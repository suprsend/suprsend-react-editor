import { useCallback, useEffect } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import SuggestionInput from '@/components/custom-ui/SuggestionInput';
import SuggestionInputWithEmoji from '@/components/custom-ui/SuggestionInputWithEmoji';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { X, Plus } from '@/assets/icons';
import SaveIndicator from '@/components/custom-ui/SaveIndicator';
import WhatsappPreview from './Preview';
import type {
  WhatsappChannelProps,
  WhatsappFormValues,
  WhatsappTemplateType,
  IWhatsappHeader,
  IWhatsappButton,
  IWhatsappCTAButton,
  IWhatsappQuickReplyButton,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  ReactSelect,
  type DefaultOption,
} from '@/components/custom-ui/ReactSelect';
// --- Validation helpers ---

const EMOJI_REGEX = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
const HANDLEBAR_REGEX = /\{{2,3}[^}]+\}{2,3}/g;

function noEmojis(value: string): string | true {
  if (!value) return true;
  return EMOJI_REGEX.test(value) ? 'Emojis are not supported' : true;
}

function noVariables(value: string): string | true {
  if (!value) return true;
  return HANDLEBAR_REGEX.test(value) ? 'Variables are not allowed' : true;
}

function maxOneVariable(value: string): string | true {
  if (!value) return true;
  const matches = value.match(HANDLEBAR_REGEX);
  return matches && matches.length > 1 ? 'Only one variable is allowed' : true;
}

function noEmojisNoVariables(value: string): string | true {
  const emojiCheck = noEmojis(value);
  if (emojiCheck !== true) return emojiCheck;
  return noVariables(value);
}

// Count characters treating each handlebar as 1 character
function countCharsWithHandlebars(text: string): number {
  if (!text) return 0;
  let result = text.replace(/\{{3}[^}]+\}{3}/g, 'X');
  result = result.replace(/\{{2}[^}]+\}{2}/g, 'X');
  return result.length;
}

const URL_REGEX =
  /^(https?:\/\/)(www\.)?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;

const TEMPLATE_CATEGORIES = [
  { label: 'Utility', value: 'UTILITY' },
  { label: 'Marketing', value: 'MARKETING' },
];

const TYPE_OPTIONS = [
  { label: 'Text', value: 'TEXT' },
  { label: 'Media', value: 'MEDIA' },
];

const MEDIA_FORMAT_OPTIONS = [
  { label: 'Image (.jpg, .png)', value: 'IMAGE' },
  { label: 'Video (.mp4)', value: 'VIDEO' },
  { label: 'Document (.pdf)', value: 'DOCUMENT' },
];

const BUTTON_TYPE_OPTIONS = [
  { label: 'None', value: 'NONE' },
  { label: 'Call to Action', value: 'CALL_TO_ACTION' },
  { label: 'Quick Reply', value: 'QUICK_REPLY' },
];

const URL_TYPE_OPTIONS = [
  { label: 'Static', value: 'static' },
  { label: 'Dynamic', value: 'dynamic' },
];

function deriveTemplateType(
  headerFormat?: string | null
): WhatsappTemplateType {
  if (!headerFormat || headerFormat === 'TEXT') return 'TEXT';
  return 'MEDIA';
}

export default function WhatsappChannel({
  variantData,
  variables,
}: WhatsappChannelProps) {
  const { templateSlug, variantId, isLive } = useTemplateEditorContext();

  const {
    mutate,
    isPending: isSaving,
    isSuccess: isSaved,
  } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'whatsapp',
    variantId,
  });

  const content = variantData?.content;

  const ctaButtons = (content?.buttons?.filter(
    (b) => b.type === 'URL' || b.type === 'PHONE_NUMBER'
  ) ?? []) as IWhatsappCTAButton[];

  const quickReplyButtons = (content?.buttons?.filter(
    (b) => b.type === 'QUICK_REPLY'
  ) ?? []) as IWhatsappQuickReplyButton[];

  const { watch, control, setValue, trigger, getValues } =
    useForm<WhatsappFormValues>({
      mode: 'onChange',
      values: {
        category: content?.category ?? '',
        template_type: deriveTemplateType(content?.header?.format),
        header_text: content?.header?.text ?? '',
        header_media_format:
          content?.header?.format && content.header.format !== 'TEXT'
            ? (content.header.format as 'IMAGE' | 'VIDEO' | 'DOCUMENT')
            : 'IMAGE',
        header_media_url: content?.header?.media_url ?? '',
        header_document_filename: content?.header?.filename ?? '',
        body_text: content?.body?.text ?? '',
        footer_text: content?.footer?.text ?? '',
        button_type: content?.button_type ?? 'NONE',
        cta_buttons: ctaButtons,
        quick_reply_buttons: quickReplyButtons,
      },
      resetOptions: {
        keepDirtyValues: true,
      },
    });

  const {
    fields: ctaFields,
    append: appendCTA,
    remove: removeCTA,
  } = useFieldArray({
    control,
    name: 'cta_buttons',
  });

  const {
    fields: qrFields,
    append: appendQR,
    remove: removeQR,
  } = useFieldArray({
    control,
    name: 'quick_reply_buttons',
  });

  const formValues = useWatch({ control });

  // Re-validate button_type when buttons change
  useEffect(() => {
    if (
      formValues.button_type === 'CALL_TO_ACTION' ||
      formValues.button_type === 'QUICK_REPLY'
    ) {
      trigger('button_type');
    }
  }, [
    formValues.cta_buttons,
    formValues.quick_reply_buttons,
    formValues.button_type,
    trigger,
  ]);

  const handleAutosave = useCallback(
    (data: WhatsappFormValues) => {
      let header: IWhatsappHeader | undefined;
      if (data.template_type === 'TEXT') {
        header = { format: 'TEXT', text: data.header_text };
      } else {
        header = {
          format: data.header_media_format,
          media_url: data.header_media_url,
        };
        if (data.header_media_format === 'DOCUMENT') {
          header.filename = data.header_document_filename;
        }
      }

      let buttons: IWhatsappButton[] | undefined;
      if (data.button_type === 'CALL_TO_ACTION') {
        buttons = data.cta_buttons.filter((b) => b.text);
      } else if (data.button_type === 'QUICK_REPLY') {
        buttons = data.quick_reply_buttons.filter((b) => b.text);
      }

      mutate({
        content: {
          category: data.category as 'UTILITY' | 'MARKETING',
          body: { text: data.body_text },
          ...(data.footer_text ? { footer: { text: data.footer_text } } : {}),
          header,
          button_type: data.button_type,
          ...(buttons && buttons.length > 0 ? { buttons } : {}),
        },
      });
    },
    [mutate]
  );

  useAutosave({ watch, onSave: handleAutosave });

  // CTA button constraints
  const urlButtonCount =
    formValues.cta_buttons?.filter((b) => b.type === 'URL').length ?? 0;
  const phoneButtonCount =
    formValues.cta_buttons?.filter((b) => b.type === 'PHONE_NUMBER').length ??
    0;
  const canAddURLButton = urlButtonCount < 2;
  const canAddPhoneButton = phoneButtonCount < 1;
  const canAddCTAButton = canAddURLButton || canAddPhoneButton;

  const bodyCharCount = countCharsWithHandlebars(formValues.body_text ?? '');
  const footerCharCount = countCharsWithHandlebars(
    formValues.footer_text ?? ''
  );

  return (
    <div className="suprsend-h-full suprsend-flex">
      {/* Form */}
      <div className="suprsend-flex-1 suprsend-p-6 suprsend-overflow-y-auto suprsend-relative">
        <SaveIndicator isSaving={isSaving} isSaved={isSaved} />
        <div className="suprsend-max-w-2xl suprsend-space-y-6">
          <div>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Template Category is required' }}
              render={({ field, fieldState }) => (
                <div className="suprsend-space-y-1">
                  <Label>
                    Template Category
                    <span className="suprsend-text-destructive">*</span>
                  </Label>
                  <ReactSelect<DefaultOption>
                    options={TEMPLATE_CATEGORIES}
                    value={TEMPLATE_CATEGORIES.find(
                      (option) => option.value === field.value
                    )}
                    onChange={(opt) =>
                      field.onChange((opt as DefaultOption)?.value ?? '')
                    }
                    placeholder="Select category"
                    isDisabled={isLive}
                  />
                  {fieldState.error?.message && (
                    <p className="suprsend-text-xs suprsend-text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="template_type"
              control={control}
              render={({ field }) => (
                <div className="suprsend-space-y-1">
                  <Label>
                    Type<span className="suprsend-text-destructive">*</span>
                  </Label>
                  <ReactSelect<DefaultOption>
                    options={TYPE_OPTIONS}
                    value={TYPE_OPTIONS.find(
                      (option) => option.value === field.value
                    )}
                    onChange={(opt) => {
                      const val = (opt as DefaultOption)?.value ?? '';
                      field.onChange(val);
                      if (val === 'TEXT') {
                        setValue('header_media_url', '');
                        setValue('header_document_filename', '');
                      } else {
                        setValue('header_text', '');
                      }
                    }}
                    placeholder="Select type"
                    isDisabled={isLive}
                  />
                </div>
              )}
            />
          </div>

          {formValues.template_type === 'TEXT' ? (
            <div>
              <Controller
                name="header_text"
                control={control}
                rules={{
                  validate: {
                    noEmojis,
                    maxOneVariable,
                  },
                }}
                render={({ field, fieldState }) => (
                  <SuggestionInput
                    label="Header"
                    mandatory={false}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Header text"
                    error={fieldState.error?.message}
                    enableHighlighting
                    enableSuggestions
                    variables={variables}
                    disabled={isLive}
                  />
                )}
              />
            </div>
          ) : (
            <div className="suprsend-space-y-3">
              <p className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground">
                Header
              </p>
              <div className="suprsend-space-y-3 suprsend-rounded-md suprsend-border suprsend-border-dashed suprsend-border-border suprsend-p-4">
                <div className="suprsend-flex suprsend-gap-3">
                  <div className="suprsend-flex-1">
                    <Controller
                      name="header_media_format"
                      control={control}
                      render={({ field }) => (
                        <div className="suprsend-space-y-1">
                          <Label>Media Type</Label>
                          <ReactSelect<DefaultOption>
                            options={MEDIA_FORMAT_OPTIONS}
                            value={MEDIA_FORMAT_OPTIONS.find(
                              (option) => option.value === field.value
                            )}
                            onChange={(opt) => {
                              const val = (opt as DefaultOption)?.value ?? '';
                              field.onChange(val);
                              if (val !== 'DOCUMENT') {
                                setValue('header_document_filename', '');
                              }
                            }}
                            isDisabled={isLive}
                          />
                        </div>
                      )}
                    />
                  </div>
                  <div className="suprsend-flex-1">
                    <Controller
                      name="header_media_url"
                      control={control}
                      rules={{
                        required:
                          formValues.template_type === 'MEDIA'
                            ? 'Media URL is required'
                            : false,
                      }}
                      render={({ field, fieldState }) => (
                        <SuggestionInput
                          label="Media URL"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Media file public URL"
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

                {formValues.header_media_format === 'DOCUMENT' && (
                  <div className="suprsend-space-y-1">
                    <Controller
                      name="header_document_filename"
                      control={control}
                      render={({ field, fieldState }) => (
                        <SuggestionInput
                          label="Document Name"
                          mandatory={false}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Filename"
                          error={fieldState.error?.message}
                          enableHighlighting
                          enableSuggestions
                          variables={variables}
                          disabled={isLive}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <Controller
              name="body_text"
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
                  placeholder="Message body"
                  error={fieldState.error?.message}
                  enableHighlighting
                  enableSuggestions
                  variables={variables}
                  disabled={isLive}
                />
              )}
            />
            <p className="suprsend-text-xs suprsend-text-muted-foreground suprsend-mt-1">
              Characters: {bodyCharCount}/1024
            </p>
          </div>

          <div className="suprsend-space-y-1">
            <Label>Footer</Label>
            <Controller
              name="footer_text"
              control={control}
              rules={{
                validate: {
                  noEmojisNoVariables,
                },
              }}
              render={({ field, fieldState }) => (
                <div className="suprsend-space-y-1">
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Footer"
                    disabled={isLive}
                  />
                  {fieldState.error?.message && (
                    <p className="suprsend-text-xs suprsend-text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
            <p className="suprsend-text-xs suprsend-text-muted-foreground">
              Characters: {footerCharCount}/60
            </p>
          </div>

          <div>
            <Controller
              name="button_type"
              control={control}
              rules={{
                validate: (value) => {
                  if (value === 'CALL_TO_ACTION') {
                    const hasButton = getValues('cta_buttons')?.some(
                      (b) => b.text
                    );
                    if (!hasButton)
                      return 'Please add action button or change the button type to "None"';
                  }
                  if (value === 'QUICK_REPLY') {
                    const hasButton = getValues('quick_reply_buttons')?.some(
                      (b) => b.text
                    );
                    if (!hasButton)
                      return 'Please add quick reply button or change the button type to "None"';
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <div className="suprsend-space-y-1">
                  <Label>Button Type</Label>
                  <ReactSelect<DefaultOption>
                    options={BUTTON_TYPE_OPTIONS}
                    value={BUTTON_TYPE_OPTIONS.find(
                      (option) => option.value === field.value
                    )}
                    onChange={(opt) => {
                      const val = (opt as DefaultOption)?.value ?? '';
                      field.onChange(val);
                      if (val !== 'CALL_TO_ACTION') {
                        setValue('cta_buttons', []);
                      }
                      if (val !== 'QUICK_REPLY') {
                        setValue('quick_reply_buttons', []);
                      }
                    }}
                    placeholder="Select button type"
                    isDisabled={isLive}
                  />
                  {fieldState.error?.message && (
                    <p className="suprsend-text-xs suprsend-text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {formValues.button_type === 'CALL_TO_ACTION' && (
            <div className="suprsend-space-y-3">
              {ctaFields.map((field, index) => {
                const buttonType = formValues.cta_buttons?.[index]?.type;
                const urlType =
                  buttonType === 'URL'
                    ? ((
                        formValues.cta_buttons?.[index] as {
                          url_type?: string;
                        }
                      )?.url_type ?? 'static')
                    : 'static';

                if (buttonType === 'PHONE_NUMBER') {
                  return (
                    <div key={field.id} className="suprsend-space-y-2">
                      <p className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground">
                        Call Phone Number Button
                      </p>
                      <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                        <div className="suprsend-flex-1">
                          <Controller
                            name={`cta_buttons.${index}.text`}
                            control={control}
                            rules={{
                              validate: { noEmojisNoVariables },
                            }}
                            render={({ field: f, fieldState }) => (
                              <Input
                                value={f.value}
                                onChange={f.onChange}
                                placeholder="Button Text"
                                disabled={isLive}
                                className={
                                  fieldState.error
                                    ? 'suprsend-border-destructive'
                                    : ''
                                }
                              />
                            )}
                          />
                        </div>
                        <div className="suprsend-flex-1">
                          <Controller
                            name={
                              `cta_buttons.${index}.phone_number` as `cta_buttons.${number}.phone_number`
                            }
                            control={control}
                            rules={{
                              required: 'Phone number is required',
                            }}
                            render={({ field: f, fieldState }) => (
                              <Input
                                value={(f.value as string) ?? ''}
                                onChange={f.onChange}
                                placeholder="+1234567890"
                                disabled={isLive}
                                className={
                                  fieldState.error
                                    ? 'suprsend-border-destructive'
                                    : ''
                                }
                              />
                            )}
                          />
                        </div>
                        {!isLive && (
                          <X
                            className="suprsend-w-4 suprsend-h-4 suprsend-cursor-pointer suprsend-text-muted-foreground suprsend-shrink-0"
                            onClick={() => removeCTA(index)}
                          />
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={field.id} className="suprsend-space-y-2">
                    <p className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground">
                      Visit Website
                    </p>
                    <div className="suprsend-flex suprsend-items-start suprsend-gap-2">
                      <div className="suprsend-flex-1 suprsend-rounded-md suprsend-border suprsend-border-dashed suprsend-border-border suprsend-p-4 suprsend-space-y-3">
                        {/* Row 1: Button Text + URL Type */}
                        <div className="suprsend-flex suprsend-items-end suprsend-gap-2">
                          <div className="suprsend-flex-1 suprsend-space-y-1">
                            <Label>Button Text</Label>
                            <Controller
                              name={`cta_buttons.${index}.text`}
                              control={control}
                              rules={{
                                validate: { noEmojisNoVariables },
                              }}
                              render={({ field: f, fieldState }) => (
                                <Input
                                  value={f.value}
                                  onChange={f.onChange}
                                  placeholder="Visit Website"
                                  disabled={isLive}
                                  className={
                                    fieldState.error
                                      ? 'suprsend-border-destructive'
                                      : ''
                                  }
                                />
                              )}
                            />
                          </div>
                          <div className="suprsend-flex-1 suprsend-space-y-1">
                            <Label>URL Type</Label>
                            <Controller
                              name={
                                `cta_buttons.${index}.url_type` as `cta_buttons.${number}.url_type`
                              }
                              control={control}
                              render={({ field: f }) => (
                                <ReactSelect<DefaultOption>
                                  options={URL_TYPE_OPTIONS}
                                  value={URL_TYPE_OPTIONS.find(
                                    (o) =>
                                      o.value ===
                                      ((f.value as string) ?? 'static')
                                  )}
                                  onChange={(opt) =>
                                    f.onChange(
                                      (opt as DefaultOption)?.value ?? 'static'
                                    )
                                  }
                                  isDisabled={isLive}
                                />
                              )}
                            />
                          </div>
                        </div>

                        {/* Row 2: Website Static URL + Dynamic part */}
                        <div className="suprsend-flex suprsend-items-start suprsend-gap-2">
                          <div className="suprsend-flex-1 suprsend-space-y-1">
                            <Label>Website Static URL</Label>
                            <Controller
                              name={
                                `cta_buttons.${index}.url_static_part` as `cta_buttons.${number}.url_static_part`
                              }
                              control={control}
                              rules={{
                                validate: {
                                  urlFormat: (value: string) => {
                                    if (!value) return true;
                                    return (
                                      URL_REGEX.test(value) ||
                                      'Invalid URL (e.g. https://example.com)'
                                    );
                                  },
                                },
                              }}
                              render={({ field: f, fieldState }) => (
                                <div className="suprsend-space-y-1">
                                  <Input
                                    value={(f.value as string) ?? ''}
                                    onChange={f.onChange}
                                    placeholder="https://www.example.com"
                                    disabled={isLive}
                                    className={
                                      fieldState.error
                                        ? 'suprsend-border-destructive'
                                        : ''
                                    }
                                  />
                                  {fieldState.error?.message && (
                                    <p className="suprsend-text-xs suprsend-text-destructive">
                                      {fieldState.error.message}
                                    </p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                          {urlType === 'dynamic' && (
                            <div className="suprsend-flex-1">
                              <Controller
                                name={
                                  `cta_buttons.${index}.url_dynamic_part` as `cta_buttons.${number}.url_dynamic_part`
                                }
                                control={control}
                                rules={{
                                  required: 'Dynamic URL part is required',
                                  validate: {
                                    isVariable: (value?: string) => {
                                      if (!value) return true;
                                      if (
                                        !(
                                          value.startsWith('{{') ||
                                          value.startsWith('{{{')
                                        ) ||
                                        !(
                                          value.endsWith('}}') ||
                                          value.endsWith('}}}')
                                        )
                                      ) {
                                        return 'Must be a valid variable (e.g. {{variable}})';
                                      }
                                      return true;
                                    },
                                  },
                                }}
                                render={({ field: f, fieldState }) => (
                                  <SuggestionInput
                                    label="URL Dynamic part"
                                    value={(f.value as string) ?? ''}
                                    onChange={f.onChange}
                                    placeholder="{{url_suffix}}"
                                    error={fieldState.error?.message}
                                    enableHighlighting
                                    enableSuggestions
                                    variables={variables}
                                    disabled={isLive}
                                  />
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      {!isLive && (
                        <X
                          className="suprsend-w-4 suprsend-h-4 suprsend-cursor-pointer suprsend-text-muted-foreground suprsend-shrink-0 suprsend-mt-1"
                          onClick={() => removeCTA(index)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {canAddCTAButton && !isLive && (
                <div className="suprsend-flex suprsend-gap-2">
                  {canAddURLButton && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendCTA({
                          type: 'URL',
                          text: '',
                          url_type: 'static',
                          url_static_part: '',
                          url_dynamic_part: '',
                        } as IWhatsappCTAButton)
                      }
                    >
                      <Plus className="suprsend-w-4 suprsend-h-4" />
                      Add URL Button
                    </Button>
                  )}
                  {canAddPhoneButton && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendCTA({
                          type: 'PHONE_NUMBER',
                          text: '',
                          phone_number: '',
                        } as IWhatsappCTAButton)
                      }
                    >
                      <Plus className="suprsend-w-4 suprsend-h-4" />
                      Add Phone Button
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {formValues.button_type === 'QUICK_REPLY' && (
            <div className="suprsend-space-y-3">
              {qrFields.map((field, index) => (
                <div
                  key={field.id}
                  className="suprsend-flex suprsend-items-center suprsend-gap-1"
                >
                  <div className="suprsend-flex-1 suprsend-min-w-0">
                    <Controller
                      name={`quick_reply_buttons.${index}.text`}
                      control={control}
                      rules={{
                        validate: { noEmojisNoVariables },
                      }}
                      render={({ field: f, fieldState }) => (
                        <Input
                          value={f.value}
                          onChange={f.onChange}
                          placeholder={`Quick Reply ${index + 1}`}
                          disabled={isLive}
                          className={
                            fieldState.error
                              ? 'suprsend-border-destructive'
                              : ''
                          }
                        />
                      )}
                    />
                  </div>
                  {!isLive && (
                    <X
                      className="suprsend-w-4 suprsend-h-4 suprsend-cursor-pointer suprsend-text-muted-foreground"
                      onClick={() => removeQR(index)}
                    />
                  )}
                </div>
              ))}

              {qrFields.length < 10 && !isLive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => appendQR({ type: 'QUICK_REPLY', text: '' })}
                >
                  <Plus className="suprsend-w-4 suprsend-h-4" />
                  Add Quick Reply
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview placeholder */}
      <div
        className="suprsend-flex-1 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-border-l suprsend-overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <WhatsappPreview
          formValues={formValues as WhatsappFormValues}
          variables={variables}
        />
      </div>
    </div>
  );
}
