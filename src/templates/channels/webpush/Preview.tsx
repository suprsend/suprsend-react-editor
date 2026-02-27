import { useMemo, useState } from 'react';
import { makeAbsoluteUrl } from '@/lib/utils';
import HandlebarsRenderer, {
  renderHandlebars,
} from '@/components/custom-ui/HandlebarsRenderer';
import {
  X,
  Wifi,
  Volume2,
  Video,
  ChevronUp,
  ChevronDown,
  Ellipsis,
  Search,
} from 'lucide-react';
import ChromeSvg from '@/assets/chrome.svg?react';
import WindowsSvg from '@/assets/windows.svg?react';
import AppleSvg from '@/assets/apple.svg?react';
import { cn } from '@/lib/utils';
import type {
  WebpushPreviewProps,
  PreviewTab,
  PreviewFrameProps,
} from '@/types';

export default function WebpushPreview({
  formValues,
  variables,
}: WebpushPreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('windows');

  const resolvedImageUrl = formValues.image_url
    ? makeAbsoluteUrl(renderHandlebars(formValues.image_url, variables))
    : '';

  return (
    <div className="suprsend-flex suprsend-flex-col suprsend-items-center suprsend-gap-8">
      {/* Tab selector */}
      <div className="suprsend-flex suprsend-gap-1 suprsend-bg-muted suprsend-rounded-lg suprsend-p-1">
        <button
          type="button"
          onClick={() => setActiveTab('windows')}
          className={cn(
            'suprsend-flex suprsend-items-center suprsend-gap-1.5 suprsend-px-4 suprsend-py-1.5 suprsend-text-xs suprsend-font-medium suprsend-rounded-md suprsend-transition-all',
            activeTab === 'windows'
              ? 'suprsend-bg-white suprsend-text-foreground suprsend-shadow-sm'
              : 'suprsend-text-muted-foreground hover:suprsend-text-foreground'
          )}
        >
          <WindowsSvg className="suprsend-w-3.5 suprsend-h-3.5" />
          Windows
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('macos')}
          className={cn(
            'suprsend-flex suprsend-items-center suprsend-gap-1.5 suprsend-px-4 suprsend-py-1.5 suprsend-text-xs suprsend-font-medium suprsend-rounded-md suprsend-transition-all',
            activeTab === 'macos'
              ? 'suprsend-bg-white suprsend-text-foreground suprsend-shadow-sm'
              : 'suprsend-text-muted-foreground hover:suprsend-text-foreground'
          )}
        >
          <AppleSvg className="suprsend-w-3.5 suprsend-h-3.5" />
          MacOS
        </button>
      </div>

      {/* Preview frame */}
      {activeTab === 'windows' ? (
        <WindowsPreview
          formValues={formValues}
          variables={variables}
          resolvedImageUrl={resolvedImageUrl}
        />
      ) : (
        <MacOSPreview
          formValues={formValues}
          variables={variables}
          resolvedImageUrl={resolvedImageUrl}
        />
      )}
    </div>
  );
}

function WindowsPreview({
  formValues,
  variables,
  resolvedImageUrl,
}: PreviewFrameProps) {
  const { timeStr, dateStr } = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const h12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();
    return {
      timeStr: `${h12}:${minutes} ${ampm}`,
      dateStr: `${month}/${day}/${year}`,
    };
  }, []);

  return (
    <div
      className="suprsend-w-[520px] suprsend-rounded-md suprsend-overflow-hidden suprsend-shadow"
      style={{
        background:
          'linear-gradient(135deg, #a8c0e0 0%, #8ba4d4 20%, #9b8ec4 40%, #b89dd0 60%, #c4aad8 80%, #d4c4e8 100%)',
      }}
    >
      {/* Desktop area */}
      <div className="suprsend-flex suprsend-flex-col suprsend-items-end suprsend-justify-center suprsend-min-h-[320px] suprsend-p-4">
        {/* Notification card */}
        <div className="suprsend-w-[80%] suprsend-bg-[#f2f2f2] suprsend-rounded-lg suprsend-overflow-hidden suprsend-shadow-lg">
          {/* Banner image */}
          {resolvedImageUrl && (
            <img
              src={resolvedImageUrl}
              alt="notification banner"
              className="suprsend-w-full suprsend-h-[160px] suprsend-object-cover"
            />
          )}

          <div className="suprsend-p-3">
            {/* Chrome header row */}
            <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-mb-2">
              <div className="suprsend-flex suprsend-items-center suprsend-gap-1.5">
                <ChromeSvg className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground" />
                <span className="suprsend-text-[12px] suprsend-text-muted-foreground suprsend-font-medium">
                  Google Chrome
                </span>
              </div>
              <div className="suprsend-flex suprsend-items-center suprsend-gap-1">
                <Ellipsis className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground" />
                <X className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground" />
              </div>
            </div>

            {/* Title */}
            <HandlebarsRenderer
              template={formValues.header || 'Notification Title'}
              data={variables}
              className="suprsend-m-0 suprsend-text-[14px] suprsend-font-semibold suprsend-text-foreground suprsend-break-words suprsend-leading-snug"
            />

            {/* Body */}
            <HandlebarsRenderer
              template={formValues.body || 'Notification body text'}
              data={variables}
              className="suprsend-m-0 suprsend-text-[13px] suprsend-text-muted-foreground suprsend-break-words suprsend-mt-1 suprsend-leading-snug"
            />

            {/* Action buttons */}
            {formValues.buttons && formValues.buttons.length > 0 && (
              <div className="suprsend-flex suprsend-gap-2 suprsend-mt-3">
                {formValues.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className="suprsend-flex-1 suprsend-text-center suprsend-py-1.5 suprsend-bg-white suprsend-border suprsend-rounded suprsend-cursor-default"
                  >
                    <HandlebarsRenderer
                      template={btn.text || `Button ${i + 1}`}
                      data={variables}
                      className="suprsend-m-0 suprsend-text-[13px] suprsend-font-medium suprsend-text-foreground"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Windows taskbar */}
      <div className="suprsend-flex suprsend-items-center suprsend-justify-end suprsend-gap-3 suprsend-px-3 suprsend-py-1.5 suprsend-bg-[#e8e4f0]/80 suprsend-backdrop-blur">
        <ChevronUp className="suprsend-w-3 suprsend-h-3 suprsend-text-gray-600" />
        <Wifi className="suprsend-w-3 suprsend-h-3 suprsend-text-gray-600" />
        <Volume2 className="suprsend-w-3 suprsend-h-3 suprsend-text-gray-600" />
        <Video className="suprsend-w-3 suprsend-h-3 suprsend-text-gray-600" />
        <div className="suprsend-text-right suprsend-leading-tight">
          <p className="suprsend-m-0 suprsend-text-[10px] suprsend-text-gray-700">
            {timeStr}
          </p>
          <p className="suprsend-m-0 suprsend-text-[10px] suprsend-text-gray-700">
            {dateStr}
          </p>
        </div>
      </div>
    </div>
  );
}

function MacNotificationContent({
  formValues,
  variables,
}: WebpushPreviewProps) {
  return (
    <>
      <ChromeSvg className="suprsend-w-5 suprsend-h-5 suprsend-mt-0.5 suprsend-flex-shrink-0" />
      <div className="suprsend-flex-1 suprsend-min-w-0">
        <HandlebarsRenderer
          template={formValues.header || 'Notification Title'}
          data={variables}
          className="suprsend-m-0 suprsend-text-[13px] suprsend-font-semibold suprsend-text-foreground suprsend-leading-tight suprsend-break-all"
        />
        <HandlebarsRenderer
          template={formValues.body || 'Notification body text'}
          data={variables}
          className="suprsend-m-0 suprsend-text-[12px] suprsend-text-muted-foreground suprsend-mt-0.5 suprsend-leading-snug suprsend-break-all"
        />
      </div>
    </>
  );
}

function MacOSPreview({
  formValues,
  variables,
  resolvedImageUrl,
}: PreviewFrameProps) {
  const [expanded, setExpanded] = useState(false);

  const dateTimeStr = useMemo(() => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'short' });
    const month = now.toLocaleDateString('en-US', { month: 'short' });
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const h12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${day} ${month} ${date}  ${h12}:${minutes} ${ampm}`;
  }, []);

  return (
    <div
      className="suprsend-w-[520px] suprsend-rounded-xl suprsend-overflow-hidden suprsend-shadow"
      style={{
        background:
          'linear-gradient(170deg, #c8dae8 0%, #b0c8e0 30%, #a8b8d8 50%, #b8b4e0 70%, #c8c4e8 100%)',
      }}
    >
      {/* macOS Menu bar */}
      <div className="suprsend-flex suprsend-items-center suprsend-justify-end suprsend-gap-3 suprsend-px-3 suprsend-py-1 suprsend-bg-white/20 suprsend-backdrop-blur">
        <Wifi className="suprsend-w-3 suprsend-h-3 suprsend-text-gray-700" />
        <Search className="suprsend-w-3 suprsend-h-3 suprsend-text-gray-700" />
        <span className="suprsend-text-[10px] suprsend-font-medium suprsend-text-gray-700">
          {dateTimeStr}
        </span>
      </div>

      {/* Desktop area */}
      <div className="suprsend-flex suprsend-flex-col suprsend-items-end suprsend-min-h-[340px] suprsend-px-4 suprsend-py-3">
        {!expanded ? (
          /* Collapsed notification */
          <div className="suprsend-w-[80%] suprsend-bg-white/80 suprsend-backdrop-blur-xl suprsend-rounded-2xl suprsend-p-3 suprsend-shadow-lg">
            <div className="suprsend-flex suprsend-gap-2.5">
              <MacNotificationContent
                formValues={formValues}
                variables={variables}
              />
              <div className="suprsend-flex suprsend-flex-col suprsend-items-end suprsend-gap-1 suprsend-flex-shrink-0">
                <div
                  className="suprsend-flex suprsend-items-center suprsend-gap-0.5 suprsend-cursor-pointer"
                  onClick={() => setExpanded(true)}
                >
                  <span className="suprsend-text-[10px] suprsend-text-muted-foreground">
                    now
                  </span>
                  <ChevronDown className="suprsend-w-3 suprsend-h-3 suprsend-text-muted-foreground" />
                </div>
                {resolvedImageUrl && (
                  <img
                    src={resolvedImageUrl}
                    alt="thumbnail"
                    className="suprsend-w-9 suprsend-h-9 suprsend-rounded suprsend-object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Expanded notification */
          <div className="suprsend-w-[80%] suprsend-bg-white/90 suprsend-backdrop-blur-xl suprsend-rounded-2xl suprsend-overflow-hidden suprsend-shadow-lg">
            <div className="suprsend-flex suprsend-justify-end suprsend-items-center suprsend-gap-1 suprsend-px-3 suprsend-pt-2">
              <Ellipsis className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground" />
              <ChevronUp
                className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground suprsend-cursor-pointer"
                onClick={() => setExpanded(false)}
              />
            </div>

            {resolvedImageUrl && (
              <img
                src={resolvedImageUrl}
                alt="notification banner"
                className="suprsend-w-full suprsend-h-[140px] suprsend-object-cover suprsend-mt-1"
              />
            )}

            <div className="suprsend-p-3 suprsend-flex suprsend-gap-2.5">
              <MacNotificationContent
                formValues={formValues}
                variables={variables}
              />
            </div>

            {formValues.buttons && formValues.buttons.length > 0 && (
              <div className="suprsend-border-t">
                {formValues.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className={cn(
                      'suprsend-w-full suprsend-py-2 suprsend-text-[13px] suprsend-text-center suprsend-text-foreground suprsend-bg-transparent',
                      i < formValues.buttons.length - 1 && 'suprsend-border-b'
                    )}
                  >
                    <HandlebarsRenderer
                      template={btn.text || `Button ${i + 1}`}
                      data={variables}
                      className="suprsend-m-0 suprsend-text-[13px] suprsend-font-medium suprsend-text-foreground"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
