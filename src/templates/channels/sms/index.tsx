import { useCallback } from 'react';
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
import type { SMSChannelProps, SMSFormValues } from '@/types';
import SMSPreview from './Preview';

const CATEGORY_OPTIONS = [
  {
    label: 'Transactional',
    value: 'SERVICE_IMPLICIT',
    notifCategory: 'transactional',
  },
  {
    label: 'Engagement',
    value: 'SERVICE_EXPLICIT',
    notifCategory: 'transactional',
  },
  { label: 'Promotional', value: 'PROMOTIONAL', notifCategory: 'promotional' },
];

export default function SMSChannel({
  variantData,
  variables,
}: SMSChannelProps) {
  const { templateSlug, variantId, isLive } = useTemplateEditorContext();

  const { mutate } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'sms',
    variantId,
  });

  const content = variantData?.content;
  const isDlt = content?.type === 'dlt';

  const { watch, control, setValue } = useForm<SMSFormValues>({
    values: {
      category: content?.category ?? '',
      header: content?.header ?? '',
      body: content?.body ?? '',
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
        <div className="suprsend-max-w-2xl suprsend-space-y-6">
          {/* Category - DLT only */}
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

          {/* Header - DLT only */}
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

          {/* Body */}
          <div className="suprsend-space-y-1">
            <Controller
              name="body"
              control={control}
              rules={{ required: 'Body is required' }}
              render={({ field, fieldState }) => (
                <SuggestionInputWithEmoji
                  label="Body"
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
            'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <SMSPreview
          formValues={formValues as SMSFormValues}
          variables={variables}
        />
      </div>
    </div>
  );
}
