import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RangeSetBuilder } from '@codemirror/state';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import {
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
  EditorView,
} from '@codemirror/view';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  flatten,
  isValidVariable,
  shouldShowSuggestions,
} from '@/lib/suggestion-utils';
import { hasInvalidHandlebarsSyntax } from './HandlebarsRenderer';
import type { CaretCoordinates } from '@/lib/suggestion-utils';
import Suggestions from './Suggestions';
import CodeMirrorEditor, {
  type CodeMirrorEditorHandle,
} from './CodeMirrorEditor';

// --- Types ---

interface SuggestionCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables: Record<string, unknown>;
  enableHighlighting?: boolean;
  enableSuggestions?: boolean;
  language?: 'json' | 'html';
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  height?: string;
  error?: string;
  label?: string;
  mandatory?: boolean;
}

// --- Highlight Extensions ---

const validVarDeco = Decoration.mark({ class: 'cm-hbs-valid' });
const invalidVarDeco = Decoration.mark({ class: 'cm-hbs-invalid' });
const HANDLEBAR_REGEX = /\{\{.*?\}\}/g;

function buildDecorations(
  view: EditorView,
  flattenedVars: Record<string, unknown>
): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();

  for (const { from, to } of view.visibleRanges) {
    const text = view.state.doc.sliceString(from, to);
    HANDLEBAR_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = HANDLEBAR_REGEX.exec(text)) !== null) {
      const start = from + match.index;
      const end = start + match[0].length;
      const isValid = isValidVariable(match[0], flattenedVars);
      builder.add(start, end, isValid ? validVarDeco : invalidVarDeco);
    }
  }

  return builder.finish();
}

function createHighlightPlugin(flattenedVars: Record<string, unknown>) {
  return ViewPlugin.define(
    (view) => ({
      decorations: buildDecorations(view, flattenedVars),
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildDecorations(update.view, flattenedVars);
        }
      },
    }),
    { decorations: (v) => v.decorations }
  );
}

const highlightTheme = EditorView.baseTheme({
  '.cm-hbs-valid, .cm-hbs-valid span': {
    color: 'hsl(var(--primary)) !important',
  },
  '.cm-hbs-invalid, .cm-hbs-invalid span': {
    color: 'hsl(var(--destructive)) !important',
  },
});

const jsonValueStyle = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.string, color: '#16a34a' },
    { tag: tags.number, color: '#16a34a' },
    { tag: tags.bool, color: '#16a34a' },
    { tag: tags.null, color: '#16a34a' },
  ])
);

// --- Main Component ---

export default function SuggestionCodeEditor({
  value,
  onChange,
  variables,
  enableHighlighting = true,
  enableSuggestions = true,
  language,
  disabled = false,
  placeholder,
  className,
  containerClassName,
  height = '300px',
  error,
  label,
  mandatory = true,
}: SuggestionCodeEditorProps) {
  const editorRef = useRef<CodeMirrorEditorHandle>(null);
  const suggestionsMouseDownRef = useRef(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentCaretPos, setCurrentCaretPos] = useState(0);
  const [caretCoordinates, setCaretCoordinates] = useState<CaretCoordinates>({
    top: 0,
    left: 0,
  });
  const [warning, setWarning] = useState('');

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

  // Extra extensions: highlighting
  const extraExtensions = useMemo(
    () => [
      highlightTheme,
      jsonValueStyle,
      enableHighlighting ? createHighlightPlugin(flattenedVars) : [],
    ],
    [flattenedVars, enableHighlighting]
  );

  // Handle CodeMirror updates for suggestion tracking and blur validation
  const handleUpdate = useCallback(
    (update: ViewUpdate) => {
      if (update.focusChanged) {
        if (update.view.hasFocus) {
          setWarning('');
        } else {
          // Editor lost focus — validate handlebars syntax
          setShowSuggestions(false);
          const docText = update.state.doc.toString();
          if (hasInvalidHandlebarsSyntax(docText)) {
            setWarning(
              "Invalid Handlebars syntax. Not sure what's wrong? Ask AI for the correct format."
            );
          }
        }
      }

      if (!enableSuggestions || disabled) return;
      if (!update.selectionSet && !update.docChanged) return;

      const pos = update.state.selection.main.head;
      const docText = update.state.doc.toString();

      setCurrentCaretPos(pos);

      if (shouldShowSuggestions(docText, pos)) {
        const coords = update.view.coordsAtPos(pos);
        if (coords) {
          setCaretCoordinates({
            left: coords.left,
            top: coords.bottom,
          });
          setShowSuggestions(true);
        }
      } else {
        setShowSuggestions(false);
      }
    },
    [enableSuggestions, disabled]
  );

  // Close suggestions when clicking outside the editor and suggestions portal
  useEffect(() => {
    if (!showSuggestions) return;
    const handleDocMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        editorRef.current?.getView()?.dom.contains(target) ||
        target.closest('[data-suggestions-portal]')
      ) {
        return;
      }
      setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleDocMouseDown);
    return () => document.removeEventListener('mousedown', handleDocMouseDown);
  }, [showSuggestions]);

  // Handle suggestion selection
  const handleSelectOption = useCallback(
    (selectedValue: string) => {
      const view = editorRef.current?.getView();
      if (!view) return;

      const docText = view.state.doc.toString();
      const str1 = docText.substring(0, currentCaretPos);
      const LI = str1.lastIndexOf('{{');
      const str2 = docText.substring(LI);
      const FI = str2.indexOf('}}');

      let replaceFrom: number;
      let replaceTo: number;

      if (FI < 0) {
        replaceFrom = LI;
        replaceTo = currentCaretPos;
      } else {
        const str3 = str2.substring(0, FI);
        const LI1 = str3.lastIndexOf('{{');
        if (LI1 > 0) {
          replaceFrom = LI;
          replaceTo = currentCaretPos;
        } else {
          replaceFrom = LI;
          replaceTo = LI + FI + 2;
        }
      }

      const afterPos = replaceFrom + selectedValue.length;

      view.dispatch({
        changes: { from: replaceFrom, to: replaceTo, insert: selectedValue },
        selection: { anchor: afterPos },
      });
      view.focus();
      setShowSuggestions(false);
    },
    [currentCaretPos]
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
        className={cn('suprsend-relative suprsend-mt-1', containerClassName)}
        onBlur={(e) => {
          if (
            e.currentTarget &&
            e.relatedTarget &&
            e.currentTarget.contains(e.relatedTarget)
          ) {
            // focus moved within container — keep suggestions open
            return;
          }
          requestAnimationFrame(() => {
            if (suggestionsMouseDownRef.current) {
              suggestionsMouseDownRef.current = false;
              return;
            }
            setShowSuggestions(false);
          });
        }}
      >
        <CodeMirrorEditor
          ref={editorRef}
          value={value}
          onChange={onChange}
          language={language}
          disabled={disabled}
          placeholder={placeholder}
          height={height}
          extensions={extraExtensions}
          onUpdate={handleUpdate}
          className={cn(
            disabled
              ? 'suprsend-bg-muted suprsend-opacity-50'
              : 'suprsend-bg-background',
            error || warning
              ? 'suprsend-border-destructive'
              : 'suprsend-border-input',
            className
          )}
        />

        {(error || warning) && (
          <p className="suprsend-text-sm suprsend-mt-1 suprsend-text-destructive suprsend-shrink-0">
            {error || warning}
          </p>
        )}

        {enableSuggestions &&
          !disabled &&
          showSuggestions &&
          createPortal(
            <Suggestions
              inputValue={
                editorRef.current?.getView()?.state.doc.toString() ?? ''
              }
              variables={modifiedVariables}
              currentCaretPos={currentCaretPos}
              caretCoordinates={caretCoordinates}
              onSelectOption={handleSelectOption}
              onSuggestionsMouseDown={() => {
                suggestionsMouseDownRef.current = true;
              }}
            />,
            document.body
          )}
      </div>
    </>
  );
}
