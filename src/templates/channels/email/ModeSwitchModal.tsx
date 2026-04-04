import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from '@/assets/icons';

type SwitchDirection =
  | 'design_to_html'
  | 'design_to_plaintext'
  | 'html_to_design'
  | 'html_to_plaintext'
  | 'plaintext_to_html'
  | 'plaintext_to_design';

interface CheckboxOption {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

interface ModalConfig {
  title: string;
  subtitle: string;
  confirmLabel: string;
  checkboxes: CheckboxOption[];
  warning?: string;
}

const MODAL_CONFIGS: Record<SwitchDirection, ModalConfig> = {
  design_to_html: {
    title: 'Switch to HTML editor',
    subtitle: 'Choose what to carry over from your current design.',
    confirmLabel: 'Switch to HTML',
    checkboxes: [
      {
        id: 'copy_html',
        label: 'Copy HTML content',
        description: 'Generated HTML pasted into the HTML editor.',
        defaultChecked: false,
      },
      {
        id: 'copy_text',
        label: 'Copy plain text',
        description: 'Plain text carries over to the HTML editor.',
        defaultChecked: false,
      },
    ],
  },
  design_to_plaintext: {
    title: 'Switch to plain text',
    subtitle: 'Only plain text will be sent. No HTML version.',
    confirmLabel: 'Switch to plain text',
    checkboxes: [
      {
        id: 'copy_text',
        label: 'Copy plain text from design',
        description: 'Auto-generated text used as starting content.',
        defaultChecked: false,
      },
    ],
    warning:
      "Your design content won't be deleted and can be restored if you switch back.",
  },
  html_to_design: {
    title: 'Switch to visual designer',
    subtitle:
      "Your HTML can't be imported into the designer. You'll start with a blank canvas.",
    confirmLabel: 'Switch to designer',
    checkboxes: [
      {
        id: 'copy_text',
        label: 'Copy plain text',
        description: 'Plain text from your HTML editor will carry over.',
        defaultChecked: false,
      },
    ],
    warning:
      "Your HTML content won't be deleted and can be restored if you switch back.",
  },
  html_to_plaintext: {
    title: 'Switch to plain text',
    subtitle: 'Only plain text will be sent. No HTML version.',
    confirmLabel: 'Switch to plain text',
    checkboxes: [
      {
        id: 'copy_text',
        label: 'Copy plain text from HTML',
        description: 'Plain text from your HTML editor used as starting content.',
        defaultChecked: false,
      },
    ],
    warning:
      "Your HTML content won't be deleted and can be restored if you switch back.",
  },
  plaintext_to_html: {
    title: 'Switch to HTML editor',
    subtitle: 'Choose what to carry over from your plain text email.',
    confirmLabel: 'Switch to HTML',
    checkboxes: [
      {
        id: 'copy_text',
        label: 'Copy as plain text fallback',
        description:
          'Your text becomes the plain text fallback for the HTML email.',
        defaultChecked: false,
      },
    ],
  },
  plaintext_to_design: {
    title: 'Switch to visual designer',
    subtitle: 'Choose what to carry over from your plain text email.',
    confirmLabel: 'Switch to designer',
    checkboxes: [
      {
        id: 'copy_text',
        label: 'Copy as plain text fallback',
        description:
          'Your text becomes the plain text fallback for the designer.',
        defaultChecked: false,
      },
    ],
  },
};

export interface ModeSwitchResult {
  checkedOptions: Record<string, boolean>;
}

interface ModeSwitchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: SwitchDirection | null;
  onConfirm: (result: ModeSwitchResult) => void;
}

export default function ModeSwitchModal({
  open,
  onOpenChange,
  direction,
  onConfirm,
}: ModeSwitchModalProps) {
  const config = direction ? MODAL_CONFIGS[direction] : null;

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Reset checkboxes when modal opens with a new direction
  useEffect(() => {
    if (open && config) {
      const defaults: Record<string, boolean> = {};
      config.checkboxes.forEach((cb) => {
        defaults[cb.id] = cb.defaultChecked ?? false;
      });
      setChecked(defaults);
    }
  }, [open, direction]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = useCallback(() => {
    onConfirm({ checkedOptions: checked });
    onOpenChange(false);
  }, [onConfirm, checked, onOpenChange]);

  if (!config) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="suprsend-sm:suprsend-max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="suprsend-py-2 suprsend-space-y-3">
          <div className="suprsend-divide-y suprsend-divide-border">
          {config.checkboxes.map((cb) => (
            <label
              key={cb.id}
              className="suprsend-flex suprsend-items-start suprsend-gap-3 suprsend-cursor-pointer suprsend-py-2"
            >
              <Checkbox
                checked={checked[cb.id] ?? false}
                onCheckedChange={(val) =>
                  setChecked((prev) => ({ ...prev, [cb.id]: !!val }))
                }
                className="suprsend-mt-0.5"
              />
              <div>
                <div className="suprsend-text-sm suprsend-font-medium">
                  {cb.label}
                </div>
                <div className="suprsend-text-xs suprsend-text-muted-foreground suprsend-mt-0.5">
                  {cb.description}
                </div>
              </div>
            </label>
          ))}
          </div>

          {config.warning && (
            <div className="suprsend-bg-amber-50 suprsend-rounded-md suprsend-p-3 suprsend-flex suprsend-items-start suprsend-gap-2">
              <AlertCircle className="suprsend-w-4 suprsend-h-4 suprsend-text-amber-600 suprsend-shrink-0 suprsend-mt-0.5" />
              <p className="suprsend-text-xs suprsend-text-amber-800">
                {config.warning}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>{config.confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { SwitchDirection };
