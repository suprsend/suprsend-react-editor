import { useState, useCallback, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Brush,
  CodeXml,
  Clipboard,
  ChevronDown,
  Smartphone,
  TvMinimal,
} from 'lucide-react';
import CodeMirrorEditor from '@/components/custom-ui/CodeMirrorEditor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import type {
  IEmailContentResponse,
  EmailContentPayload,
} from '@/types';

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
    const hasPlainText = body?.type === 'raw'
      ? !!body?.raw?.text
      : !!body?.designer?.text;
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
                  {editor.id === 'plain_text' && editor.id === editorType && (
                    <X
                      className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground suprsend-cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newActiveEditors = activeEditorTypes.filter(
                          (id) => id !== editor.id
                        );
                        setActiveEditorTypes(newActiveEditors);
                        setEditorType(newActiveEditors[0]);
                        if (designEditorType === 'design') {
                          saveContent({ content: { body: { designer: { text: '' } } } });
                        } else {
                          saveContent({ content: { body: { raw: { text: '' } } } });
                        }
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

          {editorType === 'design_editor' && (
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="!suprsend-h-7 !suprsend-px-2 suprsend-border suprsend-rounded-md"
                    aria-label="edit"
                  >
                    <Clipboard className="suprsend-h-4 suprsend-w-4 suprsend-text-muted-foreground" />
                    <ChevronDown className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                    e.stopPropagation()
                  }
                >
                  <DropdownMenuItem
                    onClick={() => {
                      console.log('edit');
                    }}
                  >
                    <CodeXml className="suprsend-h-3.5 suprsend-w-3.5 suprsend-mr-2" />
                    Copy HTML
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
}

function EmailTemplatePlayground({
  designEditorType,
  editorType,
  variantData,
  saveContent,
}: IEmailTemplatePlayground) {
  const body = variantData?.content?.body;

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

  const plainTextValue = designEditorType === 'design'
    ? (body?.designer?.text ?? '')
    : (body?.raw?.text ?? '');

  if (editorType === 'design_editor') {
    if (designEditorType === 'design') {
      return (
        <iframe
          src="http://localhost:3000/dropin_email_editor"
          className="suprsend-w-full suprsend-h-full"
        />
      );
    } else {
      return (
        <TextEditors
          type="html"
          value={body?.raw?.html ?? ''}
          onChange={(v) => handleEditorChange('html', v)}
        />
      );
    }
  } else {
    return (
      <TextEditors
        type="plaintext"
        value={plainTextValue}
        onChange={(v) => handleEditorChange('text', v)}
      />
    );
  }
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
