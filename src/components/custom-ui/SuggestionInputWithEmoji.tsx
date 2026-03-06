import { useRef, useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import SuggestionInput, { type SuggestionInputProps } from './SuggestionInput';
import { EmojiPickerTrigger } from './EmojiPicker';

// --- Types ---

type SuggestionInputWithEmojiProps = SuggestionInputProps;

// --- Component ---

/**
 * Wraps SuggestionInput and adds an emoji picker button on the right side
 * of the input / textarea. No changes to SuggestionInput are required.
 *
 * Cursor position is captured via onBlur event bubbling on the container
 * div, so the emoji is always inserted at the last caret position.
 */
export default function SuggestionInputWithEmoji({
  label,
  mandatory = true,
  value,
  onChange,
  as,
  disabled,
  ...rest
}: SuggestionInputWithEmojiProps) {
  const isTextarea = as === 'textarea';

  // Saved references set when the input loses focus (captured via bubbling).
  const savedInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null
  );
  const savedSelectionRef = useRef<[number, number]>([0, 0]);

  const [emojiOpen, setEmojiOpen] = useState(false);

  // Capture the element + cursor position as soon as the input blurs.
  // We listen at the container level so we don't need to touch SuggestionInput.
  const handleContainerBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        const el = target as HTMLInputElement | HTMLTextAreaElement;
        savedInputRef.current = el;
        savedSelectionRef.current = [
          el.selectionStart ?? el.value.length,
          el.selectionEnd ?? el.value.length,
        ];
      }
    },
    []
  );

  const insertEmoji = useCallback(
    (unicode: string) => {
      const [start, end] = savedSelectionRef.current;
      const newValue = value.slice(0, start) + unicode + value.slice(end);
      onChange(newValue);
      setEmojiOpen(false);

      const nextCursor = start + unicode.length;
      savedSelectionRef.current = [nextCursor, nextCursor];

      requestAnimationFrame(() => {
        const el = savedInputRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(nextCursor, nextCursor);
      });
    },
    [value, onChange]
  );

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
          'suprsend-flex suprsend-gap-1 suprsend-mt-1',
          isTextarea ? 'suprsend-items-start' : 'suprsend-items-center'
        )}
        onBlur={handleContainerBlur}
      >
        <div className="suprsend-flex-1 suprsend-min-w-0">
          {/* Pass label={undefined} — we render it above so the emoji
              button aligns with the input row, not the label. */}
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
          <EmojiPickerTrigger
            open={emojiOpen}
            onOpenChange={setEmojiOpen}
            onEmojiClick={insertEmoji}
            align="end"
            triggerClassName={isTextarea ? 'suprsend-mt-2' : undefined}
          />
        )}
      </div>
    </>
  );
}
