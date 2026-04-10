import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Approval Pending',
    className: 'suprsend-bg-amber-50 suprsend-border-amber-200 suprsend-text-amber-700',
  },
  sent_for_approval: {
    label: 'Sent for Approval',
    className: 'suprsend-bg-amber-50 suprsend-border-amber-200 suprsend-text-amber-700',
  },
  approved: {
    label: 'Approved',
    className: 'suprsend-bg-emerald-50 suprsend-border-emerald-200 suprsend-text-emerald-700',
  },
  rejected: {
    label: 'Rejected',
    className: 'suprsend-bg-red-50 suprsend-border-red-200 suprsend-text-red-700',
  },
  discarded: {
    label: 'Discarded',
    className: 'suprsend-bg-red-50 suprsend-border-red-200 suprsend-text-red-700',
  },
  upload_failed: {
    label: 'Upload Failed',
    className: 'suprsend-bg-red-50 suprsend-border-red-200 suprsend-text-red-700',
  },
};

export default function ApprovalStatusBadge({
  approvalStatus,
  discardComment,
}: {
  approvalStatus?: string;
  discardComment?: string;
}) {
  if (!approvalStatus) return null;

  const config = STATUS_CONFIG[approvalStatus] ?? {
    label: approvalStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    className: 'suprsend-bg-gray-50 suprsend-border-gray-200 suprsend-text-gray-700',
  };

  const badge = (
    <span
      className={`suprsend-inline-flex suprsend-items-center suprsend-rounded-md suprsend-border suprsend-px-2 suprsend-py-0.5 suprsend-text-xs suprsend-font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );

  if (approvalStatus === 'rejected' || approvalStatus === 'upload_failed') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>
              {approvalStatus === 'upload_failed'
                ? 'Failure reasons are provided against each vendor'
                : 'Rejection reasons are provided against each vendor'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (approvalStatus === 'discarded' && discardComment) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>{discardComment}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
