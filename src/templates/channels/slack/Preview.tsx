import { useMemo } from 'react';
import { renderHandlebars } from '@/components/custom-ui/HandlebarsRenderer';
import { Button } from '@/components/ui/button';
import SlackIcon from '@/assets/slackChannel.svg?react';
import type {
  SlackPreviewProps,
  SlackTextPreviewProps,
  SlackBlockPreviewProps,
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
    <div className="suprsend-w-full suprsend-max-w-lg suprsend-rounded-lg suprsend-border suprsend-border-border suprsend-overflow-hidden suprsend-shadow-lg suprsend-flex">
      {/* Purple sidebar */}
      <div className="suprsend-w-[10%] suprsend-min-w-[40px] suprsend-bg-[#411246]" />
      {/* Content area */}
      <div className="suprsend-flex-1 suprsend-bg-white suprsend-p-5">
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

// ── Block/JSONNET Preview (redirect to Slack Block Kit Builder) ──

function BlockPreview({ bodyBlock }: SlackBlockPreviewProps) {
  if (!bodyBlock) {
    return (
      <div className="suprsend-w-full suprsend-max-w-lg suprsend-flex suprsend-items-center suprsend-justify-center suprsend-min-h-[200px]">
        <p className="suprsend-text-sm suprsend-text-muted-foreground">
          Start typing to see the preview
        </p>
      </div>
    );
  }

  return (
    <div className="suprsend-w-full suprsend-max-w-md suprsend-bg-white suprsend-rounded-lg suprsend-border suprsend-border-border suprsend-shadow-lg suprsend-p-6">
      <h3 className="suprsend-text-base suprsend-font-semibold suprsend-text-foreground suprsend-mb-2">
        Preview Template
      </h3>
      <p className="suprsend-text-sm suprsend-text-muted-foreground suprsend-mb-6">
        Preview for JSONNET template is not available here. View it on Slack
        Block Kit Builder.
      </p>
      <div className="suprsend-flex suprsend-justify-end suprsend-gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.open('https://app.slack.com/block-kit-builder/', '_blank');
          }}
        >
          View on Slack Builder
        </Button>
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
    return <BlockPreview bodyBlock={bodyBlock} />;
  }
  return <TextPreview bodyText={bodyText} variables={variables} />;
}
