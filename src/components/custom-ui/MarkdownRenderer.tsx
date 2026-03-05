import { useMemo } from 'react';
import markdownit from 'markdown-it';
import DOMPurify from 'dompurify';

const md = markdownit();

// eslint-disable-next-line react-refresh/only-export-components
export function markdownToHtml(markdown: string): string {
  const rawHtml = md.render(markdown);
  return DOMPurify.sanitize(rawHtml);
}

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

const MARKDOWN_STYLES = `
  .ss-markdown a { color: #6264A7; text-decoration: none; white-space: normal; }
  .ss-markdown p { margin: 0; overflow-wrap: anywhere; }
  .ss-markdown blockquote { margin: 0; padding-left: 10px; border-left: 3px #DBDADA solid; margin-bottom: 5px; background-color: #F8F8F8; }
  .ss-markdown code { background-color: #F8F8F8; padding: 1px; }
  .ss-markdown ul, .ss-markdown ol { white-space: normal; margin: 0; padding-left: 15px; list-style: revert; }
  .ss-markdown img { max-width: 100%; object-fit: contain; }
`;

export default function MarkdownRenderer({
  children,
  className,
}: MarkdownRendererProps) {
  const html = useMemo(() => markdownToHtml(children), [children]);

  return (
    <>
      <style>{MARKDOWN_STYLES}</style>
      <div
        className={`ss-markdown ${className ?? ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
