import { useCallback, useState } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import SuggestionInput from '@/components/custom-ui/SuggestionInput';
import SuggestionInputWithEmoji from '@/components/custom-ui/SuggestionInputWithEmoji';
import SuggestionInputWithUpload from '@/components/custom-ui/SuggestionInputWithUpload';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { X, Plus, ChevronRight } from '@/assets/icons';
import SaveIndicator from '@/components/custom-ui/SaveIndicator';
import type { AndroidPushChannelProps, AndroidPushFormValues } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import AndroidPushPreview from './Preview';

export default function AndroidPushChannel({
  variantData,
  variables,
}: AndroidPushChannelProps) {
  const { templateSlug, variantId, isLive } = useTemplateEditorContext();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const {
    mutate,
    isPending: isSaving,
    isSuccess: isSaved,
  } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'androidpush',
    variantId,
  });

  const content = variantData?.content;

  const extraPayloadArray = content?.extra_payload
    ? Object.entries(content.extra_payload).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    : [];

  const { watch, control, getValues, trigger } = useForm<AndroidPushFormValues>(
    {
      mode: 'onChange',
      values: {
        header: content?.header ?? '',
        body: content?.body ?? '',
        subtext: content?.subtext ?? '',
        image_url: content?.image_url ?? '',
        action_url: content?.action_url ?? '',
        buttons: content?.buttons ?? [],
        is_silent: content?.is_silent ?? false,
        is_sticky: content?.is_sticky ?? false,
        timeout_sec: content?.timeout_sec ?? 0,
        group: content?.group ?? '',
        icon_small: content?.icon_small ?? '',
        channel_sound: content?.channel_sound ?? '',
        extra_payload: extraPayloadArray.length > 0 ? extraPayloadArray : [],
      },
      resetOptions: {
        keepDirtyValues: true,
      },
    }
  );

  const {
    fields: buttonFields,
    append: appendButton,
    remove: removeButton,
  } = useFieldArray({
    control,
    name: 'buttons',
  });

  const {
    fields: extraPayloadFields,
    append: appendPayload,
    remove: removePayload,
  } = useFieldArray({
    control,
    name: 'extra_payload',
  });

  const formValues = useWatch({ control });

  const handleAutosave = useCallback(
    (data: AndroidPushFormValues) => {
      const extraPayload: Record<string, string> = {};
      data.extra_payload?.forEach(({ key, value }) => {
        if (key) {
          extraPayload[key] = value;
        }
      });

      const validButtons = data.buttons?.filter((b) => b.text || b.url) ?? [];

      mutate({
        content: {
          ...data,
          buttons: validButtons,
          extra_payload: extraPayload,
          timeout_sec: data.timeout_sec || 0,
        },
      });
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
            Android Push Template
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
                  label="Message"
                  mandatory
                  as="textarea"
                  rows={4}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Notification Message"
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
              name="subtext"
              control={control}
              render={({ field }) => (
                <SuggestionInput
                  label="Subtext"
                  mandatory={false}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Subtext"
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
                <SuggestionInputWithUpload
                  label="Banner Image"
                  mandatory={false}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Banner Image URL"
                  accept="image/*"
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

          <div className="suprsend-space-y-3">
            <p className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground">
              Action Buttons
            </p>

            {buttonFields.map((field, index) => (
              <div
                key={field.id}
                className="suprsend-flex suprsend-items-start suprsend-gap-1"
              >
                <div className="suprsend-flex-1 suprsend-min-w-0">
                  <Controller
                    name={`buttons.${index}.text`}
                    control={control}
                    rules={{
                      validate: (value) => {
                        const url = getValues(`buttons.${index}.url`);
                        if (url && !value) return 'Title is required';
                        return true;
                      },
                    }}
                    render={({ field: f, fieldState }) => (
                      <SuggestionInput
                        value={f.value}
                        onChange={(val) => {
                          f.onChange(val);
                          trigger(`buttons.${index}.url`);
                        }}
                        placeholder={`Button ${index + 1} Title`}
                        error={fieldState.error?.message}
                        enableHighlighting
                        enableSuggestions
                        variables={variables}
                        disabled={isLive}
                      />
                    )}
                  />
                </div>
                <div className="suprsend-flex-1 suprsend-min-w-0">
                  <Controller
                    name={`buttons.${index}.url`}
                    control={control}
                    rules={{
                      validate: (value) => {
                        const text = getValues(`buttons.${index}.text`);
                        if (text && !value) return 'Link is required';
                        return true;
                      },
                    }}
                    render={({ field: f, fieldState }) => (
                      <SuggestionInput
                        value={f.value}
                        onChange={(val) => {
                          f.onChange(val);
                          trigger(`buttons.${index}.text`);
                        }}
                        placeholder={`Button ${index + 1} Link`}
                        error={fieldState.error?.message}
                        enableHighlighting
                        enableSuggestions
                        variables={variables}
                        disabled={isLive}
                      />
                    )}
                  />
                </div>
                {!isLive && (
                  <X
                    className="suprsend-w-4 suprsend-h-4 suprsend-cursor-pointer suprsend-text-muted-foreground suprsend-mt-2.5"
                    onClick={() => removeButton(index)}
                  />
                )}
              </div>
            ))}

            {buttonFields.length < 3 && !isLive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => appendButton({ id: '', url: '', text: '' })}
              >
                <Plus className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground" />
                Add Button
              </Button>
            )}
          </div>

          <div className="suprsend-border-t suprsend-border-dashed suprsend-border-border" />

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="suprsend-flex suprsend-items-center suprsend-gap-1 suprsend-cursor-pointer">
              <p className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground">
                Advanced Configuration
              </p>
              <ChevronRight
                className={cn(
                  'suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground suprsend-transition-transform suprsend-duration-200',
                  advancedOpen && 'suprsend-rotate-90'
                )}
              />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="suprsend-space-y-5 suprsend-pt-4">
                <div className="suprsend-flex suprsend-items-center suprsend-gap-3">
                  <Label>Silent</Label>
                  <Controller
                    name="is_silent"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLive}
                      />
                    )}
                  />
                </div>

                <div className="suprsend-flex suprsend-items-center suprsend-gap-3">
                  <Label>Sticky Notifications</Label>
                  <Controller
                    name="is_sticky"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLive}
                      />
                    )}
                  />
                </div>

                <div className="suprsend-space-y-1">
                  <Label>Timeout (in seconds)</Label>
                  <Controller
                    name="timeout_sec"
                    control={control}
                    render={({ field }) => (
                      <Input
                        min={0}
                        value={field.value || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? Number(val) : 0);
                        }}
                        placeholder="0"
                        disabled={isLive}
                      />
                    )}
                  />
                </div>

                <div className="suprsend-space-y-1">
                  <Label>Notification Group</Label>
                  <Controller
                    name="group"
                    control={control}
                    render={({ field }) => (
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Notification group"
                        disabled={isLive}
                      />
                    )}
                  />
                </div>

                <div className="suprsend-space-y-1">
                  <Label>App Icon</Label>
                  <Controller
                    name="icon_small"
                    control={control}
                    render={({ field }) => (
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Small icon identifier name"
                        disabled={isLive}
                      />
                    )}
                  />
                </div>

                <div className="suprsend-space-y-1">
                  <Label>Sound</Label>
                  <Controller
                    name="channel_sound"
                    control={control}
                    render={({ field }) => (
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Sound file name"
                        disabled={isLive}
                      />
                    )}
                  />
                </div>

                <div className="suprsend-space-y-3">
                    <p className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground">
                      Custom key-value pairs
                    </p>

                    {extraPayloadFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="suprsend-flex suprsend-items-center suprsend-gap-1"
                      >
                        <div className="suprsend-flex-1 suprsend-min-w-0">
                          <Controller
                            name={`extra_payload.${index}.key`}
                            control={control}
                            render={({ field: f }) => (
                              <SuggestionInput
                                value={f.value}
                                onChange={f.onChange}
                                placeholder="Key"
                                enableHighlighting
                                enableSuggestions
                                variables={variables}
                                disabled={isLive}
                              />
                            )}
                          />
                        </div>
                        <div className="suprsend-flex-1 suprsend-min-w-0">
                          <Controller
                            name={`extra_payload.${index}.value`}
                            control={control}
                            render={({ field: f }) => (
                              <SuggestionInput
                                value={f.value}
                                onChange={f.onChange}
                                placeholder="Value"
                                enableHighlighting
                                enableSuggestions
                                variables={variables}
                                disabled={isLive}
                              />
                            )}
                          />
                        </div>
                        {!isLive && (
                          <X
                            className="suprsend-w-4 suprsend-h-4 suprsend-cursor-pointer suprsend-text-muted-foreground"
                            onClick={() => removePayload(index)}
                          />
                        )}
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLive}
                      onClick={() => appendPayload({ key: '', value: '' })}
                    >
                      <Plus className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground" />
                      Add key-value pair
                    </Button>
                  </div>
                </div>
            </CollapsibleContent>
          </Collapsible>
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
        <AndroidPushPreview
          formValues={formValues as AndroidPushFormValues}
          variables={variables}
        />
      </div>
    </div>
  );
}
