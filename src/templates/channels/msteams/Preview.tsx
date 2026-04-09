import { useState, useMemo } from 'react';
import * as AdaptiveCards from 'adaptivecards';
import MarkdownRenderer, {
  markdownToHtml,
} from '@/components/custom-ui/MarkdownRenderer';
import { renderHandlebars } from '@/components/custom-ui/HandlebarsRenderer';
import { useJsonnetRender } from '@/apis';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Loader2,
  MSTeamsPreviewIcon as MSTeamsIcon,
} from '@/assets/icons';
import type {
  MSTeamsPreviewProps,
  JsonnetPreviewState,
  JsonnetPreviewProps,
  MarkdownPreviewProps,
  JsonnetRenderBody,
  AdaptiveCardRenderResult,
} from '@/types';

// ── Helpers ──

function formatTime() {
  return new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function renderAdaptiveCard(cardJson: unknown): AdaptiveCardRenderResult {
  try {
    const adaptiveCard = new AdaptiveCards.AdaptiveCard();
    AdaptiveCards.AdaptiveCard.onProcessMarkdown = (text, result) => {
      result.outputHtml = markdownToHtml(text);
      result.didProcess = true;
    };
    adaptiveCard.parse(cardJson);
    const rendered = adaptiveCard.render();
    return { success: true, html: rendered?.innerHTML ?? '' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to render card',
    };
  }
}

// ── Shared Frame Components ──

function TeamsFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="suprsend-w-full suprsend-max-w-lg">
      {/* Purple header bar */}
      <div className="suprsend-bg-[#464EB8] suprsend-h-8 suprsend-rounded-t-lg" />
      {/* Content area */}
      <div className="suprsend-bg-[#F5F5F5] suprsend-rounded-b-lg suprsend-p-5 suprsend-min-h-[300px] suprsend-max-h-[500px] suprsend-overflow-y-auto suprsend-border suprsend-border-t-0 suprsend-border-border">
        {children}
      </div>
    </div>
  );
}

function MessageBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="suprsend-flex suprsend-gap-2.5">
      {/* Teams icon */}
      <div className="suprsend-flex-shrink-0 suprsend-mt-0.5">
        <MSTeamsIcon className="suprsend-w-8 suprsend-h-8" />
      </div>
      {/* Message card */}
      <div className="suprsend-bg-white suprsend-rounded-lg suprsend-p-3 suprsend-flex-1 suprsend-shadow-sm suprsend-overflow-hidden">
        <div className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-mb-1.5">
          <span className="suprsend-text-sm suprsend-font-semibold suprsend-text-foreground">
            test
          </span>
          <span className="suprsend-text-xs suprsend-text-muted-foreground">
            {formatTime()}
          </span>
        </div>
        <div className="suprsend-text-sm suprsend-text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Markdown Preview (auto-rendered) ──

function MarkdownPreview({ bodyText, variables }: MarkdownPreviewProps) {
  const rendered = useMemo(
    () => renderHandlebars(bodyText, variables),
    [bodyText, variables]
  );

  if (!bodyText) {
    return (
      <TeamsFrame>
        <div className="suprsend-flex suprsend-items-center suprsend-justify-center suprsend-h-[250px]">
          <p className="suprsend-text-sm suprsend-text-muted-foreground">
            Start typing to see the preview
          </p>
        </div>
      </TeamsFrame>
    );
  }

  return (
    <TeamsFrame>
      <MessageBubble>
        <MarkdownRenderer>{rendered}</MarkdownRenderer>
      </MessageBubble>
    </TeamsFrame>
  );
}

// ── JSONNET Preview (manual load) ──

function JsonnetPreview({ bodyCard, variables }: JsonnetPreviewProps) {
  const [previewState, setPreviewState] = useState<JsonnetPreviewState | null>(
    null
  );
  const jsonnetRender = useJsonnetRender();

  const handleLoadPreview = () => {
    const body: JsonnetRenderBody = {
      snippet: bodyCard,
      data: variables,
      translations: (variables as Record<string, unknown>).__translations,
    };

    jsonnetRender.mutate(body, {
      onSuccess: (data) => {
        if (data.success && data.result) {
          const cardJson = data.result;
          const result = renderAdaptiveCard(cardJson);
          if (result.success) {
            setPreviewState({ success: true, html: result.html, error: null });
          } else {
            setPreviewState({
              success: false,
              html: null,
              error: result.error,
            });
          }
        } else {
          setPreviewState({
            success: false,
            html: null,
            error: data.error ?? 'Unknown error',
          });
        }
      },
      onError: (err) => {
        setPreviewState({
          success: false,
          html: null,
          error: err instanceof Error ? err.message : 'Error rendering JSONNET',
        });
      },
    });
  };

  return (
    <div className="suprsend-w-full suprsend-max-w-lg">
      {/* Purple header bar */}
      <div className="suprsend-bg-[#464EB8] suprsend-h-8 suprsend-rounded-t-lg" />
      {/* Scrollable content area */}
      <div className="suprsend-bg-[#F5F5F5] suprsend-p-5 suprsend-min-h-[200px] suprsend-max-h-[400px] suprsend-overflow-y-auto suprsend-border suprsend-border-t-0 suprsend-border-b-0 suprsend-border-border">
        {!previewState ? (
          <div className="suprsend-flex suprsend-items-center suprsend-justify-center suprsend-min-h-[200px]">
            <p className="suprsend-text-sm suprsend-text-muted-foreground suprsend-text-center suprsend-px-4">
              Preview of Adaptive card is not auto-generated. Click on Load
              Preview button to fetch the preview.
            </p>
          </div>
        ) : !previewState.success ? (
          <div className="suprsend-flex suprsend-items-center suprsend-justify-center suprsend-min-h-[200px]">
            <p className="suprsend-text-sm suprsend-text-destructive suprsend-text-center suprsend-px-4">
              {previewState.error}
            </p>
          </div>
        ) : (
          <MessageBubble>
            <div
              dangerouslySetInnerHTML={{ __html: previewState.html ?? '' }}
            />
          </MessageBubble>
        )}
      </div>
      {/* Fixed button area */}
      <div className="suprsend-bg-[#F5F5F5] suprsend-rounded-b-lg suprsend-px-5 suprsend-pb-5 suprsend-pt-4 suprsend-border suprsend-border-t-0 suprsend-border-border">
        <div className="suprsend-flex suprsend-justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadPreview}
            disabled={jsonnetRender.isPending || !bodyCard}
          >
            {jsonnetRender.isPending ? (
              <Loader2
                className="suprsend-w-4 suprsend-h-4"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            ) : (
              <RefreshCw className="suprsend-w-4 suprsend-h-4" />
            )}
            Load preview
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ──

export default function MSTeamsPreview({
  bodyType,
  bodyCard,
  bodyText,
  variables,
}: MSTeamsPreviewProps) {
  if (bodyType === 'card') {
    return <JsonnetPreview bodyCard={bodyCard} variables={variables} />;
  }
  return <MarkdownPreview bodyText={bodyText} variables={variables} />;
}
