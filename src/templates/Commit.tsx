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
import type { CommitModalProps, CommitButtonProps } from '@/types';
import { GitCommitHorizontal, Loader2 } from 'lucide-react';
import { usePreCommitValidate } from '@/apis';
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

  const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>({
    'Email > Default Variant': true,
    'Email > Variant 1': true,
  } as Record<string, boolean>);

  const handleFileToggle = (file: string) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [file]: !prev[file],
    }));
  };

  const handleCommit = () => {
    console.log('Committing with description:', description);
    console.log('Selected files:', selectedFiles);
    onOpenChange(false);
    onCommit();
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
            {preCommitData && (
              <div className="suprsend-rounded-md suprsend-border suprsend-p-4 suprsend-text-sm suprsend-bg-muted/50">
                <p className="suprsend-font-medium suprsend-mb-2">
                  Validation Result
                </p>
                <pre className="suprsend-text-xs suprsend-whitespace-pre-wrap suprsend-text-muted-foreground">
                  {JSON.stringify(preCommitData, null, 2)}
                </pre>
              </div>
            )}
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
                Below 2 files have been updated. Select the ones you want to
                commit
              </p>
              <div className="suprsend-space-y-3">
                {Object.keys(selectedFiles).map((file) => (
                  <div
                    key={file}
                    className="suprsend-flex suprsend-items-center suprsend-space-x-3"
                  >
                    <Checkbox
                      id={file}
                      checked={selectedFiles[file]}
                      onCheckedChange={() => handleFileToggle(file)}
                    />
                    <Label
                      htmlFor={file}
                      className="suprsend-text-sm suprsend-font-normal suprsend-cursor-pointer"
                    >
                      {file}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="suprsend-pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCommit} disabled={isLoading}>
            Commit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CommitButton({ onCommit }: CommitButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        className="suprsend-h-7 suprsend-rounded suprsend-flex suprsend-items-center suprsend-gap-1.5"
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
