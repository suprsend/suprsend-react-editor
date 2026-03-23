import { useMemo, useRef, useEffect } from 'react';
import { renderHandlebars } from '@/components/custom-ui/HandlebarsRenderer';
import type { EmailPreviewProps } from '@/types';

export default function EmailPreview({ html, variables }: EmailPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const resolvedHtml = useMemo(
    () => (html ? renderHandlebars(html, variables) : ''),
    [html, variables]
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(resolvedHtml);
    doc.close();
  }, [resolvedHtml]);

  if (!html) {
    return (
      <div className="suprsend-flex suprsend-items-center suprsend-justify-center suprsend-h-full suprsend-text-muted-foreground suprsend-text-sm">
        No email content to preview
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title="Email Preview"
      sandbox="allow-same-origin"
      className="suprsend-w-full suprsend-h-full suprsend-border-0"
    />
  );
}
