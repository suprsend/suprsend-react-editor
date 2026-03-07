import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import type {
  CommitModalProps,
  CommitButtonProps,
  CommitVariant,
  PreCommitValidateResponse,
} from '@/types';
import {
  GitCommitHorizontal,
  Loader2,
  ChevronDown,
  FileText,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { usePreCommitValidate, useCommitTemplate } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';

function getErrorCount(errors?: Record<string, string[]>): number {
  if (!errors) return 0;
  return Object.values(errors).reduce((sum, arr) => sum + arr.length, 0);
}

function VariantRow({
  variant,
  checked,
  onToggle,
}: {
  variant: CommitVariant;
  checked: boolean;
  onToggle: () => void;
}) {
  const [showErrors, setShowErrors] = useState(false);
  const errorCount = getErrorCount(variant.errors);
  const isDeleted = variant.is_deleted;
  const hasErrors = errorCount > 0;
  const key = `${variant.channel}:${variant.id}`;
  const displayName = variant.name || variant.id;
  const channelName = variant.channel;

  return (
    <div className="suprsend-py-2">
      <div className="suprsend-flex suprsend-items-center suprsend-gap-3">
        <Checkbox
          id={key}
          checked={hasErrors ? false : isDeleted ? true : checked}
          onCheckedChange={onToggle}
          disabled={hasErrors || isDeleted}
          className={
            isDeleted
              ? 'suprsend-border-destructive data-[state=checked]:suprsend-bg-destructive data-[state=checked]:suprsend-border-destructive'
              : ''
          }
        />
        <Label
          htmlFor={key}
          className={`suprsend-text-sm suprsend-font-normal suprsend-cursor-pointer suprsend-flex suprsend-items-center suprsend-gap-1.5 ${
            isDeleted
              ? 'suprsend-line-through suprsend-text-muted-foreground suprsend-opacity-60'
              : ''
          }`}
        >
          {channelName}
          <span className="suprsend-text-muted-foreground">&gt;</span>
          {displayName}
        </Label>
        {hasErrors && (
          <button
            type="button"
            className="suprsend-flex suprsend-items-center suprsend-gap-1 suprsend-text-xs suprsend-text-destructive suprsend-bg-transparent suprsend-border-none suprsend-cursor-pointer suprsend-p-0"
            onClick={() => setShowErrors((v) => !v)}
          >
            <AlertCircle className="suprsend-h-3.5 suprsend-w-3.5" />
            <span>error</span>
          </button>
        )}
      </div>
      {hasErrors && showErrors && (
        <div className="suprsend-ml-7 suprsend-mt-2 suprsend-rounded suprsend-bg-muted suprsend-p-3 suprsend-text-xs suprsend-font-mono suprsend-text-muted-foreground">
          {JSON.stringify(variant.errors, null, 2)}
        </div>
      )}
    </div>
  );
}

function CommitModal({ open, onOpenChange, onCommit }: CommitModalProps) {
  const [description, setDescription] = useState('');
  const [variantsOpen, setVariantsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const { templateSlug } = useTemplateEditorContext();

  const {
    data: preCommitData,
    isLoading,
    isError,
  } = usePreCommitValidate({
    templateSlug,
    enabled: open,
  });

  const commitMutation = useCommitTemplate({ templateSlug });

  const data = preCommitData as PreCommitValidateResponse | undefined;
  const variants: CommitVariant[] = useMemo(
    () => data?.variants ?? [],
    [data?.variants]
  );

  // Changed properties
  const changedProperties = useMemo(() => {
    if (!data?.properties) return [];
    return Object.entries(data.properties)
      .filter(([, v]) => v.has_diff)
      .map(([key]) => key);
  }, [data?.properties]);

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, boolean>
  >({});

  const getVariantKey = (v: CommitVariant) => `${v.channel}:${v.id}`;

  // Reset selections when preCommitData loads
  const [prevData, setPrevData] = useState(data);
  if (data !== prevData && data) {
    setPrevData(data);
    const initialVariants: Record<string, boolean> = {};
    for (const v of variants) {
      const hasErrors = getErrorCount(v.errors) > 0;
      initialVariants[getVariantKey(v)] = !hasErrors;
    }
    setSelectedVariants(initialVariants);
  }

  const handleVariantToggle = (key: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectedList = variants.filter(
    (v) => selectedVariants[getVariantKey(v)]
  );

  // Count edited and deleted variants
  const { editedCount, deletedCount } = useMemo(() => {
    let edited = 0;
    let deleted = 0;
    for (const v of variants) {
      if (v.is_deleted) {
        deleted++;
      } else {
        edited++;
      }
    }
    return { editedCount: edited, deletedCount: deleted };
  }, [variants]);

  // Count total changes (properties with has_diff + variants)
  const totalChanges = useMemo(() => {
    let count = variants.length;
    if (data?.properties) {
      for (const prop of Object.values(data.properties)) {
        if (prop.has_diff) count++;
      }
    }
    return count;
  }, [data, variants]);

  const handleCommit = () => {
    commitMutation.mutate(
      {
        commitMessage: description,
        variants: selectedList.map((v) => ({
          channel: v.channel,
          id: v.id,
        })),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onCommit();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="suprsend-sm:suprsend-max-w-[800px]">
        <DialogHeader className="suprsend-pb-4">
          <DialogTitle>Commit changes</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="suprsend-flex suprsend-items-center suprsend-justify-center suprsend-py-12">
            <Loader2 className="suprsend-h-6 suprsend-w-6 suprsend-animate-spin suprsend-text-muted-foreground" />
            <span className="suprsend-ml-2 suprsend-text-sm suprsend-text-muted-foreground">
              Validating changes...
            </span>
          </div>
        ) : isError ? (
          <div className="suprsend-py-8 suprsend-text-center suprsend-text-sm suprsend-text-destructive">
            Failed to validate. Please try again.
          </div>
        ) : (
          <div className="suprsend-space-y-6">
            <div className="suprsend-space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A brief description about what changed"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="suprsend-min-h-[100px]"
              />
            </div>

            <div className="suprsend-space-y-3">
              <p className="suprsend-text-sm suprsend-text-muted-foreground">
                Below {totalChanges} change
                {totalChanges !== 1 ? 's have' : ' has'} been updated. Select
                the ones you want to commit
              </p>

              {variants.length > 0 && (
                <Collapsible open={variantsOpen} onOpenChange={setVariantsOpen}>
                  <CollapsibleTrigger className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-w-full suprsend-bg-transparent suprsend-border-none suprsend-cursor-pointer suprsend-p-0 suprsend-group">
                    <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                      <ChevronDown
                        className={`suprsend-h-4 suprsend-w-4 suprsend-text-muted-foreground suprsend-transition-transform ${
                          !variantsOpen ? 'suprsend--rotate-90' : ''
                        }`}
                      />
                      <FileText className="suprsend-h-4 suprsend-w-4 suprsend-text-muted-foreground" />
                      <span className="suprsend-text-sm suprsend-font-semibold suprsend-tracking-wide">
                        VARIANTS
                      </span>
                    </div>
                    <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                      {editedCount > 0 && (
                        <span className="suprsend-text-xs suprsend-font-medium suprsend-text-primary suprsend-bg-primary/10 suprsend-px-2.5 suprsend-py-0.5 suprsend-rounded">
                          {editedCount} edited
                        </span>
                      )}
                      {deletedCount > 0 && (
                        <span className="suprsend-text-xs suprsend-font-medium suprsend-text-destructive suprsend-bg-destructive/10 suprsend-px-2.5 suprsend-py-0.5 suprsend-rounded">
                          {deletedCount} deleted
                        </span>
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="suprsend-ml-10 suprsend-mt-1 suprsend-space-y-1 suprsend-max-h-40 suprsend-overflow-y-auto">
                      {variants.map((variant) => {
                        const key = getVariantKey(variant);
                        return (
                          <VariantRow
                            key={key}
                            variant={variant}
                            checked={!!selectedVariants[key]}
                            onToggle={() => handleVariantToggle(key)}
                          />
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {changedProperties.length > 0 && (
                <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <CollapsibleTrigger className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-w-full suprsend-bg-transparent suprsend-border-none suprsend-cursor-pointer suprsend-p-0">
                    <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                      <ChevronDown
                        className={`suprsend-h-4 suprsend-w-4 suprsend-text-muted-foreground suprsend-transition-transform ${
                          !settingsOpen ? 'suprsend--rotate-90' : ''
                        }`}
                      />
                      <Settings className="suprsend-h-4 suprsend-w-4 suprsend-text-muted-foreground" />
                      <span className="suprsend-text-sm suprsend-font-semibold suprsend-tracking-wide">
                        TEMPLATE SETTINGS
                      </span>
                    </div>
                    <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
                      <span className="suprsend-text-xs suprsend-font-medium suprsend-text-primary suprsend-bg-primary/10 suprsend-px-2.5 suprsend-py-0.5 suprsend-rounded">
                        {changedProperties.length} edited
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="suprsend-ml-10 suprsend-mt-1 suprsend-space-y-1">
                      {changedProperties.map((propKey) => (
                        <div key={propKey} className="suprsend-py-2">
                          <div className="suprsend-flex suprsend-items-center suprsend-gap-3">
                            <Checkbox
                              id={`prop:${propKey}`}
                              checked={true}
                              disabled
                            />
                            <Label
                              htmlFor={`prop:${propKey}`}
                              className="suprsend-text-sm suprsend-font-normal suprsend-cursor-pointer"
                            >
                              {propKey}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="suprsend-pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCommit}
            disabled={
              isLoading || commitMutation.isPending || selectedList.length === 0
            }
          >
            {commitMutation.isPending ? (
              <>
                <Loader2 className="suprsend-h-3.5 suprsend-w-3.5 suprsend-animate-spin" />
                Committing...
              </>
            ) : (
              'Commit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CommitButton({ onCommit }: CommitButtonProps) {
  const { isLive } = useTemplateEditorContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        className="suprsend-h-7 suprsend-rounded suprsend-flex suprsend-items-center suprsend-gap-1.5"
        disabled={isLive}
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <GitCommitHorizontal className="suprsend-h-3.5 suprsend-w-3.5" />
        <span className="suprsend-text-sm suprsend-font-medium">Commit</span>
      </Button>
      <CommitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCommit={onCommit}
      />
    </>
  );
}
