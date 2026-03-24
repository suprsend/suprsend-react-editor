import { useMemo, useRef, useEffect } from 'react';
import { renderHandlebars } from '@/components/custom-ui/HandlebarsRenderer';
import HandlebarsRenderer from '@/components/custom-ui/HandlebarsRenderer';
import type { EmailPreviewProps } from '@/types';

export default function EmailPreview({
  variantData,
  variables,
}: EmailPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const body = variantData?.content?.body;
  const type = body?.type;

  const html = useMemo(() => {
    if (type === 'designer') return body?.designer?.html ?? '';
    if (type === 'raw') return body?.raw?.html ?? '';
    return '';
  }, [type, body?.designer?.html, body?.raw?.html]);

  const plainText = useMemo(() => {
    if (type === 'plain_text') return body?.plain_text?.text ?? '';
    return '';
  }, [type, body?.plain_text?.text]);

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

  if (type === 'plain_text') {
    return (
      <div className="suprsend-w-full suprsend-h-full suprsend-overflow-auto suprsend-p-4">
        <HandlebarsRenderer
          template={plainText || 'No plain text content to preview'}
          data={variables}
          className="suprsend-text-sm suprsend-whitespace-pre-wrap suprsend-break-words suprsend-text-foreground"
        />
      </div>
    );
  }

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
