import { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAutosave } from '@/lib/useAutosave';
import { useUpdateVariantContent } from '@/apis';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SaveIndicator from '@/components/custom-ui/SaveIndicator';
import type { MSTeamsChannelProps, MSTeamsFormValues } from '@/types';
import SuggestionInputWithEmoji from '@/components/custom-ui/SuggestionInputWithEmoji';
import CodeEditorWithEmoji from '@/components/custom-ui/CodeEditorWithEmoji';
import MSTeamsPreview from './Preview';

export default function MSTeamsChannel({
  variantData,
  variables,
}: MSTeamsChannelProps) {
  const { templateSlug, variantId, isLive } = useTemplateEditorContext();

  const {
    mutate,
    isPending: isSaving,
    isSuccess: isSaved,
  } = useUpdateVariantContent({
    templateSlug,
    chanelSlug: 'ms_teams',
    variantId,
  });

  const content = variantData?.content;

  const { watch, control, setValue } = useForm<MSTeamsFormValues>({
    mode: 'onChange',
    values: {
      body_type: content?.body_type ?? 'text',
      body_card: content?.body_card ?? '',
      body_text: content?.body_text ?? '',
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const formValues = useWatch({ control });

  const handleAutosave = useCallback(
    (data: MSTeamsFormValues) => {
      const payload: Record<string, string> = {
        body_type: data.body_type,
      };

      if (data.body_type === 'card') {
        payload.body_card = data.body_card;
      } else {
        payload.body_text = data.body_text;
      }

      mutate({ content: payload });
    },
    [mutate]
  );

  useAutosave({ watch, onSave: handleAutosave });

  const isCard = formValues.body_type === 'card';

  return (
    <div className="suprsend-h-full suprsend-flex">
      <div className="suprsend-flex-1 suprsend-p-6 suprsend-overflow-y-auto">
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-mb-6">
          <h2 className="suprsend-text-base suprsend-font-semibold suprsend-text-foreground">
            MS Teams Template
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
                    setValue('body_type', val as 'card' | 'text', {
                      shouldDirty: true,
                    })
            }
          >
            <TabsList>
              <TabsTrigger value="card">JSONNET</TabsTrigger>
              <TabsTrigger value="text">Markdown</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Helper text */}
          <p className="suprsend-text-xs suprsend-text-muted-foreground">
            {isCard
              ? 'Add variable in JSONNET as data.key or data["$batched_events"].key'
              : 'Add variable in handlebars format as {{...}}. Enclose variable containing special characters in {{{...}}}'}
          </p>

          {/* Editor */}
          {isCard ? (
            <CodeEditorWithEmoji
              language="json"
              value={formValues.body_card ?? ''}
              onChange={(val) =>
                setValue('body_card', val, { shouldDirty: true })
              }
              placeholder="Paste your Adaptive Card JSON / JSONNET here..."
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
              rows={19}
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
        <MSTeamsPreview
          bodyType={formValues.body_type ?? 'text'}
          bodyCard={formValues.body_card ?? ''}
          bodyText={formValues.body_text ?? ''}
          variables={variables}
        />
      </div>
    </div>
  );
}
