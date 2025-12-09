import { useState } from 'react';
import {
  X,
  Plus,
  Brush,
  CodeXml,
  Clipboard,
  ChevronDown,
  Pencil,
  ChevronUp,
  HelpCircle,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import Editor from '@monaco-editor/react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import EmailEditor from 'react-email-editor';

const EMAIL_EDITORS = [
  { name: 'Design Editor', id: 'design_editor' },
  { name: 'Plain Text', id: 'plain_text' },
];

export default function EmailChannel() {
  const [designEditorType, setDesignEditorType] = useState<'design' | 'html'>(
    'design'
  );
  const [emailEditors, setEmailEditors] =
    useState<{ name: string; id: string }[]>(EMAIL_EDITORS);
  const [emailEditorType, setEmailEditorType] = useState<string>(
    EMAIL_EDITORS[0].id
  );
  const [activeEmailEditors, setActiveEmailEditors] = useState<string[]>([
    EMAIL_EDITORS[0].id,
  ]);
  const [emailSettingsOpen, setEmailSettingsOpen] = useState(false);
  const [otherSettingsOpen, setOtherSettingsOpen] = useState(false);
  const [htmlSwitchModalOpen, setHtmlSwitchModalOpen] = useState(false);

  return (
    <div className="suprsend-p-3">
      <div className="">
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between">
          <div className="suprsend-flex suprsend-mb-[-1px] suprsend-z-50">
            {emailEditors.map((editor) => {
              if (!activeEmailEditors.includes(editor.id)) return null;
              return (
                <div
                  className={cn(
                    'suprsend-flex suprsend-items-center suprsend-gap-3 suprsend-border-b-background suprsend-px-3 suprsend-cursor-pointer suprsend-h-[36px]',
                    editor.id === emailEditorType &&
                      'suprsend-border suprsend-rounded-md suprsend-rounded-b-none'
                  )}
                  onClick={() => setEmailEditorType(editor.id)}
                  key={editor.id}
                >
                  <span
                    className={cn(
                      'suprsend-font-medium',
                      editor.id === emailEditorType && 'suprsend-text-primary'
                    )}
                  >
                    {editor.name}
                  </span>
                  {activeEmailEditors.length > 1 && (
                    <X
                      className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground suprsend-cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newActiveEditors = activeEmailEditors.filter(
                          (id) => id !== editor.id
                        );
                        setActiveEmailEditors(newActiveEditors);
                        // If closing the currently active editor, switch to the remaining one
                        if (
                          editor.id === emailEditorType &&
                          newActiveEditors.length > 0
                        ) {
                          setEmailEditorType(newActiveEditors[0]);
                        }
                      }}
                    />
                  )}
                </div>
              );
            })}

            {activeEmailEditors.length < EMAIL_EDITORS.length && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="add-tab"
                className="suprsend-ml-1 hover:suprsend-rounded-b-none hover:suprsend-border-b"
                onClick={() => {
                  const missingEditor = EMAIL_EDITORS.find(
                    (editor) => !activeEmailEditors.includes(editor.id)
                  );
                  if (missingEditor) {
                    setActiveEmailEditors((prev) => [
                      ...prev,
                      missingEditor.id,
                    ]);
                    setEmailEditorType(missingEditor.id);
                  }
                }}
              >
                <Plus className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground" />
              </Button>
            )}
          </div>

          {emailEditorType === 'design_editor' && (
            <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
              <div className="suprsend-inline-flex suprsend-bg-gray-100 suprsend-rounded-md suprsend-p-0.5">
                <button
                  type="button"
                  className={cn(
                    'suprsend-px-3 suprsend-py-1 suprsend-text-sm suprsend-rounded-md suprsend-flex suprsend-items-center suprsend-gap-2',
                    designEditorType === 'design' &&
                      'suprsend-bg-white suprsend-shadow'
                  )}
                  onClick={() => {
                    setDesignEditorType('design');
                    const editedEmailEditors = emailEditors.map((editor) => {
                      if (editor.id === 'design_editor') {
                        return { ...editor, name: 'Design Editor' };
                      }
                      return editor;
                    });
                    setEmailEditors(editedEmailEditors);
                  }}
                >
                  <Brush className="suprsend-h-3 suprsend-w-3" /> Design
                </button>
                <button
                  type="button"
                  className={cn(
                    'suprsend-px-3 suprsend-py-1 suprsend-text-sm suprsend-rounded-md suprsend-flex suprsend-items-center suprsend-gap-2',
                    designEditorType === 'html' &&
                      'suprsend-bg-white suprsend-shadow'
                  )}
                  onClick={() => {
                    setHtmlSwitchModalOpen(true);
                  }}
                >
                  <CodeXml className="suprsend-h-3 suprsend-w-3" /> HTML
                </button>
              </div>
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

        <div className="suprsend-flex suprsend-px-3 suprsend-py-2.5 suprsend-items-center suprsend-text-sm suprsend-border">
          <div className="suprsend-grid suprsend-grid-cols-3 suprsend-gap-6 suprsend-flex-grow">
            <p className="suprsend-text-muted-foreground suprsend-text-xs">
              From Name:{' '}
              <span className="suprsend-text-foreground">John Doe</span>
            </p>
            <p className="suprsend-text-muted-foreground suprsend-text-xs">
              From Email:{' '}
              <span className="suprsend-text-foreground">John Doe</span>
            </p>
            <p className="suprsend-text-muted-foreground suprsend-text-xs">
              Subject:{' '}
              <span className="suprsend-text-foreground">John Doe</span>
            </p>
          </div>
          <Dialog open={emailSettingsOpen} onOpenChange={setEmailSettingsOpen}>
            <DialogTrigger asChild>
              <Pencil className="suprsend-h-3.5 suprsend-w-3.5 suprsend-cursor-pointer suprsend-text-muted-foreground" />
            </DialogTrigger>
            <EmailMetaModal
              otherSettingsOpen={otherSettingsOpen}
              setOtherSettingsOpen={setOtherSettingsOpen}
              setEmailSettingsOpen={setEmailSettingsOpen}
              emailSettingsOpen={emailSettingsOpen}
            />
          </Dialog>
        </div>
      </div>

      <div className="suprsend-px-3 suprsend-bg-blue-50 suprsend-text-gray-700 suprsend-text-xs suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-between suprsend-mt-1 suprsend-rounded">
        <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
          <Info className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600" />
          <span>
            For devices that block HTML emails, we’ll automatically create and
            send a plain text version using your email content.
          </span>
        </div>
        <X className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600" />
      </div>

      <EmailTemplatePlayground
        designEditorType={designEditorType}
        emailEditorType={emailEditorType}
      />

      <HtmlSwitchModal
        open={htmlSwitchModalOpen}
        onOpenChange={setHtmlSwitchModalOpen}
        onProceed={() => {
          setDesignEditorType('html');
          const editedEmailEditors = emailEditors.map((editor) => {
            if (editor.id === 'design_editor') {
              return { ...editor, name: 'HTML Editor' };
            }
            return editor;
          });
          setEmailEditors(editedEmailEditors);
        }}
      />
    </div>
  );
}

function EmailMetaModal({
  otherSettingsOpen,
  setOtherSettingsOpen,
  setEmailSettingsOpen,
}: {
  otherSettingsOpen: boolean;
  setOtherSettingsOpen: (open: boolean) => void;
  setEmailSettingsOpen: (open: boolean) => void;
  emailSettingsOpen: boolean;
}) {
  return (
    <DialogContent className="!suprsend-max-w-3xl suprsend-p-0 !suprsend-max-h-[90vh] !suprsend-overflow-y-auto">
      <DialogHeader className="suprsend-pb-2">
        <DialogTitle className="suprsend-pb-2">Email Settings</DialogTitle>
      </DialogHeader>

      <div className="suprsend-space-y-6 suprsend-pb-6">
        <div className="suprsend-space-y-2">
          <Label>
            Subject<span className="suprsend-text-destructive">*</span>
          </Label>
          <Input defaultValue="Product Updates – October 2025" />
        </div>

        <div className="suprsend-grid suprsend-grid-cols-1 suprsend-md:suprsend-grid-cols-2 suprsend-gap-4">
          <div className="suprsend-space-y-2">
            <Label>From Name</Label>
            <Input defaultValue="WorkOS Events" />
          </div>
          <div className="suprsend-space-y-2">
            <Label>From Email</Label>
            <Input defaultValue="events@workOS.com" />
          </div>
        </div>

        <div className="suprsend-bg-blue-50 suprsend-text-gray-700 suprsend-text-xs suprsend-px-4 suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-between suprsend-rounded">
          <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
            <Info className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600" />
            <span>
              Value for the above fields will be picked from vendor settings if
              left blank
            </span>
          </div>
          <X className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600" />
        </div>

        <div className="suprsend-rounded-lg">
          <button
            onClick={() => setOtherSettingsOpen(!otherSettingsOpen)}
            className="suprsend-w-full suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-py-3 mb-4"
            type="button"
          >
            <span className="suprsend-font-medium suprsend-flex suprsend-items-center suprsend-gap-2">
              Other Settings{' '}
              {otherSettingsOpen ? (
                <ChevronUp className="suprsend-w-4 suprsend-h-4" />
              ) : (
                <ChevronDown className="suprsend-w-4 suprsend-h-4" />
              )}
            </span>
          </button>

          {otherSettingsOpen && (
            <div className="suprsend-space-y-4">
              {/* Preheader */}
              <div className="suprsend-space-y-2">
                <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                  <Label>Preheader Text</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="suprsend-w-3 suprsend-h-3 suprsend-cursor-default suprsend-text-accent-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          A short summary text that follows the subject line
                          when viewing an email from the inbox.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input placeholder="V1" />
              </div>

              <div className="suprsend-flex suprsend-gap-4">
                <div className="suprsend-space-y-2 suprsend-flex-grow">
                  <Label>Cc</Label>
                  <Input placeholder="cc1@example.com, cc2@example.com" />
                </div>
                <div className="suprsend-space-y-2 suprsend-flex-grow">
                  <Label>Bcc</Label>
                  <Input placeholder="bcc1@example.com, bcc2@example.com" />
                </div>
              </div>

              <div className="suprsend-space-y-2">
                <Label>Reply To</Label>
                <Input placeholder="reply@example.com" />
              </div>

              {/* Add Multiple Tos */}
              <div className="suprsend-space-y-2">
                <Label>Add Multiple Tos</Label>
                <Input placeholder="to1@example.com, to2@example.com..." />
              </div>

              {/* JSON Markup with Monaco Editor */}
              <div className="suprsend-space-y-2 suprsend-mt-3">
                {/* Top row: Label left + two icons right */}
                <div className="suprsend-flex suprsend-items-center">
                  <Label className="suprsend-mr-2">Email Markup JSON</Label>

                  <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="suprsend-w-3 suprsend-h-3 suprsend-text-accent-foreground" />
                        </TooltipTrigger>

                        <TooltipContent side="top">
                          <p>
                            This JSON defines the layout and content of the
                            email.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <span
                      className="cursor-pointer text-muted-foreground hover:text-primary transition"
                      onClick={() => console.log('external link')}
                    >
                      <ExternalLink className="suprsend-w-3 suprsend-h-3 suprsend-text-accent-foreground" />
                    </span>
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="suprsend-border suprsend-rounded-md suprsend-overflow-hidden mt-1">
                  <Editor
                    height="300px"
                    defaultLanguage="json"
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      renderLineHighlight: 'none',
                      folding: false,
                      lineNumbers: 'on',
                      glyphMargin: false,
                      foldingHighlight: false,
                      selectOnLineNumbers: true,
                      automaticLayout: true,
                      wordWrap: 'on',
                      scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setEmailSettingsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setEmailSettingsOpen(false)}>Save</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

function HtmlSwitchModal({
  open,
  onOpenChange,
  onProceed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="suprsend-sm:suprsend-max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Switch to HTML Code Editor?</DialogTitle>
        </DialogHeader>
        <div className="suprsend-py-4">
          <p className="suprsend-text-sm suprsend-text-muted-foreground">
            You're about to switch to the code editor. Your changes will be
            saved, and you can return to the design editor anytime.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onProceed();
              onOpenChange(false);
            }}
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmailTemplatePlayground({
  designEditorType,
  emailEditorType,
}: {
  designEditorType: 'design' | 'html';
  emailEditorType: string;
}) {
  if (emailEditorType === 'design_editor') {
    if (designEditorType === 'design') {
      return <EmailEditor minHeight={'580px'} />;
    } else {
      return <TextEditors type="html" />;
    }
  } else {
    return <TextEditors type="plaintext" />;
  }
}

function TextEditors({ type }: { type: 'html' | 'plaintext' }) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="suprsend-border suprsend-m-2"
    >
      <ResizablePanel
        defaultSize={50}
        className="suprsend-overflow-hidden mt-1 suprsend-h-[580px]"
      >
        <Editor
          defaultLanguage={type}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            renderLineHighlight: 'none',
            folding: false,
            lineNumbers: 'on',
            glyphMargin: false,
            foldingHighlight: false,
            selectOnLineNumbers: true,
            automaticLayout: true,
            wordWrap: 'on',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div>
          <div className="suprsend-p-2 suprsend-border-b">
            <p className="suprsend-text-sm suprsend-font-medium">Preview</p>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
