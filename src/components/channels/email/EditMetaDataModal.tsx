import {
  Info,
  X,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EditMetaDataModalProps {
  otherSettingsOpen: boolean;
  setOtherSettingsOpen: (open: boolean) => void;
  setEmailSettingsOpen: (open: boolean) => void;
}

export default function EmailMetaModal({
  otherSettingsOpen,
  setOtherSettingsOpen,
  setEmailSettingsOpen,
}: EditMetaDataModalProps) {
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
          <Input defaultValue="Product Updates - October 2025" />
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

              <div className="suprsend-space-y-2">
                <Label>Add Multiple Tos</Label>
                <Input placeholder="to1@example.com, to2@example.com..." />
              </div>

              <div className="suprsend-space-y-2 suprsend-mt-3">
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
                            Use it to create interactive email and take quick
                            actions within the email. Examples include: Replying
                            to meeting invite, tracking delivery status, event
                            reservation etc.
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
