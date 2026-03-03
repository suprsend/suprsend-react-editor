import { useCallback } from 'react';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import SuggestionInput from '@/components/custom-ui/SuggestionInput';
import SuggestionInputWithEmoji from '@/components/custom-ui/SuggestionInputWithEmoji';
import SuggestionInputWithUpload from '@/components/custom-ui/SuggestionInputWithUpload';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { X, Plus } from 'lucide-react';
import type { WebpushChannelProps, WebpushFormValues } from '@/types';
import { Button } from '@/components/ui/button';
import WebpushPreview from './Preview';

export default function WebpushChannel({
  variantData,
  variables,
}: WebpushChannelProps) {
  const { templateSlug, variantId } = useTemplateEditorContext();

  const { mutate } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'webpush',
    variantId,
  });

  const content = variantData?.content;

  const { watch, control } = useForm<WebpushFormValues>({
    values: {
      header: content?.header ?? '',
      body: content?.body ?? '',
      buttons: content?.buttons ?? [],
      image_url: content?.image_url ?? '',
      action_url: content?.action_url ?? '',
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'buttons',
  });

  const formValues = useWatch({ control });

  const handleAutosave = useCallback(
    (data: WebpushFormValues) => {
      mutate({ content: { ...data } });
    },
    [mutate]
  );

  useAutosave({ watch, onSave: handleAutosave });

  return (
    <div className="suprsend-h-full suprsend-flex">
      {/* Form */}
      <div className="suprsend-flex-1 suprsend-p-6 suprsend-overflow-y-auto">
        <div className="suprsend-max-w-2xl suprsend-space-y-6">
          <div className="suprsend-space-y-1">
            <Controller
              name="header"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field, fieldState }) => (
                <SuggestionInputWithEmoji
                  label="Title"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Notification Title"
                  error={fieldState.error?.message}
                  enableHighlighting
                  enableSuggestions
                  variables={variables}
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
                  as="textarea"
                  rows={4}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Notification Body"
                  error={fieldState.error?.message}
                  enableHighlighting
                  enableSuggestions
                  variables={variables}
                />
              )}
            />
          </div>

          <div className="suprsend-space-y-1">
            <Controller
              name="image_url"
              control={control}
              render={({ field }) => (
                <SuggestionInputWithUpload
                  label="Banner Image URL"
                  mandatory={false}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Image URL"
                  accept="image/*"
                  enableHighlighting
                  enableSuggestions
                  variables={variables}
                />
              )}
            />
            <p className="suprsend-text-xs suprsend-text-muted-foreground">
              Recommended size: 720x480
            </p>
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
                />
              )}
            />
          </div>

          {/* Chrome Action Buttons */}
          <div className="suprsend-space-y-3">
            <p className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground">
              Chrome Action Buttons
            </p>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="suprsend-flex suprsend-items-center suprsend-gap-1"
              >
                <div className="suprsend-flex-1 suprsend-min-w-0">
                  <Controller
                    name={`buttons.${index}.text`}
                    control={control}
                    render={({ field: f }) => (
                      <SuggestionInput
                        value={f.value}
                        onChange={f.onChange}
                        placeholder={`Button ${index + 1} Title`}
                        enableHighlighting
                        enableSuggestions
                        variables={variables}
                      />
                    )}
                  />
                </div>
                <div className="suprsend-flex-1 suprsend-min-w-0">
                  <Controller
                    name={`buttons.${index}.url`}
                    control={control}
                    render={({ field: f }) => (
                      <SuggestionInput
                        value={f.value}
                        onChange={f.onChange}
                        placeholder={`Button ${index + 1} Link`}
                        enableHighlighting
                        enableSuggestions
                        variables={variables}
                      />
                    )}
                  />
                </div>
                <X
                  className="suprsend-w-4 suprsend-h-4 suprsend-cursor-pointer suprsend-text-muted-foreground"
                  onClick={() => remove(index)}
                />
              </div>
            ))}

            {fields.length < 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => append({ text: '', url: '' })}
              >
                <Plus className="suprsend-w-4 suprsend-h-4" />
                Add Button
              </Button>
            )}
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
        <WebpushPreview
          formValues={formValues as WebpushFormValues}
          variables={variables}
        />
      </div>
    </div>
  );
}
