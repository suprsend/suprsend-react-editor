import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import getCaretCoordinates from 'textarea-caret';
import Handlebars from 'handlebars';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { cloneDeep } from 'lodash';
import initCustomHelpers from '@/lib/handlebarHelper';
import {
  DATA_TYPE_SECTIONS,
  CustomHelpers,
  isEmpty,
  getLabel,
  getOptionsList,
} from '@/lib/suggestion-utils';

// Constants
const DROPDOWN_WIDTH = 540;
const DROPDOWN_HEIGHT = 280;
const BLUR_DELAY = 200;
const CLICK_RESET_DELAY = 250;

// Helper functions

function calculateCaretCoordinates(
  element: HTMLInputElement | HTMLTextAreaElement,
  caretIndex: number
) {
  const caretCoords = getCaretCoordinates(element, caretIndex);
  const xOverflow = element.offsetWidth < element.scrollWidth;
  const yOverflow = element.offsetHeight < element.scrollHeight;

  if (xOverflow && caretCoords.left > element.offsetWidth) {
    caretCoords.left = element.offsetWidth;
  } else if (yOverflow && caretCoords.top > element.offsetHeight) {
    caretCoords.top = element.offsetHeight;
  }

  return caretCoords;
}

function calculateViewportCoordinates(
  element: HTMLInputElement | HTMLTextAreaElement,
  caretCoordinates: { left: number; top: number }
) {
  const inputRect = element.getBoundingClientRect();
  let viewportLeft = inputRect.left + caretCoordinates.left;
  let viewportTop = inputRect.top + caretCoordinates.top;

  if (viewportLeft + DROPDOWN_WIDTH > window.innerWidth) {
    viewportLeft = window.innerWidth - DROPDOWN_WIDTH - 10;
  }
  if (viewportLeft < 0) {
    viewportLeft = 10;
  }

  if (viewportTop + DROPDOWN_HEIGHT > window.innerHeight) {
    viewportTop = inputRect.top - DROPDOWN_HEIGHT - 5;
  }
  if (viewportTop < 0) {
    viewportTop = 10;
  }

  return { left: viewportLeft, top: viewportTop };
}

function parseInputContext(
  inputValue: string,
  caretIndex: number,
  insertWithoutBrackets: boolean
) {
  const textBeforeCaret = inputValue.substring(0, caretIndex);
  const lastOpenBracket = textBeforeCaret.lastIndexOf('{{');
  const lastCloseBracket = textBeforeCaret.lastIndexOf('}}');
  const leftCharacter = textBeforeCaret[caretIndex - 1];
  const isLeftCharBracket = leftCharacter === '}';

  let inputVariable = '';
  if (insertWithoutBrackets && lastOpenBracket < 0) {
    const lastSpace = textBeforeCaret.lastIndexOf(' ');
    inputVariable = textBeforeCaret.substring(lastSpace + 1);
  } else {
    inputVariable =
      lastOpenBracket >= 0
        ? inputValue.substring(lastOpenBracket + 2, caretIndex)
        : '';
  }

  return {
    lastOpenBracket,
    lastCloseBracket,
    isLeftCharBracket,
    inputVariable,
    textBeforeCaret,
  };
}

function shouldShowSuggestions(
  context: ReturnType<typeof parseInputContext>,
  insertWithoutBrackets: boolean
) {
  const { isLeftCharBracket, lastOpenBracket, lastCloseBracket } = context;

  if (isLeftCharBracket) {
    return false;
  }

  if (insertWithoutBrackets) {
    return lastOpenBracket > lastCloseBracket || lastOpenBracket < 0;
  }

  return lastOpenBracket > lastCloseBracket;
}

function setCaretPosition(
  element: HTMLInputElement | HTMLTextAreaElement | null,
  caretPos: number
) {
  if (!element) return;
  element.focus();
  element.setSelectionRange(caretPos, caretPos);
}

// Props

export interface SuggestionInputDisplayConditionsProps {
  variables: Record<string, unknown>;
  label?: string;
  mandatory?: boolean;
  onChange: (value: string) => void;
  value: string;
  error?: string;
  as?: 'input' | 'textarea';
  validateOnBlur?: boolean;
  onBlur?: () => void;
  insertWithoutBrackets?: boolean;
  [key: string]: unknown;
}

export default function SuggestionInputDisplayConditions({
  variables,
  label,
  mandatory = true,
  onChange,
  value,
  error,
  as,
  validateOnBlur = true,
  onBlur,
  insertWithoutBrackets = false,
  ...rest
}: SuggestionInputDisplayConditionsProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const suggestionRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isClickingDropdownRef = useRef(false);
  const caretPosRef = useRef<number | undefined>(undefined);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentCaretPos, setCurrentCaretPos] = useState<number | undefined>(
    undefined
  );
  const [caretCoordinates, setCaretCoordinates] = useState<
    { left: number; top: number } | undefined
  >(undefined);
  const [viewportCoordinates, setViewportCoordinates] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [handlebarWarning, setHandlebarWarning] = useState('');

  const modifiedVariables = useMemo(() => {
    const vars = { ...variables };
    if ('__translations' in vars) {
      delete vars.__translations;
    }
    return vars;
  }, [variables]);

  const updateCoordinates = (
    element: HTMLInputElement | HTMLTextAreaElement,
    caretIndex: number
  ) => {
    const caretCoords = calculateCaretCoordinates(element, caretIndex);
    const viewportCoords = calculateViewportCoordinates(element, caretCoords);
    setCaretCoordinates(caretCoords);
    setViewportCoordinates(viewportCoords);
  };

  const handleShowSuggestion = (
    event: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const newValue = target.value;
    const caretIndex = target.selectionEnd ?? 0;

    setInputValue(newValue);
    setCurrentCaretPos(caretIndex);
    updateCoordinates(target, caretIndex);

    const context = parseInputContext(newValue, caretIndex, insertWithoutBrackets);
    setShowSuggestions(shouldShowSuggestions(context, insertWithoutBrackets));
  };

  useEffect(() => {
    setInputValue(value);
    setHandlebarWarning('');
  }, [value]);

  useEffect(() => {
    suggestionRef.current = showSuggestions;
  }, [showSuggestions]);

  useEffect(() => {
    caretPosRef.current = currentCaretPos;
  }, [currentCaretPos]);

  useEffect(() => {
    if (!showSuggestions || !viewportCoordinates) return;

    const handleFocusChange = (event: FocusEvent) => {
      if (!suggestionRef.current) return;

      const target = event.target as HTMLElement;
      const isClickingDropdown =
        dropdownRef.current &&
        (dropdownRef.current === target || dropdownRef.current.contains(target));

      if (isClickingDropdown && isClickingDropdownRef.current && inputRef.current) {
        requestAnimationFrame(() => {
          if (
            suggestionRef.current &&
            dropdownRef.current?.contains(document.activeElement) &&
            inputRef.current
          ) {
            inputRef.current.focus();
            if (caretPosRef.current !== undefined) {
              setTimeout(() => {
                setCaretPosition(inputRef.current, caretPosRef.current!);
              }, 0);
            }
          }
        });
      }
    };

    document.addEventListener('focusin', handleFocusChange, true);
    return () => {
      document.removeEventListener('focusin', handleFocusChange, true);
    };
  }, [showSuggestions, viewportCoordinates]);

  useEffect(() => {
    if (!showSuggestions) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isClickOnInput =
        inputRef.current &&
        (inputRef.current === target || inputRef.current.contains(target));
      const isClickOnDropdown =
        dropdownRef.current &&
        (dropdownRef.current === target || dropdownRef.current.contains(target));

      if (!isClickOnInput && !isClickOnDropdown) {
        isClickingDropdownRef.current = false;
        setShowSuggestions(false);
      }
    };

    const useCapture = !!viewportCoordinates;
    document.addEventListener('click', handleClickOutside, useCapture);
    return () => {
      document.removeEventListener('click', handleClickOutside, useCapture);
    };
  }, [showSuggestions, viewportCoordinates]);

  const handleContainerBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setCurrentCaretPos(
      (e.target as HTMLInputElement | HTMLTextAreaElement).selectionEnd ?? 0
    );

    if (viewportCoordinates) {
      setTimeout(() => {
        if (!suggestionRef.current) {
          isClickingDropdownRef.current = false;
          return;
        }

        const activeElement = document.activeElement;
        const clickedOnDropdown =
          dropdownRef.current &&
          (dropdownRef.current === activeElement ||
            dropdownRef.current.contains(activeElement));

        if (clickedOnDropdown && isClickingDropdownRef.current) {
          if (inputRef.current) {
            inputRef.current.focus();
            if (currentCaretPos !== undefined) {
              setTimeout(() => {
                setCaretPosition(inputRef.current, currentCaretPos);
              }, 0);
            }
          }
          return;
        }

        isClickingDropdownRef.current = false;

        if (activeElement !== inputRef.current && suggestionRef.current) {
          setShowSuggestions(false);
        }
      }, BLUR_DELAY);
      return;
    }

    if (
      e.currentTarget &&
      e.relatedTarget &&
      e.currentTarget.contains(e.relatedTarget as Node)
    ) {
      return;
    }

    setTimeout(() => {
      const stillActive =
        document.activeElement === inputRef.current ||
        (dropdownRef.current &&
          dropdownRef.current.contains(document.activeElement));
      if (!stillActive) {
        setShowSuggestions(false);
      }
    }, 0);
  };

  const handleInputFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setHandlebarWarning('');

    if (insertWithoutBrackets) {
      setTimeout(() => {
        const caretIndex = e.target.selectionEnd ?? 0;
        setCurrentCaretPos(caretIndex);
        updateCoordinates(e.target, caretIndex);
        setShowSuggestions(true);
      }, 0);
    }
  };

  const handleKeyDown = () => {
    if (showSuggestions && inputRef.current) {
      const currentCaret = inputRef.current.selectionEnd ?? 0;
      updateCoordinates(inputRef.current, currentCaret);

      setTimeout(() => {
        if (inputRef.current && showSuggestions) {
          const updatedCaret = inputRef.current.selectionEnd ?? 0;
          setCurrentCaretPos(updatedCaret);
          updateCoordinates(inputRef.current, updatedCaret);
        }
      }, 0);
    }
  };

  const handleInputBlur = () => {
    if (viewportCoordinates) {
      return;
    }

    const isClickingDropdown =
      dropdownRef.current &&
      dropdownRef.current.contains(document.activeElement);

    if (isClickingDropdown) {
      return;
    }

    setTimeout(() => {
      if (!validateOnBlur || suggestionRef.current) return;

      initCustomHelpers();
      try {
        Handlebars.compile(inputValue, { strict: true });
      } catch (e: unknown) {
        setHandlebarWarning(e instanceof Error ? e.message : String(e));
      }

      onBlur?.();
    }, 0);
  };

  const InputComponent = as === 'textarea' ? Textarea : Input;

  return (
    <>
      {label && (
        <Label>
          {label}
          {mandatory && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative mt-1" onBlur={handleContainerBlur}>
        <InputComponent
          value={inputValue}
          ref={inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>}
          autoFocus={false}
          onInput={handleShowSuggestion}
          onClick={handleShowSuggestion}
          onKeyDown={handleKeyDown}
          onKeyUp={handleShowSuggestion}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          {...rest}
        />
        {(error || handlebarWarning) && (
          <p className="text-sm mt-1 text-destructive">
            {error || handlebarWarning}
          </p>
        )}
        {showSuggestions && (
          <SuggestionsDropdown
            inputValue={inputValue}
            setInputValue={setInputValue}
            variables={modifiedVariables}
            currentCaretPos={currentCaretPos}
            caretCoordinates={caretCoordinates}
            viewportCoordinates={viewportCoordinates}
            setShowSuggestions={setShowSuggestions}
            inputRef={inputRef}
            onChange={onChange}
            insertWithoutBrackets={insertWithoutBrackets}
            dropdownRef={dropdownRef}
            isClickingDropdownRef={isClickingDropdownRef}
          />
        )}
      </div>
    </>
  );
}

// Internal Suggestions component with insertWithoutBrackets support

interface SuggestionsDropdownProps {
  inputValue: string;
  setInputValue: (v: string) => void;
  variables: Record<string, unknown>;
  currentCaretPos: number | undefined;
  caretCoordinates: { left: number; top: number } | undefined;
  viewportCoordinates: { left: number; top: number } | null;
  setShowSuggestions: (v: boolean) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onChange: (v: string) => void;
  insertWithoutBrackets: boolean;
  dropdownRef: React.MutableRefObject<HTMLDivElement | null>;
  isClickingDropdownRef: React.MutableRefObject<boolean>;
}

function SuggestionsDropdown({
  inputValue,
  setInputValue,
  variables,
  currentCaretPos,
  caretCoordinates,
  viewportCoordinates = null,
  setShowSuggestions,
  inputRef,
  onChange,
  insertWithoutBrackets = false,
  dropdownRef,
  isClickingDropdownRef,
}: SuggestionsDropdownProps) {
  const [selectedSection, setSelectedSection] = useState(DATA_TYPE_SECTIONS[0].id);
  const [optionsList, setOptionsList] = useState<Record<string, unknown> | undefined>(
    undefined
  );

  useEffect(() => {
    const context = parseInputContext(
      inputValue,
      currentCaretPos ?? 0,
      insertWithoutBrackets
    );
    const { inputVariable } = context;

    for (const item of DATA_TYPE_SECTIONS) {
      const idLength = item.id.length;

      if (
        inputVariable &&
        item.id.startsWith('$') &&
        (inputVariable.length <= idLength
          ? item.id.startsWith(inputVariable)
          : inputVariable.startsWith(item.id))
      ) {
        setSelectedSection(item.id);
        return;
      } else if (
        inputVariable &&
        ('$embedded_preference_url'.startsWith(inputVariable) ||
          '$hosted_preference_url'.startsWith(inputVariable))
      ) {
        setSelectedSection('preference');
        return;
      }
    }

    setSelectedSection('data');
  }, [inputValue, currentCaretPos, insertWithoutBrackets]);

  useEffect(() => {
    setOptionsList(undefined);
    const selectedOptionsData = getOptionsList({ variables, selectedSection });
    setTimeout(() => setOptionsList(selectedOptionsData), 0);
  }, [selectedSection, variables]);

  const filteredOptionsList = useMemo(() => {
    if (selectedSection === 'custom_helpers' || !optionsList) {
      return optionsList ?? {};
    }

    const context = parseInputContext(
      inputValue,
      currentCaretPos ?? 0,
      insertWithoutBrackets
    );
    const { inputVariable } = context;

    if (!inputVariable) {
      return optionsList;
    }

    const clonedOptions = cloneDeep(optionsList) as Record<string, unknown>;
    Object.keys(clonedOptions).forEach((item) => {
      if (!item.startsWith(inputVariable)) {
        delete clonedOptions[item];
      }
    });
    return clonedOptions;
  }, [optionsList, inputValue, currentCaretPos, selectedSection, insertWithoutBrackets]);

  const noOptions = isEmpty(filteredOptionsList);

  const handleDropdownInteraction = (e: React.SyntheticEvent) => {
    isClickingDropdownRef.current = true;
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.focus();
      if (currentCaretPos !== undefined) {
        setTimeout(() => {
          setCaretPosition(inputRef.current, currentCaretPos);
        }, 0);
      }
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    isClickingDropdownRef.current = true;
    if (inputRef.current) {
      inputRef.current.focus();
      if (currentCaretPos !== undefined) {
        setTimeout(() => {
          setCaretPosition(inputRef.current, currentCaretPos);
        }, 0);
      }
    }
    setTimeout(() => {
      isClickingDropdownRef.current = false;
    }, CLICK_RESET_DELAY);
  };

  const dropdownStyle = viewportCoordinates
    ? {
        left: `${viewportCoordinates.left}px`,
        top: `${viewportCoordinates.top + 15}px`,
      }
    : {
        left: caretCoordinates?.left,
        top: (caretCoordinates?.top ?? 0) + 15,
      };

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={cn(
        viewportCoordinates ? 'fixed z-[100]' : 'absolute z-50',
        'border rounded bg-muted flex-row flex shadow'
      )}
      tabIndex={-1}
      onMouseDown={handleDropdownInteraction}
      onMouseUp={(e) => {
        isClickingDropdownRef.current = true;
        e.stopPropagation();
      }}
      onClick={handleDropdownClick}
      onPointerDown={handleDropdownInteraction}
      style={{ ...dropdownStyle, pointerEvents: 'auto' }}
    >
      {/* Section sidebar */}
      <div className="border-r py-1">
        <div className="border-b pb-1 w-[140px]">
          {DATA_TYPE_SECTIONS.map((option) => (
            <div
              key={option.id}
              className={cn(
                'px-3 mx-1 py-2 my-0.5 text-sm hover:bg-[#EDF1F5] hover:rounded cursor-pointer',
                selectedSection === option.id && 'bg-[#EDF1F5] rounded'
              )}
              onMouseDown={handleDropdownInteraction}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSection(option.id);
              }}
            >
              <p>{option.label}</p>
            </div>
          ))}
        </div>

        <div
          className={cn(
            'px-3 mx-1 py-2 my-1 text-sm hover:bg-[#EDF1F5] hover:rounded cursor-pointer',
            selectedSection === 'custom_helpers' && 'bg-[#EDF1F5] rounded'
          )}
          onMouseDown={handleDropdownInteraction}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSection('custom_helpers');
          }}
        >
          <p>Custom helpers</p>
        </div>
      </div>

      {/* Options list */}
      <div className="py-1 max-h-[280px] min-w-[400px] overflow-scroll bg-background rounded-r">
        {noOptions ? (
          <p className="px-3 mx-1 py-2 my-0.5 text-muted-foreground text-sm text-center mt-4">
            No variables found matching the search
          </p>
        ) : (
          Object.keys(filteredOptionsList).map((option) => {
            const isCustomHelper = selectedSection === 'custom_helpers';
            const label = isCustomHelper ? option : getLabel(option);
            const subLabel = isCustomHelper
              ? CustomHelpers[option]
              : insertWithoutBrackets
                ? option
                : `{{${option}}}`;

            if (!option || !label) return null;

            return (
              <div
                key={option}
                className="px-3 mx-1 py-2 my-0.5 text-sm hover:bg-[#EDF1F5] hover:rounded cursor-pointer"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={handleDropdownInteraction}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectOption({
                    selectedValue: subLabel,
                    setInputValue,
                    setShowSuggestions,
                    inputRef,
                    onChange,
                  });
                }}
              >
                <p className="text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{subLabel}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  if (viewportCoordinates) {
    return createPortal(dropdownContent, document.body);
  }

  return dropdownContent;
}

function handleSelectOption({
  selectedValue,
  setInputValue,
  setShowSuggestions,
  inputRef,
  onChange,
}: {
  selectedValue: string;
  setInputValue: (v: string) => void;
  setShowSuggestions: (v: boolean) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onChange: (v: string) => void;
}) {
  setInputValue(selectedValue);
  onChange(selectedValue);

  const afterSelectCaretPosition = selectedValue.length;
  setShowSuggestions(false);

  setTimeout(() => {
    setCaretPosition(inputRef.current, afterSelectCaretPosition);
  }, 0);
}
