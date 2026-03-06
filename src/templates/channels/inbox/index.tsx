import { useCallback, useState } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import SuggestionInput from '@/components/custom-ui/SuggestionInput';
import SuggestionInputWithEmoji from '@/components/custom-ui/SuggestionInputWithEmoji';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent, useInboxTags } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { X, Plus, ChevronRight } from 'lucide-react';
import type { InboxChannelProps, InboxFormValues } from '@/types';
import InboxPreview from './Preview';
import {
  ReactSelect,
  type DefaultOption,
} from '@/components/custom-ui/ReactSelect';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import DurationInput from '@/components/custom-ui/DurationInput';
import { cn } from '@/lib/utils';

const IMPORTANCE_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'High', value: 'high' },
  { label: 'Low', value: 'low' },
  { label: 'Min', value: 'min' },
];

export default function InboxChannel({
  variantData,
  variables,
}: InboxChannelProps) {
  const { templateSlug, variantId, isLive } = useTemplateEditorContext();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const { mutate } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'inbox',
    variantId,
  });

  const { data: tagsData } = useInboxTags(tagSearch);

  const content = variantData?.content;

  const initialTags =
    content?.tags?.map((tag) => ({ label: tag, value: tag })) || [];

  const { watch, control, setValue } = useForm<InboxFormValues>({
    values: {
      header: content?.header ?? '',
      body: content?.body ?? '',
      action_url: content?.action_url ?? '',
      open_in_new_tab: content?.open_in_new_tab ?? false,
      avatar: {
        image_url: content?.avatar?.image_url ?? '',
        url: content?.avatar?.url ?? '',
      },
      subtext: {
        text: content?.subtext?.text ?? '',
        url: content?.subtext?.url ?? '',
      },
      buttons: content?.buttons ?? [],
      is_pinned: content?.is_pinned ?? false,
      is_expiry_enabled: content?.is_expiry_enabled ?? false,
      expiry: {
        expiry_type: content?.expiry?.expiry_type ?? 'fixed',
        format: content?.expiry?.format ?? 'relative',
        value: content?.expiry?.value ?? '',
        is_expiry_visible: content?.expiry?.is_expiry_visible ?? false,
      },
      importance: content?.importance ?? 'default',
      tags: initialTags,
      extra_data: content?.extra_data ?? '',
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const {
    fields: buttonFields,
    append: appendButton,
    remove: removeButton,
  } = useFieldArray({
    control,
    name: 'buttons',
  });

  const formValues = useWatch({ control });

  const handleAutosave = useCallback(
    (data: InboxFormValues) => {
      const { tags: formTags, buttons, ...rest } = data;

      mutate({
        content: {
          ...rest,
          buttons: buttons?.filter((b) => b.text || b.url) ?? [],
          tags: formTags?.map((t) => t.value) ?? [],
        },
      });
    },
    [mutate]
  );

  useAutosave({ watch, onSave: handleAutosave });

  const tagOptions: DefaultOption[] =
    tagsData?.results?.map((tag: { tag: string }) => ({
      label: tag.tag,
      value: tag.tag,
    })) || [];

  const currentTags: DefaultOption[] = (formValues.tags ?? []).filter(
    (t): t is DefaultOption =>
      typeof t.label === 'string' && typeof t.value === 'string'
  );

  return (
    <div className="suprsend-h-full suprsend-flex">
      {/* Form */}
      <div className="suprsend-flex-1 suprsend-p-6 suprsend-overflow-y-auto">
        <div className="suprsend-max-w-2xl suprsend-space-y-6">
          <div className="suprsend-space-y-1">
            <Controller
              name="header"
              control={control}
              render={({ field }) => (
                <SuggestionInputWithEmoji
                  label="Header"
                  mandatory={false}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Notification Header"
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
              rules={{ required: 'Text is required' }}
              render={({ field, fieldState }) => (
                <SuggestionInputWithEmoji
                  label="Text"
                  as="textarea"
                  rows={4}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Notification Text"
                  error={fieldState.error?.message}
                  enableHighlighting
                  enableSuggestions
                  variables={variables}
                  disabled={isLive}
                />
              )}
            />
            <p className="suprsend-text-xs suprsend-text-muted-foreground">
              Supports{' '}
              <a
                href="https://docs.suprsend.com/docs/in-app-inbox-template#supported-markdown-syntax-in-text-field"
                className="suprsend-text-primary suprsend-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                markdown
              </a>
            </p>
          </div>

          <div className="suprsend-space-y-1">
            <Label>Avatar</Label>
            <div className="suprsend-flex suprsend-gap-2">
              <div className="suprsend-flex-1">
                <Controller
                  name="avatar.image_url"
                  control={control}
                  render={({ field }) => (
                    <SuggestionInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Image URL"
                      mandatory={false}
                      enableHighlighting
                      enableSuggestions
                      variables={variables}
                      disabled={isLive}
                    />
                  )}
                />
              </div>
              <div className="suprsend-flex-1">
                <Controller
                  name="avatar.url"
                  control={control}
                  render={({ field }) => (
                    <SuggestionInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Click Action URL"
                      mandatory={false}
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

          <div className="suprsend-space-y-1">
            <Label>Subtext</Label>
            <div className="suprsend-flex suprsend-gap-2">
              <div className="suprsend-flex-1">
                <Controller
                  name="subtext.text"
                  control={control}
                  render={({ field }) => (
                    <SuggestionInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Subtext"
                      mandatory={false}
                      enableHighlighting
                      enableSuggestions
                      variables={variables}
                      disabled={isLive}
                    />
                  )}
                />
              </div>
              <div className="suprsend-flex-1">
                <Controller
                  name="subtext.url"
                  control={control}
                  render={({ field }) => (
                    <SuggestionInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Click Action URL"
                      mandatory={false}
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
            <div className="suprsend-flex suprsend-items-center gap-2 suprsend-space-y-1">
              <Controller
                name="open_in_new_tab"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLive}
                  />
                )}
              />
              <label className="suprsend-text-sm suprsend-text-foreground suprsend-cursor-pointer">
                Open in new tab
              </label>
            </div>
          </div>

          <div className="suprsend-space-y-1">
            <p className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground">
              Action Buttons
            </p>
            <div className="suprsend-space-y-2">
              {buttonFields.map((field, index) => (
                <div key={field.id} className="suprsend-space-y-1">
                  <div className="suprsend-flex suprsend-items-center suprsend-gap-1">
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
                            disabled={isLive}
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
                            disabled={isLive}
                          />
                        )}
                      />
                    </div>
                    <X
                      className={cn(
                        'suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground',
                        isLive
                          ? 'suprsend-opacity-50 suprsend-cursor-not-allowed'
                          : 'suprsend-cursor-pointer'
                      )}
                      onClick={() => !isLive && removeButton(index)}
                    />
                  </div>
                  <div className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-ml-1">
                    <Controller
                      name={`buttons.${index}.open_in_new_tab`}
                      control={control}
                      render={({ field: f }) => (
                        <Checkbox
                          checked={f.value}
                          onCheckedChange={f.onChange}
                          disabled={isLive}
                        />
                      )}
                    />
                    <label className="suprsend-text-sm suprsend-text-foreground suprsend-cursor-pointer">
                      Open in new tab
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {buttonFields.length < 2 && (
              <div className="suprsend-pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLive}
                  onClick={() =>
                    appendButton({ text: '', url: '', open_in_new_tab: false })
                  }
                >
                  <Plus className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground" />
                  Add Button
                </Button>
              </div>
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
                <div className="suprsend-space-y-2">
                  <Label>Tags</Label>
                  <ReactSelect<DefaultOption, true>
                    variant="creatable"
                    isMulti
                    value={currentTags}
                    options={tagOptions}
                    onInputChange={(val) => setTagSearch(val)}
                    onChange={(newValue) => {
                      setValue(
                        'tags',
                        (newValue as DefaultOption[]).map((t) => ({
                          label: t.label,
                          value: t.value,
                        })),
                        { shouldDirty: true }
                      );
                    }}
                    onCreateOption={(inputValue) => {
                      const trimmed = inputValue.trim();
                      if (
                        trimmed &&
                        !currentTags.some((t) => t.value === trimmed)
                      ) {
                        setValue(
                          'tags',
                          [...currentTags, { label: trimmed, value: trimmed }],
                          { shouldDirty: true }
                        );
                      }
                    }}
                    placeholder="Search or create tag..."
                    isClearable
                    isDisabled={isLive}
                  />
                </div>

                <div className="suprsend-flex suprsend-items-center suprsend-gap-3">
                  <Label>Pinned Notification</Label>
                  <Controller
                    name="is_pinned"
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

                <div className="suprsend-space-y-3">
                  <div className="suprsend-flex suprsend-items-center suprsend-gap-3">
                    <Label>Expiry</Label>
                    <Controller
                      name="is_expiry_enabled"
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

                  {formValues.is_expiry_enabled && (
                    <div className="suprsend-space-y-4 suprsend-pl-1">
                      <Controller
                        name="expiry.format"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={(val: string) => {
                              field.onChange(val);
                              if (val === 'relative') {
                                setValue('expiry.value', '0d0h0m0s', {
                                  shouldDirty: true,
                                });
                              } else {
                                setValue('expiry.value', '', {
                                  shouldDirty: true,
                                });
                              }
                            }}
                            className="suprsend-flex suprsend-flex-row suprsend-gap-4"
                            disabled={isLive}
                          >
                            <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                              <RadioGroupItem value="relative" />
                              <Label className="suprsend-font-normal">
                                Relative
                              </Label>
                            </div>
                            <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                              <RadioGroupItem value="absolute" />
                              <Label className="suprsend-font-normal">
                                Absolute
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      />

                      {formValues.expiry?.format === 'relative' ? (
                        <Controller
                          name="expiry.value"
                          control={control}
                          render={({ field }) => (
                            <DurationInput
                              value={field.value || '0d0h0m0s'}
                              onChange={field.onChange}
                              disabled={isLive}
                            />
                          )}
                        />
                      ) : (
                        <div />
                      )}

                      <div className="suprsend-flex suprsend-items-center suprsend-gap-3">
                        <Label className="suprsend-font-normal">
                          Show expiry to user
                        </Label>
                        <Controller
                          name="expiry.is_expiry_visible"
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
                    </div>
                  )}
                </div>

                <div className="suprsend-space-y-1">
                  <Label>Importance</Label>
                  <Controller
                    name="importance"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLive}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select importance" />
                        </SelectTrigger>
                        <SelectContent>
                          {IMPORTANCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="suprsend-space-y-1">
                  <Label>Extra Data</Label>
                  <Controller
                    name="extra_data"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        value={field.value}
                        onChange={field.onChange}
                        placeholder='{"key": "value"}'
                        rows={4}
                        disabled={isLive}
                      />
                    )}
                  />
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
            'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <InboxPreview
          formValues={formValues as InboxFormValues}
          variables={variables}
        />
      </div>
    </div>
  );
}
