import { useMemo } from 'react';
import {
  Signal,
  Wifi,
  BatteryFull,
  ChevronLeft,
  Camera,
  Mic,
} from '@/assets/icons';
import HandlebarsRenderer from '@/components/custom-ui/HandlebarsRenderer';
import type { SMSPreviewProps } from '@/types';

function useCurrentTime() {
  return useMemo(() => {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const h = now.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    return {
      statusTime: `${hours}:${minutes}`,
      messageTime: `${day} ${hours}:${minutes}${ampm}`,
    };
  }, []);
}

function getInitials(header: string): string {
  if (!header) return 'SM';
  const words = header.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return header.slice(0, 2).toUpperCase();
}

export default function SMSPreview({
  formValues,
  variables,
}: SMSPreviewProps) {
  const { statusTime, messageTime } = useCurrentTime();
  const senderName = formValues.header || 'Sender';
  const initials = getInitials(formValues.header);

  return (
    <div className="suprsend-relative suprsend-rounded-[3rem] suprsend-bg-black suprsend-p-[10px] suprsend-shadow-xl suprsend-w-[314px] suprsend-h-[640px]">
      {/* Side buttons */}
      <div className="suprsend-absolute suprsend-bg-[#2a2a2a] suprsend-rounded-l-sm suprsend-left-[-2px] suprsend-top-[80px] suprsend-w-[2px] suprsend-h-[20px]" />
      <div className="suprsend-absolute suprsend-bg-[#2a2a2a] suprsend-rounded-l-sm suprsend-left-[-2px] suprsend-top-[120px] suprsend-w-[2px] suprsend-h-[40px]" />
      <div className="suprsend-absolute suprsend-bg-[#2a2a2a] suprsend-rounded-l-sm suprsend-left-[-2px] suprsend-top-[170px] suprsend-w-[2px] suprsend-h-[40px]" />
      <div className="suprsend-absolute suprsend-bg-[#2a2a2a] suprsend-rounded-r-sm suprsend-right-[-2px] suprsend-top-[140px] suprsend-w-[2px] suprsend-h-[55px]" />

      {/* Screen */}
      <div className="suprsend-relative suprsend-w-full suprsend-h-full suprsend-rounded-[2.3rem] suprsend-overflow-hidden suprsend-bg-white suprsend-flex suprsend-flex-col">
        {/* Dynamic Island */}
        <div className="suprsend-absolute suprsend-top-[10px] suprsend-left-1/2 suprsend-transform suprsend--translate-x-1/2 suprsend-z-20">
          <div className="suprsend-bg-black suprsend-rounded-full suprsend-w-[85px] suprsend-h-[22px]" />
        </div>

        {/* Status bar */}
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-px-6 suprsend-pt-3 suprsend-pb-1">
          <span className="suprsend-text-black suprsend-text-xs suprsend-font-semibold">
            {statusTime}
          </span>
          <div className="suprsend-flex suprsend-items-center suprsend-gap-1">
            <Signal className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-black" />
            <Wifi className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-black" />
            <BatteryFull className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-black" />
          </div>
        </div>

        {/* Navigation header with back + contact */}
        <div className="suprsend-flex suprsend-flex-col suprsend-items-center suprsend-pt-2 suprsend-pb-2 suprsend-border-b suprsend-border-[#e5e5e5]">
          {/* Back button */}
          <div className="suprsend-absolute suprsend-left-3 suprsend-top-[46px]">
            <ChevronLeft className="suprsend-w-5 suprsend-h-5 suprsend-text-[#007AFF]" />
          </div>

          {/* Avatar */}
          <div className="suprsend-w-10 suprsend-h-10 suprsend-rounded-full suprsend-bg-[#F4C2C2] suprsend-flex suprsend-items-center suprsend-justify-center">
            <span className="suprsend-text-[#8B6E6E] suprsend-text-sm suprsend-font-semibold">
              {initials}
            </span>
          </div>

          {/* Sender name */}
          <div className="suprsend-flex suprsend-items-center suprsend-gap-0.5 suprsend-mt-0.5">
            <span className="suprsend-text-[11px] suprsend-font-medium suprsend-text-black">
              {senderName}
            </span>
            <ChevronLeft className="suprsend-w-3 suprsend-h-3 suprsend-text-[#8e8e93] suprsend-rotate-[-90deg]" />
          </div>
        </div>

        {/* Message area */}
        <div className="suprsend-flex-1 suprsend-overflow-y-auto suprsend-px-3 suprsend-pt-2">
          {/* Date label */}
          <div className="suprsend-text-center suprsend-mb-2">
            <span className="suprsend-text-[11px] suprsend-text-[#8e8e93]">
              Text Message &bull; SMS
            </span>
            <br />
            <span className="suprsend-text-[11px] suprsend-text-[#8e8e93]">
              {messageTime}
            </span>
          </div>

          {/* Message bubble */}
          <div className="suprsend-flex suprsend-justify-start">
            <div className="suprsend-max-w-[85%] suprsend-bg-[#e9e9eb] suprsend-rounded-[18px] suprsend-px-3 suprsend-py-2">
              <HandlebarsRenderer
                template={formValues.body || 'SMS message text'}
                data={variables}
                className="suprsend-m-0 suprsend-text-[13px] suprsend-text-black suprsend-leading-[1.35] suprsend-break-words suprsend-whitespace-pre-wrap"
              />
            </div>
          </div>
        </div>

        {/* Bottom input bar */}
        <div className="suprsend-px-3 suprsend-pb-2 suprsend-pt-1.5">
          <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
            <Camera className="suprsend-w-5 suprsend-h-5 suprsend-text-[#8e8e93] suprsend-shrink-0" />
            <div className="suprsend-flex-1 suprsend-h-8 suprsend-rounded-full suprsend-border suprsend-border-[#c7c7cc] suprsend-flex suprsend-items-center suprsend-px-3">
              <span className="suprsend-text-[13px] suprsend-text-[#8e8e93]">
                Text Message &bull; SMS
              </span>
            </div>
            <Mic className="suprsend-w-5 suprsend-h-5 suprsend-text-[#8e8e93] suprsend-shrink-0" />
          </div>
        </div>

        {/* Home indicator */}
        <div className="suprsend-flex suprsend-justify-center suprsend-pb-2">
          <div className="suprsend-w-28 suprsend-h-1 suprsend-bg-black suprsend-rounded-full" />
        </div>
      </div>
    </div>
  );
}
