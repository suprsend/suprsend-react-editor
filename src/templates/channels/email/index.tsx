import { useState, useCallback, useRef, useEffect } from 'react';
import { Check, ChevronDown, Brush, CodeXml, FileText, Clipboard } from '@/assets/icons';
import SaveIndicator from '@/components/custom-ui/SaveIndicator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { EditorTopBanner } from './TopBanners';
import ModeSwitchModal from './ModeSwitchModal';
import type { SwitchDirection, ModeSwitchResult } from './ModeSwitchModal';
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

type PlainTextMode = 'auto' | 'custom';


const MODE_LABELS: Record<string, string> = {
  design: 'Visual designer',
  html: 'HTML editor',
  plaintext: 'Plain text only',
};

const MODE_DESCRIPTIONS: Record<string, string> = {
  design: 'Drag-and-drop builder',
  html: 'Write raw HTML code',
  plaintext: 'No HTML, text-only email',
};

const MODE_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  design: Brush,
  html: CodeXml,
  plaintext: FileText,
};

export default function EmailChannel({
  variantData,
  variables = {},
}: EmailChannelProps) {
  const { templateSlug, variantId, isLive } = useTemplateEditorContext();
  const {
    mutate,
    isPending: isSaving,
    isSuccess: isSaved,
  } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'email',
    variantId,
  });

  const pendingPayloadRef = useRef<EmailContentPayload | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Immediately fire any pending debounced save.
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

  // --- Refs for latest HTML values ---
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

  // Whether the plain text toggle is on (showing plain text view)
  const showPlainText = activeTab === 'plain_text' && hasEditorTab;

  // Derived current mode for dropdown
  const currentMode = !hasEditorTab
    ? 'plaintext'
    : editorMode === 'html'
      ? 'html'
      : 'design';

  // Local state for each field — variantData is stale (mutations don't refetch)
  const [rawHtmlValue, setRawHtmlValue] = useState<string>(
    variantData?.content?.body?.raw?.html ?? ''
  );
  const [designerText, setDesignerText] = useState<string>(
    variantData?.content?.body?.designer?.text ?? ''
  );
  const [rawText, setRawText] = useState<string>(
    variantData?.content?.body?.raw?.text ?? ''
  );
  const [plainTextOnlyText, setPlainTextOnlyText] = useState<string>(
    variantData?.content?.body?.plain_text?.text ?? ''
  );

  // Plain text mode derived from whether the current field has content
  const plainTextMode: PlainTextMode = (() => {
    if (editorMode === 'design') return designerText ? 'custom' : 'auto';
    if (editorMode === 'html') return rawText ? 'custom' : 'auto';
    return 'custom';
  })();

  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const [switchDirection, setSwitchDirection] = useState<SwitchDirection | null>(null);
  const [editorWarning, setEditorWarning] = useState('');

  useEffect(() => {
    setEditorWarning('');
  }, [activeTab, editorMode]);

  // --- Sync state when variant data changes (initial load or refetch after import) ---
  // variantData only changes from API fetches, not from local mutations (which don't refetch),
  // so it's safe to re-sync local state whenever the reference changes.
  const prevVariantDataRef = useRef(variantData);
  useEffect(() => {
    if (!apiBodyType) return;
    if (prevVariantDataRef.current === variantData) return;
    prevVariantDataRef.current = variantData;
    setEditorMode(apiBodyType === 'raw' ? 'html' : 'design');
    setHasEditorTab(apiBodyType !== 'plain_text');
    setActiveTab(apiBodyType === 'plain_text' ? 'plain_text' : 'editor');
    setRawHtmlValue(variantData?.content?.body?.raw?.html ?? '');
    setDesignerText(variantData?.content?.body?.designer?.text ?? '');
    setRawText(variantData?.content?.body?.raw?.text ?? '');
    setPlainTextOnlyText(variantData?.content?.body?.plain_text?.text ?? '');
    designerHtmlRef.current = variantData?.content?.body?.designer?.html ?? '';
    rawHtmlRef.current = variantData?.content?.body?.raw?.html ?? '';
  }, [apiBodyType, variantData]);

  // --- Handlers ---

  const handleAddEditorTab = useCallback(
    (mode: EditorMode) => {
      flushSave();
      const type = mode === 'html' ? 'raw' : 'designer';
      setEditorMode(mode);
      setHasEditorTab(true);
      setActiveTab('editor');
      mutate({ content: { body: { type } } });
    },
    [mutate, flushSave]
  );

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

  // --- Mode dropdown handler ---
  const DIRECTION_MAP: Record<string, Record<string, SwitchDirection>> = {
    design: {
      html: 'design_to_html',
      plaintext: 'design_to_plaintext',
    },
    html: {
      design: 'html_to_design',
      plaintext: 'html_to_plaintext',
    },
    plaintext: {
      design: 'plaintext_to_design',
      html: 'plaintext_to_html',
    },
  };

  const handleModeChange = useCallback(
    (targetMode: string) => {
      if (targetMode === currentMode) return;
      const direction = DIRECTION_MAP[currentMode]?.[targetMode];
      if (!direction) return;
      setSwitchDirection(direction);
      setSwitchModalOpen(true);
    },
    [currentMode]
  );

  const handleModeSwitchConfirm = useCallback(
    async ({ checkedOptions }: ModeSwitchResult) => {
      if (!switchDirection) return;
      const copyHtml = checkedOptions.copy_html ?? false;
      const copyText = checkedOptions.copy_text ?? false;

      // When plain text is in "auto" mode the stored value is empty.
      // Resolve to auto-generated text so copying carries the visible content.
      const effectiveDesignerText = designerText || htmlToText(designerHtmlRef.current);
      const effectiveRawText = rawText || htmlToText(rawHtmlValue);

      switch (switchDirection) {
        case 'design_to_html': {
          // Copy designer HTML into raw HTML field
          if (copyHtml) {
            const html = exportHtmlRef.current
              ? await exportHtmlRef.current()
              : designerHtmlRef.current;
            rawHtmlRef.current = html;
            setRawHtmlValue(html);
            flushSave();
            setEditorMode('html');
            const payload: Record<string, unknown> = { type: 'raw', raw: { html } };
            if (copyText) {
              payload.raw = { ...payload.raw as object, text: effectiveDesignerText };
              setRawText(effectiveDesignerText);
            }
            mutate({ content: { body: payload } });
          } else {
            if (copyText) {
              setRawText(effectiveDesignerText);
              flushSave();
              setEditorMode('html');
              mutate({ content: { body: { type: 'raw', raw: { text: effectiveDesignerText } } } });
            } else {
              handleSwitchToHtml();
            }
          }
          break;
        }
        case 'design_to_plaintext': {
          flushSave();
          const body: Record<string, unknown> = { type: 'plain_text' };
          if (copyText) {
            // Copy designer plain text (or auto-generated) value
            setPlainTextOnlyText(effectiveDesignerText);
            if (effectiveDesignerText) {
              body.plain_text = { text: effectiveDesignerText };
            }
          }
          setHasEditorTab(false);
          setActiveTab('plain_text');
          mutate({ content: { body } });
          break;
        }
        case 'html_to_design': {
          flushSave();
          if (copyText) {
            // Copy raw plain text (or auto-generated) value to designer plain text
            setDesignerText(effectiveRawText);
            setEditorMode('design');
            mutate({ content: { body: { type: 'designer', designer: { text: effectiveRawText } } } });
          } else {
            handleSwitchToDesign();
          }
          break;
        }
        case 'html_to_plaintext': {
          flushSave();
          const body: Record<string, unknown> = { type: 'plain_text' };
          if (copyText) {
            // Copy raw plain text (or auto-generated) value to plain_text mode
            setPlainTextOnlyText(effectiveRawText);
            if (effectiveRawText) {
              body.plain_text = { text: effectiveRawText };
            }
          }
          setHasEditorTab(false);
          setActiveTab('plain_text');
          mutate({ content: { body } });
          break;
        }
        case 'plaintext_to_html': {
          if (copyText) {
            setRawText(plainTextOnlyText);
            flushSave();
            setEditorMode('html');
            setHasEditorTab(true);
            setActiveTab('editor');
            mutate({ content: { body: { type: 'raw', raw: { text: plainTextOnlyText } } } });
          } else {
            handleAddEditorTab('html');
          }
          break;
        }
        case 'plaintext_to_design': {
          if (copyText) {
            setDesignerText(plainTextOnlyText);
            flushSave();
            setEditorMode('design');
            setHasEditorTab(true);
            setActiveTab('editor');
            mutate({ content: { body: { type: 'designer', designer: { text: plainTextOnlyText } } } });
          } else {
            handleAddEditorTab('design');
          }
          break;
        }
      }
    },
    [
      switchDirection,
      flushSave,
      mutate,
      designerText,
      rawText,
      rawHtmlValue,
      plainTextOnlyText,
      handleSwitchToHtml,
      handleSwitchToDesign,
      handleAddEditorTab,
      exportHtmlRef,
      designerHtmlRef,
      rawHtmlRef,
    ]
  );

  // --- Toggle handler ---
  const handleTogglePlainText = useCallback(
    (checked: boolean) => {
      setActiveTab(checked ? 'plain_text' : 'editor');
    },
    []
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

  return (
    <div className="suprsend-h-full suprsend-flex suprsend-flex-col suprsend-m-1.5 suprsend-relative">
      <div>
        {/* ---- Top Bar ---- */}
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-py-2 suprsend-border-b suprsend-border-border">
          <div className="suprsend-flex suprsend-items-center suprsend-gap-3">
            {/* Mode Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="suprsend-gap-1.5 suprsend-font-medium"
                  disabled={isLive}
                >
                  {(() => {
                    const Icon = MODE_ICONS[currentMode];
                    return <Icon className="suprsend-h-3.5 suprsend-w-3.5" />;
                  })()}
                  {MODE_LABELS[currentMode]}
                  <ChevronDown className="suprsend-h-3 suprsend-w-3 suprsend-text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="suprsend-w-[220px]">
                {(['design', 'html', 'plaintext'] as const).map((mode) => {
                  const Icon = MODE_ICONS[mode];
                  const isActive = currentMode === mode;
                  return (
                    <DropdownMenuItem
                      key={mode}
                      className={cn(
                        'suprsend-flex suprsend-items-center suprsend-gap-2.5 suprsend-py-2',
                        isActive && 'suprsend-bg-accent'
                      )}
                      onClick={() => handleModeChange(mode)}
                    >
                      <Icon className="suprsend-h-4 suprsend-w-4 suprsend-shrink-0" />
                      <div className="suprsend-flex-1">
                        <div className="suprsend-text-sm suprsend-font-medium">
                          {MODE_LABELS[mode]}
                        </div>
                        <div className="suprsend-text-xs suprsend-text-muted-foreground">
                          {MODE_DESCRIPTIONS[mode]}
                        </div>
                      </div>
                      {isActive && (
                        <Check className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-primary suprsend-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider + Plain text toggle (only for design/html modes) */}
            {hasEditorTab && (
              <>
                <div className="suprsend-w-px suprsend-h-4 suprsend-bg-border" />
                <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                  <Switch
                    checked={showPlainText}
                    onCheckedChange={handleTogglePlainText}
                    className="suprsend-scale-90"
                  />
                  <span
                    className={cn(
                      'suprsend-text-xs suprsend-cursor-pointer suprsend-select-none',
                      showPlainText
                        ? 'suprsend-text-primary suprsend-font-medium'
                        : 'suprsend-text-muted-foreground'
                    )}
                    onClick={() => handleTogglePlainText(!showPlainText)}
                  >
                    Show plain text
                  </span>
                  <span
                    className={cn(
                      'suprsend-text-[10px] suprsend-px-1.5 suprsend-py-0.5 suprsend-rounded-full suprsend-font-medium suprsend-select-none',
                      plainTextMode === 'auto'
                        ? 'suprsend-bg-blue-50 suprsend-text-blue-700'
                        : 'suprsend-bg-amber-50 suprsend-text-amber-700'
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {plainTextMode === 'auto' ? 'Auto' : 'Custom'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right side: Save indicator + Copy HTML */}
          <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
            <SaveIndicator
              isSaving={isSaving}
              isSaved={isSaved}
              className="suprsend-mr-1"
            />
            {hasEditorTab &&
              activeTab === 'editor' &&
              editorMode === 'design' &&
              !isLive && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip open={htmlCopied || undefined}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="!suprsend-h-7 !suprsend-w-7 suprsend-border suprsend-rounded-md"
                        aria-label="Copy HTML"
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
              )}
          </div>
        </div>

        <EmailSettingsPreviewBanner
          variantData={variantData}
          onSave={saveContent}
          variables={variables}
        />
      </div>

      {!isLive && <EditorTopBanner
        editorType={activeTab === 'editor' ? 'design_editor' : 'plain_text'}
        designEditorType={editorMode}
        plainTextMode={plainTextMode}
        showPlainText={showPlainText}
        onEditManually={() => {
          // Convert current HTML to text and save it as the plain text value (switches to custom mode)
          const html = editorMode === 'design' ? designerHtmlRef.current : rawHtmlRef.current;
          const text = html ? htmlToText(html) : '';
          if (editorMode === 'design') {
            setDesignerText(text);
            saveContent({ content: { body: { designer: { text } } } });
          } else {
            setRawText(text);
            saveContent({ content: { body: { raw: { text } } } });
          }
        }}
        onResetToAuto={() => {
          if (editorMode === 'design') {
            setDesignerText('');
            saveContent({ content: { body: { designer: { text: '' } } } });
          } else if (editorMode === 'html') {
            setRawText('');
            saveContent({ content: { body: { raw: { text: '' } } } });
          }
        }}
      />}

      <div
        className="suprsend-min-h-0 suprsend-overflow-hidden suprsend-flex-1 suprsend-flex suprsend-flex-col"
      >
        <div className="suprsend-flex-1 suprsend-min-h-0 suprsend-relative">
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
          rawHtmlValue={rawHtmlValue}
          onRawHtmlValueChange={setRawHtmlValue}
          rawText={rawText}
          onRawTextChange={setRawText}
          plainTextOnlyText={plainTextOnlyText}
          onPlainTextOnlyTextChange={setPlainTextOnlyText}
          disabled={isLive}
          onWarningChange={setEditorWarning}
        />
        </div>
        {activeTab !== 'editor' || editorMode !== 'design' ? (
          <div className="suprsend-h-8 suprsend-shrink-0">
            {editorWarning && (
              <p className="suprsend-text-sm suprsend-px-3 suprsend-py-1 suprsend-text-destructive">
                {editorWarning}
              </p>
            )}
          </div>
        ) : null}
      </div>

      <ModeSwitchModal
        open={switchModalOpen}
        onOpenChange={setSwitchModalOpen}
        direction={switchDirection}
        onConfirm={handleModeSwitchConfirm}
      />
    </div>
  );
}
