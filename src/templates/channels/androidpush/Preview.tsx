import { useMemo, useState } from 'react';
import {
  Phone,
  Camera,
  Signal,
  BatteryFull,
  Bell,
  ChevronDown,
  ChevronUp,
} from '@/assets/icons';
import { cn } from '@/lib/utils';
import HandlebarsRenderer, {
  renderHandlebars,
} from '@/components/custom-ui/HandlebarsRenderer';
import { makeAbsoluteUrl } from '@/lib/utils';
import type { PhoneFrameProps, AndroidPushPreviewProps } from '@/types';

function useCurrentDateTime() {
  return useMemo(() => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const h12 = hours % 12 || 12;
    return {
      dateStr: `${day}, ${month} ${date}`,
      timeStr: `${h12}:${minutes}`,
    };
  }, []);
}

export function AndroidFrame({ children, className }: PhoneFrameProps) {
  const { dateStr, timeStr } = useCurrentDateTime();

  return (
    <div
      className={cn(
        'suprsend-relative suprsend-rounded-[3rem] suprsend-bg-[#2a2a2a] suprsend-p-[10px] suprsend-shadow-xl suprsend-w-[314px] suprsend-h-[640px]',
        className
      )}
    >
      <div className="suprsend-absolute suprsend-bg-[#3a3a3a] suprsend-rounded-r-sm suprsend-right-[-2px] suprsend-top-[120px] suprsend-w-[2px] suprsend-h-[35px]" />
      <div className="suprsend-absolute suprsend-bg-[#3a3a3a] suprsend-rounded-r-sm suprsend-right-[-2px] suprsend-top-[175px] suprsend-w-[2px] suprsend-h-[55px]" />

      <div className="suprsend-relative suprsend-w-full suprsend-h-full suprsend-rounded-[2.3rem] suprsend-overflow-hidden suprsend-bg-black">
        <div
          className="suprsend-absolute suprsend-inset-0"
          style={{
            background:
              'linear-gradient(180deg, #1a0a2e 0%, #2d1b5e 15%, #4a2d8a 28%, #6040b0 38%, #7a6bc8 48%, #8a8ad8 55%, #9aaae8 62%, #a8c0f0 70%, #b0d0f8 80%, #a0b8f0 90%, #8090e0 100%)',
          }}
        />

        {/* Punch-hole camera */}
        <div className="suprsend-absolute suprsend-top-[8px] suprsend-left-1/2 suprsend-transform suprsend--translate-x-1/2 suprsend-z-20">
          <div className="suprsend-bg-black suprsend-rounded-full suprsend-w-[10px] suprsend-h-[10px]" />
        </div>

        {/* Status bar */}
        <div className="suprsend-relative suprsend-flex suprsend-items-center suprsend-justify-between suprsend-px-6 suprsend-pt-2 suprsend-z-10">
          <span></span>
          <div className="suprsend-flex suprsend-items-center suprsend-gap-1">
            <Signal className="suprsend-w-3 suprsend-h-3 suprsend-text-white" />
            <BatteryFull className="suprsend-w-3 suprsend-h-3 suprsend-text-white" />
          </div>
        </div>

        {/* Lock screen content */}
        <div className="suprsend-relative suprsend-flex suprsend-flex-col suprsend-h-full suprsend-z-10">
          <div className="suprsend-text-center suprsend-mt-6">
            <p className="suprsend-text-white suprsend-font-bold suprsend-leading-none suprsend-text-[64px]">
              {timeStr}
            </p>
            <p className="suprsend-text-white/80 suprsend-text-sm suprsend-font-medium suprsend-mt-1">
              {dateStr}
            </p>
          </div>

          <div className="suprsend-flex-1 suprsend-px-3 suprsend-mt-6 suprsend-overflow-y-auto suprsend-min-h-0">
            {children}
          </div>

          <div className="suprsend-pb-3">
            <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-px-8 suprsend-mb-6">
              <div className="suprsend-w-10 suprsend-h-10 suprsend-rounded-full suprsend-bg-white/15 suprsend-backdrop-blur suprsend-flex suprsend-items-center suprsend-justify-center">
                <Phone className="suprsend-w-4 suprsend-h-4 suprsend-text-white" />
              </div>
              <div className="suprsend-w-10 suprsend-h-10 suprsend-rounded-full suprsend-bg-white/15 suprsend-backdrop-blur suprsend-flex suprsend-items-center suprsend-justify-center">
                <Camera className="suprsend-w-4 suprsend-h-4 suprsend-text-white" />
              </div>
            </div>
            <div className="suprsend-flex suprsend-justify-center">
              <div className="suprsend-w-28 suprsend-h-1 suprsend-bg-white suprsend-rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function AndroidPushPreview({
  formValues,
  variables,
}: AndroidPushPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const resolvedImageUrl = formValues.image_url
    ? makeAbsoluteUrl(renderHandlebars(formValues.image_url, variables))
    : '';

  const title = formValues.header || 'Notification Title';
  const body = formValues.body || 'Notification body text';
  const subtext = formValues.subtext || '';
  const activeButtons = formValues.buttons?.filter((b) => b.text) ?? [];
  const hasButtons = activeButtons.length > 0;

  return (
    <AndroidFrame>
      {/* Notification card */}
      <div className="suprsend-rounded-2xl suprsend-overflow-hidden suprsend-bg-secondary">
        {/* ── Top bar: bell | app-name subtext | logo | chevron ── */}
        <div
          className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-px-3 suprsend-pt-2.5 suprsend-pb-1 suprsend-cursor-pointer"
          onClick={() => setIsExpanded((v) => !v)}
        >
          {/* Red bell circle */}
          <div className="suprsend-w-[18px] suprsend-h-[18px] suprsend-rounded-full suprsend-bg-[#d94f4f] suprsend-flex suprsend-items-center suprsend-justify-center suprsend-shrink-0">
            <Bell className="suprsend-w-[10px] suprsend-h-[10px] suprsend-text-white" />
          </div>

          {/* App name + subtext */}
          <div className="suprsend-flex suprsend-items-center suprsend-gap-1.5 suprsend-flex-1 suprsend-min-w-0">
            <span className="suprsend-text-[9px] suprsend-text-muted-foreground suprsend-font-medium suprsend-truncate suprsend-max-w-[100px]">
              {
                (variables as Record<string, Record<string, string>>)?.$brand
                  ?.brand_name
              }
            </span>
            {subtext && (
              <>
                <span className="suprsend-text-[9px] suprsend-text-muted-foreground suprsend-shrink-0">
                  ·
                </span>
                <HandlebarsRenderer
                  template={subtext}
                  data={variables}
                  className="suprsend-m-0 suprsend-text-[9px] suprsend-text-muted-foreground suprsend-truncate suprsend-max-w-[80px]"
                />
              </>
            )}
          </div>

          {/* Right: logo + chevron */}
          <div className="suprsend-flex suprsend-items-center suprsend-gap-1.5 suprsend-shrink-0">
            {(variables as Record<string, Record<string, string>>)?.$brand?.logo && (
              <img
                src={(variables as Record<string, Record<string, string>>).$brand.logo}
                alt="brand logo"
                className="suprsend-w-[14px] suprsend-h-[14px] suprsend-rounded-[3px] suprsend-shrink-0 suprsend-object-cover"
              />
            )}
            {isExpanded ? (
              <ChevronUp className="suprsend-w-[12px] suprsend-h-[12px] suprsend-text-muted-foreground" />
            ) : (
              <ChevronDown className="suprsend-w-[12px] suprsend-h-[12px] suprsend-text-muted-foreground" />
            )}
          </div>
        </div>

        {/* ── Title + body (always visible, indented to align with app name) ── */}
        <div
          className="suprsend-flex suprsend-gap-2 suprsend-px-3 suprsend-pb-2.5 suprsend-cursor-pointer"
          onClick={() => setIsExpanded((v) => !v)}
        >
          {/* Spacer matching bell width so text aligns with app name above */}
          <div className="suprsend-w-[18px] suprsend-shrink-0" />
          <div className="suprsend-flex-1 suprsend-min-w-0">
            <HandlebarsRenderer
              template={title}
              data={variables}
              className={cn(
                'suprsend-m-0 suprsend-text-[13px] suprsend-font-semibold suprsend-text-foreground suprsend-leading-tight',
                !isExpanded ? 'suprsend-truncate' : 'suprsend-break-words'
              )}
            />
            <HandlebarsRenderer
              template={body}
              data={variables}
              className={cn(
                'suprsend-m-0 suprsend-text-[11px] suprsend-text-muted-foreground suprsend-mt-0.5 suprsend-leading-snug',
                !isExpanded ? 'suprsend-truncate' : 'suprsend-break-words'
              )}
            />
          </div>
        </div>

        {/* ── Expanded: image + buttons ── */}
        {isExpanded && (
          <>
            {resolvedImageUrl && (
              <div
                className="suprsend-pb-2"
                style={{ paddingLeft: 38, paddingRight: 12 }}
              >
                <img
                  src={resolvedImageUrl}
                  alt="notification banner"
                  className="suprsend-w-full suprsend-max-h-[100px] suprsend-object-cover suprsend-rounded-lg"
                />
              </div>
            )}

            {hasButtons && (
              <div className="suprsend-flex suprsend-items-center">
                {activeButtons.map((btn, i) => (
                  <div
                    key={i}
                    className="suprsend-flex suprsend-items-center suprsend-flex-1 suprsend-min-w-0"
                  >
                    {i > 0 && (
                      <div className="suprsend-w-px suprsend-h-3 suprsend-bg-border suprsend-shrink-0" />
                    )}
                    <HandlebarsRenderer
                      template={btn.text}
                      data={variables}
                      className="suprsend-m-0 suprsend-flex-1 suprsend-min-w-0 suprsend-py-2 suprsend-px-1.5 suprsend-text-[10px] suprsend-font-medium suprsend-text-foreground suprsend-truncate suprsend-text-center"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AndroidFrame>
  );
}
