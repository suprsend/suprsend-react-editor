import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useDiscardVendorApproval } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';

interface DiscardApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelSlug: string;
}

export default function DiscardApprovalModal({
  open,
  onOpenChange,
  channelSlug,
}: DiscardApprovalModalProps) {
  const { templateSlug, variantId } = useTemplateEditorContext();
  const [reason, setReason] = useState('');

  const { mutate, isPending } = useDiscardVendorApproval({
    templateSlug,
    channelSlug,
    variantId,
  });

  const handleSubmit = () => {
    mutate(
      { discard_comment: reason },
      {
        onSuccess: () => {
          setReason('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Approval</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel the approval?
          </DialogDescription>
        </DialogHeader>
        <div className="suprsend-space-y-2">
          <Label>Reason</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for cancelling approval..."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
