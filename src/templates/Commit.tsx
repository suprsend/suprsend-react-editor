import { useState } from 'react';
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
import type {
  CommitModalProps,
  CommitButtonProps,
  CommitVariant,
} from '@/types';
import { GitCommitHorizontal, Loader2 } from 'lucide-react';
import { usePreCommitValidate, useCommitTemplate } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';

function CommitModal({ open, onOpenChange, onCommit }: CommitModalProps) {
  const [description, setDescription] = useState('');
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

  const variants: CommitVariant[] = preCommitData?.variants ?? [];

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, boolean>
  >({});

  const getVariantKey = (v: CommitVariant) => `${v.channel}:${v.id}`;

  // Reset selections when preCommitData loads
  const [prevVariants, setPrevVariants] = useState(variants);
  if (variants !== prevVariants && variants.length > 0) {
    setPrevVariants(variants);
    const initial: Record<string, boolean> = {};
    for (const v of variants) {
      initial[getVariantKey(v)] = true;
    }
    setSelectedVariants(initial);
  }

  const handleVariantToggle = (key: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectedList = variants.filter((v) => selectedVariants[getVariantKey(v)]);

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
                Below {variants.length} file{variants.length !== 1 ? 's' : ''}{' '}
                have been updated. Select the ones you want to commit
              </p>
              <div className="suprsend-space-y-3">
                {variants.map((variant) => {
                  const key = getVariantKey(variant);
                  return (
                    <div
                      key={key}
                      className="suprsend-flex suprsend-items-center suprsend-space-x-3"
                    >
                      <Checkbox
                        id={key}
                        checked={!!selectedVariants[key]}
                        onCheckedChange={() => handleVariantToggle(key)}
                      />
                      <Label
                        htmlFor={key}
                        className="suprsend-text-sm suprsend-font-normal suprsend-cursor-pointer"
                      >
                        {variant.channel} &gt; {variant.id}
                      </Label>
                    </div>
                  );
                })}
              </div>
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
