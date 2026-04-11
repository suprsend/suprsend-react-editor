import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Loader2, AlertCircle } from '@/assets/icons';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { usePostMessageBridge } from '@/lib/usePostMessageBridge';
import { useUploadFile } from '@/apis';
import { renderHandlebars } from '@/components/custom-ui/HandlebarsRenderer';
import { variablesToDesignerMergeTags } from '@/lib/suggestion-utils';
import { generateUUID, htmlToText } from '@/lib/utils';
import type {
  MergeTagData,
  EmailTemplatePlaygroundProps,
  DisplayConditionInfo,
  DisplayConditionData,
  MergeTagInfo,
} from '@/types';
import DisplayConditionsModal from './DisplayConditionsModal';
import OldDisplayConditionsModal from './OldDisplayConditionsModal';
import MergeTagsModal from './MergeTagsModal';
import TextEditors from './TextEditors';

export default function EmailTemplatePlayground({
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
  rawHtmlValue,
  onRawHtmlValueChange,
  rawText,
  onRawTextChange,
  plainTextOnlyText,
  onPlainTextOnlyTextChange,
  variables = {},
  disabled = false,
  onWarningChange,
}: EmailTemplatePlaygroundProps) {
  const { isPrivate, designerEditorHost } = useTemplateEditorContext();

  const generatedIdRef = useRef(generateUUID());
  const userId = isPrivate
    ? variantData?.email_editor_userid
    : generatedIdRef.current;

  const { workspaceUid } = useTemplateEditorContext();
  const { mutateAsync: uploadFile } = useUploadFile(workspaceUid);
  const [iframeLoading, setIframeLoading] = useState(true);

  const apiBody = variantData?.content?.body;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const designJsonRef = useRef(apiBody?.designer?.design_json);
  const { on, post } = usePostMessageBridge(iframeRef);

  // Track latest designer HTML as state so auto plain text updates reactively
  const [latestDesignerHtml, setLatestDesignerHtml] = useState(
    apiBody?.designer?.html ?? ''
  );

  // --- Preview error from Unlayer ---
  const [previewHtmlError, setPreviewHtmlError] = useState<string | null>(null);

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
        designerMergeTags: variablesToDesignerMergeTags(variables),
      });
    },
    [saveContent, post, variables]
  );

  // --- Sync variables to iframe when they change after initial load ---
  const variablesInitRef = useRef(true);
  useEffect(() => {
    if (variablesInitRef.current) {
      variablesInitRef.current = false;
      return;
    }
    post('BRAND_CONFIG', { brandData: variables });
    post('INIT_MERGE_TAGS', {
      variables,
      mergeTagsList: mergeTagsListRef.current,
      designerMergeTags: variablesToDesignerMergeTags(variables),
    });
  }, [variables, post]);

  // --- Designer HTML export ---
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
  const iframeReadyRef = useRef(false);
  useEffect(() => {
    if (apiBody?.type === 'designer' && apiBody?.designer?.design_json) {
      designJsonRef.current = apiBody.designer.design_json;
      // If iframe is already loaded, push the updated design into it
      if (iframeReadyRef.current) {
        post('LOAD_DESIGN', { design_json: apiBody.designer.design_json });
      }
    }
    if (apiBody?.type === 'designer' && apiBody?.designer?.html) {
      setLatestDesignerHtml(apiBody.designer.html);
    }
    if (apiBody?.type === 'designer') {
      const conditions =
        (apiBody?.designer?.display_conditions as DisplayConditionData[]) ?? [];
      displayConditionsListRef.current = conditions;
      setDisplayConditionsList(conditions);

      const tags =
        (apiBody?.designer?.merge_tags as MergeTagData[]) ?? [];
      mergeTagsListRef.current = tags;
      setMergeTagsList(tags);
    }
  }, [apiBody?.designer?.design_json, apiBody?.designer?.html, apiBody?.designer?.display_conditions, apiBody?.designer?.merge_tags, apiBody?.type, post]);

  useEffect(() => {
    if (apiBody?.type === 'raw' && apiBody?.raw?.html !== undefined) {
      rawHtmlRef.current = apiBody.raw.html;
      onRawHtmlValueChange(apiBody.raw.html);
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
        brandData: variables,
      });
    });

    const unsubReady = on('EDITOR_READY', () => {
      iframeReadyRef.current = true;
      setIframeLoading(false);
      const designJson = designJsonRef.current;
      if (designJson && Object.keys(designJson).length > 0) {
        post('LOAD_DESIGN', { design_json: designJson });
      }
      post('INIT_MERGE_TAGS', {
        variables,
        mergeTagsList: mergeTagsListRef.current,
        designerMergeTags: variablesToDesignerMergeTags(variables),
      });
    });

    const unsubUpdate = on('DESIGN_UPDATED', (payload) => {
      const { html, design_json } = payload as {
        html: string;
        design_json: Record<string, unknown>;
      };
      designerHtmlRef.current = html;
      designJsonRef.current = design_json;
      setLatestDesignerHtml(html);
      setPreviewHtmlError(null);
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

    const unsubPreviewError = on('PREVIEW_HTML_ERROR', (payload) => {
      const { error } = payload as { error: string | null };
      setPreviewHtmlError(error);
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
      unsubPreviewError();
      unsubUpload();
    };
  }, [on, post, saveContent, designerHtmlRef, uploadFile, variables]);

  // --- Separate change handlers for each field ---
  const handleHtmlChange = useCallback(
    (v: string) => {
      rawHtmlRef.current = v;
      onRawHtmlValueChange(v);
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

  const { resolvedDesignerHtml, designerHtmlError } = useMemo(() => {
    if (!disabled || editorMode !== 'design')
      return { resolvedDesignerHtml: '', designerHtmlError: null };
    const html = apiBody?.designer?.html ?? '';
    if (!html) return { resolvedDesignerHtml: '', designerHtmlError: null };
    let error: string | null = null;
    const onError = (e: unknown) => {
      error = e instanceof Error ? e.message : String(e);
    };
    const result = renderHandlebars(html, variables, {
      onCompileError: onError,
      onRenderError: onError,
    });
    return { resolvedDesignerHtml: result, designerHtmlError: error };
  }, [disabled, editorMode, apiBody?.designer?.html, variables]);

  // Auto-generated plain text from HTML (shown when plain text field is empty)
  const autoDesignerText = useMemo(
    () => (latestDesignerHtml ? htmlToText(latestDesignerHtml) : ''),
    [latestDesignerHtml]
  );
  const autoRawText = useMemo(
    () => (rawHtmlValue ? htmlToText(rawHtmlValue) : ''),
    [rawHtmlValue]
  );

  const showDesignerIframe = activeTab === 'editor' && editorMode === 'design';
  const hiddenStyle = {
    visibility: 'hidden' as const,
    pointerEvents: 'none' as const,
  };

  return (
    <div className="suprsend-relative suprsend-w-full suprsend-h-full">
      <DisplayConditionsModal
        open={displayConditionOpen}
        setOpen={setDisplayConditionOpen}
        displayConditionInfoRef={displayConditionInfoRef}
        displayConditionsList={displayConditionsList}
        setDisplayConditionsList={handleSetDisplayConditionsList}
        variables={variables}
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

      {/* Designer iframe – always mounted in design mode (non-live), hidden when not active */}
      {editorMode === 'design' && !disabled && (
        <div
          className="suprsend-absolute suprsend-inset-0 suprsend-flex suprsend-flex-col"
          style={showDesignerIframe ? undefined : hiddenStyle}
        >
          {previewHtmlError && (
            <div className="suprsend-shrink-0 suprsend-p-2">
              <div className="suprsend-flex suprsend-items-start suprsend-gap-2 suprsend-px-3 suprsend-py-2 suprsend-bg-destructive/10 suprsend-border suprsend-border-destructive/20 suprsend-rounded-md suprsend-text-destructive">
                <AlertCircle className="suprsend-w-4 suprsend-h-4 suprsend-shrink-0 suprsend-mt-0.5" />
                <p className="suprsend-text-xs suprsend-m-0 suprsend-break-words suprsend-min-w-0">
                  {previewHtmlError}
                </p>
              </div>
            </div>
          )}
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
            src={`${designerEditorHost}?userId=${encodeURIComponent(userId ?? '')}`}
            className="suprsend-w-full suprsend-flex-1 suprsend-min-h-0"
          />
        </div>
      )}

      {/* Designer live mode: HTML preview */}
      {editorMode === 'design' && disabled && (
        <div
          className="suprsend-absolute suprsend-inset-0 suprsend-flex suprsend-flex-col"
          style={showDesignerIframe ? undefined : hiddenStyle}
        >
          {designerHtmlError && (
            <div className="suprsend-shrink-0 suprsend-p-2">
              <div className="suprsend-flex suprsend-items-start suprsend-gap-2 suprsend-px-3 suprsend-py-2 suprsend-bg-destructive/10 suprsend-border suprsend-border-destructive/20 suprsend-rounded-md suprsend-text-destructive">
                <AlertCircle className="suprsend-w-4 suprsend-h-4 suprsend-shrink-0 suprsend-mt-0.5" />
                <p className="suprsend-text-xs suprsend-m-0 suprsend-break-words suprsend-min-w-0">
                  {designerHtmlError}
                </p>
              </div>
            </div>
          )}
          <iframe
            srcDoc={resolvedDesignerHtml}
            title="Email preview"
            className="suprsend-w-full suprsend-flex-1 suprsend-border-0"
          />
        </div>
      )}

      {/* HTML CodeMirror editor */}
      <div
        className="suprsend-absolute suprsend-inset-0"
        style={
          activeTab === 'editor' && editorMode === 'html'
            ? undefined
            : hiddenStyle
        }
      >
        <TextEditors
          type="html"
          value={rawHtmlValue}
          onChange={handleHtmlChange}
          variables={variables}
          disabled={disabled}
          onWarningChange={onWarningChange}
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
            disabled={disabled}
            onWarningChange={onWarningChange}
            autoValue={autoDesignerText}
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
            disabled={disabled}
            onWarningChange={onWarningChange}
            autoValue={autoRawText}
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
            disabled={disabled}
            onWarningChange={onWarningChange}
          />
        </div>
      )}
    </div>
  );
}
