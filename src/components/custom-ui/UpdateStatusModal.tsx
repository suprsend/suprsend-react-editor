import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Info } from '@/assets/icons';
import {
  ReactSelect,
  type DefaultOption,
} from '@/components/custom-ui/ReactSelect';

import { useStartVendorApproval, invalidateQueries } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';

import type { VendorApproval } from '@/types';

const CATEGORY_OPTIONS = [
  { label: 'Utility', value: 'UTILITY' },
  { label: 'Marketing', value: 'MARKETING' },
];

const LANGUAGE_OPTIONS = [
  { label: 'English (en)', value: 'en' },
  { label: 'English (UK) (en_GB)', value: 'en_GB' },
  { label: 'English (US) (en_US)', value: 'en_US' },
  { label: 'English (UAE) (en_AE)', value: 'en_AE' },
  { label: 'English (AUS) (en_AU)', value: 'en_AU' },
  { label: 'English (CAN) (en_CA)', value: 'en_CA' },
  { label: 'English (GHA) (en_GH)', value: 'en_GH' },
  { label: 'English (IRL) (en_IE)', value: 'en_IE' },
  { label: 'English (IND) (en_IN)', value: 'en_IN' },
  { label: 'English (JAM) (en_JM)', value: 'en_JM' },
  { label: 'English (MYS) (en_MY)', value: 'en_MY' },
  { label: 'English (NZL) (en_NZ)', value: 'en_NZ' },
  { label: 'English (QAT) (en_QA)', value: 'en_QA' },
  { label: 'English (SGP) (en_SG)', value: 'en_SG' },
  { label: 'English (UGA) (en_UG)', value: 'en_UG' },
  { label: 'English (ZAF) (en_ZA)', value: 'en_ZA' },
  { label: 'Spanish (es)', value: 'es' },
  { label: 'Spanish (ARG) (es_AR)', value: 'es_AR' },
  { label: 'Spanish (CHL) (es_CL)', value: 'es_CL' },
  { label: 'Spanish (COL) (es_CO)', value: 'es_CO' },
  { label: 'Spanish (CRI) (es_CR)', value: 'es_CR' },
  { label: 'Spanish (DOM) (es_DO)', value: 'es_DO' },
  { label: 'Spanish (ECU) (es_EC)', value: 'es_EC' },
  { label: 'Spanish (HND) (es_HN)', value: 'es_HN' },
  { label: 'Spanish (MEX) (es_MX)', value: 'es_MX' },
  { label: 'Spanish (PAN) (es_PA)', value: 'es_PA' },
  { label: 'Spanish (PER) (es_PE)', value: 'es_PE' },
  { label: 'Spanish (SPA) (es_ES)', value: 'es_ES' },
  { label: 'Spanish (URY) (es_UY)', value: 'es_UY' },
  { label: 'Afrikaans (af)', value: 'af' },
  { label: 'Albanian (sq)', value: 'sq' },
  { label: 'Arabic (ar)', value: 'ar' },
  { label: 'Arabic (EGY) (ar_EG)', value: 'ar_EG' },
  { label: 'Arabic (UAE) (ar_AE)', value: 'ar_AE' },
  { label: 'Arabic (LBN) (ar_LB)', value: 'ar_LB' },
  { label: 'Arabic (MAR) (ar_MA)', value: 'ar_MA' },
  { label: 'Arabic (QAT) (ar_QA)', value: 'ar_QA' },
  { label: 'Azerbaijani (az)', value: 'az' },
  { label: 'Belarusian (be_BY)', value: 'be_BY' },
  { label: 'Bengali (bn)', value: 'bn' },
  { label: 'Bengali (IND) (bn_IN)', value: 'bn_IN' },
  { label: 'Bulgarian (bg)', value: 'bg' },
  { label: 'Catalan (ca)', value: 'ca' },
  { label: 'Chinese (CHN) (zh_CN)', value: 'zh_CN' },
  { label: 'Chinese (HKG) (zh_HK)', value: 'zh_HK' },
  { label: 'Chinese (TAI) (zh_TW)', value: 'zh_TW' },
  { label: 'Croatian (hr)', value: 'hr' },
  { label: 'Czech (cs)', value: 'cs' },
  { label: 'Danish (da)', value: 'da' },
  { label: 'Dari (prs_AF)', value: 'prs_AF' },
  { label: 'Dutch (nl)', value: 'nl' },
  { label: 'Dutch (BEL) (nl_BE)', value: 'nl_BE' },
  { label: 'Estonian (et)', value: 'et' },
  { label: 'Filipino (fil)', value: 'fil' },
  { label: 'Finnish (fi)', value: 'fi' },
  { label: 'French (fr)', value: 'fr' },
  { label: 'French (BEL) (fr_BE)', value: 'fr_BE' },
  { label: 'French (CAN) (fr_CA)', value: 'fr_CA' },
  { label: 'French (CHE) (fr_CH)', value: 'fr_CH' },
  { label: 'French (CIV) (fr_CI)', value: 'fr_CI' },
  { label: 'French (MAR) (fr_MA)', value: 'fr_MA' },
  { label: 'Georgian (ka)', value: 'ka' },
  { label: 'German (de)', value: 'de' },
  { label: 'German (AUT) (de_AT)', value: 'de_AT' },
  { label: 'German (CHE) (de_CH)', value: 'de_CH' },
  { label: 'Greek (el)', value: 'el' },
  { label: 'Gujarati (gu)', value: 'gu' },
  { label: 'Hausa (ha)', value: 'ha' },
  { label: 'Hebrew (he)', value: 'he' },
  { label: 'Hindi (hi)', value: 'hi' },
  { label: 'Hungarian (hu)', value: 'hu' },
  { label: 'Indonesian (id)', value: 'id' },
  { label: 'Irish (ga)', value: 'ga' },
  { label: 'Italian (it)', value: 'it' },
  { label: 'Japanese (ja)', value: 'ja' },
  { label: 'Kannada (kn)', value: 'kn' },
  { label: 'Kazakh (kk)', value: 'kk' },
  { label: 'Kinyarwanda (rw_RW)', value: 'rw_RW' },
  { label: 'Korean (ko)', value: 'ko' },
  { label: 'Kyrgyz (Kyrgyzstan) (ky_KG)', value: 'ky_KG' },
  { label: 'Lao (lo)', value: 'lo' },
  { label: 'Latvian (lv)', value: 'lv' },
  { label: 'Lithuanian (lt)', value: 'lt' },
  { label: 'Macedonian (mk)', value: 'mk' },
  { label: 'Malay (ms)', value: 'ms' },
  { label: 'Malayalam (ml)', value: 'ml' },
  { label: 'Marathi (mr)', value: 'mr' },
  { label: 'Norwegian (nb)', value: 'nb' },
  { label: 'Pashto (ps_AF)', value: 'ps_AF' },
  { label: 'Persian (fa)', value: 'fa' },
  { label: 'Polish (pl)', value: 'pl' },
  { label: 'Portuguese (BR) (pt_BR)', value: 'pt_BR' },
  { label: 'Portuguese (POR) (pt_PT)', value: 'pt_PT' },
  { label: 'Punjabi (pa)', value: 'pa' },
  { label: 'Romanian (ro)', value: 'ro' },
  { label: 'Russian (ru)', value: 'ru' },
  { label: 'Serbian (sr)', value: 'sr' },
  { label: 'Sinhala (si_LK)', value: 'si_LK' },
  { label: 'Slovak (sk)', value: 'sk' },
  { label: 'Slovenian (sl)', value: 'sl' },
  { label: 'Swahili (sw)', value: 'sw' },
  { label: 'Swedish (sv)', value: 'sv' },
  { label: 'Tamil (ta)', value: 'ta' },
  { label: 'Telugu (te)', value: 'te' },
  { label: 'Thai (th)', value: 'th' },
  { label: 'Turkish (tr)', value: 'tr' },
  { label: 'Ukrainian (uk)', value: 'uk' },
  { label: 'Urdu (ur)', value: 'ur' },
  { label: 'Uzbek (uz)', value: 'uz' },
  { label: 'Vietnamese (vi)', value: 'vi' },
  { label: 'Zulu (zu)', value: 'zu' },
];

function variantLocaleToBase(locale: string): string {
  if (!locale) return '';
  const base = locale.split('_')[0].toLowerCase();
  // Check if exact match exists first, then fall back to base
  if (LANGUAGE_OPTIONS.some((o) => o.value === locale)) return locale;
  if (LANGUAGE_OPTIONS.some((o) => o.value === base)) return base;
  return '';
}

interface FormValues {
  status: 'approved' | 'rejected';
  templateName: string;
  templateId: string;
  language: string;
  category: string;
  providerTemplateId: string;
  rejectionReason: string;
}

interface UpdateStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: VendorApproval;
  channelSlug: string;
  sysgenTemplateName: string;
  locale?: string;
  contentCategory?: string;
  defaultStatus?: 'approved' | 'rejected';
}

export default function UpdateStatusModal({
  open,
  onOpenChange,
  approval,
  channelSlug,
  sysgenTemplateName,
  locale = '',
  contentCategory = '',
  defaultStatus = 'approved',
}: UpdateStatusModalProps) {
  const { templateSlug, variantId, mode, version } = useTemplateEditorContext();

  const isSmsMsg91 =
    channelSlug === 'sms' && approval.vendor_slug === 'msg91-sms';

  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      status: defaultStatus,
      templateName: approval.vendor_template_name ?? sysgenTemplateName,
      templateId: approval.vendor_template_id ?? '',
      language: approval.vendor_locale_code ?? variantLocaleToBase(locale),
      category: approval.vendor_template_category ?? contentCategory,
      providerTemplateId: approval.provider_template_id ?? '',
      rejectionReason: '',
    },
  });

  const status = watch('status');

  const { mutate, isPending } = useStartVendorApproval({
    templateSlug,
    channelSlug,
    variantId,
  });

  const onSubmit = (data: FormValues) => {
    mutate(
      {
        approval_status: data.status,
        vendor_slug: approval.vendor_slug,
        vendor_uid: approval.vendor_uid,
        vendor_template_name: data.templateName,
        ...(data.status === 'approved' && data.templateId
          ? { vendor_template_id: data.templateId }
          : {}),
        ...(data.status === 'approved' && isSmsMsg91 && data.providerTemplateId
          ? { provider_template_id: data.providerTemplateId }
          : {}),
        ...(data.status === 'approved' &&
        channelSlug !== 'sms' &&
        data.language
          ? { vendor_locale_code: data.language }
          : {}),
        ...(data.status === 'approved' &&
        channelSlug !== 'sms' &&
        data.category
          ? { vendor_template_category: data.category }
          : {}),
        ...(data.status === 'rejected'
          ? { comment: data.rejectionReason }
          : {}),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          invalidateQueries([
            `template/${templateSlug}/channel/${channelSlug}/variant/${variantId}`,
            mode,
            version,
          ]);
        },
      }
    );
  };

  const channelLabel = channelSlug === 'whatsapp' ? 'WhatsApp' : 'SMS';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="suprsend-max-w-2xl suprsend-max-h-[85vh] suprsend-flex suprsend-flex-col suprsend-gap-0">
        <DialogHeader className="suprsend-pb-4 suprsend-border-b suprsend-border-border suprsend--mx-6 suprsend-px-6">
          <DialogTitle>
            Update approval status from your vendor portal
          </DialogTitle>
          <DialogDescription>
            Fill in the details from your vendor portal to help identify the
            correct {channelLabel} template for API calls.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="suprsend-flex suprsend-flex-col suprsend-flex-1 suprsend-overflow-hidden"
        >
          <div className="suprsend-flex-1 suprsend-overflow-y-auto suprsend-space-y-6 suprsend-py-4 suprsend--mx-6 suprsend-px-6">
            {/* Status radio */}
            <div className="suprsend-space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="suprsend-grid suprsend-grid-cols-2 suprsend-gap-3"
                  >
                    <label
                      className={`suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-rounded-md suprsend-border suprsend-px-4 suprsend-py-3 suprsend-cursor-pointer suprsend-transition-colors ${
                        field.value === 'approved'
                          ? 'suprsend-border-primary suprsend-bg-primary/5'
                          : 'suprsend-border-border'
                      }`}
                    >
                      <RadioGroupItem value="approved" />
                      <span className="suprsend-text-sm suprsend-font-medium">
                        Approved
                      </span>
                    </label>
                    <label
                      className={`suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-rounded-md suprsend-border suprsend-px-4 suprsend-py-3 suprsend-cursor-pointer suprsend-transition-colors ${
                        field.value === 'rejected'
                          ? 'suprsend-border-primary suprsend-bg-primary/5'
                          : 'suprsend-border-border'
                      }`}
                    >
                      <RadioGroupItem value="rejected" />
                      <span className="suprsend-text-sm suprsend-font-medium">
                        Rejected
                      </span>
                    </label>
                  </RadioGroup>
                )}
              />
            </div>

            {status === 'approved' && (
              <>
                {/* Info banner */}
                <div className="suprsend-flex suprsend-items-start suprsend-gap-2 suprsend-rounded-md suprsend-bg-muted/50 suprsend-px-3 suprsend-py-2.5">
                  <Info className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground suprsend-shrink-0 suprsend-mt-0.5" />
                  <p className="suprsend-text-sm suprsend-text-muted-foreground">
                    Please make sure that this template is approved by your{' '}
                    {channelSlug} vendor else it will fail at the time of
                    sending.
                  </p>
                </div>

                {/* Template Name */}
                <div className="suprsend-space-y-1">
                  <Label>
                    Template Name
                    <span className="suprsend-text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="templateName"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input {...field} placeholder="Template name" />
                    )}
                  />
                </div>

                {/* Template DLT ID (SMS) / Template ID (WhatsApp) */}
                <div className="suprsend-space-y-1">
                  <Label>
                    {channelSlug === 'sms' ? 'Template DLT ID' : 'Template ID'}
                    <span className="suprsend-text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="templateId"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="template ID of approved template"
                      />
                    )}
                  />
                </div>

                {isSmsMsg91 && (
                  <div className="suprsend-space-y-1">
                    <Label>
                      Provider Template ID
                      <span className="suprsend-text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="providerTemplateId"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Provider template ID" />
                      )}
                    />
                  </div>
                )}

                {channelSlug !== 'sms' && (
                  <>
                    {/* Language */}
                    <div className="suprsend-space-y-1">
                      <Label>
                        Language
                        <span className="suprsend-text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="language"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <ReactSelect<DefaultOption>
                            options={LANGUAGE_OPTIONS}
                            value={
                              LANGUAGE_OPTIONS.find(
                                (o) => o.value === field.value
                              ) ?? null
                            }
                            onChange={(opt) =>
                              field.onChange(
                                (opt as DefaultOption)?.value ?? ''
                              )
                            }
                            placeholder="Search language..."
                            isClearable
                            components={{
                              MenuList: ({
                                children,
                                innerRef,
                                innerProps,
                              }) => (
                                <div
                                  ref={innerRef}
                                  {...innerProps}
                                  className="suprsend-max-h-[150px] suprsend-overflow-y-auto suprsend-p-1"
                                >
                                  {children}
                                </div>
                              ),
                            }}
                          />
                        )}
                      />
                    </div>

                    {/* Category */}
                    <div className="suprsend-space-y-1">
                      <Label>
                        Category
                        <span className="suprsend-text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="category"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
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
                        )}
                      />
                      <p className="suprsend-text-xs suprsend-text-muted-foreground">
                        Category template approved in. Used for {channelSlug}{' '}
                        cost calculation
                      </p>
                    </div>
                  </>
                )}
                <div className="suprsend-mb-4" />
              </>
            )}

            {status === 'rejected' && (
              <div className="suprsend-space-y-1">
                <Label>
                  Rejection reason
                  <span className="suprsend-text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="rejectionReason"
                  rules={{ required: status === 'rejected' }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="Reason of rejection"
                      rows={4}
                      className="suprsend-flex suprsend-w-full suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-transparent suprsend-px-3 suprsend-py-2 suprsend-text-sm suprsend-shadow-sm placeholder:suprsend-text-muted-foreground focus-visible:suprsend-outline-none focus-visible:suprsend-ring-1 focus-visible:suprsend-ring-ring"
                    />
                  )}
                />
              </div>
            )}
          </div>

          <DialogFooter className="suprsend-pt-4 suprsend-border-t suprsend-border-border suprsend--mx-6 suprsend-px-6">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              I'll update later
            </Button>
            <Button type="submit" disabled={isPending}>
              Update Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
