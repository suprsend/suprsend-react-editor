import { useState, useCallback, useRef, useEffect } from 'react';
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
import { EditorTopBanner } from './TopBanners';
import HtmlSwitchModal from './HTMLEditorSwitchModal';
import EmailSettingsPreviewBanner from './EditMetaData';
import { useUpdateVariantContent, useUploadFile } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { usePostMessageBridge } from '@/lib/usePostMessageBridge';
import type { IEmailContentResponse, EmailContentPayload } from '@/types';
import DisplayConditionsModal from './DisplayConditionsModal';
import OldDisplayConditionsModal from './OldDisplayConditionsModal';
import type {
  DisplayConditionInfo,
  DisplayConditionData,
} from './DisplayConditionsModal';

// TODO: replace with brand data fetched from API
const MOCK_BRAND_DATA = {
  $brand: {
    logo: 'https://picsum.photos/200/300',
    primary_color: '#064DB3',
    brand_name: 'SuprSend',
    social_links: {
      website: 'https://suprsend.com',
      facebook: 'https://facebook.com/suprsend',
      linkedin: 'https://linkedin.com/company/suprsend',
      x: 'https://x.com/suprsend',
      instagram: '',
      medium: '',
      discord: '',
      telegram: '',
      youtube: '',
      tiktok: '',
    },
    embedded_preference_url: 'https://suprsend.com/preferences',
    hosted_preference_domain: 'https://suprsend.com/unsubscribe',
  },
};

const EDITOR_TYPE_OPTIONS = [
  { name: 'Design Editor', id: 'design_editor' },
  { name: 'Plain Text', id: 'plain_text' },
];

type DesignEditorType = 'design' | 'html';

interface IEditorTypeList {
  name: string;
  id: string;
}

interface EmailChannelProps {
  variantData: IEmailContentResponse;
}

export default function EmailChannel({ variantData }: EmailChannelProps) {
  const {
    templateSlug,
    variantId,
    workspaceUid,
    conditions,
    locale,
    tenantId,
  } = useTemplateEditorContext();
  const { mutate } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'email',
    variantId,
    workspaceUid,
    conditions,
    locale,
    tenantId,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveContent = useCallback(
    (payload: EmailContentPayload) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        mutate(payload);
      }, 500);
    },
    [mutate]
  );

  const designerHtmlRef = useRef<string>(
    variantData?.content?.body?.designer?.html ?? ''
  );

  const bodyType = variantData?.content?.body?.type;
  const initialDesignEditorType: DesignEditorType =
    bodyType === 'raw' ? 'html' : 'design';

  const [designEditorType, setDesignEditorType] = useState<DesignEditorType>(
    initialDesignEditorType
  );
  const [editorTypeList, setEditorTypeList] = useState<IEditorTypeList[]>(() =>
    EDITOR_TYPE_OPTIONS.map((opt) =>
      opt.id === 'design_editor' && initialDesignEditorType === 'html'
        ? { ...opt, name: 'HTML Editor' }
        : opt
    )
  );

  const [editorType, setEditorType] = useState<string>(
    EDITOR_TYPE_OPTIONS[0].id
  );
  const [activeEditorTypes, setActiveEditorTypes] = useState<string[]>(() => {
    const types = [EDITOR_TYPE_OPTIONS[0].id];
    const body = variantData?.content?.body;
    const hasPlainText =
      body?.type === 'raw' ? !!body?.raw?.text : !!body?.designer?.text;
    if (hasPlainText) {
      types.push('plain_text');
    }
    return types;
  });

  // Sync design/html switch from server data after fetch
  useEffect(() => {
    if (!bodyType) return;
    const type: DesignEditorType = bodyType === 'raw' ? 'html' : 'design';
    setDesignEditorType(type);
    setEditorTypeList((prev) =>
      prev.map((opt) =>
        opt.id === 'design_editor'
          ? { ...opt, name: type === 'html' ? 'HTML Editor' : 'Design Editor' }
          : opt
      )
    );
  }, [bodyType]);

  const [htmlSwitchModalOpen, setHtmlSwitchModalOpen] = useState(false);

  const missingEditor = EDITOR_TYPE_OPTIONS.find(
    (editor) => !activeEditorTypes.includes(editor.id)
  );

  let tooltipText = '';
  if (missingEditor?.id === 'plain_text') {
    tooltipText = 'Add Plain text';
  } else if (missingEditor?.id === 'design_editor') {
    if (designEditorType === 'design') {
      tooltipText = 'Add Design Editor';
    } else {
      tooltipText = 'Add HTML Editor';
    }
  }

  return (
    <div className="suprsend-h-full suprsend-flex suprsend-flex-col suprsend-m-1.5">
      <div>
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-mt-2">
          <div className="suprsend-flex suprsend-mb-[-1px] suprsend-z-50">
            {editorTypeList.map((editor) => {
              if (!activeEditorTypes.includes(editor.id)) return null;
              return (
                <div
                  className={cn(
                    'suprsend-flex suprsend-items-center suprsend-gap-3 suprsend-border-b-background suprsend-px-3 suprsend-cursor-pointer suprsend-h-[36px]',
                    editor.id === editorType &&
                      'suprsend-border suprsend-rounded-md suprsend-rounded-b-none'
                  )}
                  onClick={() => setEditorType(editor.id)}
                  key={editor.id}
                >
                  <span
                    className={cn(
                      'suprsend-font-medium',
                      editor.id === editorType && 'suprsend-text-primary'
                    )}
                  >
                    {editor.name}
                  </span>
                  {activeEditorTypes.length > 1 && editor.id === editorType && (
                    <X
                      className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground suprsend-cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newActiveEditors = activeEditorTypes.filter(
                          (id) => id !== editor.id
                        );
                        setActiveEditorTypes(newActiveEditors);
                        setEditorType(newActiveEditors[0]);
                      }}
                    />
                  )}
                </div>
              );
            })}

            {activeEditorTypes.length < EDITOR_TYPE_OPTIONS.length && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="add-tab"
                      className="suprsend-ml-1 hover:suprsend-rounded-b-none hover:suprsend-border-b"
                      onClick={() => {
                        const missingEditor = EDITOR_TYPE_OPTIONS.find(
                          (editor) => !activeEditorTypes.includes(editor.id)
                        );
                        if (missingEditor) {
                          setActiveEditorTypes((prev) => [
                            ...prev,
                            missingEditor.id,
                          ]);
                          setEditorType(missingEditor.id);
                        }
                      }}
                    >
                      <Plus className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tooltipText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {activeEditorTypes.includes('design_editor') && (
            <div className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-mt-[-10px]">
              <Tabs
                value={designEditorType}
                onValueChange={(value) => {
                  if (value === 'design') {
                    setDesignEditorType('design');
                    mutate({ content: { body: { type: 'designer' } } });
                    const editedEmailEditors = editorTypeList.map((editor) => {
                      if (editor.id === 'design_editor') {
                        return { ...editor, name: 'Design Editor' };
                      }
                      return editor;
                    });
                    setEditorTypeList(editedEmailEditors);
                  }
                }}
              >
                <TabsList className="suprsend-h-auto suprsend-p-0.5">
                  <TabsTrigger value="design" className="suprsend-gap-2">
                    <Brush className="suprsend-h-3 suprsend-w-3" /> Design
                  </TabsTrigger>
                  <TabsTrigger
                    value="html"
                    className="suprsend-gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      if (designEditorType !== 'html') {
                        setHtmlSwitchModalOpen(true);
                      }
                    }}
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
                      disabled={
                        editorType !== 'design_editor' ||
                        designEditorType !== 'design'
                      }
                      onClick={() => {
                        navigator.clipboard.writeText(designerHtmlRef.current);
                      }}
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
        editorType={editorType}
        designEditorType={designEditorType}
      />

      <div className="suprsend-flex-1 suprsend-min-h-0 suprsend-overflow-hidden">
        <EmailTemplatePlayground
          designEditorType={designEditorType}
          editorType={editorType}
          variantData={variantData}
          saveContent={saveContent}
          designerHtmlRef={designerHtmlRef}
          brandData={MOCK_BRAND_DATA}
        />
      </div>

      <HtmlSwitchModal
        open={htmlSwitchModalOpen}
        onOpenChange={setHtmlSwitchModalOpen}
        onProceed={() => {
          setDesignEditorType('html');
          mutate({ content: { body: { type: 'raw' } } });
          const editedEmailEditors = editorTypeList.map((editor) => {
            if (editor.id === 'design_editor') {
              return { ...editor, name: 'HTML Editor' };
            }
            return editor;
          });
          setEditorTypeList(editedEmailEditors);
        }}
      />
    </div>
  );
}

interface IEmailTemplatePlayground {
  designEditorType: DesignEditorType;
  editorType: string;
  variantData: IEmailContentResponse;
  saveContent: (payload: EmailContentPayload) => void;
  designerHtmlRef: React.RefObject<string>;
  brandData?: Record<string, unknown> | null;
}

function EmailTemplatePlayground({
  designEditorType,
  editorType,
  variantData,
  saveContent,
  designerHtmlRef,
  brandData = null,
}: IEmailTemplatePlayground) {
  const { workspaceUid } = useTemplateEditorContext();
  // TODO: replace with userId from API when ready
  const userId = 'staging-1';
  const { mutateAsync: uploadFile } = useUploadFile(workspaceUid);
  const body = variantData?.content?.body;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const designJsonRef = useRef(body?.designer?.design_json);
  const [iframeLoading, setIframeLoading] = useState(true);
  const { on, post } = usePostMessageBridge(iframeRef);

  const displayConditionInfoRef = useRef<DisplayConditionInfo | null>(null);
  const [displayConditionOpen, setDisplayConditionOpen] = useState(false);
  const [oldDisplayConditionOpen, setOldDisplayConditionOpen] = useState(false);
  const initialDisplayConditions =
    (variantData?.content?.body?.designer
      ?.display_conditions as DisplayConditionData[]) ?? [];
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

  // Keep designJsonRef in sync with latest server data
  useEffect(() => {
    designJsonRef.current = body?.designer?.design_json;
  }, [body?.designer?.design_json]);

  // Reset iframe loading state when switching from HTML back to design mode
  // (iframe remounts in that case). Not needed for tab switches since iframe stays mounted.
  useEffect(() => {
    if (designEditorType === 'design') {
      setIframeLoading(true);
    }
  }, [designEditorType]);

  // Listen for postMessage events from iframe
  useEffect(() => {
    const unsubConfig = on('REQUEST_CONFIG', () => {
      post('BRAND_CONFIG', { brandData: brandData ?? null });
    });

    const unsubReady = on('EDITOR_READY', () => {
      setIframeLoading(false);
      const designJson = designJsonRef.current;
      if (designJson && Object.keys(designJson).length > 0) {
        post('LOAD_DESIGN', { design_json: designJson });
      }
    });

    const unsubUpdate = on('DESIGN_UPDATED', (payload) => {
      const { html, design_json } = payload as {
        html: string;
        design_json: Record<string, unknown>;
      };
      designerHtmlRef.current = html;
      saveContent({
        content: {
          body: {
            designer: {
              html,
              design_json,
              display_conditions: displayConditionsListRef.current,
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
      // Route: v1 condition (has `before` but not version '2') → old; everything else → v2
      const isV1 = !!(data?.before && data.version !== '2');
      if (isV1) {
        setOldDisplayConditionOpen(true);
      } else {
        setDisplayConditionOpen(true);
      }
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
      unsubUpload();
    };
  }, [on, post, saveContent, designerHtmlRef, uploadFile, brandData]);

  const handleEditorChange = useCallback(
    (type: 'html' | 'text', value: string) => {
      if (type === 'html') {
        const currentRaw = body?.raw;
        saveContent({
          content: {
            body: {
              raw: {
                html: value,
                text: currentRaw?.text ?? '',
              },
            },
          },
        });
      } else if (designEditorType === 'design') {
        saveContent({
          content: { body: { designer: { text: value } } },
        });
      } else {
        const currentRaw = body?.raw;
        saveContent({
          content: {
            body: {
              raw: {
                html: currentRaw?.html ?? '',
                text: value,
              },
            },
          },
        });
      }
    },
    [saveContent, body?.raw, designEditorType]
  );

  const plainTextValue =
    designEditorType === 'design'
      ? (body?.designer?.text ?? '')
      : (body?.raw?.text ?? '');

  const showDesignerIframe =
    editorType === 'design_editor' && designEditorType === 'design';

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
      {/* Iframe stays mounted in design mode; use visibility instead of display to avoid re-layout flicker */}
      {designEditorType === 'design' && (
        <div
          className="suprsend-absolute suprsend-inset-0"
          style={showDesignerIframe ? undefined : { visibility: 'hidden' }}
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

      {editorType === 'design_editor' && designEditorType !== 'design' && (
        <TextEditors
          type="html"
          value={body?.raw?.html ?? ''}
          onChange={(v) => handleEditorChange('html', v)}
        />
      )}

      {editorType !== 'design_editor' && (
        <TextEditors
          type="plaintext"
          value={plainTextValue}
          onChange={(v) => handleEditorChange('text', v)}
        />
      )}
    </div>
  );
}

interface TextEditorsProps {
  type: 'html' | 'plaintext';
  value: string;
  onChange: (value: string) => void;
}

function TextEditors({ type, value, onChange }: TextEditorsProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<
    'desktop' | 'mobile'
  >('desktop');

  return (
    <ResizablePanelGroup direction="horizontal" className="suprsend-border">
      <ResizablePanel
        defaultSize={50}
        className="suprsend-overflow-hidden mt-1 suprsend-h-full"
      >
        <CodeMirrorEditor
          value={value}
          onChange={onChange}
          language={type === 'html' ? 'html' : undefined}
          className="suprsend-h-full suprsend-border-0 suprsend-rounded-none"
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div>
          <div className="suprsend-border-b suprsend-flex suprsend-items-center suprsend-justify-between">
            <div className="suprsend-p-2">
              <p className="suprsend-text-sm suprsend-font-medium">Preview</p>
            </div>
            <div className="suprsend-mr-2">
              <Tabs
                defaultValue="desktop"
                className=""
                onValueChange={(value) =>
                  setActivePreviewTab(value as 'desktop' | 'mobile')
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
          </div>
          {activePreviewTab === 'desktop' && <p>Desktop preview</p>}
          {activePreviewTab === 'mobile' && <p>Mobile preview</p>}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
