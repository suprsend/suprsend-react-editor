import { useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { DeviceFrameset } from 'react-device-frameset';
import SuggestionInput from '@/components/custom-ui/SuggestionInput';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { makeAbsoluteUrl } from '@/lib/utils';
import type {
  IIOSPushContentResponse,
  IOSPushFormValues,
  IOSPushContentPayload,
} from '@/types';
import 'react-device-frameset/styles/marvel-devices.min.css';

interface IOSPushChannelProps {
  variantData: IIOSPushContentResponse;
}

export default function IOSPushChannel({ variantData }: IOSPushChannelProps) {
  const {
    templateSlug,
    variantId,
    workspaceUid,
    conditions,
    locale,
    tenantId,
  } = useTemplateEditorContext();

  const { mutate } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'iospush',
    variantId,
    workspaceUid,
    conditions,
    locale,
    tenantId,
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
      const payload: IOSPushContentPayload = {
        content: {
          header: data.header,
          body: data.body,
          image_url: data.image_url,
          action_url: data.action_url,
        },
      };
      mutate(payload);
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
                <SuggestionInput
                  label="Title"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Notification Title"
                  error={fieldState.error?.message}
                  enableHighlighting
                  enableSuggestions
                  variables={{}}
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
                <SuggestionInput
                  label="Body"
                  as="textarea"
                  rows={4}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Notification Body"
                  error={fieldState.error?.message}
                  enableHighlighting
                  enableSuggestions
                  variables={{}}
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
                  variables={{}}
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
                  variables={{}}
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
        <IOSPushPreview formValues={formValues as IOSPushFormValues} />
      </div>
    </div>
  );
}

interface IOSPushPreviewProps {
  formValues: IOSPushFormValues;
}

function IOSPushPreview({ formValues }: IOSPushPreviewProps) {
  const imageUrl = formValues.image_url
    ? makeAbsoluteUrl(formValues.image_url)
    : '';

  return (
    <div style={{ transform: 'scale(0.75)', transformOrigin: 'center' }}>
      <DeviceFrameset device="iPhone X">
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 16px',
            background:
              'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          }}
        >
          {/* Notification card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 14,
              padding: '12px',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: '#888',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                }}
              >
                App Name
              </span>
              <span style={{ fontSize: 12, color: '#888' }}>now</span>
            </div>

            {/* Title */}
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#000',
                margin: 0,
                wordBreak: 'break-word',
              }}
            >
              {formValues.header || 'Notification Title'}
            </p>

            {/* Body */}
            <p
              style={{
                fontSize: 13,
                color: '#333',
                margin: '4px 0 0',
                wordBreak: 'break-word',
              }}
            >
              {formValues.body || 'Notification body text'}
            </p>

            {/* Image */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="notification"
                style={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'cover',
                  borderRadius: 8,
                  marginTop: 8,
                }}
              />
            )}
          </div>
        </div>
      </DeviceFrameset>
    </div>
  );
}
