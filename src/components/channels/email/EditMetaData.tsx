import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Info,
  X,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  HelpCircle,
  Pencil,
} from 'lucide-react';
import SuggestionCodeEditor from '@/components/custom-ui/SuggestionCodeEditor';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import SuggestionInput from '@/components/custom-ui/SuggestionInput';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAutosave } from '@/lib/useAutosave';
import type {
  EmailMetaDataFormValues,
  EmailContentPayload,
  IEmailContentResponse,
} from '@/types';

export interface IEmailSettingsPreviewBannerProps {
  variantData: IEmailContentResponse;
  onSave: (payload: EmailContentPayload) => void;
  variables?: Record<string, unknown>;
}

export default function EmailSettingsPreviewBanner({
  variantData,
  onSave,
  variables = {},
}: IEmailSettingsPreviewBannerProps) {
  const emailContent = variantData?.content;
  const [emailSettingsOpen, setEmailSettingsOpen] = useState(false);
  const [otherSettingsOpen, setOtherSettingsOpen] = useState(false);

  return (
    <div className="suprsend-flex suprsend-px-3 suprsend-py-2.5 suprsend-items-center suprsend-text-sm suprsend-border">
      <div className="suprsend-grid suprsend-grid-cols-3 suprsend-gap-6 suprsend-flex-grow">
        <p className="suprsend-text-muted-foreground suprsend-text-xs">
          From Name:{' '}
          <span className="suprsend-text-foreground">
            {emailContent?.from_name || '-'}
          </span>
        </p>
        <p className="suprsend-text-muted-foreground suprsend-text-xs">
          From Email:{' '}
          <span className="suprsend-text-foreground">
            {emailContent?.from_address || '-'}
          </span>
        </p>
        <p className="suprsend-text-muted-foreground suprsend-text-xs">
          Subject:{' '}
          <span className="suprsend-text-foreground">
            {emailContent?.subject || '-'}
          </span>
        </p>
      </div>
      <Dialog open={emailSettingsOpen} onOpenChange={setEmailSettingsOpen}>
        <DialogTrigger asChild>
          <Pencil className="suprsend-h-3.5 suprsend-w-3.5 suprsend-cursor-pointer suprsend-text-muted-foreground" />
        </DialogTrigger>
        <EmailMetaDataModal
          otherSettingsOpen={otherSettingsOpen}
          setOtherSettingsOpen={setOtherSettingsOpen}
          variantData={variantData}
          onSave={onSave}
          variables={variables}
        />
      </Dialog>
    </div>
  );
}

interface EmailMetaDataModalProps {
  otherSettingsOpen: boolean;
  setOtherSettingsOpen: (open: boolean) => void;
  variantData: IEmailContentResponse;
  onSave: (payload: EmailContentPayload) => void;
  variables: Record<string, unknown>;
}

function EmailMetaDataModal({
  otherSettingsOpen,
  setOtherSettingsOpen,
  variantData,
  onSave,
  variables,
}: EmailMetaDataModalProps) {
  const emailContent = variantData?.content;
  const [infoBannerVisible, setInfoBannerVisible] = useState(true);

  const { watch, control } = useForm<EmailMetaDataFormValues>({
    values: {
      subject: emailContent?.subject ?? '',
      from_name: emailContent?.from_name ?? '',
      from_address: emailContent?.from_address ?? '',
      preheader: emailContent?.body?.preheader ?? '',
      cc: emailContent?.cc ?? '',
      bcc: emailContent?.bcc ?? '',
      reply_to: emailContent?.reply_to ?? '',
      extra_to: emailContent?.extra_to ?? '',
      email_markup: emailContent?.body?.email_markup ?? '',
    },
  });

  const handleAutosave = useCallback(
    (data: EmailMetaDataFormValues) => {
      const { preheader, email_markup, ...rest } = data;
      const content: EmailContentPayload['content'] = { ...rest };
      content.body = { preheader, email_markup };
      onSave({ content });
    },
    [onSave]
  );

  useAutosave({ watch, onSave: handleAutosave, debounceMs: 0 });

  return (
    <DialogContent className="!suprsend-max-w-3xl suprsend-p-0 !suprsend-max-h-[90vh] !suprsend-overflow-y-auto !suprsend-border-0">
      <DialogHeader className="suprsend-pb-2">
        <DialogTitle className="suprsend-pb-2">Email Settings</DialogTitle>
      </DialogHeader>

      <div className="suprsend-space-y-6 suprsend-pb-6">
        <div className="suprsend-space-y-2">
          <Controller
            name="subject"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <SuggestionInput
                label="Subject"
                variables={variables}
                value={field.value}
                onChange={field.onChange}
                enableHighlighting
                enableSuggestions
              />
            )}
          />
        </div>

        <div className="suprsend-grid suprsend-grid-cols-1 suprsend-md:suprsend-grid-cols-2 suprsend-gap-4">
          <div className="suprsend-space-y-2">
            <Controller
              name="from_name"
              control={control}
              render={({ field }) => (
                <SuggestionInput
                  label="From Name"
                  mandatory={false}
                  variables={variables}
                  value={field.value}
                  onChange={field.onChange}
                  enableHighlighting
                  enableSuggestions
                />
              )}
            />
          </div>
          <div className="suprsend-space-y-2">
            <Controller
              name="from_address"
              control={control}
              render={({ field }) => (
                <SuggestionInput
                  label="From Email"
                  mandatory={false}
                  variables={variables}
                  value={field.value}
                  onChange={field.onChange}
                  enableHighlighting
                  enableSuggestions
                />
              )}
            />
          </div>
        </div>

        {infoBannerVisible && (
          <div className="suprsend-bg-blue-50 suprsend-text-gray-700 suprsend-text-xs suprsend-px-4 suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-between suprsend-rounded">
            <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
              <Info className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600 suprsend-shrink-0" />
              <span>
                Value for the above fields will be picked from vendor settings
                if left blank
              </span>
            </div>
            <X
              className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600 suprsend-cursor-pointer suprsend-shrink-0"
              onClick={() => setInfoBannerVisible(false)}
            />
          </div>
        )}

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
                <Controller
                  name="preheader"
                  control={control}
                  render={({ field }) => (
                    <SuggestionInput
                      variables={variables}
                      value={field.value}
                      onChange={field.onChange}
                      mandatory={false}
                      placeholder="Preview text..."
                      enableHighlighting
                      enableSuggestions
                    />
                  )}
                />
              </div>

              <div className="suprsend-flex suprsend-gap-4">
                <div className="suprsend-space-y-2 suprsend-flex-grow">
                  <Controller
                    name="cc"
                    control={control}
                    render={({ field }) => (
                      <SuggestionInput
                        label="Cc"
                        mandatory={false}
                        variables={variables}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="cc1@example.com, cc2@example.com"
                        enableHighlighting
                        enableSuggestions
                      />
                    )}
                  />
                </div>
                <div className="suprsend-space-y-2 suprsend-flex-grow">
                  <Controller
                    name="bcc"
                    control={control}
                    render={({ field }) => (
                      <SuggestionInput
                        label="Bcc"
                        mandatory={false}
                        variables={variables}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="bcc1@example.com, bcc2@example.com"
                        enableHighlighting
                        enableSuggestions
                      />
                    )}
                  />
                </div>
              </div>

              <div className="suprsend-space-y-2">
                <Controller
                  name="reply_to"
                  control={control}
                  render={({ field }) => (
                    <SuggestionInput
                      label="Reply To"
                      mandatory={false}
                      variables={variables}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="reply@example.com"
                      enableHighlighting
                      enableSuggestions
                    />
                  )}
                />
              </div>

              <div className="suprsend-space-y-2">
                <Controller
                  name="extra_to"
                  control={control}
                  render={({ field }) => (
                    <SuggestionInput
                      label="Add Multiple Tos"
                      mandatory={false}
                      variables={variables}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="to1@example.com, to2@example.com..."
                      enableHighlighting
                      enableSuggestions
                    />
                  )}
                />
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

                    <span className="cursor-pointer text-muted-foreground hover:text-primary transition">
                      <ExternalLink className="suprsend-w-3 suprsend-h-3 suprsend-text-accent-foreground" />
                    </span>
                  </div>
                </div>

                <Controller
                  name="email_markup"
                  control={control}
                  render={({ field }) => (
                    <SuggestionCodeEditor
                      value={field.value}
                      onChange={field.onChange}
                      variables={variables}
                      enableHighlighting
                      enableSuggestions
                      language="json"
                      height="300px"
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}
