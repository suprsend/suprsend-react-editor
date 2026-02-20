import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface HtmlSwitchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
}

export default function HtmlSwitchModal({
  open,
  onOpenChange,
  onProceed,
}: HtmlSwitchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="suprsend-sm:suprsend-max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Switch to HTML Code Editor?</DialogTitle>
        </DialogHeader>
        <div className="suprsend-py-4">
          <p className="suprsend-text-sm suprsend-text-muted-foreground">
            You're about to switch to the code editor. Your changes will be
            saved, and you can return to the design editor anytime.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onProceed();
              onOpenChange(false);
            }}
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
