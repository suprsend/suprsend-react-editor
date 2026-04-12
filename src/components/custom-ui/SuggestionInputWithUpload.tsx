import { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import SuggestionInput, { type SuggestionInputProps } from './SuggestionInput';
import { Upload, Loader2 } from '@/assets/icons';
import { useUploadFile } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';

// --- Types ---

interface SuggestionInputWithUploadProps extends SuggestionInputProps {
  accept?: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: unknown) => void;
}

// --- Component ---

/**
 * Wraps SuggestionInput and adds an upload button on the right side.
 * On file selection the file is uploaded via useUploadFile; the returned
 * URL is written into the input via onChange.
 */
export default function SuggestionInputWithUpload({
  label,
  mandatory = true,
  value,
  onChange,
  as,
  accept,
  onUploadSuccess,
  onUploadError,
  disabled,
  ...rest
}: SuggestionInputWithUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { workspaceUid } = useTemplateEditorContext();
  const { mutateAsync: uploadFile, isPending } = useUploadFile(workspaceUid);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset immediately so the same file can be re-selected if needed
    e.target.value = '';
    if (!file) return;

    try {
      const result = await uploadFile(file);
      if (result?.error) throw new Error(result.error);
      const url: string = result?.url ?? '';
      onChange(url);
      onUploadSuccess?.(url);
    } catch (err) {
      onUploadError?.(err);
    }
  };

  return (
    <>
      {label && (
        <Label>
          {label}
          {mandatory && <span className="suprsend-text-destructive">*</span>}
        </Label>
      )}
      <div
        className={cn(
          'suprsend-flex suprsend-gap-1 suprsend-items-start',
          label && 'suprsend-mt-1'
        )}
      >
        <div className="suprsend-flex-1 suprsend-min-w-0">
          <SuggestionInput
            value={value}
            onChange={onChange}
            as={as}
            label={undefined}
            mandatory={false}
            disabled={disabled}
            {...rest}
          />
        </div>

        {!disabled && (
          <>
            <button
              type="button"
              aria-label="Upload file"
              disabled={isPending}
              onClick={handleUploadClick}
              className={cn(
                'suprsend-text-muted-foreground hover:suprsend-text-foreground suprsend-transition-colors suprsend-shrink-0 disabled:suprsend-opacity-50 disabled:suprsend-cursor-not-allowed suprsend-mt-3'
              )}
            >
              {isPending ? (
                <Loader2
                  className="suprsend-w-4 suprsend-h-4"
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              ) : (
                <Upload className="suprsend-w-4 suprsend-h-4" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="suprsend-hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
    </>
  );
}
