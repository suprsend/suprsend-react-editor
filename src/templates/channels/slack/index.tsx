import { useCallback, useRef, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { EditorView, basicSetup } from 'codemirror';
import { Annotation } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { placeholder as cmPlaceholder } from '@codemirror/view';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SlackChannelProps, SlackFormValues } from '@/types';
import SuggestionInput from '@/components/custom-ui/SuggestionInput';
import SlackPreview from './Preview';

const externalUpdate = Annotation.define<boolean>();

const editorTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '14px', fontFamily: 'inherit' },
  '&.cm-focused': { outline: 'none' },
  '.cm-content': {
    padding: '8px 12px',
    caretColor: 'hsl(var(--foreground))',
  },
  '.cm-line': { padding: '0' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-placeholder': { color: 'hsl(var(--muted-foreground))' },
  '.cm-gutters': {
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--muted-foreground))',
    borderRight: '1px solid hsl(var(--border))',
  },
});

export default function SlackChannel({
  variantData,
  variables,
}: SlackChannelProps) {
  const { templateSlug, variantId } = useTemplateEditorContext();

  const { mutate } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'slack',
    variantId,
  });

  const content = variantData?.content;

  const { watch, control, setValue } = useForm<SlackFormValues>({
    values: {
      body_type: content?.body_type ?? 'text',
      body_block: content?.body_block ?? '',
      body_text: content?.body_text ?? '',
    },
  });

  const formValues = useWatch({ control });

  const handleAutosave = useCallback(
    (data: SlackFormValues) => {
      const payload: Record<string, string> = {
        body_type: data.body_type,
      };

      if (data.body_type === 'block') {
        payload.body_block = data.body_block;
      } else {
        payload.body_text = data.body_text;
      }

      mutate({ content: payload });
    },
    [mutate]
  );

  useAutosave({ watch, onSave: handleAutosave });

  // --- CodeMirror setup ---
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef<(value: string) => void>(() => {});

  const isBlock = formValues.body_type === 'block';
  const currentValue = isBlock ? formValues.body_block : formValues.body_text;
  const fieldName = isBlock ? 'body_block' : 'body_text';

  onChangeRef.current = (value: string) => {
    setValue(fieldName as keyof SlackFormValues, value, {
      shouldDirty: true,
    });
  };

  // Create / recreate editor when mode switches
  useEffect(() => {
    if (!editorContainerRef.current) return;

    const view = new EditorView({
      doc: currentValue || '',
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        editorTheme,
        ...(isBlock
          ? [
              json(),
              cmPlaceholder(
                'Add template blocks array [...], instead of blocks object {blocks:[...]}'
              ),
            ]
          : [cmPlaceholder('Write your message here...')]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const isExt = update.transactions.some((tr) =>
              tr.annotation(externalUpdate)
            );
            if (!isExt) {
              onChangeRef.current?.(update.state.doc.toString());
            }
          }
        }),
      ],
      parent: editorContainerRef.current,
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlock]);

  // Sync external value into editor (e.g. after API round-trip)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (view.hasFocus) return;
    const currentDoc = view.state.doc.toString();
    if ((currentValue || '') !== currentDoc) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: currentValue || '',
        },
        annotations: externalUpdate.of(true),
      });
    }
  }, [currentValue]);

  return (
    <div className="suprsend-h-full suprsend-flex">
      <div className="suprsend-flex-1 suprsend-p-6 suprsend-overflow-y-auto">
        <div className="suprsend-max-w-3xl suprsend-space-y-4">
          {/* Body Type Toggle */}
          <Tabs
            value={formValues.body_type}
            onValueChange={(val) =>
              setValue('body_type', val as 'block' | 'text', {
                shouldDirty: true,
              })
            }
          >
            <TabsList>
              <TabsTrigger value="block">JSONNET</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Helper text */}
          <p className="suprsend-text-xs suprsend-text-muted-foreground">
            {isBlock
              ? 'Add variable in JSONNET as data.key or data["$batched_events"].key'
              : 'Add variable in handlebars format as {{...}}. Enclose variable containing special characters in {{{...}}}'}
          </p>

          {/* Editor */}
          {isBlock ? (
            <div
              ref={editorContainerRef}
              className="suprsend-rounded-md suprsend-border suprsend-overflow-hidden suprsend-bg-background"
              style={{ height: '400px' }}
            />
          ) : (
            <SuggestionInput
              value={formValues.body_text ?? ''}
              onChange={(val: string) =>
                setValue('body_text', val, { shouldDirty: true })
              }
              className="suprsend-rounded-md suprsend-border suprsend-bg-background"
              variables={variables}
              as="textarea"
              rows={19}
            />
          )}
        </div>
      </div>

      {/* Preview */}
      <div
        className="suprsend-flex-1 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-border-l suprsend-overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <SlackPreview
          bodyType={formValues.body_type ?? 'text'}
          bodyBlock={formValues.body_block ?? ''}
          bodyText={formValues.body_text ?? ''}
          variables={variables}
        />
      </div>
    </div>
  );
}
