import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Smartphone, TvMinimal } from 'lucide-react';
import SuggestionCodeEditor from '@/components/custom-ui/SuggestionCodeEditor';
import { cn } from '@/lib/utils';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlainTextBanner } from './TopBanners';
import { renderHandlebars } from '@/components/custom-ui/HandlebarsRenderer';
import type { TextEditorsProps } from '@/types';

export default function TextEditors({
  type,
  value,
  onChange,
  variables = {},
  onFetchFromHtml,
  disabled = false,
}: TextEditorsProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<
    'desktop' | 'mobile'
  >('desktop');
  const [localValue, setLocalValue] = useState(value);
  const localValueRef = useRef(value);
  const lastExternalRef = useRef(value);

  // Smart sync: only apply external value change if the user hasn't locally diverged.
  // This prevents API responses from overwriting what the user just typed.
  useEffect(() => {
    const prev = lastExternalRef.current;
    lastExternalRef.current = value;
    if (localValueRef.current === prev) {
      localValueRef.current = value;
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = useCallback(
    (v: string) => {
      localValueRef.current = v;
      setLocalValue(v);
      onChange(v);
    },
    [onChange]
  );

  const handleFetchFromHtml = useCallback(async () => {
    if (!onFetchFromHtml) return;
    const text = await onFetchFromHtml();
    if (text !== undefined) handleChange(text);
  }, [onFetchFromHtml, handleChange]);

  const renderedContent = useMemo(
    () => renderHandlebars(localValue, variables),
    [localValue, variables]
  );

  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const resizePreviewIframe = useCallback(() => {
    const iframe = previewIframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;
    if (doc.body) doc.body.style.overflow = 'hidden';
    if (doc.documentElement) doc.documentElement.style.overflow = 'hidden';
    const height = Math.max(
      doc.body?.scrollHeight ?? 0,
      doc.documentElement?.scrollHeight ?? 0
    );
    if (iframe) iframe.style.height = `${height}px`;
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal" className="suprsend-border">
      <ResizablePanel
        defaultSize={50}
        className="suprsend-overflow-hidden suprsend-flex suprsend-flex-col suprsend-h-full"
      >
        {type === 'plaintext' && onFetchFromHtml && !disabled && (
          <PlainTextBanner onFetchFromHtml={handleFetchFromHtml} />
        )}
        <SuggestionCodeEditor
          value={localValue}
          onChange={handleChange}
          variables={variables}
          language={type === 'html' ? 'html' : undefined}
          placeholder={
            type === 'plaintext'
              ? 'Plain text is always sent to reach users with HTML blocked in their email client. To preview or edit it, click "Fetch from HTML" above.'
              : undefined
          }
          height=""
          containerClassName="suprsend-flex-1 suprsend-min-h-0 !suprsend-mt-0"
          className="suprsend-h-full suprsend-border-0 suprsend-rounded-none"
          disabled={disabled}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={50}
        className="suprsend-flex suprsend-flex-col"
      >
        <div className="suprsend-border-b suprsend-flex suprsend-items-center suprsend-justify-between suprsend-shrink-0">
          <div className="suprsend-p-2">
            <p className="suprsend-text-sm suprsend-font-medium">Preview</p>
          </div>
          {type === 'html' && (
            <div className="suprsend-mr-2">
              <Tabs
                defaultValue="desktop"
                onValueChange={(v) =>
                  setActivePreviewTab(v as 'desktop' | 'mobile')
                }
              >
                <TabsList className="!suprsend-h-7">
                  <TabsTrigger value="desktop" className="h-5">
                    <TvMinimal className="suprsend-w-3 suprsend-h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="h-5">
                    <Smartphone className="suprsend-w-3 suprsend-h-3" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>

        <div className="suprsend-flex-1 suprsend-min-h-0 suprsend-overflow-auto suprsend-bg-muted/30">
          {type === 'html' ? (
            <div
              className={cn(
                'suprsend-p-4',
                activePreviewTab === 'mobile' &&
                  'suprsend-flex suprsend-justify-center'
              )}
            >
              <iframe
                ref={previewIframeRef}
                srcDoc={renderedContent}
                title="Email preview"
                onLoad={resizePreviewIframe}
                className={cn(
                  'suprsend-bg-white suprsend-border suprsend-border-muted-foreground/10',
                  activePreviewTab === 'desktop'
                    ? 'suprsend-w-full'
                    : 'suprsend-w-[390px] suprsend-rounded-lg'
                )}
              />
            </div>
          ) : (
            <pre className="suprsend-p-4 suprsend-text-xs suprsend-whitespace-pre-wrap suprsend-break-words suprsend-font-mono suprsend-text-gray-700">
              {renderedContent || (
                <span className="suprsend-text-muted-foreground">
                  Nothing to preview
                </span>
              )}
            </pre>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
