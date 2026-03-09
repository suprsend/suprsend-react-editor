import { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2 } from '@/assets/icons';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { usePostMessageBridge } from '@/lib/usePostMessageBridge';
import { useUploadFile } from '@/apis';
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
  rawText,
  onRawTextChange,
  plainTextOnlyText,
  onPlainTextOnlyTextChange,
  variables = {},
  disabled = false,
}: EmailTemplatePlaygroundProps) {
  const { isPrivate } = useTemplateEditorContext();

  const userId = isPrivate ? variantData?.email_editor_userid : generateUUID();

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
        designerMergeTags: variablesToDesignerMergeTags(variables),
      });
    },
    [saveContent, post, variables]
  );

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
    return htmlToText(html);
  }, [exportHtmlRef, designerHtmlRef]);

  const fetchRawHtml = useCallback(async () => {
    const html = rawHtmlRef.current;
    if (!html) return undefined;
    return htmlToText(html);
  }, [rawHtmlRef]);

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
            src={`http://localhost:3000/dropin_email_editor?userId=${encodeURIComponent(userId ?? '')}`}
            className="suprsend-w-full suprsend-h-full"
          />
        </div>
      )}

      {/* Designer live mode: HTML preview */}
      {editorMode === 'design' && disabled && (
        <div
          className="suprsend-absolute suprsend-inset-0"
          style={showDesignerIframe ? undefined : hiddenStyle}
        >
          <iframe
            srcDoc={apiBody?.designer?.html ?? ''}
            title="Email preview"
            className="suprsend-w-full suprsend-h-full suprsend-border-0"
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
          value={apiBody?.raw?.html ?? ''}
          onChange={handleHtmlChange}
          variables={variables}
          disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
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
          />
        </div>
      )}
    </div>
  );
}
