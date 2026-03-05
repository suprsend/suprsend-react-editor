import { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  DATA_TYPE_SECTIONS,
  CustomHelpers,
  isEmpty,
  getLabel,
  getOptionsList,
} from '@/lib/suggestion-utils';
import type { CaretCoordinates } from '@/lib/suggestion-utils';

export interface SuggestionsProps {
  inputValue: string;
  variables: Record<string, unknown>;
  currentCaretPos: number;
  caretCoordinates: CaretCoordinates;
  onSelectOption: (selectedValue: string) => void;
  onSuggestionsMouseDown?: () => void;
}

export default function Suggestions({
  inputValue,
  variables,
  currentCaretPos,
  caretCoordinates,
  onSelectOption,
  onSuggestionsMouseDown,
}: SuggestionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent pointerdown from bubbling to document where Radix Dialog's
  // dismiss handler listens (bubble phase). Using bubble phase here ensures
  // the event still reaches child elements (option clicks work) but never
  // reaches document, so Radix won't treat it as an outside click.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stop = (e: PointerEvent) => e.stopPropagation();
    el.addEventListener('pointerdown', stop); // bubble phase
    return () => el.removeEventListener('pointerdown', stop);
  }, []);

  const visibleSections = DATA_TYPE_SECTIONS;

  const [selectedSection, setSelectedSection] = useState(
    visibleSections[0].id
  );
  const [optionsList, setOptionsList] = useState<Record<string, unknown>>();

  useEffect(() => {
    for (const item of visibleSections) {
      const str1 = inputValue.substring(0, currentCaretPos);
      const LI = str1.lastIndexOf('{{');
      const str2 = inputValue.substring(LI + 2, currentCaretPos);
      const idLength = item.id.length;

      if (
        str2 &&
        item.id.startsWith('$') &&
        (str2.length <= idLength
          ? item.id.startsWith(str2)
          : str2.startsWith(item.id))
      ) {
        setSelectedSection(item.id);
        return;
      } else if (
        str2 &&
        ('$embedded_preference_url'.startsWith(str2) ||
          '$hosted_preference_url'.startsWith(str2))
      ) {
        setSelectedSection('preference');
      } else {
        setSelectedSection('data');
      }
    }
  }, [inputValue, currentCaretPos, visibleSections]);

  useEffect(() => {
    setOptionsList(getOptionsList({ variables, selectedSection }));
  }, [selectedSection, variables]);

  const filteredOptionsList = useMemo(() => {
    if (!optionsList) return {};
    if (selectedSection === 'custom_helpers') return optionsList;

    const str1 = inputValue.substring(0, currentCaretPos);
    const lastOpenBracket = str1.lastIndexOf('{{');
    const inputVariable = inputValue.substring(
      lastOpenBracket + 2,
      currentCaretPos
    );

    if (!inputVariable) return optionsList;

    return Object.fromEntries(
      Object.entries(optionsList).filter(([key]) =>
        key.startsWith(inputVariable)
      )
    );
  }, [optionsList, inputValue, currentCaretPos, selectedSection]);

  const noOptions = isEmpty(filteredOptionsList);

  return (
    <div
      ref={containerRef}
      data-suggestions-portal
      className="suprsend-fixed suprsend-z-[9999] suprsend-border suprsend-rounded suprsend-bg-muted suprsend-flex-row suprsend-flex suprsend-shadow"
      tabIndex={-1}
      onMouseDown={(e) => {
        e.preventDefault();
        onSuggestionsMouseDown?.();
      }}
      style={{
        left: caretCoordinates.left,
        top: caretCoordinates.top + 15,
        // Radix Dialog's modal mode sets `pointer-events: none` on document.body
        // to block interaction with background content. Since these suggestions are
        // portaled to body, they inherit that and become unclickable. Override here.
        pointerEvents: 'auto',
      }}
    >
      {/* Section sidebar */}
      <div className="suprsend-border-r suprsend-py-1 suprsend-min-h-[250px]">
        <div className="suprsend-border-b suprsend-pb-1 suprsend-w-[140px]">
          {visibleSections.map((option) => (
            <div
              key={option.id}
              className={cn(
                'suprsend-px-3 suprsend-mx-1 suprsend-py-2 suprsend-my-0.5 suprsend-text-sm hover:suprsend-bg-accent hover:suprsend-rounded suprsend-cursor-pointer',
                selectedSection === option.id &&
                  'suprsend-bg-accent suprsend-rounded'
              )}
              onClick={() => setSelectedSection(option.id)}
            >
              <p>{option.label}</p>
            </div>
          ))}
        </div>

        <div
          className={cn(
            'suprsend-px-3 suprsend-mx-1 suprsend-py-2 suprsend-my-1 suprsend-text-sm hover:suprsend-bg-accent hover:suprsend-rounded suprsend-cursor-pointer',
            selectedSection === 'custom_helpers' &&
              'suprsend-bg-accent suprsend-rounded'
          )}
          onClick={() => setSelectedSection('custom_helpers')}
        >
          <p>Custom helpers</p>
        </div>
      </div>

      {/* Options list */}
      <div className="suprsend-py-1 suprsend-max-h-[280px] suprsend-min-w-[400px] suprsend-overflow-auto suprsend-bg-background suprsend-rounded-r">
        {noOptions ? (
          <p className="suprsend-px-3 suprsend-mx-1 suprsend-py-2 suprsend-my-0.5 suprsend-text-muted-foreground suprsend-text-sm suprsend-text-center suprsend-mt-4">
            No variables found matching the search
          </p>
        ) : (
          Object.keys(filteredOptionsList).map((option) => {
            const isCustomHelper = selectedSection === 'custom_helpers';
            const label = isCustomHelper ? option : getLabel(option);
            const subLabel = isCustomHelper
              ? CustomHelpers[option]
              : `{{${option}}}`;

            if (!option || !label) return null;

            return (
              <div
                key={option}
                className="suprsend-px-3 suprsend-mx-1 suprsend-py-2 suprsend-my-0.5 suprsend-text-sm hover:suprsend-bg-accent hover:suprsend-rounded suprsend-cursor-pointer"
                onClick={() => onSelectOption(subLabel)}
              >
                <p className="suprsend-text-sm">{label}</p>
                <p className="suprsend-text-xs suprsend-text-muted-foreground suprsend-mt-0.5">
                  {subLabel}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
