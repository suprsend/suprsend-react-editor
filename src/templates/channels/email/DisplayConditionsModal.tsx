import { useEffect, useState } from 'react';
import cloneDeep from 'lodash.clonedeep';
import isEmpty from 'lodash.isempty';
import { Plus, X, Info } from '@/assets/icons';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  Condition,
  OuterCondition,
  DisplayConditionData,
  DisplayConditionInfo,
} from '@/types';
import SuggestionInputDisplayConditions from '@/components/custom-ui/SuggestionInputDisplayConditions';

const OPERATOR_OPTIONS = [
  { name: '==', value: '==' },
  { name: '!=', value: '!=' },
  { name: '>', value: '>' },
  { name: '>=', value: '>=' },
  { name: '<', value: '<' },
  { name: '<=', value: '<=' },
];

const defaultCondition: OuterCondition[] = [
  {
    op: 'AND',
    args: [{ variable: '', op: '==', value: '' }],
  },
];

function getHandlebarExpression(conditions: OuterCondition[]): string {
  const outerConditionsExp: string[] = [];
  for (const outerCondition of conditions) {
    const innerConditionsExp: string[] = [];
    for (const innerCondition of outerCondition.args) {
      const mod = { ...innerCondition };

      const isKeyHelper =
        mod.variable.includes(' ') && !mod.variable.includes('[');
      if (isKeyHelper) {
        mod.variable = mod.variable.replace('{{', '(').replace('}}', ')');
      } else {
        mod.variable = mod.variable.replace('{{', '').replace('}}', '');
      }

      const isValueHelper = mod.value.includes(' ') && !mod.value.includes('[');
      if (isValueHelper) {
        mod.value = mod.value.replace('{{', '(').replace('}}', ')');
      } else {
        mod.value = mod.value.replace('{{', '').replace('}}', '');
      }

      innerConditionsExp.push(
        `(condition ${mod.variable} "${mod.op}" ${mod.value})`
      );
    }
    outerConditionsExp.push(`(and ${innerConditionsExp.join(' ')})`);
  }
  return `(or ${outerConditionsExp.join(' ')})`;
}

function getReadableExpression(conditions: OuterCondition[]): string {
  const outerConditionsExp: string[] = [];
  for (const outerCondition of conditions) {
    const innerConditionsExp = outerCondition.args.map(
      (c) => `(${c.variable} ${c.op} ${c.value})`
    );
    outerConditionsExp.push(`(${innerConditionsExp.join(' and ')})`);
  }
  return outerConditionsExp.join(' or ');
}

function validateConditions(
  conditions: OuterCondition[],
  setErrors: (errors: string[][]) => void
): boolean {
  const finalErrorArray: string[][] = [];
  let hasError = false;

  for (const outerCondition of conditions) {
    const innerErrorArray: string[] = [];
    for (const innerCondition of outerCondition.args) {
      if (
        !innerCondition.variable ||
        !innerCondition.op ||
        !innerCondition.value
      ) {
        hasError = true;
        innerErrorArray.push('Mandatory fields are missing');
      } else {
        innerErrorArray.push('');
      }
    }
    finalErrorArray.push(innerErrorArray);
  }
  setErrors(finalErrorArray);
  return hasError;
}

interface DisplayConditionsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  displayConditionInfoRef: React.RefObject<DisplayConditionInfo | null>;
  displayConditionsList: DisplayConditionData[];
  setDisplayConditionsList: (list: DisplayConditionData[]) => void;
  variables: Record<string, unknown>;
}

export default function DisplayConditionsModal({
  open,
  setOpen,
  displayConditionInfoRef,
  displayConditionsList,
  setDisplayConditionsList,
  variables,
}: DisplayConditionsModalProps) {
  const [conditions, setConditions] = useState<OuterCondition[]>(
    cloneDeep(defaultCondition)
  );
  const [errors, setErrors] = useState<string[][]>([]);

  useEffect(() => {
    if (open) {
      const initialData = displayConditionInfoRef?.current?.data;
      setConditions(
        isEmpty(initialData?.conditions)
          ? cloneDeep(defaultCondition)
          : cloneDeep(initialData!.conditions as OuterCondition[])
      );
      setErrors([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="!suprsend-max-w-3xl suprsend-overflow-y-auto suprsend-max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Display Conditions</DialogTitle>
          <p className="suprsend-text-sm suprsend-text-muted-foreground">
            Show block when conditions are met
          </p>
        </DialogHeader>
        <div className="suprsend-mt-2">
          <Conditions
            conditions={conditions}
            setConditions={setConditions}
            errors={errors}
            setErrors={setErrors}
            variables={variables}
          />
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
              onClick={() => {
                const hasError = validateConditions(conditions, setErrors);
                if (hasError) return;

                setErrors([]);
                const handlebarExpression = getHandlebarExpression(conditions);
                const readableExpression = getReadableExpression(conditions);
                const initialData = displayConditionInfoRef?.current?.data;

                const currentData: DisplayConditionData = {
                  id: initialData?.id || window.crypto.randomUUID(),
                  version: '2',
                  label: '',
                  description: readableExpression,
                  expression: handlebarExpression,
                  conditions,
                  before: `{{#if ${handlebarExpression}}}`,
                  after: '{{/if}}',
                };

                let updatedList = [...displayConditionsList];
                const existingIndex = updatedList.findIndex(
                  (item) => initialData?.id && item?.id === initialData?.id
                );
                if (existingIndex >= 0) {
                  updatedList.splice(existingIndex, 1, currentData);
                } else {
                  updatedList = [...updatedList, currentData];
                }
                setDisplayConditionsList(updatedList);
                displayConditionInfoRef?.current?.done(currentData);
                setOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ConditionsProps {
  conditions: OuterCondition[];
  setConditions: (conditions: OuterCondition[]) => void;
  errors: string[][];
  setErrors: (errors: string[][]) => void;
  variables: Record<string, unknown>;
}

function Conditions({
  conditions,
  setConditions,
  errors,
  setErrors,
  variables,
}: ConditionsProps) {
  return (
    <div>
      {conditions.map((outerCondition, outerIndex) => {
        const innerConditions = outerCondition.args;
        const isLast = conditions.length === outerIndex + 1;

        return (
          <div className="suprsend-my-2" key={outerIndex}>
            {innerConditions.map((innerCondition, innerIndex) => {
              const isLastInner = innerConditions.length === innerIndex + 1;

              return (
                <div
                  className="suprsend-border-l suprsend-pl-2"
                  key={innerIndex}
                >
                  <ConditionRow
                    condition={innerCondition}
                    setConditions={setConditions}
                    conditions={conditions}
                    innerConditions={innerConditions}
                    outerIndex={outerIndex}
                    innerIndex={innerIndex}
                    errors={errors}
                    setErrors={setErrors}
                    variables={variables}
                  />
                  {isLastInner ? (
                    <Button
                      className="suprsend-px-1.5 suprsend-my-2 suprsend-h-6 suprsend-flex suprsend-gap-1"
                      variant="outline"
                      onClick={() => {
                        innerConditions.push({
                          variable: '',
                          op: '==',
                          value: '',
                        });
                        setConditions([...conditions]);
                      }}
                    >
                      <Plus className="suprsend-h-4 suprsend-w-4 suprsend-text-accent-foreground" />
                      <p className="suprsend-text-xs suprsend-text-accent-foreground">
                        AND
                      </p>
                    </Button>
                  ) : (
                    <p className="suprsend-text-xs suprsend-pl-2 suprsend-pt-2 suprsend-text-muted-foreground suprsend-font-medium">
                      {outerCondition.op}
                    </p>
                  )}
                </div>
              );
            })}
            {isLast ? (
              <Button
                className="suprsend-px-1.5 suprsend-my-2 suprsend-h-6 suprsend-flex suprsend-gap-1"
                variant="outline"
                onClick={() => {
                  conditions.push({
                    op: 'AND',
                    args: [{ variable: '', op: '==', value: '' }],
                  });
                  setConditions([...conditions]);
                }}
              >
                <Plus className="suprsend-h-4 suprsend-w-4 suprsend-text-accent-foreground" />
                <p className="suprsend-text-xs suprsend-text-accent-foreground">
                  OR
                </p>
              </Button>
            ) : (
              <p className="suprsend-text-sm suprsend-my-3 suprsend-text-muted-foreground suprsend-font-medium">
                OR
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ConditionRowProps {
  condition: Condition;
  setConditions: (conditions: OuterCondition[]) => void;
  outerIndex: number;
  innerIndex: number;
  conditions: OuterCondition[];
  innerConditions: Condition[];
  errors: string[][];
  setErrors: (errors: string[][]) => void;
  variables: Record<string, unknown>;
}

function ConditionRow({
  condition,
  setConditions,
  outerIndex,
  innerIndex,
  conditions,
  innerConditions,
  errors,
  setErrors,
  variables,
}: ConditionRowProps) {
  const error = errors?.[outerIndex]?.[innerIndex];

  return (
    <div>
      <div className="suprsend-flex suprsend-gap-4 suprsend-items-center suprsend-justify-between">
        <div className="suprsend-grow">
          {innerIndex === 0 && (
            <Label className="suprsend-text-xs suprsend-text-accent-foreground">
              Property
            </Label>
          )}
          <SuggestionInputDisplayConditions
            variables={variables}
            value={condition.variable}
            placeholder="key or {{handlebars_helper}}"
            insertWithoutBrackets={true}
            mandatory={false}
            validateOnBlur={false}
            onChange={(val) => {
              condition.variable = val;
              setConditions([...conditions]);
              if (error) {
                errors[outerIndex][innerIndex] = '';
                setErrors([...errors]);
              }
            }}
          />
        </div>

        <div className="suprsend-grow">
          {innerIndex === 0 && (
            <Label className="suprsend-text-xs suprsend-text-accent-foreground">
              Operator
            </Label>
          )}
          <Select
            value={condition.op}
            onValueChange={(value) => {
              condition.op = value;
              setConditions([...conditions]);
              if (error) {
                errors[outerIndex][innerIndex] = '';
                setErrors([...errors]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {OPERATOR_OPTIONS.map((option) => (
                  <SelectItem value={option.value} key={option.value}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="suprsend-grow">
          {innerIndex === 0 && (
            <div className="suprsend-flex suprsend-items-center suprsend-gap-1 suprsend-mb-0.5">
              <Label className="suprsend-text-xs suprsend-text-accent-foreground">
                Value
              </Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="suprsend-inline-flex">
                      <Info className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground suprsend-cursor-pointer" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add static values as "string", 12, true, null</p>
                    <p>and variable as variable_key (without brackets)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <Input
            value={condition.value}
            placeholder='"value"'
            onChange={(e) => {
              condition.value = e.target.value;
              setConditions([...conditions]);
              if (error) {
                errors[outerIndex][innerIndex] = '';
                setErrors([...errors]);
              }
            }}
          />
        </div>

        <div
          className={`suprsend-cursor-pointer ${innerIndex === 0 ? 'suprsend-mt-5' : ''}`}
          onClick={() => {
            innerConditions.splice(innerIndex, 1);
            if (innerConditions.length === 0) {
              conditions.splice(outerIndex, 1);
            }
            if (conditions.length === 0) {
              conditions.push({
                op: 'AND',
                args: [{ variable: '', op: '==', value: '' }],
              });
            }
            setConditions([...conditions]);
            validateConditions(conditions, setErrors);
          }}
        >
          <X className="suprsend-h-5 suprsend-w-5 suprsend-text-muted-foreground" />
        </div>
      </div>

      {error && (
        <p className="suprsend-text-xs suprsend-text-destructive suprsend-mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
