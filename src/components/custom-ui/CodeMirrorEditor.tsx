import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  type Ref,
} from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { Compartment, Annotation, type Extension } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { placeholder as cmPlaceholder } from '@codemirror/view';
import { cn } from '@/lib/utils';

// --- Public handle exposed via ref ---

export interface CodeMirrorEditorHandle {
  getView: () => EditorView | null;
}

// --- Props ---

export interface CodeMirrorEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: 'json' | 'html';
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  height?: string;
  extensions?: Extension[];
  onUpdate?: (update: import('@codemirror/view').ViewUpdate) => void;
}

// --- Annotations ---

const externalUpdate = Annotation.define<boolean>();

// --- Theme ---

const editorTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '14px', fontFamily: 'inherit' },
  '&.cm-focused': { outline: 'none' },
  '.cm-content': {
    padding: '8px 12px',
    caretColor: 'var(--foreground))',
  },
  '.cm-line': { padding: '0' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-placeholder': { color: 'var(--muted-foreground))' },
  '.cm-gutters': {
    backgroundColor: 'var(--background))',
    color: 'var(--muted-foreground))',
    borderRight: '1px solid var(--border))',
  },
});

// --- Language map ---

const languageExtensions: Record<string, () => Extension> = {
  json,
  html,
};

// --- Component ---

function CodeMirrorEditorInner(
  {
    value = '',
    onChange,
    language,
    disabled = false,
    placeholder,
    className,
    height,
    extensions: extraExtensions = [],
    onUpdate,
  }: CodeMirrorEditorProps,
  ref: Ref<CodeMirrorEditorHandle>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const editableCompartment = useRef(new Compartment());
  const extraCompartment = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const onUpdateRef = useRef(onUpdate);

  // Keep refs fresh
  onChangeRef.current = onChange;
  onUpdateRef.current = onUpdate;

  // Expose view to parent
  useImperativeHandle(ref, () => ({
    getView: () => viewRef.current,
  }));

  // Initialize CodeMirror
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        editorTheme,
        editableCompartment.current.of(EditorView.editable.of(!disabled)),
        language && languageExtensions[language]
          ? languageExtensions[language]()
          : [],
        placeholder ? cmPlaceholder(placeholder) : [],
        extraCompartment.current.of(extraExtensions),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const isExternal = update.transactions.some((tr) =>
              tr.annotation(externalUpdate)
            );
            if (!isExternal) {
              onChangeRef.current?.(update.state.doc.toString());
            }
          }
          onUpdateRef.current?.(update);
        }),
      ],
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    // While the editor is focused (user is actively editing), skip external
    // value syncs to prevent stale API responses (from autosave round-trips)
    // from overwriting what the user just typed.
    if (view.hasFocus) return;
    const currentDoc = view.state.doc.toString();
    if (value !== currentDoc) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
        annotations: externalUpdate.of(true),
      });
    }
  }, [value]);

  // Reconfigure disabled
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: editableCompartment.current.reconfigure(
        EditorView.editable.of(!disabled)
      ),
    });
  }, [disabled]);

  // Reconfigure extra extensions
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: extraCompartment.current.reconfigure(extraExtensions),
    });
  }, [extraExtensions]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'suprsend-rounded-md suprsend-border suprsend-overflow-hidden suprsend-bg-background',
        className
      )}
      style={height ? { height } : undefined}
    />
  );
}

const CodeMirrorEditor = forwardRef(CodeMirrorEditorInner);
export default CodeMirrorEditor;
