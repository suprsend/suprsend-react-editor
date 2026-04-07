import { useMemo, useState } from 'react';
import {
  useVendorsForApproval,
  useStartVendorApproval,
  invalidateQueries,
} from '@/apis';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { HelpCircle, Plus, Clipboard, Check } from '@/assets/icons';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import VendorApproveModal from './VendorApproveModal';
import UpdateStatusModal from './UpdateStatusModal';
import type { VendorApproval, IWhatsappContent, ISMSContent } from '@/types';

type ChannelContent = IWhatsappContent | ISMSContent;

interface VendorFromAPI {
  id: string;
  nickname: string;
  unique_identifier: string | null;
  vendor: {
    name: string;
    slug: string;
    logo: string;
    is_template_approval_required: boolean;
  };
  is_enabled: boolean;
}

interface MergedVendorRow {
  key: string;
  label: string;
  approval: VendorApproval | null;
  hasVendor: boolean;
}

const CHANNEL_LABEL: Record<string, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
};

function getStatusConfig(
  status: string,
  channelSlug: string
): { label: string; className: string; tooltip: string } | null {
  const channel = CHANNEL_LABEL[channelSlug] ?? 'Template';

  const config: Record<
    string,
    { label: string; className: string; tooltip: string }
  > = {
    pending: {
      label: 'Approval Pending',
      className:
        'suprsend-bg-amber-50 suprsend-border-amber-200 suprsend-text-amber-700',
      tooltip: `${channel} template will need to be approved on DLT portal to go live. Until then, last live version will be sent to users.`,
    },
    sent_for_approval: {
      label: 'Sent for Approval',
      className:
        'suprsend-bg-amber-50 suprsend-border-amber-200 suprsend-text-amber-700',
      tooltip: `${channel} template has been sent for approval to this vendor. Until then, last live version will be sent to users.`,
    },
    approved: {
      label: 'Approved',
      className:
        'suprsend-bg-emerald-50 suprsend-border-emerald-200 suprsend-text-emerald-700',
      tooltip: `${channel} template has been approved by this vendor.`,
    },
    rejected: {
      label: 'Rejected',
      className:
        'suprsend-bg-red-50 suprsend-border-red-200 suprsend-text-red-700',
      tooltip: `${channel} template was rejected by this vendor.`,
    },
  };

  return config[status] ?? null;
}

function ApprovedTooltip({ approval }: { approval: VendorApproval }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="suprsend-space-y-2 suprsend-min-w-[240px]">
      <p className="suprsend-font-semibold suprsend-text-xs">
        Approved Template Details
      </p>
      {approval.vendor_template_name && (
        <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
          <span className="suprsend-text-xs suprsend-text-muted-foreground suprsend-w-[100px] suprsend-shrink-0">
            Template Name
          </span>
          <span className="suprsend-flex suprsend-items-center suprsend-gap-1 suprsend-text-xs">
            {approval.vendor_template_name}
            <button
              type="button"
              onClick={() =>
                handleCopy(approval.vendor_template_name!, 'name')
              }
              className="suprsend-text-muted-foreground hover:suprsend-text-background suprsend-transition-colors"
            >
              {copiedField === 'name' ? (
                <Check className="suprsend-w-3 suprsend-h-3" />
              ) : (
                <Clipboard className="suprsend-w-3 suprsend-h-3" />
              )}
            </button>
          </span>
        </div>
      )}
      {approval.vendor_template_id && (
        <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
          <span className="suprsend-text-xs suprsend-text-muted-foreground suprsend-w-[100px] suprsend-shrink-0">
            Template ID
          </span>
          <span className="suprsend-text-xs">
            {approval.vendor_template_id}
          </span>
        </div>
      )}
    </div>
  );
}

function AddVendorRow({
  unmatchedVendors,
  channelSlug,
  sysgenTemplateName,
}: {
  unmatchedVendors: VendorFromAPI[];
  channelSlug: string;
  sysgenTemplateName: string;
}) {
  const { templateSlug, variantId, mode, version } =
    useTemplateEditorContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');

  const { mutate, isPending } = useStartVendorApproval({
    templateSlug,
    channelSlug,
    variantId,
  });

  const handleSave = () => {
    const vendor = unmatchedVendors.find((v) => v.id === selectedVendorId);
    if (!vendor) return;

    mutate(
      {
        approval_status: 'pending',
        vendor_slug: vendor.vendor.slug,
        vendor_uid: vendor.unique_identifier ?? '',
        vendor_template_name: sysgenTemplateName,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setSelectedVendorId('');
          invalidateQueries([
            `template/${templateSlug}/channel/${channelSlug}/variant/${variantId}`,
            mode,
            version,
          ]);
        },
      }
    );
  };

  if (!isOpen) {
    return (
      <div>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          <Plus className="suprsend-w-4 suprsend-h-4" />
          Add vendors
        </Button>
      </div>
    );
  }

  return (
    <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
      <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
        <SelectTrigger className="suprsend-w-[220px]">
          <SelectValue placeholder="Select Vendor ID" />
        </SelectTrigger>
        <SelectContent>
          {unmatchedVendors.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              {v.nickname}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        disabled={!selectedVendorId || isPending}
        onClick={handleSave}
      >
        Save
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => {
          setIsOpen(false);
          setSelectedVendorId('');
        }}
      >
        Cancel
      </Button>
    </div>
  );
}

interface VendorApprovalBannerProps {
  channelSlug: string;
  vendorApprovals?: VendorApproval[];
  sysgenTemplateName?: string;
  locale?: string;
  content?: ChannelContent;
}

export default function VendorApprovalBanner({
  channelSlug,
  vendorApprovals = [],
  sysgenTemplateName = '',
  locale = '',
  content,
}: VendorApprovalBannerProps) {
  const { data } = useVendorsForApproval(channelSlug);
  const [approveModalApproval, setApproveModalApproval] =
    useState<VendorApproval | null>(null);
  const [approveModalReadOnly, setApproveModalReadOnly] = useState(false);
  const [updateStatusApproval, setUpdateStatusApproval] =
    useState<VendorApproval | null>(null);
  const [updateStatusDefault, setUpdateStatusDefault] = useState<'approved' | 'rejected'>('approved');

  const approvalVendors: VendorFromAPI[] = Array.isArray(data?.results)
    ? data.results
    : [];

  const { rows, unmatchedVendors } = useMemo(() => {
    const matchedIds = new Set<string>();
    const result: MergedVendorRow[] = [];
    const unmatched: VendorFromAPI[] = [];

    for (const v of approvalVendors) {
      const uid = v.unique_identifier;
      const approval = uid
        ? (vendorApprovals.find((a) => a.vendor_uid === uid) ?? null)
        : null;
      if (approval && uid) {
        matchedIds.add(uid);
        result.push({
          key: v.id,
          label: v.nickname,
          approval,
          hasVendor: true,
        });
      } else {
        unmatched.push(v);
      }
    }

    for (const a of vendorApprovals) {
      if (!matchedIds.has(a.vendor_uid)) {
        result.push({
          key: a.vendor_uid,
          label: a.vendor_slug,
          approval: a,
          hasVendor: false,
        });
      }
    }

    return { rows: result, unmatchedVendors: unmatched };
  }, [approvalVendors, vendorApprovals]);

  if (rows.length === 0 && unmatchedVendors.length === 0) return null;

  return (
    <div className="suprsend-pb-6 suprsend-mb-6 suprsend-border-b suprsend-border-dashed suprsend-border-border suprsend-space-y-2">
      {rows.length > 0 && (
        <div className="suprsend-space-y-3">
          {rows.map((row) => {
            const statusConfig = row.approval
              ? getStatusConfig(row.approval.approval_status, channelSlug)
              : null;

            return (
              <div
                key={row.key}
                className="suprsend-rounded-lg suprsend-border suprsend-border-border suprsend-bg-background"
              >
                <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-px-4 suprsend-py-3">
                  <div className="suprsend-flex suprsend-items-center suprsend-gap-3 suprsend-min-w-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground suprsend-truncate suprsend-max-w-[200px]">
                            {row.label}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{row.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {statusConfig && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={`suprsend-inline-flex suprsend-items-center suprsend-gap-1 suprsend-rounded-md suprsend-border suprsend-px-2 suprsend-py-0.5 suprsend-text-xs suprsend-font-medium ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                              <HelpCircle className="suprsend-w-3 suprsend-h-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {row.approval?.approval_status === 'approved' ? (
                              <ApprovedTooltip approval={row.approval} />
                            ) : row.approval?.approval_status === 'rejected' ? (
                              <div className="suprsend-space-y-1">
                                <p>
                                  Rejection reason:{' '}
                                  <strong>{row.approval.comment || 'No reason provided'}</strong>
                                </p>
                                <p>Fix and republish the template</p>
                              </div>
                            ) : (
                              <p>{statusConfig.tooltip}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {row.approval?.approval_status !== 'approved' &&
                    row.approval?.approval_status !== 'rejected' && (
                    <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                      {row.approval?.approval_status === 'sent_for_approval' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (row.approval) {
                                setUpdateStatusApproval(row.approval);
                                setUpdateStatusDefault('approved');
                              }
                            }}
                          >
                            Update Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (row.approval) {
                                setApproveModalApproval(row.approval);
                                setApproveModalReadOnly(true);
                              }
                            }}
                          >
                            Message Template
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (row.approval) {
                                setApproveModalApproval(row.approval);
                                setApproveModalReadOnly(false);
                              }
                            }}
                          >
                            Approve Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (row.approval) {
                                setUpdateStatusApproval(row.approval);
                                setUpdateStatusDefault('rejected');
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {unmatchedVendors.length > 0 && (
        <AddVendorRow
          unmatchedVendors={unmatchedVendors}
          channelSlug={channelSlug}
          sysgenTemplateName={sysgenTemplateName}
        />
      )}

      {approveModalApproval && content && (
        <VendorApproveModal
          open={!!approveModalApproval}
          onOpenChange={(open) => {
            if (!open) {
              setApproveModalApproval(null);
              setApproveModalReadOnly(false);
            }
          }}
          approval={approveModalApproval}
          content={content}
          sysgenTemplateName={sysgenTemplateName}
          locale={locale}
          channelSlug={channelSlug}
          readOnly={approveModalReadOnly}
        />
      )}

      {updateStatusApproval && (
        <UpdateStatusModal
          open={!!updateStatusApproval}
          onOpenChange={(open) => {
            if (!open) {
              setUpdateStatusApproval(null);
              setUpdateStatusDefault('approved');
            }
          }}
          approval={updateStatusApproval}
          channelSlug={channelSlug}
          sysgenTemplateName={sysgenTemplateName}
          locale={locale}
          contentCategory={content?.category}
          defaultStatus={updateStatusDefault}
        />
      )}
    </div>
  );
}
