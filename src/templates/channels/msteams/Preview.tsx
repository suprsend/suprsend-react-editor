import { useState, useMemo } from 'react';
import * as AdaptiveCards from 'adaptivecards';
import markdownit from 'markdown-it';
import Markdown from 'react-markdown';
import { renderHandlebars } from '@/components/custom-ui/HandlebarsRenderer';
import { useJsonnetRender } from '@/apis';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import MSTeamsIcon from '@/assets/msteamPreview.svg?react';
import type {
  MSTeamsPreviewProps,
  JsonnetPreviewState,
  JsonnetPreviewProps,
  MarkdownPreviewProps,
  JsonnetRenderBody,
  AdaptiveCardRenderResult,
} from '@/types';

// ── Helpers ──

const md = markdownit();

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
      result.outputHtml = md.render(text);
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
      <div className="suprsend-bg-[#F5F5F5] suprsend-rounded-b-lg suprsend-p-5 suprsend-min-h-[300px] suprsend-border suprsend-border-t-0 suprsend-border-border">
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
        <Markdown
          components={{
            a({ children, href }) {
              return (
                <a
                  href={href}
                  style={{
                    color: '#6264A7',
                    textDecoration: 'none',
                    whiteSpace: 'normal',
                  }}
                >
                  {children}
                </a>
              );
            },
            p({ children }) {
              return (
                <p style={{ margin: 0, overflowWrap: 'anywhere' }}>
                  {children}
                </p>
              );
            },
            blockquote({ children }) {
              return (
                <blockquote
                  style={{
                    margin: 0,
                    paddingLeft: 10,
                    borderLeft: '3px #DBDADA solid',
                    marginBottom: 5,
                    backgroundColor: '#F8F8F8',
                  }}
                >
                  {children}
                </blockquote>
              );
            },
            code({ children }) {
              return (
                <code style={{ backgroundColor: '#F8F8F8', padding: 1 }}>
                  {children}
                </code>
              );
            },
            ul({ children }) {
              return (
                <ul
                  style={{
                    whiteSpace: 'normal',
                    margin: 0,
                    paddingLeft: 15,
                    listStyle: 'revert',
                  }}
                >
                  {children}
                </ul>
              );
            },
            ol({ children }) {
              return (
                <ol
                  style={{
                    whiteSpace: 'normal',
                    margin: 0,
                    paddingLeft: 15,
                    listStyle: 'revert',
                  }}
                >
                  {children}
                </ol>
              );
            },
            img(props) {
              return (
                <img
                  style={{ maxWidth: '100%', objectFit: 'contain' }}
                  {...props}
                />
              );
            },
          }}
        >
          {rendered}
        </Markdown>
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
          const cardJson = data.result[0];
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
    <TeamsFrame>
      {/* Preview content */}
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

      {/* Always show Load preview button */}
      <div className="suprsend-flex suprsend-justify-center suprsend-mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadPreview}
          disabled={jsonnetRender.isPending || !bodyCard}
        >
          {jsonnetRender.isPending ? (
            <Loader2 className="suprsend-w-4 suprsend-h-4 suprsend-animate-spin" />
          ) : (
            <RefreshCw className="suprsend-w-4 suprsend-h-4" />
          )}
          Load preview
        </Button>
      </div>
    </TeamsFrame>
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
