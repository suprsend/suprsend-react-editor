import { useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import SuggestionInput from '@/components/custom-ui/SuggestionInput';
import SuggestionInputWithEmoji from '@/components/custom-ui/SuggestionInputWithEmoji';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import SaveIndicator from '@/components/custom-ui/SaveIndicator';
import type { IOSPushChannelProps, IOSPushFormValues } from '@/types';
import IOSPushPreview from './Preview';

export default function IOSPushChannel({
  variantData,
  variables,
}: IOSPushChannelProps) {
  const { templateSlug, variantId, isLive } = useTemplateEditorContext();

  const {
    mutate,
    isPending: isSaving,
    isSuccess: isSaved,
  } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'iospush',
    variantId,
  });

  const content = variantData?.content;

  const { watch, control } = useForm<IOSPushFormValues>({
    mode: 'onChange',
    values: {
      header: content?.header ?? '',
      body: content?.body ?? '',
      image_url: content?.image_url ?? '',
      action_url: content?.action_url ?? '',
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const formValues = useWatch({ control });

  const handleAutosave = useCallback(
    (data: IOSPushFormValues) => {
      mutate({ content: { ...data } });
    },
    [mutate]
  );

  useAutosave({ watch, onSave: handleAutosave });

  return (
    <div className="suprsend-h-full suprsend-flex">
      {/* Form */}
      <div className="suprsend-flex-1 suprsend-p-6 suprsend-overflow-y-auto">
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-mb-6">
          <h2 className="suprsend-text-base suprsend-font-semibold suprsend-text-foreground">
            iOS Push Template
          </h2>
          <SaveIndicator isSaving={isSaving} isSaved={isSaved} className="" />
        </div>
        <div className="suprsend-max-w-2xl suprsend-space-y-6">
          <div className="suprsend-space-y-1">
            <Controller
              name="header"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field, fieldState }) => (
                <SuggestionInputWithEmoji
                  label="Title"
                  mandatory
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Notification Title"
                  error={fieldState.error?.message}
                  enableHighlighting
                  enableSuggestions
                  variables={variables}
                  disabled={isLive}
                />
              )}
            />
          </div>

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
                  rows={4}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Notification Body"
                  error={fieldState.error?.message}
                  enableHighlighting
                  enableSuggestions
                  variables={variables}
                  disabled={isLive}
                />
              )}
            />
          </div>

          <div className="suprsend-space-y-1">
            <Controller
              name="image_url"
              control={control}
              render={({ field }) => (
                <SuggestionInput
                  label="Image URL"
                  mandatory={false}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Image URL"
                  enableHighlighting
                  enableSuggestions
                  variables={variables}
                  disabled={isLive}
                />
              )}
            />
          </div>

          <div className="suprsend-space-y-1">
            <Controller
              name="action_url"
              control={control}
              render={({ field }) => (
                <SuggestionInput
                  label="Action URL"
                  mandatory={false}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Launch URL"
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
        <IOSPushPreview
          formValues={formValues as IOSPushFormValues}
          variables={variables}
        />
      </div>
    </div>
  );
}
