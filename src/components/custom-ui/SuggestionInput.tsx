import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import getCaretCoordinates from 'textarea-caret';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  flatten,
  replaceBetween,
  isValidVariable,
} from '@/lib/suggestion-utils';
import type { CaretCoordinates } from '@/lib/suggestion-utils';
import Suggestions from './Suggestions';

// --- Types ---

export interface SuggestionInputProps {
  variables: Record<string, unknown>;
  label?: string;
  mandatory?: boolean;
  onChange: (value: string) => void;
  value: string;
  error?: string;
  as?: 'input' | 'textarea';
  rows?: number;
  validateOnBlur?: boolean;
  validate?: (value: string) => string | null;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  enableHighlighting?: boolean;
  enableSuggestions?: boolean;
}

// --- Highlighting functions (HTML overlay specific) ---

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function highlightHandlebars(
  text: string,
  flattenedVars: Record<string, unknown>
): string {
  if (!text) return '';
  return text
    .split(/(\{\{.*?\}\})/g)
    .map((part) => {
      if (/^\{\{.*\}\}$/.test(part)) {
        const isValid = isValidVariable(part, flattenedVars);
        const color = isValid
          ? 'hsl(var(--primary))'
          : 'hsl(var(--destructive))';
        return `<mark style="background:transparent;color:${color}">${escapeHtml(part)}</mark>`;
      }
      return escapeHtml(part);
    })
    .join('');
}

function setCaretPosition(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  caretPos: number
) {
  if (el == null) return;
  el.focus();
  el.setSelectionRange(caretPos, caretPos);
}

// --- Main Component ---

export default function SuggestionInput({
  variables,
  label,
  mandatory = true,
  onChange,
  value,
  error,
  as,
  rows,
  validateOnBlur = true,
  validate,
  onBlur,
  className,
  disabled,
  enableHighlighting = true,
  enableSuggestions = true,
  ...rest
}: SuggestionInputProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const suggestionRef = useRef(false);
  const isFocusedRef = useRef(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentCaretPos, setCurrentCaretPos] = useState(0);
  const [caretCoordinates, setCaretCoordinates] = useState<CaretCoordinates>({
    top: 0,
    left: 0,
  });
  const [warning, setWarning] = useState('');

  const isTextarea = as === 'textarea';

  // Variables without __translations for suggestions
  const modifiedVariables = useMemo(() => {
    if (!variables) return {};
    const vars = { ...variables };
    delete vars.__translations;
    return vars;
  }, [variables]);

  // Flatten all variables for highlight validation
  const flattenedVars = useMemo(() => {
    if (!enableHighlighting || !variables) return {};
    const filtered: Record<string, unknown> = {};
    for (const key of Object.keys(variables)) {
      if (key !== '__translations') {
        filtered[key] = variables[key];
      }
    }
    return flatten(filtered);
  }, [variables, enableHighlighting]);

  // Memoized highlighted HTML
  const highlightedHtml = useMemo(() => {
    if (!enableHighlighting) return '';
    return (
      highlightHandlebars(inputValue, flattenedVars) +
      (isTextarea ? '<br/>' : '')
    );
  }, [enableHighlighting, inputValue, flattenedVars, isTextarea]);

  // Sync highlight overlay scroll with input scroll
  const handleScroll = useCallback(() => {
    if (inputRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = inputRef.current.scrollTop;
      highlightRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  }, []);

  // Handle input/click/keyup events for both highlighting and suggestions
  const handleInputEvent = (
    event: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const val = target.value;
    const caretIndex = target.selectionEnd ?? 0;

    setInputValue(val);
    setCurrentCaretPos(caretIndex);

    if (!enableSuggestions) return;

    // Determine suggestion visibility synchronously.
    const strippedValue = val.slice(0, caretIndex);
    const startBracketIndex = strippedValue.lastIndexOf('{{');
    const endBracketIndex = strippedValue.lastIndexOf('}}');
    const leftCharacter = strippedValue[caretIndex - 1];

    if (leftCharacter === '}') {
      setShowSuggestions(false);
    } else if (startBracketIndex > endBracketIndex) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    // Defer coordinate measurement to the next frame.
    // For click events the browser may not have finished adjusting the
    // input's scrollLeft by the time this handler fires, so reading it
    // synchronously produces a stale value that places the popup at the
    // wrong horizontal position (often clamped to the left edge).
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const pos = el.selectionEnd ?? 0;
      const coords = getCaretCoordinates(el, pos);
      const visibleLeft = coords.left - el.scrollLeft;
      const visibleTop = coords.top - el.scrollTop;
      setCaretCoordinates({
        ...coords,
        left: Math.max(0, Math.min(visibleLeft, el.offsetWidth)),
        // Single-line inputs always have top ≈ 0 from getCaretCoordinates
        // (only one line), which would place the popup inside the input.
        // Pin it to offsetHeight so the popup appears below the input.
        // Textareas track the visible caret line.
        top: isTextarea
          ? Math.max(0, Math.min(visibleTop, el.offsetHeight))
          : el.offsetHeight,
      });
    });
  };

  useEffect(() => {
    // While the user is actively typing (focused), local inputValue is the
    // source of truth. Skip external syncs to prevent stale API responses
    // (from autosave round-trips) from overwriting what the user just typed.
    if (!isFocusedRef.current) {
      setInputValue(value);
      setWarning('');
    }
  }, [value]);

  useEffect(() => {
    suggestionRef.current = showSuggestions;
  }, [showSuggestions]);

  const handleBlur = () => {
    setTimeout(() => {
      if (!validateOnBlur || suggestionRef.current) return;
      if (validate) {
        const validationError = validate(inputValue);
        if (validationError) setWarning(validationError);
      }
      onBlur?.();
    }, 0);
  };

  const handleSelectOption = useCallback(
    (selectedValue: string) => {
      const str1 = inputValue.substring(0, currentCaretPos);
      const LI = str1.lastIndexOf('{{');
      const str2 = inputValue.substring(LI);
      const FI = str2.indexOf('}}');

      let result: string;

      if (FI < 0) {
        result = replaceBetween(inputValue, LI, currentCaretPos, selectedValue);
      } else {
        const str3 = str2.substring(0, FI);
        const LI1 = str3.lastIndexOf('{{');

        if (LI1 > 0) {
          result = replaceBetween(
            inputValue,
            LI,
            currentCaretPos,
            selectedValue
          );
        } else {
          result = replaceBetween(inputValue, LI, LI + FI + 2, selectedValue);
        }
      }

      setInputValue(result);
      onChange(result);

      const afterSelectCaretPosition = LI + selectedValue.length;
      setShowSuggestions(false);

      setTimeout(() => {
        setCaretPosition(inputRef.current, afterSelectCaretPosition);
      }, 0);
    },
    [inputValue, currentCaretPos, onChange]
  );

  const InputComponent = isTextarea ? Textarea : Input;

  return (
    <>
      {label && (
        <Label>
          {label}
          {mandatory && <span className="suprsend-text-destructive">*</span>}
        </Label>
      )}
      <div
        className="suprsend-relative suprsend-mt-1"
        onBlur={(e) => {
          const target = e.target as HTMLInputElement | HTMLTextAreaElement;
          setCurrentCaretPos(target.selectionEnd ?? 0);
          if (
            e.currentTarget &&
            e.relatedTarget &&
            e.currentTarget.contains(e.relatedTarget)
          ) {
            // focus moved within container — keep suggestions open
          } else {
            setShowSuggestions(false);
          }
        }}
      >
        {enableHighlighting ? (
          <div className="suprsend-relative suprsend-w-full">
            {/* Layer 1: Background with visible border */}
            <div
              className={cn(
                'suprsend-absolute suprsend-inset-0 suprsend-rounded-md suprsend-border',
                disabled ? 'suprsend-bg-muted' : 'suprsend-bg-background',
                error || warning
                  ? 'suprsend-border-destructive'
                  : 'suprsend-border-input'
              )}
              style={{ zIndex: 1 }}
            />

            {/* Layer 2: Highlighted text overlay */}
            <div
              ref={highlightRef}
              className={cn(
                'suprsend-absolute suprsend-pointer-events-none suprsend-overflow-hidden suprsend-rounded-md',
                'suprsend-px-3 suprsend-text-base md:suprsend-text-sm',
                isTextarea
                  ? 'suprsend-py-2'
                  : 'suprsend-flex suprsend-items-center'
              )}
              style={{
                top: 1,
                left: 1,
                right: 1,
                bottom: 1,
                zIndex: 2,
                color: 'hsl(var(--foreground))',
              }}
            >
              <span
                className={
                  isTextarea
                    ? 'suprsend-whitespace-pre-wrap suprsend-break-words'
                    : 'suprsend-whitespace-pre'
                }
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </div>

            {/* Layer 3: Transparent input for user interaction */}
            <InputComponent
              value={inputValue}
              ref={
                inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>
              }
              disabled={disabled}
              onInput={handleInputEvent}
              onClick={enableSuggestions ? handleInputEvent : undefined}
              onKeyUp={enableSuggestions ? handleInputEvent : undefined}
              onScroll={handleScroll}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => {
                isFocusedRef.current = true;
                setWarning('');
              }}
              onBlur={() => {
                isFocusedRef.current = false;
                handleBlur();
              }}
              className={cn(
                'suprsend-border-transparent suprsend-bg-transparent disabled:suprsend-bg-transparent suprsend-shadow-none',
                className
              )}
              style={{
                color: 'transparent',
                caretColor: 'hsl(var(--foreground))',
                position: 'relative',
                zIndex: 3,
              }}
              {...(isTextarea ? { rows } : {})}
              {...rest}
            />
          </div>
        ) : (
          <InputComponent
            value={inputValue}
            ref={inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>}
            disabled={disabled}
            onInput={handleInputEvent}
            onClick={enableSuggestions ? handleInputEvent : undefined}
            onKeyUp={enableSuggestions ? handleInputEvent : undefined}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              isFocusedRef.current = true;
              setWarning('');
            }}
            onBlur={() => {
              isFocusedRef.current = false;
              handleBlur();
            }}
            className={className}
            {...(isTextarea ? { rows } : {})}
            {...rest}
          />
        )}

        {(error || warning) && (
          <p className="suprsend-text-sm suprsend-mt-1 suprsend-text-destructive">
            {error || warning}
          </p>
        )}

        {enableSuggestions && showSuggestions && (
          <Suggestions
            inputValue={inputValue}
            variables={modifiedVariables}
            currentCaretPos={currentCaretPos}
            caretCoordinates={caretCoordinates}
            onSelectOption={handleSelectOption}
          />
        )}
      </div>
    </>
  );
}
