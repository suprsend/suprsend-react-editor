import { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SaveIndicator from '@/components/custom-ui/SaveIndicator';
import type { SlackChannelProps, SlackFormValues } from '@/types';
import SuggestionInputWithEmoji from '@/components/custom-ui/SuggestionInputWithEmoji';
import CodeEditorWithEmoji from '@/components/custom-ui/CodeEditorWithEmoji';
import SlackPreview from './Preview';

export default function SlackChannel({
  variantData,
  variables,
}: SlackChannelProps) {
  const { templateSlug, variantId, isLive } = useTemplateEditorContext();

  const {
    mutate,
    isPending: isSaving,
    isSuccess: isSaved,
  } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'slack',
    variantId,
  });

  const content = variantData?.content;

  const { watch, control, setValue } = useForm<SlackFormValues>({
    mode: 'onChange',
    values: {
      body_type: content?.body_type ?? 'text',
      body_block: content?.body_block ?? '',
      body_text: content?.body_text ?? '',
    },
    resetOptions: {
      keepDirtyValues: true,
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

  const isBlock = formValues.body_type === 'block';

  return (
    <div className="suprsend-h-full suprsend-flex">
      <div className="suprsend-flex-1 suprsend-p-6 suprsend-overflow-y-auto">
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-mb-6">
          <h2 className="suprsend-text-base suprsend-font-semibold suprsend-text-foreground">
            Slack Template
          </h2>
          <SaveIndicator isSaving={isSaving} isSaved={isSaved} className="" />
        </div>
        <div className="suprsend-max-w-3xl suprsend-space-y-4">
          {/* Body Type Toggle */}
          <Tabs
            value={formValues.body_type}
            onValueChange={
              isLive
                ? undefined
                : (val) =>
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
            {isBlock ? (
              <>
                Add variable in JSONNET as data.key or data["$batched_events"]
                .key. Design template in{' '}
                <a
                  href="https://app.slack.com/block-kit-builder"
                  target="_blank"
                  rel="noreferrer"
                  className="suprsend-text-primary hover:suprsend-underline"
                >
                  Slack Block Kit Builder
                </a>
              </>
            ) : (
              'Add variable in handlebars format as {{...}}. Enclose variable containing special characters in {{{...}}}'
            )}
          </p>

          {/* Editor */}
          {isBlock ? (
            <CodeEditorWithEmoji
              language="json"
              value={formValues.body_block ?? ''}
              onChange={(val) =>
                setValue('body_block', val, { shouldDirty: true })
              }
              height="500px"
              disabled={isLive}
            />
          ) : (
            <SuggestionInputWithEmoji
              value={formValues.body_text ?? ''}
              onChange={(val: string) =>
                setValue('body_text', val, { shouldDirty: true })
              }
              variables={variables}
              as="textarea"
              className="!suprsend-h-[500px]"
              disabled={isLive}
            />
          )}
        </div>
      </div>

      {/* Preview */}
      <div
        className="suprsend-flex-1 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-border-l suprsend-overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--border) 1px, transparent 1px)',
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
