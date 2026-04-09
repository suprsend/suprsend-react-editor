import { useState, useMemo } from 'react';
import { renderHandlebars } from '@/components/custom-ui/HandlebarsRenderer';
import { Button } from '@/components/ui/button';
import { SlackIcon, RefreshCw, Loader2 } from '@/assets/icons';
import { useJsonnetRender } from '@/apis';
import type {
  SlackPreviewProps,
  SlackTextPreviewProps,
  SlackBlockPreviewProps,
  JsonnetRenderBody,
} from '@/types';

function formatTime() {
  return new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ── Slack-styled message frame ──

function SlackFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="suprsend-w-full suprsend-max-w-lg suprsend-max-h-[500px] suprsend-rounded-lg suprsend-border suprsend-border-border suprsend-overflow-hidden suprsend-shadow-lg suprsend-flex">
      {/* Purple sidebar */}
      <div className="suprsend-w-[10%] suprsend-min-w-[40px] suprsend-bg-[#411246]" />
      {/* Content area */}
      <div className="suprsend-flex-1 suprsend-bg-white suprsend-p-5 suprsend-overflow-y-auto">
        <div className="suprsend-flex suprsend-gap-2.5">
          <div className="suprsend-flex-shrink-0 suprsend-mt-0.5">
            <SlackIcon className="suprsend-w-5 suprsend-h-5" />
          </div>
          <div className="suprsend-flex-1">
            <div className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-mb-1">
              <span className="suprsend-text-sm suprsend-font-bold suprsend-text-[#1D1C1D]">
                Your App
              </span>
              <span className="suprsend-bg-[#EDEDEF] suprsend-px-1 suprsend-py-0.5 suprsend-rounded suprsend-text-xs suprsend-font-semibold suprsend-text-[#616061]">
                APP
              </span>
              <span className="suprsend-text-sm suprsend-text-[#616061]">
                {formatTime()}
              </span>
            </div>
            <div className="suprsend-text-sm suprsend-text-[#1D1C1D]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Text Preview (auto-rendered) ──

function TextPreview({ bodyText, variables }: SlackTextPreviewProps) {
  const rendered = useMemo(
    () => renderHandlebars(bodyText, variables),
    [bodyText, variables]
  );

  if (!bodyText) {
    return (
      <div className="suprsend-w-full suprsend-max-w-lg suprsend-flex suprsend-items-center suprsend-justify-center suprsend-min-h-[200px]">
        <p className="suprsend-text-sm suprsend-text-muted-foreground">
          Start typing to see the preview
        </p>
      </div>
    );
  }

  return (
    <SlackFrame>
      <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{rendered}</p>
    </SlackFrame>
  );
}

// ── Block/JSONNET Preview (manual load via render API) ──

function BlockPreview({ bodyBlock, variables }: SlackBlockPreviewProps) {
  const [previewState, setPreviewState] = useState<{
    success: boolean;
    data: string | null;
    error: string | null;
  } | null>(null);
  const jsonnetRender = useJsonnetRender();

  const handleLoadPreview = () => {
    const body: JsonnetRenderBody = {
      snippet: bodyBlock,
      data: variables,
      translations: (variables as Record<string, unknown>).__translations,
    };

    jsonnetRender.mutate(body, {
      onSuccess: (res) => {
        if (res.success && res.result) {
          setPreviewState({
            success: true,
            data: JSON.stringify(res.result, undefined, 2),
            error: null,
          });
        } else {
          setPreviewState({
            success: false,
            data: null,
            error: res.error ?? 'Unknown error',
          });
        }
      },
      onError: (err) => {
        setPreviewState({
          success: false,
          data: null,
          error: err instanceof Error ? err.message : 'Error rendering JSONNET',
        });
      },
    });
  };

  return (
    <div className="suprsend-w-full suprsend-max-w-lg suprsend-rounded-lg suprsend-border suprsend-border-border suprsend-shadow-lg suprsend-overflow-hidden suprsend-flex">
      {/* Purple sidebar — full height */}
      <div className="suprsend-w-[10%] suprsend-min-w-[40px] suprsend-bg-[#411246]" />

      {/* Right column: content + footer */}
      <div className="suprsend-flex-1 suprsend-flex suprsend-flex-col suprsend-bg-white">
        {/* Scrollable content */}
        <div className="suprsend-flex-1 suprsend-p-5 suprsend-min-h-[200px] suprsend-max-h-[400px] suprsend-overflow-y-auto">
          {!previewState ? (
            <div className="suprsend-flex suprsend-items-center suprsend-justify-center suprsend-h-full suprsend-min-h-[180px]">
              <p className="suprsend-text-sm suprsend-text-muted-foreground suprsend-text-center suprsend-px-4">
                Click Load Preview to fetch the rendered output.
              </p>
            </div>
          ) : !previewState.success ? (
            <div className="suprsend-flex suprsend-items-center suprsend-justify-center suprsend-h-full suprsend-min-h-[180px]">
              <p className="suprsend-text-sm suprsend-text-destructive suprsend-text-center suprsend-px-4">
                {previewState.error}
              </p>
            </div>
          ) : (
            <pre className="suprsend-text-xs suprsend-text-foreground suprsend-whitespace-pre-wrap suprsend-break-words suprsend-m-0">
              {previewState.data}
            </pre>
          )}
        </div>

        {/* Footer — stays in white area only */}
        <div className="suprsend-border-t suprsend-border-border suprsend-px-5 suprsend-py-3 suprsend-flex suprsend-items-center suprsend-justify-between suprsend-gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadPreview}
            disabled={jsonnetRender.isPending || !bodyBlock}
          >
            {jsonnetRender.isPending ? (
              <Loader2
                className="suprsend-w-4 suprsend-h-4"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            ) : (
              <RefreshCw className="suprsend-w-4 suprsend-h-4" />
            )}
            Load Preview
          </Button>

          {previewState?.success && previewState.data && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const domain = 'https://app.slack.com/block-kit-builder/#';
                const path = window.encodeURI(previewState.data!);
                window.open(`${domain}${path}`, '_blank');
              }}
            >
              View in Slack Block Kit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Export ──

export default function SlackPreview({
  bodyType,
  bodyBlock,
  bodyText,
  variables,
}: SlackPreviewProps) {
  if (bodyType === 'block') {
    return <BlockPreview bodyBlock={bodyBlock} variables={variables} />;
  }
  return <TextPreview bodyText={bodyText} variables={variables} />;
}
