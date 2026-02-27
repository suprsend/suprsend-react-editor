import { useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import SuggestionInput from '@/components/custom-ui/SuggestionInput';
import SuggestionInputWithEmoji from '@/components/custom-ui/SuggestionInputWithEmoji';
import IPhoneFrame from '@/components/custom-ui/IPhoneFrame';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { makeAbsoluteUrl } from '@/lib/utils';
import HandlebarsRenderer, {
  renderHandlebars,
} from '@/components/custom-ui/HandlebarsRenderer';
import type {
  IOSPushChannelProps,
  IOSPushPreviewProps,
  IOSPushFormValues,
} from '@/types';

export default function IOSPushChannel({
  variantData,
  variables,
}: IOSPushChannelProps) {
  const { templateSlug, variantId } = useTemplateEditorContext();

  const { mutate } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'iospush',
    variantId,
  });

  const content = variantData?.content;

  const { watch, control } = useForm<IOSPushFormValues>({
    values: {
      header: content?.header ?? '',
      body: content?.body ?? '',
      image_url: content?.image_url ?? '',
      action_url: content?.action_url ?? '',
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
      <div className="suprsend-flex-1 suprsend-p-6">
        <div className="suprsend-max-w-2xl suprsend-space-y-6">
          <div className="suprsend-space-y-2">
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

          <div className="suprsend-space-y-2">
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

          <div className="suprsend-space-y-2">
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
                />
              )}
            />
          </div>

          <div className="suprsend-space-y-2">
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
        <IOSPushPreview
          formValues={formValues as IOSPushFormValues}
          variables={variables}
        />
      </div>
    </div>
  );
}

function IOSPushPreview({ formValues, variables }: IOSPushPreviewProps) {
  const resolvedImageUrl = formValues.image_url
    ? makeAbsoluteUrl(renderHandlebars(formValues.image_url, variables))
    : '';

  return (
    <IPhoneFrame>
      {/* Notification card */}
      <div className="suprsend-bg-white suprsend-opacity-70 suprsend-rounded-[14px] suprsend-px-3 suprsend-py-2.5 suprsend-backdrop-blur-[20px]">
        {/* Header row */}
        <div className="suprsend-flex suprsend-items-start suprsend-justify-between suprsend-mb-1">
          <HandlebarsRenderer
            template={formValues.header || 'Notification Title'}
            data={variables}
            className="suprsend-m-0 suprsend-text-[11px] suprsend-font-semibold suprsend-text-foreground suprsend-break-words"
          />
          <span className="suprsend-text-[11px] suprsend-text-muted-foreground">
            now
          </span>
        </div>

        {/* Body */}
        <HandlebarsRenderer
          template={formValues.body || 'Notification body text'}
          data={variables}
          className="suprsend-m-0 suprsend-text-[11px] suprsend-text-muted-foreground suprsend-break-words"
        />

        {/* Image */}
        {resolvedImageUrl && (
          <img
            src={resolvedImageUrl}
            alt="notification"
            className="suprsend-w-full suprsend-max-h-[150px] suprsend-object-cover suprsend-rounded-lg suprsend-mt-1.5"
          />
        )}
      </div>
    </IPhoneFrame>
  );
}
