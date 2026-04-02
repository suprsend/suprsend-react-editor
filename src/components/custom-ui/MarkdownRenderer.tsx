import { useMemo } from 'react';
import markdownit from 'markdown-it';
import taskLists from 'markdown-it-task-lists';
import DOMPurify from 'dompurify';

const md = markdownit('commonmark', { html: false });

const inboxMd = markdownit({
  html: true,
  linkify: true,
});
inboxMd.use(taskLists);

// eslint-disable-next-line react-refresh/only-export-components
export function markdownToHtml(markdown: string): string {
  const rawHtml = md.render(markdown);
  return DOMPurify.sanitize(rawHtml);
}

// eslint-disable-next-line react-refresh/only-export-components
export function inboxMarkdownToHtml(markdown: string): string {
  const rawHtml = inboxMd.render(markdown);
  return DOMPurify.sanitize(rawHtml);
}

interface BaseMarkdownRendererProps {
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

const INBOX_MARKDOWN_STYLES = `
  .ss-inbox-markdown a { color: #066AF3; text-decoration: none; white-space: normal; }
  .ss-inbox-markdown p { margin: 0; overflow-wrap: anywhere; }
  .ss-inbox-markdown blockquote { margin: 0; padding-left: 10px; border-left: 3px solid #DBDADA; margin-bottom: 5px; }
  .ss-inbox-markdown ul, .ss-inbox-markdown ol { white-space: normal; margin: 0; padding-left: 15px; list-style: revert; }
  .ss-inbox-markdown img { max-width: 100%; object-fit: contain; }
  .ss-inbox-markdown table { overflow-wrap: break-word; border-collapse: collapse; }
  .ss-inbox-markdown th { text-align: left; white-space: nowrap; border: 1px solid #DBDADA; padding: 5px; }
  .ss-inbox-markdown td { border: 1px solid #DBDADA; padding: 5px; }
  .ss-inbox-markdown h1, .ss-inbox-markdown h2, .ss-inbox-markdown h3,
  .ss-inbox-markdown h4, .ss-inbox-markdown h5, .ss-inbox-markdown h6 { font-size: revert; font-weight: revert; }
  .ss-inbox-markdown script, .ss-inbox-markdown link { display: none; }
  .ss-inbox-markdown .task-list-item { list-style: none; }
  .ss-inbox-markdown .task-list-item input[type="checkbox"] { margin-right: 5px; }
`;

export function InboxMarkdownRenderer({
  children,
  className,
}: BaseMarkdownRendererProps) {
  const html = useMemo(() => {
    const formatted = children
      ?.replaceAll('\\\n', '&nbsp;')
      ?.replaceAll('\n', '  \n')
      ?.replaceAll('&nbsp;', '&nbsp;  \n');
    return inboxMarkdownToHtml(formatted);
  }, [children]);

  return (
    <>
      <style>{INBOX_MARKDOWN_STYLES}</style>
      <div
        className={`ss-inbox-markdown ${className ?? ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}

export default function MarkdownRenderer({
  children,
  className,
}: BaseMarkdownRendererProps) {
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
