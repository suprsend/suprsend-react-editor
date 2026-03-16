import { useEffect, useRef, useState, useCallback } from 'react';
import 'emoji-picker-element';
import type { EmojiClickEventDetail } from 'emoji-picker-element/shared';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Smile } from '@/assets/icons';
import { cn } from '@/lib/utils';

export type { EmojiClickEventDetail };

// --- Theme ---

// Maps the app's CSS variables into emoji-picker-element's CSS custom properties.
const THEME_CSS_VARS: [string, string][] = [
  ['--background', 'hsl(var(--popover))'],
  ['--border-color', 'hsl(var(--border))'],
  ['--indicator-color', 'hsl(var(--primary))'],
  ['--input-font-color', 'hsl(var(--foreground))'],
  ['--input-placeholder-color', 'hsl(var(--muted-foreground))'],
  ['--input-border-color', 'hsl(var(--border))'],
  ['--input-border-radius', 'calc(var(--radius) - 2px)'],
  ['--category-font-color', 'hsl(var(--muted-foreground))'],
  ['--emoji-padding', '0.28rem'],
];

// --- EmojiPicker ---

interface EmojiPickerProps {
  onEmojiClick: (unicode: string) => void;
}

/**
 * Renders the emoji-picker-element web component, themed to match the app.
 * Mount this inside a Popover or modal — it has no built-in trigger.
 */
export function EmojiPicker({ onEmojiClick }: EmojiPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep callback ref so the effect never needs to re-run for callback changes.
  const onClickRef = useRef(onEmojiClick);
  onClickRef.current = onEmojiClick;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const picker = document.createElement('emoji-picker');
    for (const [prop, value] of THEME_CSS_VARS) {
      picker.style.setProperty(prop, value);
    }
    container.appendChild(picker);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<EmojiClickEventDetail>).detail;
      if (detail.unicode) onClickRef.current(detail.unicode);
    };
    picker.addEventListener('emoji-click', handler);

    return () => {
      picker.removeEventListener('emoji-click', handler);
      if (container.contains(picker)) container.removeChild(picker);
    };
  }, []);

  return <div ref={containerRef} />;
}

// --- EmojiTrigger (shared hook + popover trigger) ---

interface UseEmojiInsertionOptions {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Shared hook for inserting emoji at the cursor position of a
 * controlled input or textarea.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useEmojiInsertion<
  T extends HTMLInputElement | HTMLTextAreaElement,
>({ value, onChange }: UseEmojiInsertionOptions) {
  const elementRef = useRef<T>(null);
  // Saved before focus leaves the element (clicking the emoji button).
  const savedSelection = useRef<[number, number]>([value.length, value.length]);
  const [open, setOpen] = useState(false);

  const saveSelection = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;
    savedSelection.current = [
      el.selectionStart ?? el.value.length,
      el.selectionEnd ?? el.value.length,
    ];
  }, []);

  const insertEmoji = useCallback(
    (unicode: string) => {
      const [start, end] = savedSelection.current;
      const newValue = value.slice(0, start) + unicode + value.slice(end);
      onChange(newValue);
      setOpen(false);

      const nextCursor = start + unicode.length;
      savedSelection.current = [nextCursor, nextCursor];

      requestAnimationFrame(() => {
        const el = elementRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(nextCursor, nextCursor);
      });
    },
    [value, onChange]
  );

  return { elementRef, open, setOpen, saveSelection, insertEmoji };
}

// --- EmojiPickerTrigger ---

interface EmojiPickerTriggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmojiClick: (unicode: string) => void;
  align?: 'start' | 'center' | 'end';
  triggerClassName?: string;
}

/**
 * A standalone emoji trigger button + popover. Compose this next to any input.
 */
export function EmojiPickerTrigger({
  open,
  onOpenChange,
  onEmojiClick,
  align = 'end',
  triggerClassName,
}: EmojiPickerTriggerProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Insert emoji"
          className={cn(
            'suprsend-text-muted-foreground hover:suprsend-text-foreground suprsend-transition-colors suprsend-shrink-0',
            triggerClassName
          )}
        >
          <Smile className="suprsend-w-4 suprsend-h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="suprsend-w-auto suprsend-p-0 suprsend-border-0 suprsend-shadow-md"
        align={align}
        sideOffset={6}
      >
        <EmojiPicker onEmojiClick={onEmojiClick} />
      </PopoverContent>
    </Popover>
  );
}
