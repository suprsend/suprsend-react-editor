import { useEffect, useState } from 'react';
import Handlebars from 'handlebars';
import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SuggestionInput from '@/components/custom-ui/SuggestionInput';
import type { MergeTagData } from '@/types';

export interface MergeTagInfo {
  data: {
    mergeTagGroup?: string | null;
    mergeTags?: Record<string, unknown>;
  };
  done: (result: {
    mergeTagGroup: string | null;
    mergeTagRule: string | null;
  }) => void;
}

interface MergeTagsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mergeTagInfoRef: React.RefObject<MergeTagInfo | null>;
  mergeTagsList: MergeTagData[];
  setMergeTagsList: (list: MergeTagData[]) => void;
  variables: Record<string, unknown>;
}

export default function MergeTagsModal({
  open,
  setOpen,
  mergeTagInfoRef,
  mergeTagsList,
  setMergeTagsList,
  variables,
}: MergeTagsModalProps) {
  const [currentMergeTag, setCurrentMergeTag] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const refData = mergeTagInfoRef?.current;
  const existingUnlayerMergeTag = refData?.data?.mergeTagGroup;

  useEffect(() => {
    setCurrentMergeTag('');
    setError('');
    setWarning('');
    if (open && existingUnlayerMergeTag) {
      const existing = mergeTagsList.find(
        (item) => item.id === existingUnlayerMergeTag
      );
      if (existing?.expression) {
        setCurrentMergeTag(existing.expression);
      } else {
        setCurrentMergeTag(existingUnlayerMergeTag);
      }
    }
  }, [open]);

  const validateMergeTag = () => {
    if (
      !currentMergeTag.includes('{{') &&
      currentMergeTag.includes(' ') &&
      !currentMergeTag.includes('[')
    ) {
      setError(
        'Enclose handlebars helpers in {{…}} or variables with spaces in […]'
      );
      return false;
    }
    try {
      let modifiedCurrentMergeTag = currentMergeTag;
      if (!modifiedCurrentMergeTag.includes('{{')) {
        modifiedCurrentMergeTag = `{{${currentMergeTag}}}`;
      }
      const template = Handlebars.compile(modifiedCurrentMergeTag, {
        strict: true,
      });
      template(variables);
      setError('');
      setWarning('');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Parse error')) {
        setError(
          'Error while parsing handlebars. Please add valid handlebars string'
        );
      } else if (message.includes('not defined in')) {
        setWarning(
          `Mock data for ${message.split(' not defined in')[0]} variable is not found`
        );
        return true;
      } else {
        setError(message);
      }
      return false;
    }
  };

  const handleSave = () => {
    const isValid = validateMergeTag();
    if (!isValid) return;

    const isHelper =
      currentMergeTag.includes(' ') && !currentMergeTag.includes('[');
    let modifiedMergeTag = currentMergeTag;

    if (isHelper) {
      modifiedMergeTag = modifiedMergeTag.replace('{{', '(');
      modifiedMergeTag = modifiedMergeTag.replace('}}', ')');
    } else {
      modifiedMergeTag = modifiedMergeTag.replace('{{', '');
      modifiedMergeTag = modifiedMergeTag.replace('}}', '');
    }

    const before = `{{#each ${modifiedMergeTag}}}`;
    const after = '{{/each}}';
    const newMergeTagsList: MergeTagData[] = [];
    const existingMergeTag = mergeTagsList.find(
      (item) => item.id === existingUnlayerMergeTag
    );
    const mergeTagId = existingMergeTag
      ? existingUnlayerMergeTag!
      : window.crypto.randomUUID();

    mergeTagsList.forEach((item) => {
      if (item.id === mergeTagId) {
        newMergeTagsList.push({
          id: item.id,
          before,
          after,
          expression: currentMergeTag,
        });
      } else {
        newMergeTagsList.push(item);
      }
    });

    if (!existingMergeTag) {
      newMergeTagsList.push({
        id: mergeTagId,
        before,
        after,
        expression: currentMergeTag,
      });
    }

    // If editing and expression changed, clear the old assignment first
    if (existingMergeTag && existingMergeTag.expression !== currentMergeTag) {
      refData?.done({
        mergeTagGroup: null,
        mergeTagRule: null,
      });
    }

    setMergeTagsList(newMergeTagsList);

    refData?.done({
      mergeTagGroup: mergeTagId,
      mergeTagRule: 'repeat',
    });
    setOpen(false);
  };

  const handleDelete = () => {
    const newMergeTagsList = mergeTagsList.filter(
      (item) => item.id !== existingUnlayerMergeTag
    );
    setMergeTagsList(newMergeTagsList);
    refData?.done({
      mergeTagGroup: null,
      mergeTagRule: null,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="!suprsend-max-w-3xl suprsend-overflow-y-auto suprsend-max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Merge Tags</DialogTitle>
          <DialogDescription className="suprsend-text-sm suprsend-text-muted-foreground">
            Pass variable of array datatype and dynamically create a row for
            each array item. Generally used to create tables using array of
            objects.
          </DialogDescription>
        </DialogHeader>

        <div className="suprsend-mt-2">
          <SuggestionInput
            variables={variables}
            placeholder="Add {{variable_key}} or handlebars helper {{jsonPath a.b}}"
            value={currentMergeTag}
            onChange={(value: string) => {
              setError('');
              setWarning('');
              setCurrentMergeTag(value);
            }}
            onBlur={() => {
              validateMergeTag();
            }}
            error={error || warning}
          />
          <div className="suprsend-flex suprsend-items-center suprsend-mt-4 suprsend-bg-muted suprsend-rounded-md suprsend-py-1.5 suprsend-px-2 suprsend-mb-4">
            <Info className="suprsend-h-4 suprsend-w-4 suprsend-text-muted-foreground suprsend-shrink-0" />
            <p className="suprsend-text-sm suprsend-ml-2 suprsend-text-muted-foreground">
              {`Use {{key1}} or {{this.key1}} to reference array elements in the row where merge tag is being used.`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <div
            className={`suprsend-flex suprsend-justify-between ${existingUnlayerMergeTag ? 'suprsend-flex-auto' : ''}`}
          >
            {!!existingUnlayerMergeTag && (
              <Button
                type="button"
                variant="outline"
                className="suprsend-text-destructive suprsend-border-destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
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
                disabled={!!error || !currentMergeTag}
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
