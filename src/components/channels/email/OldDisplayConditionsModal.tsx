import { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type {
  DisplayConditionData,
  DisplayConditionInfo,
} from './DisplayConditionsModal';

interface OldDisplayConditionsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  displayConditionInfoRef: React.RefObject<DisplayConditionInfo | null>;
  displayConditionsList: DisplayConditionData[];
  setDisplayConditionsList: (list: DisplayConditionData[]) => void;
}

type FormValues = {
  label: string;
  description: string;
  expression: string;
};

type FormErrors = {
  label?: string;
  description?: string;
  expression?: string;
};

function getFormValues(selection: DisplayConditionData | null): FormValues {
  if (!selection) return { label: '', description: '', expression: '' };
  return {
    label: selection.label ?? '',
    description: selection.description ?? '',
    expression: selection.expression ?? '',
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.label || values.label.length < 2) {
    errors.label = values.label ? 'Too Short! (min 2)' : 'Required';
  } else if (values.label.length > 50) {
    errors.label = 'Too Long! (max 50)';
  }
  if (!values.description || values.description.length < 2) {
    errors.description = values.description ? 'Too Short! (min 2)' : 'Required';
  } else if (values.description.length > 50) {
    errors.description = 'Too Long! (max 50)';
  }
  if (!values.expression || values.expression.length < 2) {
    errors.expression = values.expression ? 'Too Short! (min 2)' : 'Required';
  }
  return errors;
}

export default function OldDisplayConditionsModal({
  open,
  setOpen,
  displayConditionInfoRef,
  displayConditionsList,
  setDisplayConditionsList,
}: OldDisplayConditionsModalProps) {
  // Only show v1 (non-version-2) conditions in this modal's list
  const oldConditions = displayConditionsList.filter((c) => c.version !== '2');

  const [selected, setSelected] = useState<DisplayConditionData | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    label: '',
    description: '',
    expression: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      const data = displayConditionInfoRef?.current?.data;
      // Pre-select the condition already on this block (if any)
      let initial: DisplayConditionData | null = null;
      if (data && !isEmpty(data)) {
        initial = oldConditions.find((c) => c.label === data.label) ?? data;
      }
      setSelected(initial);
      setFormValues(getFormValues(initial));
      setErrors({});
    }
  }, [open]);

  const isAddNew = selected === null;

  // Dirty: any field differs from the currently selected condition's saved values
  const originalValues = getFormValues(selected);
  const dirty =
    formValues.label !== originalValues.label ||
    formValues.description !== originalValues.description ||
    formValues.expression !== originalValues.expression;

  const validationErrors = validate(formValues);
  const isValid = Object.keys(validationErrors).length === 0;

  const handleSelectCondition = (condition: DisplayConditionData | null) => {
    if (dirty) return; // require saving before switching
    setSelected(condition);
    setFormValues(getFormValues(condition));
    setErrors({});
  };

  const handleSave = () => {
    const errs = validate(formValues);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const finalValues: DisplayConditionData = {
      ...formValues,
      before: `{{#if ${formValues.expression}}}`,
      after: '{{/if}}',
    };

    let updatedList = [...displayConditionsList];

    if (isAddNew) {
      const isDuplicate = oldConditions.some(
        (c) => c.label === formValues.label
      );
      if (isDuplicate) {
        setErrors({ label: 'Label with this name already exists' });
        return;
      }
      updatedList = [...updatedList, finalValues];
    } else {
      const idx = updatedList.findIndex((c) => c.label === selected!.label);
      if (idx >= 0) {
        updatedList.splice(idx, 1, finalValues);
      } else {
        updatedList = [...updatedList, finalValues];
      }
    }

    setDisplayConditionsList(updatedList);
    displayConditionInfoRef?.current?.done(finalValues);
    setOpen(false);
  };

  const isButtonDisabled = isAddNew ? !(dirty && isValid) : !isValid;
  const buttonLabel = isAddNew
    ? 'Create new condition'
    : dirty
      ? `Save and use ${formValues.label || 'this'} condition`
      : `Use '${formValues.label}' condition`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="!suprsend-max-w-4xl suprsend-overflow-y-auto suprsend-max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Display Condition Editor</DialogTitle>
        </DialogHeader>

        <div className="suprsend-flex suprsend-gap-4 suprsend-mt-2">
          {/* Left: condition list */}
          <div
            className="suprsend-w-2/5 suprsend-overflow-y-auto suprsend-space-y-2 suprsend-shrink-0"
            style={{ maxHeight: '460px', minHeight: '460px' }}
          >
            {/* Add New option */}
            <button
              type="button"
              disabled={dirty}
              onClick={() => handleSelectCondition(null)}
              className={cn(
                'suprsend-w-full suprsend-text-left suprsend-border suprsend-rounded-lg suprsend-px-4 suprsend-py-3 suprsend-text-sm suprsend-transition-colors',
                isAddNew
                  ? 'suprsend-border-primary suprsend-bg-muted'
                  : 'suprsend-border-border hover:suprsend-bg-muted/50',
                dirty &&
                  !isAddNew &&
                  'suprsend-opacity-40 suprsend-cursor-not-allowed'
              )}
            >
              <span className="suprsend-font-medium suprsend-text-foreground">
                Add Display Condition
              </span>
            </button>

            {oldConditions.map((condition, idx) => (
              <button
                key={idx}
                type="button"
                disabled={dirty}
                onClick={() => handleSelectCondition(condition)}
                className={cn(
                  'suprsend-w-full suprsend-text-left suprsend-border suprsend-rounded-lg suprsend-px-4 suprsend-py-3 suprsend-text-sm suprsend-transition-colors',
                  selected?.label === condition.label
                    ? 'suprsend-border-primary suprsend-bg-muted'
                    : 'suprsend-border-border hover:suprsend-bg-muted/50',
                  dirty &&
                    selected?.label !== condition.label &&
                    'suprsend-opacity-40 suprsend-cursor-not-allowed'
                )}
              >
                <span className="suprsend-font-medium suprsend-text-foreground suprsend-block">
                  {condition.label}
                </span>
                <span className="suprsend-text-muted-foreground suprsend-text-xs">
                  {condition.description}
                </span>
              </button>
            ))}

            {dirty && (
              <p className="suprsend-text-xs suprsend-text-destructive suprsend-pt-1">
                * Please save your changes first
              </p>
            )}
          </div>

          {/* Right: form */}
          <div className="suprsend-flex-1 suprsend-border suprsend-rounded-md suprsend-px-4 suprsend-py-4 suprsend-space-y-4">
            <div>
              <Label className="suprsend-text-sm suprsend-mb-1.5 suprsend-block">
                Name of Condition
              </Label>
              <Input
                value={formValues.label}
                placeholder="Condition name"
                onChange={(e) =>
                  setFormValues({ ...formValues, label: e.target.value })
                }
              />
              {errors.label && (
                <p className="suprsend-text-xs suprsend-text-destructive suprsend-mt-1">
                  {errors.label}
                </p>
              )}
            </div>

            <div>
              <Label className="suprsend-text-sm suprsend-mb-1.5 suprsend-block">
                Description
              </Label>
              <Input
                value={formValues.description}
                placeholder="Describe when this condition applies"
                onChange={(e) =>
                  setFormValues({ ...formValues, description: e.target.value })
                }
              />
              {errors.description && (
                <p className="suprsend-text-xs suprsend-text-destructive suprsend-mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-mb-1.5">
                <Label className="suprsend-text-sm">
                  Conditional Statement
                </Label>
                <a
                  href="https://docs.suprsend.com/docs/email#display-blocks-based-on-condition"
                  className="suprsend-text-xs suprsend-text-primary suprsend-font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Check Docs
                </a>
              </div>
              <Input
                value={formValues.expression}
                placeholder='(condition <key> "===" <value>)'
                onChange={(e) =>
                  setFormValues({ ...formValues, expression: e.target.value })
                }
              />
              {errors.expression && (
                <p className="suprsend-text-xs suprsend-text-destructive suprsend-mt-1">
                  {errors.expression}
                </p>
              )}
            </div>

            {formValues.expression.length > 0 && (
              <div>
                <p className="suprsend-text-xs suprsend-text-muted-foreground suprsend-mb-1">
                  Generated Handlebars template
                </p>
                <pre className="suprsend-text-xs suprsend-bg-muted suprsend-rounded suprsend-p-3 suprsend-border suprsend-overflow-x-auto suprsend-font-mono suprsend-leading-5">
                  {`{{#if ${formValues.expression}}}\n//Your content block\n{{/if}}\n\n/* Example:\n{{#if (condition orgName "==" "suprsend")}}\n//Your content block\n{{/if}}\n*/`}
                </pre>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="suprsend-flex suprsend-gap-3 suprsend-items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isButtonDisabled}
              onClick={handleSave}
            >
              {buttonLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
