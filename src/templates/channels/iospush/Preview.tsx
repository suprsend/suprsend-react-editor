import { useMemo } from 'react';
import { Flashlight, Camera, Signal, Wifi, BatteryFull } from '@/assets/icons';
import { cn } from '@/lib/utils';
import HandlebarsRenderer, {
  renderHandlebars,
} from '@/components/custom-ui/HandlebarsRenderer';
import type { PhoneFrameProps, IOSPushPreviewProps } from '@/types';

// --- iPhone Frame (reusable) ---


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

export function IPhoneFrame({ children, className }: PhoneFrameProps) {
  const { dateStr, timeStr } = useCurrentDateTime();

  return (
    <div
      className={cn(
        'suprsend-relative suprsend-rounded-[3rem] suprsend-bg-black suprsend-p-[10px] suprsend-shadow-xl suprsend-w-[314px] suprsend-h-[640px]',
        className
      )}
    >
      {/* Side buttons */}
      <div className="suprsend-absolute suprsend-bg-[#2a2a2a] suprsend-rounded-l-sm suprsend-left-[-2px] suprsend-top-[80px] suprsend-w-[2px] suprsend-h-[20px]" />
      <div className="suprsend-absolute suprsend-bg-[#2a2a2a] suprsend-rounded-l-sm suprsend-left-[-2px] suprsend-top-[120px] suprsend-w-[2px] suprsend-h-[40px]" />
      <div className="suprsend-absolute suprsend-bg-[#2a2a2a] suprsend-rounded-l-sm suprsend-left-[-2px] suprsend-top-[170px] suprsend-w-[2px] suprsend-h-[40px]" />
      <div className="suprsend-absolute suprsend-bg-[#2a2a2a] suprsend-rounded-r-sm suprsend-right-[-2px] suprsend-top-[140px] suprsend-w-[2px] suprsend-h-[55px]" />

      {/* Screen */}
      <div className="suprsend-relative suprsend-w-full suprsend-h-full suprsend-rounded-[2.3rem] suprsend-overflow-hidden suprsend-bg-black">
        {/* Wallpaper */}
        <div
          className="suprsend-absolute suprsend-inset-0"
          style={{
            background:
              'linear-gradient(170deg, #e8c87a 0%, #d4a96a 15%, #c98b6a 25%, #d4a08a 35%, #e8c0a0 42%, #f0d8c0 48%, #5b8faa 55%, #2d6080 65%, #1a3d5c 80%, #0d2440 100%)',
          }}
        />

        {/* Dynamic Island */}
        <div className="suprsend-absolute suprsend-top-[10px] suprsend-left-1/2 suprsend-transform suprsend--translate-x-1/2 suprsend-z-20">
          <div className="suprsend-bg-black suprsend-rounded-full suprsend-w-[85px] suprsend-h-[22px]" />
        </div>

        {/* Status bar */}
        <div className="suprsend-relative suprsend-flex suprsend-items-center suprsend-justify-between suprsend-px-6 suprsend-pt-3 suprsend-z-10">
          <span className="suprsend-text-white suprsend-text-xs suprsend-font-semibold" />
          <div className="suprsend-flex suprsend-items-center suprsend-gap-1">
            <Signal className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-white" />
            <Wifi className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-white" />
            <BatteryFull className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-white" />
          </div>
        </div>

        {/* Lock screen content */}
        <div className="suprsend-relative suprsend-flex suprsend-flex-col suprsend-h-full suprsend-z-10">
          {/* Date & Time */}
          <div className="suprsend-text-center suprsend-mt-8">
            <p className="suprsend-text-white suprsend-text-sm suprsend-font-medium suprsend-tracking-wide">
              {dateStr}
            </p>
            <p className="suprsend-text-white suprsend-font-bold suprsend-leading-none suprsend-mt-0.5 suprsend-text-[64px]">
              {timeStr}
            </p>
          </div>

          {/* Notification area */}
          <div className="suprsend-flex-1 suprsend-px-3 suprsend-mt-4 suprsend-overflow-y-auto suprsend-min-h-0">
            {children}
          </div>

          {/* Bottom bar area */}
          <div className="suprsend-pb-3">
            {/* Flashlight & Camera */}
            <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-px-8 suprsend-mb-8">
              <div className="suprsend-w-8 suprsend-h-8 suprsend-rounded-full suprsend-bg-white/20 suprsend-backdrop-blur suprsend-flex suprsend-items-center suprsend-justify-center">
                <Flashlight className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-white" />
              </div>
              <div className="suprsend-w-8 suprsend-h-8 suprsend-rounded-full suprsend-bg-white/20 suprsend-backdrop-blur suprsend-flex suprsend-items-center suprsend-justify-center">
                <Camera className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-white" />
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

export default function IOSPushPreview({
  formValues,
  variables,
}: IOSPushPreviewProps) {
  const resolvedImageUrl = formValues.image_url
    ? renderHandlebars(formValues.image_url, variables)
    : '';

  return (
    <IPhoneFrame>
      {/* Notification card */}
      <div className="suprsend-bg-white suprsend-opacity-70 suprsend-rounded-[14px] suprsend-backdrop-blur-[20px] suprsend-max-h-[320px] suprsend-flex suprsend-flex-col suprsend-overflow-hidden">
        <div className="suprsend-overflow-y-auto suprsend-flex-1 suprsend-min-h-0 suprsend-px-3 suprsend-py-2.5">
          {/* Header row */}
          <div className="suprsend-flex suprsend-items-start suprsend-justify-between suprsend-gap-2 suprsend-mb-1">
            <div className="suprsend-flex-1 suprsend-min-w-0">
              <HandlebarsRenderer
                template={formValues.header || 'Notification Title'}
                data={variables}
                className="suprsend-m-0 suprsend-text-[13px] suprsend-font-semibold suprsend-text-foreground suprsend-break-all"
              />
            </div>
            <span className="suprsend-text-[10px] suprsend-text-muted-foreground suprsend-shrink-0">
              now
            </span>
          </div>

          {/* Body */}
          <HandlebarsRenderer
            template={formValues.body || 'Notification body text'}
            data={variables}
            className="suprsend-m-0 suprsend-text-[12px] suprsend-text-muted-foreground suprsend-break-all"
          />

          {/* Image */}
          {resolvedImageUrl && (
            <img
              src={resolvedImageUrl}
              alt="notification"
              className="suprsend-w-full suprsend-max-h-[150px] suprsend-object-cover suprsend-rounded-lg suprsend-mt-1.5"
            />
          )}
        </div>
      </div>
    </IPhoneFrame>
  );
}
