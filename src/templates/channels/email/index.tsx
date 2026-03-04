import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Brush,
  CodeXml,
  Clipboard,
  Loader2,
  Smartphone,
  TvMinimal,
} from 'lucide-react';
import CodeMirrorEditor from '@/components/custom-ui/CodeMirrorEditor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditorTopBanner, PlainTextBanner } from './TopBanners';
import HtmlSwitchModal from './HTMLEditorSwitchModal';
import EmailSettingsPreviewBanner from './EditMetaData';
import { useUpdateVariantContent, useUploadFile } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { usePostMessageBridge } from '@/lib/usePostMessageBridge';
import type {
  IEmailContentResponse,
  EmailContentPayload,
  TextEditorsProps,
  MergeTagData,
} from '@/types';
import DisplayConditionsModal from './DisplayConditionsModal';
import { renderHandlebars } from '@/components/custom-ui/HandlebarsRenderer';
import { variablesToUnlayerMergeTags } from '@/lib/suggestion-utils';
import OldDisplayConditionsModal from './OldDisplayConditionsModal';
import MergeTagsModal from './MergeTagsModal';
import type {
  DisplayConditionInfo,
  DisplayConditionData,
} from './DisplayConditionsModal';
import type { MergeTagInfo } from './MergeTagsModal';
import { convert } from 'html-to-text';

/**
 * Tab / data model:
 *
 * type='designer' → 2 tabs: Design Editor (designer.html via Unlayer) + Plain Text (designer.text)
 * type='raw'      → 2 tabs: HTML Editor   (raw.html via CodeMirror)  + Plain Text (raw.text)
 * type='plain_text' → 1 tab: Plain Text (plain_text.text)
 *
 * Closing the editor tab converts its HTML to text, saves as plain_text.text, sets type='plain_text'.
 * Re-adding restores the previous editor mode (design or html).
 */

type EditorMode = 'design' | 'html';
type ActiveTab = 'editor' | 'plain_text';

interface EmailChannelProps {
  variantData: IEmailContentResponse;
  variables?: Record<string, unknown>;
}

export default function EmailChannel({
  variantData,
  variables = {},
}: EmailChannelProps) {
  const { templateSlug, variantId } = useTemplateEditorContext();
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

  // Which sub-editor: Unlayer designer or raw HTML CodeMirror
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
    const body: { type: string; plain_text?: { text: string } } = { type: 'plain_text' };

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
      const text = html ? convert(html, { wordwrap: 130 }) : '';
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

  const handleCopyHtml = useCallback(async () => {
    const html = exportHtmlRef.current
      ? await exportHtmlRef.current()
      : designerHtmlRef.current;
    navigator.clipboard.writeText(html);
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
                {activeTab === 'editor' && (
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
            {!hasEditorTab && (
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
          {hasEditorTab && activeTab === 'editor' && (
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
              <TooltipProvider>
                <Tooltip>
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
                    <p>Copy HTML</p>
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

// ---------------------------------------------------------------------------
// EmailTemplatePlayground
// ---------------------------------------------------------------------------

interface EmailTemplatePlaygroundProps {
  editorMode: EditorMode;
  activeTab: ActiveTab;
  hasEditorTab: boolean;
  variantData: IEmailContentResponse;
  saveContent: (payload: EmailContentPayload) => void;
  designerHtmlRef: { current: string };
  exportHtmlRef: React.RefObject<(() => Promise<string>) | null>;
  rawHtmlRef: { current: string };
  variables?: Record<string, unknown>;
  designerText: string;
  onDesignerTextChange: (v: string) => void;
  rawText: string;
  onRawTextChange: (v: string) => void;
  plainTextOnlyText: string;
  onPlainTextOnlyTextChange: (v: string) => void;
}

function EmailTemplatePlayground({
  editorMode,
  activeTab,
  hasEditorTab,
  saveContent,
  designerHtmlRef,
  exportHtmlRef,
  rawHtmlRef,
  variantData,
  designerText,
  onDesignerTextChange,
  rawText,
  onRawTextChange,
  plainTextOnlyText,
  onPlainTextOnlyTextChange,
  variables = {},
}: EmailTemplatePlaygroundProps) {
  const userId = 'staging-1'; // TODO: replace with userId from API when ready

  const { workspaceUid } = useTemplateEditorContext();
  const { mutateAsync: uploadFile } = useUploadFile(workspaceUid);
  const [iframeLoading, setIframeLoading] = useState(true);

  const apiBody = variantData?.content?.body;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const designJsonRef = useRef(apiBody?.designer?.design_json);
  const { on, post } = usePostMessageBridge(iframeRef);

  // --- Display conditions ---
  const displayConditionInfoRef = useRef<DisplayConditionInfo | null>(null);
  const [displayConditionOpen, setDisplayConditionOpen] = useState(false);
  const [oldDisplayConditionOpen, setOldDisplayConditionOpen] = useState(false);
  const initialDisplayConditions =
    (apiBody?.designer?.display_conditions as DisplayConditionData[]) ?? [];
  const displayConditionsListRef = useRef<DisplayConditionData[]>(
    initialDisplayConditions
  );
  const [displayConditionsList, setDisplayConditionsList] = useState<
    DisplayConditionData[]
  >(initialDisplayConditions);

  const handleSetDisplayConditionsList = useCallback(
    (list: DisplayConditionData[]) => {
      displayConditionsListRef.current = list;
      setDisplayConditionsList(list);
      saveContent({
        content: { body: { designer: { display_conditions: list } } },
      });
    },
    [saveContent]
  );

  // --- Merge tags ---
  const mergeTagInfoRef = useRef<MergeTagInfo | null>(null);
  const [mergeTagModalOpen, setMergeTagModalOpen] = useState(false);
  const initialMergeTags =
    (apiBody?.designer?.merge_tags as MergeTagData[]) ?? [];
  const mergeTagsListRef = useRef<MergeTagData[]>(initialMergeTags);
  const [mergeTagsList, setMergeTagsList] =
    useState<MergeTagData[]>(initialMergeTags);

  const handleSetMergeTagsList = useCallback(
    (list: MergeTagData[]) => {
      mergeTagsListRef.current = list;
      setMergeTagsList(list);
      saveContent({
        content: { body: { designer: { merge_tags: list } } },
      });
      post('SET_MERGE_TAGS', {
        mergeTagsList: list,
        unlayerMergeTags: variablesToUnlayerMergeTags(variables),
      });
    },
    [saveContent, post, variables]
  );

  // --- Unlayer HTML export ---
  useEffect(() => {
    exportHtmlRef.current = () => {
      return new Promise<string>((resolve) => {
        const unsub = on('EXPORT_HTML_DONE', (payload) => {
          unsub();
          resolve((payload as { html: string }).html);
        });
        post('EXPORT_HTML');
      });
    };
    return () => {
      exportHtmlRef.current = null;
    };
  }, [on, post, exportHtmlRef]);

  // --- Sync refs from API data ---
  useEffect(() => {
    if (apiBody?.type === 'designer' && apiBody?.designer?.design_json) {
      designJsonRef.current = apiBody.designer.design_json;
    }
  }, [apiBody?.designer?.design_json, apiBody?.type]);

  useEffect(() => {
    if (apiBody?.type === 'raw' && apiBody?.raw?.html !== undefined) {
      rawHtmlRef.current = apiBody.raw.html;
    }
  }, [apiBody?.raw?.html, apiBody?.type, rawHtmlRef]);

  // Reset iframe loading when switching to design mode (iframe remounts)
  useEffect(() => {
    if (editorMode === 'design') {
      setIframeLoading(true);
    }
  }, [editorMode]);

  // --- PostMessage bridge ---
  useEffect(() => {
    const unsubConfig = on('REQUEST_CONFIG', () => {
      post('BRAND_CONFIG', {
        brandData: variables?.['$brand'],
      });
    });

    const unsubReady = on('EDITOR_READY', () => {
      setIframeLoading(false);
      const designJson = designJsonRef.current;
      if (designJson && Object.keys(designJson).length > 0) {
        post('LOAD_DESIGN', { design_json: designJson });
      }
      post('INIT_MERGE_TAGS', {
        variables,
        mergeTagsList: mergeTagsListRef.current,
        unlayerMergeTags: variablesToUnlayerMergeTags(variables),
      });
    });

    const unsubUpdate = on('DESIGN_UPDATED', (payload) => {
      const { html, design_json } = payload as {
        html: string;
        design_json: Record<string, unknown>;
      };
      designerHtmlRef.current = html;
      designJsonRef.current = design_json;
      saveContent({
        content: {
          body: {
            designer: {
              html,
              design_json,
              display_conditions: displayConditionsListRef.current,
              merge_tags: mergeTagsListRef.current,
            },
          },
        },
      });
    });

    const unsubDisplayCondition = on('DISPLAY_CONDITION_OPEN', (payload) => {
      const data = (payload as { data: DisplayConditionData }).data;
      displayConditionInfoRef.current = {
        data,
        done: (conditionData) => {
          post('DISPLAY_CONDITION_DONE', { conditionData });
        },
      };
      const isV1 = !!(data?.before && data.version !== '2');
      if (isV1) {
        setOldDisplayConditionOpen(true);
      } else {
        setDisplayConditionOpen(true);
      }
    });

    const unsubMergeTag = on('MERGE_TAG_OPEN', (payload) => {
      const data = (
        payload as {
          data: {
            mergeTagGroup?: string | null;
            mergeTags?: Record<string, unknown>;
          };
        }
      ).data;
      mergeTagInfoRef.current = {
        data,
        done: (result) => {
          post('MERGE_TAG_DONE', { result });
        },
      };
      setMergeTagModalOpen(true);
    });

    const unsubUpload = on('IMAGE_UPLOAD', async (payload) => {
      const { file, requestId } = payload as { file: File; requestId: string };
      try {
        const result = await uploadFile(file);
        if (result.error) throw new Error(result.error);
        post('IMAGE_UPLOAD_DONE', { requestId, url: result.url });
      } catch (error) {
        console.error('Image upload failed:', error);
        post('IMAGE_UPLOAD_DONE', { requestId, url: null });
      }
    });

    return () => {
      unsubConfig();
      unsubReady();
      unsubUpdate();
      unsubDisplayCondition();
      unsubMergeTag();
      unsubUpload();
    };
  }, [on, post, saveContent, designerHtmlRef, uploadFile, variables]);

  // --- Separate change handlers for each field ---
  const handleHtmlChange = useCallback(
    (v: string) => {
      rawHtmlRef.current = v;
      saveContent({ content: { body: { raw: { html: v } } } });
    },
    [saveContent, rawHtmlRef]
  );

  const handleDesignerTextChange = useCallback(
    (v: string) => {
      onDesignerTextChange(v);
      saveContent({ content: { body: { designer: { text: v } } } });
    },
    [saveContent, onDesignerTextChange]
  );

  const handleRawTextChange = useCallback(
    (v: string) => {
      onRawTextChange(v);
      saveContent({ content: { body: { raw: { text: v } } } });
    },
    [saveContent, onRawTextChange]
  );

  const handlePlainTextOnlyChange = useCallback(
    (v: string) => {
      onPlainTextOnlyTextChange(v);
      saveContent({ content: { body: { plain_text: { text: v } } } });
    },
    [saveContent, onPlainTextOnlyTextChange]
  );

  // --- Fetch-from-HTML helpers ---
  const fetchDesignerHtml = useCallback(async () => {
    const html = exportHtmlRef.current
      ? await exportHtmlRef.current()
      : designerHtmlRef.current;
    if (!html) return undefined;
    return convert(html, { wordwrap: 130 });
  }, [exportHtmlRef, designerHtmlRef]);

  const fetchRawHtml = useCallback(async () => {
    const html = rawHtmlRef.current;
    if (!html) return undefined;
    return convert(html, { wordwrap: 130 });
  }, [rawHtmlRef]);

  const showDesignerIframe =
    activeTab === 'editor' && editorMode === 'design';
  const hiddenStyle = { visibility: 'hidden' as const, pointerEvents: 'none' as const };

  return (
    <div className="suprsend-relative suprsend-w-full suprsend-h-full">
      <DisplayConditionsModal
        open={displayConditionOpen}
        setOpen={setDisplayConditionOpen}
        displayConditionInfoRef={displayConditionInfoRef}
        displayConditionsList={displayConditionsList}
        setDisplayConditionsList={handleSetDisplayConditionsList}
      />
      <OldDisplayConditionsModal
        open={oldDisplayConditionOpen}
        setOpen={setOldDisplayConditionOpen}
        displayConditionInfoRef={displayConditionInfoRef}
        displayConditionsList={displayConditionsList}
        setDisplayConditionsList={handleSetDisplayConditionsList}
      />
      <MergeTagsModal
        open={mergeTagModalOpen}
        setOpen={setMergeTagModalOpen}
        mergeTagInfoRef={mergeTagInfoRef}
        mergeTagsList={mergeTagsList}
        setMergeTagsList={handleSetMergeTagsList}
        variables={variables}
      />

      {/* Unlayer iframe – always mounted in design mode, hidden when not active */}
      {editorMode === 'design' && (
        <div
          className="suprsend-absolute suprsend-inset-0"
          style={showDesignerIframe ? undefined : hiddenStyle}
        >
          {iframeLoading && (
            <div className="suprsend-absolute suprsend-inset-0 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-bg-background suprsend-z-10">
              <Loader2
                className="suprsend-h-6 suprsend-w-6 suprsend-text-muted-foreground"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={`http://localhost:3000/dropin_email_editor?userId=${encodeURIComponent(userId)}`}
            className="suprsend-w-full suprsend-h-full"
          />
        </div>
      )}

      {/* HTML CodeMirror editor */}
      <div
        className="suprsend-absolute suprsend-inset-0"
        style={activeTab === 'editor' && editorMode === 'html' ? undefined : hiddenStyle}
      >
        <TextEditors
          type="html"
          value={apiBody?.raw?.html ?? ''}
          onChange={handleHtmlChange}
          variables={variables}
        />
      </div>

      {/* Plain text: designer mode – mounted only in designer mode */}
      {hasEditorTab && editorMode === 'design' && (
        <div
          className="suprsend-absolute suprsend-inset-0"
          style={activeTab === 'plain_text' ? undefined : hiddenStyle}
        >
          <TextEditors
            type="plaintext"
            value={designerText}
            onChange={handleDesignerTextChange}
            variables={variables}
            onFetchFromHtml={fetchDesignerHtml}
          />
        </div>
      )}

      {/* Plain text: HTML mode – mounted only in HTML mode */}
      {hasEditorTab && editorMode === 'html' && (
        <div
          className="suprsend-absolute suprsend-inset-0"
          style={activeTab === 'plain_text' ? undefined : hiddenStyle}
        >
          <TextEditors
            type="plaintext"
            value={rawText}
            onChange={handleRawTextChange}
            variables={variables}
            onFetchFromHtml={fetchRawHtml}
          />
        </div>
      )}

      {/* Plain text: plain_text only mode – mounted only when no editor tab */}
      {!hasEditorTab && (
        <div
          className="suprsend-absolute suprsend-inset-0"
          style={activeTab === 'plain_text' ? undefined : hiddenStyle}
        >
          <TextEditors
            type="plaintext"
            value={plainTextOnlyText}
            onChange={handlePlainTextOnlyChange}
            variables={variables}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TextEditors (split-pane: editor left, preview right)
// ---------------------------------------------------------------------------

function TextEditors({
  type,
  value,
  onChange,
  variables = {},
  onFetchFromHtml,
}: TextEditorsProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<
    'desktop' | 'mobile'
  >('desktop');
  const [localValue, setLocalValue] = useState(value);
  const localValueRef = useRef(value);
  const lastExternalRef = useRef(value);

  // Smart sync: only apply external value change if the user hasn't locally diverged.
  // This prevents API responses from overwriting what the user just typed.
  useEffect(() => {
    const prev = lastExternalRef.current;
    lastExternalRef.current = value;
    if (localValueRef.current === prev) {
      localValueRef.current = value;
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = useCallback(
    (v: string) => {
      localValueRef.current = v;
      setLocalValue(v);
      onChange(v);
    },
    [onChange]
  );

  const handleFetchFromHtml = useCallback(async () => {
    if (!onFetchFromHtml) return;
    const text = await onFetchFromHtml();
    if (text !== undefined) handleChange(text);
  }, [onFetchFromHtml, handleChange]);

  const renderedContent = useMemo(
    () => renderHandlebars(localValue, variables),
    [localValue, variables]
  );

  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const resizePreviewIframe = useCallback(() => {
    const iframe = previewIframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;
    if (doc.body) doc.body.style.overflow = 'hidden';
    if (doc.documentElement) doc.documentElement.style.overflow = 'hidden';
    const height = Math.max(
      doc.body?.scrollHeight ?? 0,
      doc.documentElement?.scrollHeight ?? 0
    );
    if (iframe) iframe.style.height = `${height}px`;
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal" className="suprsend-border">
      <ResizablePanel
        defaultSize={50}
        className="suprsend-overflow-hidden suprsend-flex suprsend-flex-col suprsend-h-full"
      >
        {type === 'plaintext' && onFetchFromHtml && (
          <PlainTextBanner onFetchFromHtml={handleFetchFromHtml} />
        )}
        <CodeMirrorEditor
          value={localValue}
          onChange={handleChange}
          language={type === 'html' ? 'html' : undefined}
          placeholder={
            type === 'plaintext'
              ? 'Plain text is always sent to reach users with HTML blocked in their email client. To preview or edit it, click "Fetch from HTML" above.'
              : undefined
          }
          className="suprsend-flex-1 suprsend-min-h-0 suprsend-border-0 suprsend-rounded-none"
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={50}
        className="suprsend-flex suprsend-flex-col"
      >
        <div className="suprsend-border-b suprsend-flex suprsend-items-center suprsend-justify-between suprsend-shrink-0">
          <div className="suprsend-p-2">
            <p className="suprsend-text-sm suprsend-font-medium">Preview</p>
          </div>
          {type === 'html' && (
            <div className="suprsend-mr-2">
              <Tabs
                defaultValue="desktop"
                onValueChange={(v) =>
                  setActivePreviewTab(v as 'desktop' | 'mobile')
                }
              >
                <TabsList className="!suprsend-h-7">
                  <TabsTrigger value="desktop" className="h-5">
                    <TvMinimal className="suprsend-w-3 suprsend-h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="h-5">
                    <Smartphone className="suprsend-w-3 suprsend-h-3" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>

        <div className="suprsend-flex-1 suprsend-min-h-0 suprsend-overflow-auto suprsend-bg-muted/30">
          {type === 'html' ? (
            <div
              className={cn(
                'suprsend-p-4',
                activePreviewTab === 'mobile' &&
                  'suprsend-flex suprsend-justify-center'
              )}
            >
              <iframe
                ref={previewIframeRef}
                srcDoc={renderedContent}
                title="Email preview"
                onLoad={resizePreviewIframe}
                className={cn(
                  'suprsend-bg-white suprsend-border suprsend-border-muted-foreground/10',
                  activePreviewTab === 'desktop'
                    ? 'suprsend-w-full'
                    : 'suprsend-w-[390px] suprsend-rounded-lg'
                )}
              />
            </div>
          ) : (
            <pre className="suprsend-p-4 suprsend-text-xs suprsend-whitespace-pre-wrap suprsend-break-words suprsend-font-mono suprsend-text-gray-700">
              {renderedContent || (
                <span className="suprsend-text-muted-foreground">
                  Nothing to preview
                </span>
              )}
            </pre>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
