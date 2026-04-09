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
import { useStartVendorApproval } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import {
  LANGUAGE_OPTIONS,
  CATEGORY_OPTIONS,
  variantLocaleToBase,
} from './constants';
import type { VendorApproval } from '@/types';

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
  const isSmsMsg91 =
    channelSlug === 'sms' && approval.vendor_slug === 'msg91-sms';
  const isSms = channelSlug === 'sms';

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
  const { templateSlug, variantId } = useTemplateEditorContext();
  const { mutate, isPending } = useStartVendorApproval({ templateSlug, channelSlug, variantId });

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
        ...(data.status === 'approved' && !isSms && data.language
          ? { vendor_locale_code: data.language }
          : {}),
        ...(data.status === 'approved' && !isSms && data.category
          ? { vendor_template_category: data.category }
          : {}),
        ...(data.status === 'rejected'
          ? { comment: data.rejectionReason }
          : {}),
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const channelLabel = channelSlug === 'whatsapp' ? 'WhatsApp' : 'SMS';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!suprsend-max-w-3xl suprsend-max-h-[85vh] !suprsend-p-0 !suprsend-gap-0 suprsend-overflow-hidden">
        <DialogHeader className="suprsend-pb-4 suprsend-pt-6 suprsend-px-6 suprsend-border-b suprsend-border-border">
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
          <div className="suprsend-flex-1 suprsend-overflow-y-auto suprsend-space-y-6 suprsend-pt-4 suprsend-pb-4 suprsend-px-6">
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
                    {(['approved', 'rejected'] as const).map((value) => (
                      <label
                        key={value}
                        className={`suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-rounded-md suprsend-border suprsend-px-4 suprsend-py-3 suprsend-cursor-pointer suprsend-transition-colors ${
                          field.value === value
                            ? 'suprsend-border-primary suprsend-bg-primary/5'
                            : 'suprsend-border-border'
                        }`}
                      >
                        <RadioGroupItem value={value} />
                        <span className="suprsend-text-sm suprsend-font-medium">
                          {value === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>

            {status === 'approved' && (
              <>
                <div className="suprsend-flex suprsend-items-start suprsend-gap-2 suprsend-rounded-md suprsend-bg-muted/50 suprsend-px-3 suprsend-py-2.5">
                  <Info className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground suprsend-shrink-0 suprsend-mt-0.5" />
                  <p className="suprsend-text-sm suprsend-text-muted-foreground">
                    Please make sure that this template is approved by your{' '}
                    {channelSlug} vendor else it will fail at the time of
                    sending.
                  </p>
                </div>

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

                <div className="suprsend-space-y-1">
                  <Label>
                    {isSms ? 'Template DLT ID' : 'Template ID'}
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

                {!isSms && (
                  <>
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

          <DialogFooter className="suprsend-pt-4 suprsend-pb-6 suprsend-px-6 suprsend-border-t suprsend-border-border">
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
