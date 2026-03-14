import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Plus, Brush, CodeXml, Clipboard } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditorTopBanner } from './TopBanners';
import HtmlSwitchModal from './HTMLEditorSwitchModal';
import EmailSettingsPreviewBanner from './EditMetaData';
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import type {
  EmailContentPayload,
  EditorMode,
  ActiveTab,
  EmailChannelProps,
} from '@/types';
import { htmlToText } from '@/lib/utils';
import EmailTemplatePlayground from './EmailTemplatePlayground';

/**
 * Tab / data model:
 *
 * type='designer' → 2 tabs: Design Editor (designer.html) + Plain Text (designer.text)
 * type='raw'      → 2 tabs: HTML Editor   (raw.html via CodeMirror)  + Plain Text (raw.text)
 * type='plain_text' → 1 tab: Plain Text (plain_text.text)
 *
 * Closing the editor tab converts its HTML to text, saves as plain_text.text, sets type='plain_text'.
 * Re-adding restores the previous editor mode (design or html).
 */

export default function EmailChannel({
  variantData,
  variables = {},
}: EmailChannelProps) {
  const { templateSlug, variantId, isLive } = useTemplateEditorContext();
  const { mutate } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'email',
    variantId,
  });

  const pendingPayloadRef = useRef<EmailContentPayload | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Immediately fire any pending debounced save.
  // Must be called before direct mutate() calls (mode switches) to prevent
  // stale saves from firing after the mode has already changed.
  const flushSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (pendingPayloadRef.current) {
      mutate(pendingPayloadRef.current);
      pendingPayloadRef.current = null;
    }
  }, [mutate]);

  const saveContent = useCallback(
    (payload: EmailContentPayload) => {
      pendingPayloadRef.current = payload;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (pendingPayloadRef.current) {
          mutate(pendingPayloadRef.current);
          pendingPayloadRef.current = null;
        }
        debounceRef.current = null;
      }, 500);
    },
    [mutate]
  );

  // --- Refs for latest HTML values (needed for close-tab conversion & copy) ---
  const designerHtmlRef = useRef<string>(
    variantData?.content?.body?.designer?.html ?? ''
  );
  const exportHtmlRef = useRef<(() => Promise<string>) | null>(null);
  const rawHtmlRef = useRef<string>(
    variantData?.content?.body?.raw?.html ?? ''
  );

  // --- Core state ---
  const apiBodyType = variantData?.content?.body?.type as string | undefined;

  // Which sub-editor: designer or raw HTML CodeMirror
  // Persists across plain_text mode so re-adding restores the right editor
  const [editorMode, setEditorMode] = useState<EditorMode>(
    apiBodyType === 'raw' ? 'html' : 'design'
  );

  // Whether the editor tab (Design/HTML) is visible
  const [hasEditorTab, setHasEditorTab] = useState(
    apiBodyType !== 'plain_text'
  );

  // Currently active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    apiBodyType === 'plain_text' ? 'plain_text' : 'editor'
  );

  // Local state for each plain text field — variantData is stale (mutations don't refetch).
  const [designerText, setDesignerText] = useState<string>(
    variantData?.content?.body?.designer?.text ?? ''
  );
  const [rawText, setRawText] = useState<string>(
    variantData?.content?.body?.raw?.text ?? ''
  );
  const [plainTextOnlyText, setPlainTextOnlyText] = useState<string>(
    variantData?.content?.body?.plain_text?.text ?? ''
  );

  const [htmlSwitchModalOpen, setHtmlSwitchModalOpen] = useState(false);

  // --- One-time sync when API data arrives after mount (lazy loading) ---
  const initializedRef = useRef(!!apiBodyType);
  useEffect(() => {
    if (initializedRef.current || !apiBodyType) return;
    initializedRef.current = true;
    setEditorMode(apiBodyType === 'raw' ? 'html' : 'design');
    setHasEditorTab(apiBodyType !== 'plain_text');
    setActiveTab(apiBodyType === 'plain_text' ? 'plain_text' : 'editor');
    setDesignerText(variantData?.content?.body?.designer?.text ?? '');
    setRawText(variantData?.content?.body?.raw?.text ?? '');
    setPlainTextOnlyText(variantData?.content?.body?.plain_text?.text ?? '');
  }, [apiBodyType, variantData]);

  // --- Handlers ---

  const handleCloseEditorTab = useCallback(async () => {
    flushSave();
    const body: { type: string; plain_text?: { text: string } } = {
      type: 'plain_text',
    };

    // Only convert HTML when plain_text.text is empty
    if (!plainTextOnlyText) {
      let html = '';
      if (editorMode === 'design') {
        html = exportHtmlRef.current
          ? await exportHtmlRef.current()
          : designerHtmlRef.current;
      } else {
        html = rawHtmlRef.current;
      }
      const text = html ? htmlToText(html) : '';
      body.plain_text = { text };
      setPlainTextOnlyText(text);
    }

    setHasEditorTab(false);
    setActiveTab('plain_text');
    mutate({ content: { body } });
  }, [editorMode, mutate, flushSave, plainTextOnlyText]);

  const handleAddEditorTab = useCallback(() => {
    flushSave();
    const type = editorMode === 'html' ? 'raw' : 'designer';
    setHasEditorTab(true);
    setActiveTab('editor');
    mutate({ content: { body: { type } } });
  }, [editorMode, mutate, flushSave]);

  const handleSwitchToDesign = useCallback(() => {
    flushSave();
    setEditorMode('design');
    mutate({ content: { body: { type: 'designer' } } });
  }, [mutate, flushSave]);

  const handleSwitchToHtml = useCallback(() => {
    flushSave();
    setEditorMode('html');
    mutate({ content: { body: { type: 'raw' } } });
  }, [mutate, flushSave]);

  const handleHtmlTabClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (editorMode === 'html') return;
      if (localStorage.getItem('ss_email_html_switch_confirmed') === 'true') {
        handleSwitchToHtml();
      } else {
        setHtmlSwitchModalOpen(true);
      }
    },
    [editorMode, handleSwitchToHtml]
  );

  const [htmlCopied, setHtmlCopied] = useState(false);

  const handleCopyHtml = useCallback(async () => {
    const html = exportHtmlRef.current
      ? await exportHtmlRef.current()
      : designerHtmlRef.current;
    navigator.clipboard.writeText(html);
    setHtmlCopied(true);
    setTimeout(() => setHtmlCopied(false), 2000);
  }, []);

  const editorTabLabel =
    editorMode === 'design' ? 'Design Editor' : 'HTML Editor';

  return (
    <div className="suprsend-h-full suprsend-flex suprsend-flex-col suprsend-m-1.5">
      <div>
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-mt-2">
          {/* ---- Tab bar ---- */}
          <div className="suprsend-flex suprsend-mb-[-1px] suprsend-z-50">
            {/* Editor tab */}
            {hasEditorTab && (
              <div
                className={cn(
                  'suprsend-flex suprsend-items-center suprsend-gap-3 suprsend-border-b-background suprsend-px-3 suprsend-cursor-pointer suprsend-h-[36px]',
                  activeTab === 'editor' &&
                    'suprsend-border suprsend-rounded-md suprsend-rounded-b-none'
                )}
                onClick={() => setActiveTab('editor')}
              >
                <span
                  className={cn(
                    'suprsend-font-medium',
                    activeTab === 'editor' && 'suprsend-text-primary'
                  )}
                >
                  {editorTabLabel}
                </span>
                {activeTab === 'editor' && !isLive && (
                  <X
                    className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground suprsend-cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseEditorTab();
                    }}
                  />
                )}
              </div>
            )}

            {/* Plain Text tab */}
            <div
              className={cn(
                'suprsend-flex suprsend-items-center suprsend-gap-3 suprsend-border-b-background suprsend-px-3 suprsend-cursor-pointer suprsend-h-[36px]',
                activeTab === 'plain_text' &&
                  'suprsend-border suprsend-rounded-md suprsend-rounded-b-none'
              )}
              onClick={() => setActiveTab('plain_text')}
            >
              <span
                className={cn(
                  'suprsend-font-medium',
                  activeTab === 'plain_text' && 'suprsend-text-primary'
                )}
              >
                Plain Text
              </span>
            </div>

            {/* Add editor tab button */}
            {!hasEditorTab && !isLive && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="add-tab"
                      className="suprsend-ml-1 hover:suprsend-rounded-b-none hover:suprsend-border-b"
                      onClick={handleAddEditorTab}
                    >
                      <Plus className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {editorMode === 'design'
                        ? 'Add Design Editor'
                        : 'Add HTML Editor'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* ---- Design / HTML toggle + Copy button ---- */}
          {hasEditorTab && activeTab === 'editor' && !isLive && (
            <div className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-mt-[-10px]">
              <Tabs
                value={editorMode}
                onValueChange={(v) => {
                  if (v === 'design') handleSwitchToDesign();
                }}
              >
                <TabsList className="suprsend-h-auto suprsend-p-0.5">
                  <TabsTrigger value="design" className="suprsend-gap-2">
                    <Brush className="suprsend-h-3 suprsend-w-3" /> Design
                  </TabsTrigger>
                  <TabsTrigger
                    value="html"
                    className="suprsend-gap-2"
                    onClick={handleHtmlTabClick}
                  >
                    <CodeXml className="suprsend-h-3 suprsend-w-3" /> HTML
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <TooltipProvider delayDuration={0}>
                <Tooltip open={htmlCopied || undefined}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="!suprsend-h-7 !suprsend-w-7 suprsend-border suprsend-rounded-md"
                      aria-label="Copy HTML"
                      disabled={editorMode !== 'design'}
                      onClick={handleCopyHtml}
                    >
                      <Clipboard className="suprsend-h-4 suprsend-w-4 suprsend-text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{htmlCopied ? 'Copied!' : 'Copy HTML'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

        </div>

        <EmailSettingsPreviewBanner
          variantData={variantData}
          onSave={saveContent}
        />
      </div>

      <EditorTopBanner
        editorType={activeTab === 'editor' ? 'design_editor' : 'plain_text'}
        designEditorType={editorMode}
      />

      <div className="suprsend-flex-1 suprsend-min-h-0 suprsend-overflow-hidden">
        <EmailTemplatePlayground
          editorMode={editorMode}
          activeTab={activeTab}
          hasEditorTab={hasEditorTab}
          variantData={variantData}
          saveContent={saveContent}
          designerHtmlRef={designerHtmlRef}
          exportHtmlRef={exportHtmlRef}
          rawHtmlRef={rawHtmlRef}
          variables={variables}
          designerText={designerText}
          onDesignerTextChange={setDesignerText}
          rawText={rawText}
          onRawTextChange={setRawText}
          plainTextOnlyText={plainTextOnlyText}
          onPlainTextOnlyTextChange={setPlainTextOnlyText}
          disabled={isLive}
        />
      </div>

      <HtmlSwitchModal
        open={htmlSwitchModalOpen}
        onOpenChange={setHtmlSwitchModalOpen}
        onProceed={() => {
          localStorage.setItem('ss_email_html_switch_confirmed', 'true');
          handleSwitchToHtml();
        }}
      />
    </div>
  );
}
