import { useRef, useState, useMemo, useCallback } from 'react';
import { RangeSetBuilder } from '@codemirror/state';
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
  '.cm-hbs-valid': { color: 'hsl(var(--primary))' },
  '.cm-hbs-invalid': { color: 'hsl(var(--destructive))' },
});

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
  height = '300px',
  error,
  label,
  mandatory = true,
}: SuggestionCodeEditorProps) {
  const editorRef = useRef<CodeMirrorEditorHandle>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentCaretPos, setCurrentCaretPos] = useState(0);
  const [caretCoordinates, setCaretCoordinates] = useState<CaretCoordinates>({
    top: 0,
    left: 0,
  });

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
      enableHighlighting ? createHighlightPlugin(flattenedVars) : [],
    ],
    [flattenedVars, enableHighlighting]
  );

  // Handle CodeMirror updates for suggestion tracking
  const handleUpdate = useCallback(
    (update: ViewUpdate) => {
      if (!enableSuggestions) return;
      if (!update.selectionSet && !update.docChanged) return;

      const pos = update.state.selection.main.head;
      const docText = update.state.doc.toString();

      setCurrentCaretPos(pos);

      if (shouldShowSuggestions(docText, pos)) {
        setShowSuggestions(true);
        const coords = update.view.coordsAtPos(pos);
        if (coords) {
          const editorRect = update.view.dom.getBoundingClientRect();
          setCaretCoordinates({
            left: coords.left - editorRect.left,
            top: coords.bottom - editorRect.top,
          });
        }
      } else {
        setShowSuggestions(false);
      }
    },
    [enableSuggestions]
  );

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
        className="suprsend-relative suprsend-mt-1"
        onBlur={(e) => {
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
            error ? 'suprsend-border-destructive' : 'suprsend-border-input',
            className
          )}
        />

        {error && (
          <p className="suprsend-text-sm suprsend-mt-1 suprsend-text-destructive">
            {error}
          </p>
        )}

        {enableSuggestions && showSuggestions && (
          <Suggestions
            inputValue={
              editorRef.current?.getView()?.state.doc.toString() ?? ''
            }
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
