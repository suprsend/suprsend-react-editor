import { useMemo } from 'react';
import { Phone, Camera, Signal, BatteryFull, ChevronUp } from '@/assets/icons';
import { cn } from '@/lib/utils';
import HandlebarsRenderer, {
  renderHandlebars,
} from '@/components/custom-ui/HandlebarsRenderer';
import { makeAbsoluteUrl } from '@/lib/utils';
import type { PhoneFrameProps, AndroidPushPreviewProps } from '@/types';

// --- Android Phone Frame (reusable) ---


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
      {/* Side buttons — power + volume on right */}
      <div className="suprsend-absolute suprsend-bg-[#3a3a3a] suprsend-rounded-r-sm suprsend-right-[-2px] suprsend-top-[120px] suprsend-w-[2px] suprsend-h-[35px]" />
      <div className="suprsend-absolute suprsend-bg-[#3a3a3a] suprsend-rounded-r-sm suprsend-right-[-2px] suprsend-top-[175px] suprsend-w-[2px] suprsend-h-[55px]" />

      {/* Screen */}
      <div className="suprsend-relative suprsend-w-full suprsend-h-full suprsend-rounded-[2.3rem] suprsend-overflow-hidden suprsend-bg-black">
        {/* Wallpaper — purple/blue gradient matching the screenshot */}
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
          {/* Time & Date */}
          <div className="suprsend-text-center suprsend-mt-6">
            <p className="suprsend-text-white suprsend-font-bold suprsend-leading-none suprsend-text-[64px]">
              {timeStr}
            </p>
            <p className="suprsend-text-white/80 suprsend-text-sm suprsend-font-medium suprsend-mt-1">
              {dateStr}
            </p>
          </div>

          {/* Notification area */}
          <div className="suprsend-flex-1 suprsend-px-3 suprsend-mt-6 suprsend-overflow-y-auto suprsend-min-h-0">
            {children}
          </div>

          {/* Bottom bar */}
          <div className="suprsend-pb-3">
            {/* Phone & Camera shortcuts */}
            <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-px-8 suprsend-mb-6">
              <div className="suprsend-w-10 suprsend-h-10 suprsend-rounded-full suprsend-bg-white/15 suprsend-backdrop-blur suprsend-flex suprsend-items-center suprsend-justify-center">
                <Phone className="suprsend-w-4 suprsend-h-4 suprsend-text-white" />
              </div>
              <div className="suprsend-w-10 suprsend-h-10 suprsend-rounded-full suprsend-bg-white/15 suprsend-backdrop-blur suprsend-flex suprsend-items-center suprsend-justify-center">
                <Camera className="suprsend-w-4 suprsend-h-4 suprsend-text-white" />
              </div>
            </div>

            {/* Home indicator */}
            <div className="suprsend-flex suprsend-justify-center">
              <div className="suprsend-w-28 suprsend-h-1 suprsend-bg-white suprsend-rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Notification Preview ---

export default function AndroidPushPreview({
  formValues,
  variables,
}: AndroidPushPreviewProps) {
  const resolvedImageUrl = formValues.image_url
    ? makeAbsoluteUrl(renderHandlebars(formValues.image_url, variables))
    : '';

  return (
    <AndroidFrame>
      <div className="suprsend-bg-white suprsend-rounded-lg suprsend-shadow-lg suprsend-max-h-[320px] suprsend-flex suprsend-flex-col suprsend-overflow-hidden">
        {/* Scrollable content */}
        <div className="suprsend-overflow-y-auto suprsend-flex-1 suprsend-min-h-0">
        {/* Content */}
        <div className="suprsend-px-3.5 suprsend-pt-3 suprsend-pb-2">
          {/* Title row */}
          <div className="suprsend-flex suprsend-items-start suprsend-justify-between suprsend-gap-2">
            <HandlebarsRenderer
              template={formValues.header || 'Notification Title'}
              data={variables}
              className="suprsend-m-0 suprsend-text-[13px] suprsend-font-semibold suprsend-text-foreground suprsend-break-all suprsend-flex-1 suprsend-min-w-0"
            />
            <div className="suprsend-flex suprsend-items-center suprsend-gap-1 suprsend-shrink-0">
              <span className="suprsend-text-[10px] suprsend-text-muted-foreground">
                now
              </span>
              <ChevronUp className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-muted-foreground" />
            </div>
          </div>

          {/* Body */}
          <HandlebarsRenderer
            template={formValues.body || 'Notification body text'}
            data={variables}
            className="suprsend-m-0 suprsend-text-[12px] suprsend-text-muted-foreground suprsend-break-all suprsend-mt-0.5"
          />

          {/* Banner image */}
          {resolvedImageUrl && (
            <img
              src={resolvedImageUrl}
              alt="notification banner"
              className="suprsend-w-full suprsend-max-h-[140px] suprsend-object-cover suprsend-rounded-lg suprsend-mt-2"
            />
          )}
        </div>

        {/* Action buttons */}
        {formValues.buttons?.some((b) => b.text) && (
          <div className="suprsend-flex suprsend-justify-around suprsend-gap-4 suprsend-px-3.5 suprsend-pb-3 suprsend-pt-1">
            {formValues.buttons.map(
              (btn, i) =>
                btn.text && (
                  <HandlebarsRenderer
                    key={i}
                    template={btn.text}
                    data={variables}
                    className="suprsend-m-0 suprsend-text-[12px] suprsend-font-medium suprsend-text-primary suprsend-break-all"
                  />
                )
            )}
          </div>
        )}
        </div>
      </div>
    </AndroidFrame>
  );
}
