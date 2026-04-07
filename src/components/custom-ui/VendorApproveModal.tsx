import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clipboard, Check } from '@/assets/icons';
import { useStartVendorApproval, invalidateQueries } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import type { VendorApproval, IWhatsappContent, ISMSContent } from '@/types';

// --- Copyable field ---

function CopyableField({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  if (!value) return null;

  return (
    <div className="suprsend-space-y-1">
      {label && (
        <p className="suprsend-text-xs suprsend-font-medium suprsend-text-foreground">
          {label}
        </p>
      )}
      <div className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-rounded-md suprsend-border suprsend-border-border suprsend-bg-muted/30 suprsend-px-2.5 suprsend-py-1.5">
        <span
          className={`suprsend-flex-1 suprsend-text-sm suprsend-text-foreground ${multiline ? 'suprsend-whitespace-pre-wrap' : 'suprsend-truncate'}`}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="suprsend-shrink-0 suprsend-text-muted-foreground hover:suprsend-text-foreground suprsend-transition-colors"
        >
          {copied ? (
            <Check className="suprsend-w-4 suprsend-h-4" />
          ) : (
            <Clipboard className="suprsend-w-4 suprsend-h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function ReadOnlySelect({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div className="suprsend-space-y-1">
      {label && (
        <p className="suprsend-text-xs suprsend-font-medium suprsend-text-foreground">
          {label}
        </p>
      )}
      <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-rounded-md suprsend-border suprsend-border-border suprsend-bg-muted/30 suprsend-px-2.5 suprsend-py-1.5">
        <span className="suprsend-text-sm suprsend-text-foreground">
          {value}
        </span>
        <svg
          className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

// --- Button row display ---

function ButtonRow({
  buttonType,
  text,
  extra,
}: {
  buttonType: string;
  text: string;
  extra?: { label: string; value: string }[];
}) {
  return (
    <div className="suprsend-space-y-2">
      <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
        <div className="suprsend-w-[140px]">
          <ReadOnlySelect label="" value={buttonType} />
        </div>
        <div className="suprsend-flex-1">
          <CopyableField label="" value={text} />
        </div>
      </div>
      {extra?.map((e, i) => (
        <div key={i} className="suprsend-flex suprsend-items-center suprsend-gap-2">
          <div className="suprsend-w-[140px]">
            <ReadOnlySelect label="" value={e.label} />
          </div>
          <div className="suprsend-flex-1">
            <CopyableField label="" value={e.value} />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main modal ---

interface VendorApproveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: VendorApproval;
  content: IWhatsappContent | ISMSContent;
  sysgenTemplateName: string;
  locale: string;
  channelSlug: string;
  readOnly?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  UTILITY: 'Utility',
  MARKETING: 'Marketing',
};

const FORMAT_LABELS: Record<string, string> = {
  TEXT: 'Text',
  IMAGE: 'Image',
  VIDEO: 'Video',
  DOCUMENT: 'Document',
};

const LOCALE_LABELS: Record<string, string> = {
  en: 'English (en)',
  hi: 'Hindi (hi)',
  es: 'Spanish (es)',
  fr: 'French (fr)',
  de: 'German (de)',
  pt: 'Portuguese (pt)',
  ar: 'Arabic (ar)',
};

export default function VendorApproveModal({
  open,
  onOpenChange,
  approval,
  content,
  sysgenTemplateName,
  locale,
  channelSlug,
  readOnly = false,
}: VendorApproveModalProps) {
  const { templateSlug, variantId, mode, version } =
    useTemplateEditorContext();

  const { mutate, isPending } = useStartVendorApproval({
    templateSlug,
    channelSlug,
    variantId,
  });

  const handleConfirm = () => {
    mutate(
      {
        approval_status: 'sent_for_approval',
        vendor_slug: approval.vendor_slug,
        vendor_uid: approval.vendor_uid,
        vendor_template_name: sysgenTemplateName,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          invalidateQueries([
            `template/${templateSlug}/channel/${channelSlug}/variant/${variantId}`,
            mode,
            version,
          ]);
        },
      }
    );
  };

  const templateName = sysgenTemplateName;
  const isSms = channelSlug === 'sms';

  const renderSmsFields = () => {
    const smsContent = content as ISMSContent;
    const SMS_CATEGORY_LABELS: Record<string, string> = {
      service_implicit: 'Transactional',
      service_explicit: 'Engagement',
      promotional: 'Promotional',
    };
    const commType =
      SMS_CATEGORY_LABELS[smsContent.category] ?? smsContent.category;

    const examples = smsContent._examples ?? [];

    return (
      <>
        <CopyableField label="Template Name" value={templateName} />
        {smsContent.header && (
          <CopyableField label="Header" value={smsContent.header} />
        )}
        {commType && (
          <ReadOnlySelect
            label="Template / Communication Type"
            value={commType}
          />
        )}
        <CopyableField label="Content" value={smsContent._parsed_body ?? smsContent.body} multiline />
        {examples.length > 0 && (
          <div className="suprsend-space-y-2">
            <p className="suprsend-text-xs suprsend-font-medium suprsend-text-foreground">
              Variables
            </p>
            {examples.map((val, i) => (
              <CopyableField key={i} label="" value={val} />
            ))}
          </div>
        )}
      </>
    );
  };

  const renderWhatsappFields = () => {
    const waContent = content as IWhatsappContent;
    const language = LOCALE_LABELS[locale] ?? locale;
    const category =
      CATEGORY_LABELS[
        approval.vendor_template_category ?? waContent.category ?? ''
      ] ?? (waContent.category ?? '');

    const headerFormat = waContent.header?.format;
    const isMedia = headerFormat && headerFormat !== 'TEXT';
    const templateType = isMedia ? 'Media' : 'Text';
    const mediaType = isMedia
      ? (FORMAT_LABELS[headerFormat] ?? headerFormat)
      : '';

    const headerText =
      headerFormat === 'TEXT'
        ? (waContent.header?._parsed_text ?? '')
        : '';

    const bodyText = waContent.body?._parsed_text ?? '';
    const footerText = waContent.footer?.text ?? '';
    const buttons = waContent.buttons ?? [];

    const headerExamples = waContent.header?._examples ?? [];
    const bodyExamples = waContent.body?._examples ?? [];
    const dynamicUrlExamples = buttons
      .filter(
        (b) =>
          b.type === 'URL' && b.url_type === 'dynamic' && b._examples?.length
      )
      .flatMap((b) => (b.type === 'URL' ? (b._examples ?? []) : []));
    const hasSampleValues =
      headerExamples.length > 0 ||
      bodyExamples.length > 0 ||
      dynamicUrlExamples.length > 0;

    return (
      <>
        <CopyableField label="Name" value={templateName} />
        <CopyableField label="Language" value={language} />
        <ReadOnlySelect label="Category" value={category} />

        <div className="suprsend-flex suprsend-items-end suprsend-gap-2">
          <div className="suprsend-flex-1">
            <ReadOnlySelect label="Type" value={templateType} />
          </div>
          {isMedia && (
            <div className="suprsend-flex-1">
              <ReadOnlySelect label="" value={mediaType} />
            </div>
          )}
        </div>

        {!isMedia && headerText && (
          <CopyableField label="Header" value={headerText} />
        )}

        <CopyableField label="Body" value={bodyText} multiline />

        {footerText && <CopyableField label="Footer" value={footerText} />}

        {buttons.length > 0 && (
          <div className="suprsend-space-y-2">
            <p className="suprsend-text-xs suprsend-font-medium suprsend-text-foreground">
              Buttons
            </p>
            <div className="suprsend-space-y-6">
              {buttons.map((btn, i) => {
                if (btn.type === 'URL') {
                  const extra = [
                    {
                      label:
                        btn.url_type === 'dynamic' ? 'Dynamic' : 'Static',
                      value: btn.url_static_part,
                    },
                  ];
                  return (
                    <ButtonRow
                      key={i}
                      buttonType="Visit Website"
                      text={btn.text}
                      extra={extra}
                    />
                  );
                }
                if (btn.type === 'PHONE_NUMBER') {
                  return (
                    <div
                      key={i}
                      className="suprsend-flex suprsend-items-center suprsend-gap-2"
                    >
                      <div className="suprsend-w-[140px]">
                        <ReadOnlySelect label="" value="Phone Number" />
                      </div>
                      <div className="suprsend-flex-1">
                        <CopyableField label="" value={btn.text} />
                      </div>
                      <div className="suprsend-flex-1">
                        <CopyableField label="" value={btn.phone_number} />
                      </div>
                    </div>
                  );
                }
                if (btn.type === 'QUICK_REPLY') {
                  return (
                    <ButtonRow
                      key={i}
                      buttonType="Quick Reply"
                      text={btn.text}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {hasSampleValues && (
          <div className="suprsend-space-y-4">
            <p className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground">
              Sample Values
            </p>

            {headerExamples.length > 0 && (
              <div className="suprsend-space-y-2">
                <p className="suprsend-text-xs suprsend-font-medium suprsend-text-foreground">
                  Header
                </p>
                {headerExamples.map((val: string, i: number) => (
                  <CopyableField key={i} label="" value={val} />
                ))}
              </div>
            )}

            {bodyExamples.length > 0 && (
              <div className="suprsend-space-y-2">
                <p className="suprsend-text-xs suprsend-font-medium suprsend-text-foreground">
                  Body
                </p>
                {bodyExamples.map((val: string, i: number) => (
                  <CopyableField key={i} label="" value={val} />
                ))}
              </div>
            )}

            {dynamicUrlExamples.length > 0 && (
              <div className="suprsend-space-y-2">
                <p className="suprsend-text-xs suprsend-font-medium suprsend-text-foreground">
                  Visit Website Button
                </p>
                {dynamicUrlExamples.map((val: string, i: number) => (
                  <CopyableField key={i} label="" value={val} />
                ))}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="suprsend-max-w-2xl suprsend-max-h-[85vh] suprsend-flex suprsend-flex-col suprsend-gap-0">
        <DialogHeader className="suprsend-pb-4 suprsend-border-b suprsend-border-border suprsend--mx-6 suprsend-px-6">
          <DialogTitle>
            {isSms
              ? 'Form to upload on DLT portal'
              : 'Message template to add on vendor portal'}
          </DialogTitle>
          <DialogDescription>
            {isSms
              ? 'Paste these values into the vendor portal form. Skip this step if approved, already.'
              : 'Paste these values into your vendor portal. Skip this step if approved, already.'}
          </DialogDescription>
        </DialogHeader>

        <div className="suprsend-flex-1 suprsend-overflow-y-auto suprsend-space-y-6 suprsend-py-4 suprsend--mx-6 suprsend-px-6">
          {isSms ? renderSmsFields() : renderWhatsappFields()}
        </div>

        <DialogFooter className="suprsend-pt-4 suprsend-border-t suprsend-border-border suprsend--mx-6 suprsend-px-6">
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button disabled={isPending} onClick={handleConfirm}>
              {isSms ? 'Sent for Approval, Next' : 'Added, Next'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
