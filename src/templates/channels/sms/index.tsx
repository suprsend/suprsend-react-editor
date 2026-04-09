import { useCallback, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import SuggestionInputWithEmoji from '@/components/custom-ui/SuggestionInputWithEmoji';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent, useSMSHeaders } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import SaveIndicator from '@/components/custom-ui/SaveIndicator';
import ApprovalStatusBadge from '@/templates/vendor-approval/ApprovalStatusBadge';
import DiscardApprovalModal from '@/templates/vendor-approval/DiscardApprovalModal';
import type { SMSChannelProps, SMSFormValues } from '@/types';
import VendorApprovalBanner from '@/templates/vendor-approval/VendorApprovalBanner';
import { Button } from '@/components/ui/button';
import SMSPreview from './Preview';

const CATEGORY_OPTIONS = [
  {
    label: 'Transactional',
    value: 'service_implicit',
    notifCategory: 'transactional',
  },
  {
    label: 'Engagement',
    value: 'service_explicit',
    notifCategory: 'transactional',
  },
  { label: 'Promotional', value: 'promotional', notifCategory: 'promotional' },
];

export default function SMSChannel({
  variantData,
  variables,
}: SMSChannelProps) {
  const { templateSlug, variantId, isLive, isPrivate } = useTemplateEditorContext();
  const [discardOpen, setDiscardOpen] = useState(false);

  const {
    mutate,
    isPending: isSaving,
    isSuccess: isSaved,
  } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'sms',
    variantId,
  });

  const content = variantData?.content;
  const isDlt = content?.type === 'dlt';

  const { watch, control, setValue } = useForm<SMSFormValues>({
    mode: 'onChange',
    values: {
      category: content?.category ?? '',
      header: content?.header ?? '',
      body: content?.body ?? '',
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const formValues = useWatch({ control });
  const notifCategory =
    CATEGORY_OPTIONS.find((opt) => opt.value === formValues.category)
      ?.notifCategory ?? '';

  const { data: smsHeadersData } = useSMSHeaders(notifCategory);
  const smsHeaders: string[] = smsHeadersData?.sms_headers ?? [];

  const handleAutosave = useCallback(
    (data: SMSFormValues) => {
      mutate({
        content: {
          ...data,
          type: content?.type ?? 'dlt',
        },
      });
    },
    [mutate, content?.type]
  );

  useAutosave({ watch, onSave: handleAutosave });

  return (
    <div className="suprsend-h-full suprsend-flex">
      {/* Form */}
      <div className="suprsend-flex-1 suprsend-p-6 suprsend-overflow-y-auto">
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-mb-6">
          <div className="suprsend-flex suprsend-items-center suprsend-gap-3">
            <h2 className="suprsend-text-base suprsend-font-semibold suprsend-text-foreground">
              SMS Template
            </h2>
            {isLive && <ApprovalStatusBadge approvalStatus={variantData?.approval_status} discardComment={variantData?.discard_comment} />}
          </div>
          <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
            {isLive && variantData?.needs_vendor_approval && !['approved', 'rejected', 'discarded'].includes(variantData?.approval_status ?? '') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDiscardOpen(true)}
              >
                Cancel Approval
              </Button>
            )}
            <SaveIndicator isSaving={isSaving} isSaved={isSaved} className="" />
          </div>
        </div>
        <div className="suprsend-max-w-2xl suprsend-space-y-6">
          {isLive && isPrivate && variantData?.needs_vendor_approval && variantData?.approval_status !== 'discarded' && (
            <VendorApprovalBanner
              channelSlug="sms"
              vendorApprovals={variantData?.vendor_approvals}
              sysgenTemplateName={variantData?.sysgen_template_name}
              locale={variantData?.locale}
              content={content}
            />
          )}
          {isDlt && (
            <div className="suprsend-space-y-1">
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field, fieldState }) => (
                  <div className="suprsend-space-y-1.5">
                    <label className="suprsend-text-sm suprsend-font-medium suprsend-text-foreground">
                      Category
                      <span className="suprsend-text-destructive suprsend-ml-0.5">
                        *
                      </span>
                    </label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue('header', '');
                      }}
                      disabled={isLive}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error?.message && (
                      <p className="suprsend-text-sm suprsend-text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          )}

          {isDlt && (
            <div className="suprsend-space-y-1">
              <Controller
                name="header"
                control={control}
                rules={{ required: 'Header is required' }}
                render={({ field, fieldState }) => (
                  <div className="suprsend-space-y-1.5">
                    <label className="suprsend-text-sm suprsend-font-medium suprsend-text-foreground">
                      Header
                      <span className="suprsend-text-destructive suprsend-ml-0.5">
                        *
                      </span>
                    </label>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLive || !formValues.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select header" />
                      </SelectTrigger>
                      <SelectContent>
                        {smsHeaders.length > 0 ? (
                          smsHeaders.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))
                        ) : (
                          <p className="suprsend-px-2 suprsend-py-1.5 suprsend-text-sm suprsend-text-muted-foreground suprsend-italic">
                            No headers available
                          </p>
                        )}
                      </SelectContent>
                    </Select>
                    {fieldState.error?.message && (
                      <p className="suprsend-text-sm suprsend-text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          )}

          <div className="suprsend-space-y-1">
            <Controller
              name="body"
              control={control}
              rules={{ required: 'Body is required' }}
              render={({ field, fieldState }) => (
                <SuggestionInputWithEmoji
                  label="Body"
                  mandatory
                  as="textarea"
                  rows={6}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="SMS body text"
                  error={fieldState.error?.message}
                  enableHighlighting
                  enableSuggestions
                  variables={variables}
                  disabled={isLive}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        className="suprsend-flex-1 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-border-l suprsend-overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <SMSPreview
          formValues={formValues as SMSFormValues}
          variables={variables}
        />
      </div>

      <DiscardApprovalModal
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        channelSlug="sms"
      />
    </div>
  );
}
