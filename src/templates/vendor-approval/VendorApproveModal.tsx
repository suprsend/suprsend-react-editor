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
import { useStartVendorApproval } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import {
  CATEGORY_LABELS,
  FORMAT_LABELS,
  LOCALE_LABELS,
  SMS_CATEGORY_LABELS,
} from './constants';
import type {
  VendorApproval,
  IWhatsappContent,
  ISMSContent,
  VendorApproveModalProps,
} from '@/types';

// --- Shared display components ---

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

function ExamplesList({ title, examples }: { title: string; examples: string[] }) {
  if (examples.length === 0) return null;
  return (
    <div className="suprsend-space-y-2">
      <p className="suprsend-text-xs suprsend-font-medium suprsend-text-foreground">
        {title}
      </p>
      {examples.map((val, i) => (
        <CopyableField key={i} label="" value={val} />
      ))}
    </div>
  );
}

// --- Channel-specific field renderers ---

function SmsFields({ content, templateName }: { content: ISMSContent; templateName: string }) {
  const commType = SMS_CATEGORY_LABELS[content.category] ?? content.category;
  const examples = content._examples ?? [];

  return (
    <>
      <CopyableField label="Template Name" value={templateName} />
      {content.header && <CopyableField label="Header" value={content.header} />}
      {commType && <ReadOnlySelect label="Template / Communication Type" value={commType} />}
      <CopyableField label="Content" value={content._parsed_body ?? content.body} multiline />
      <ExamplesList title="Variables" examples={examples} />
    </>
  );
}

function WhatsappFields({
  content,
  templateName,
  locale,
  approval,
}: {
  content: IWhatsappContent;
  templateName: string;
  locale: string;
  approval: VendorApproval;
}) {
  const language = LOCALE_LABELS[locale] ?? locale;
  const category =
    CATEGORY_LABELS[approval.vendor_template_category ?? content.category ?? ''] ??
    (content.category ?? '');

  const headerFormat = content.header?.format;
  const isMedia = headerFormat && headerFormat !== 'TEXT';
  const templateType = isMedia ? 'Media' : 'Text';
  const mediaType = isMedia ? (FORMAT_LABELS[headerFormat] ?? headerFormat) : '';
  const headerText = headerFormat === 'TEXT' ? (content.header?._parsed_text ?? '') : '';
  const bodyText = content.body?._parsed_text ?? '';
  const footerText = content.footer?.text ?? '';
  const buttons = content.buttons ?? [];

  const headerExamples = content.header?._examples ?? [];
  const bodyExamples = content.body?._examples ?? [];
  const dynamicUrlExamples = buttons
    .filter((b) => b.type === 'URL' && b.url_type === 'dynamic' && b._examples?.length)
    .flatMap((b) => (b.type === 'URL' ? (b._examples ?? []) : []));
  const hasSampleValues =
    headerExamples.length > 0 || bodyExamples.length > 0 || dynamicUrlExamples.length > 0;

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

      {!isMedia && headerText && <CopyableField label="Header" value={headerText} />}
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
                return (
                  <ButtonRow
                    key={i}
                    buttonType="Visit Website"
                    text={btn.text}
                    extra={[{
                      label: btn.url_type === 'dynamic' ? 'Dynamic' : 'Static',
                      value: btn.url_static_part,
                    }]}
                  />
                );
              }
              if (btn.type === 'PHONE_NUMBER') {
                return (
                  <div key={i} className="suprsend-flex suprsend-items-center suprsend-gap-2">
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
                return <ButtonRow key={i} buttonType="Quick Reply" text={btn.text} />;
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
          <ExamplesList title="Header" examples={headerExamples} />
          <ExamplesList title="Body" examples={bodyExamples} />
          <ExamplesList title="Visit Website Button" examples={dynamicUrlExamples} />
        </div>
      )}
    </>
  );
}

// --- Main modal ---

export default function VendorApproveModal({
  open,
  onOpenChange,
  approval,
  content,
  sysgenTemplateName,
  locale,
  channelSlug,
  readOnly = false,
  onConfirmSuccess,
}: VendorApproveModalProps) {
  const { templateSlug, variantId } = useTemplateEditorContext();
  const { mutate, isPending } = useStartVendorApproval({ templateSlug, channelSlug, variantId });
  const isSms = channelSlug === 'sms';

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
          onConfirmSuccess?.();
        },
      }
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
          {isSms ? (
            <SmsFields content={content as ISMSContent} templateName={sysgenTemplateName} />
          ) : (
            <WhatsappFields
              content={content as IWhatsappContent}
              templateName={sysgenTemplateName}
              locale={locale}
              approval={approval}
            />
          )}
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
