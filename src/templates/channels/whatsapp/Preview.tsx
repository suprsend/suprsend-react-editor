import { useMemo } from 'react';
import {
  ChevronLeft,
  Signal,
  Wifi,
  BatteryFull,
  User,
  Phone,
  ExternalLink,
  Reply,
  List,
  Plus,
  Smile,
  Camera,
  Mic,
  FileText,
  Video,
} from '@/assets/icons';
import { cn } from '@/lib/utils';
import { renderHandlebars } from '@/components/custom-ui/HandlebarsRenderer';
import { makeAbsoluteUrl } from '@/lib/utils';
import type { WhatsappPreviewProps, PhoneFrameProps } from '@/types';

// --- Helpers ---

function useCurrentDateTime() {
  return useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const h12 = hours % 12 || 12;
    return { timeStr: `${h12}:${minutes}` };
  }, []);
}

function isAlphanumeric(char: string): boolean {
  return /[a-zA-Z0-9]/.test(char);
}

function whatsappTextFormat(
  format: string,
  wildcard: string,
  opTag: string,
  clTag: string
): string {
  const indices: number[] = [];
  for (let i = 0; i < format.length; i++) {
    if (format[i] === wildcard) {
      if (indices.length % 2) {
        if (format[i - 1] !== ' ') {
          if (typeof format[i + 1] === 'undefined') {
            indices.push(i);
          } else if (!isAlphanumeric(format[i + 1])) {
            indices.push(i);
          }
        }
      } else {
        if (typeof format[i + 1] !== 'undefined' && format[i + 1] !== ' ') {
          if (typeof format[i - 1] === 'undefined') {
            indices.push(i);
          } else if (!isAlphanumeric(format[i - 1])) {
            indices.push(i);
          }
        }
      }
    } else {
      if (format?.[i]?.charCodeAt(0) === 10 && indices.length % 2) {
        indices.pop();
      }
    }
  }
  if (indices.length % 2) indices.pop();

  let offset = 0;
  indices.forEach((v, i) => {
    const tag = i % 2 ? clTag : opTag;
    const pos = v + offset;
    format = format.substr(0, pos) + tag + format.substr(pos + 1);
    offset += tag.length - 1;
  });
  return format;
}

function urlify(text: string): string {
  return text.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<span style="color:#1a73e8">$1</span>'
  );
}

function formatBody(text: string, variables: Record<string, unknown>): string {
  if (!text) return '';
  let str = text;
  str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  str = str.replace(/\n/g, ' <br/>');
  str = renderHandlebars(str, variables);
  str = whatsappTextFormat(str, '_', '<i>', '</i>');
  str = whatsappTextFormat(str, '*', '<b>', '</b>');
  str = whatsappTextFormat(str, '~', '<s>', '</s>');
  str = whatsappTextFormat(str, '`', '<code>', '</code>');
  str = urlify(str);
  return str;
}

// --- WhatsApp Phone Frame ---

function WhatsappPhoneFrame({ children, className }: PhoneFrameProps) {
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
      <div className="suprsend-relative suprsend-w-full suprsend-h-full suprsend-rounded-[2.3rem] suprsend-overflow-hidden suprsend-bg-[#ECE5DD]">
        {/* Dynamic Island */}
        <div className="suprsend-absolute suprsend-top-[10px] suprsend-left-1/2 suprsend-transform suprsend--translate-x-1/2 suprsend-z-30">
          <div className="suprsend-bg-black suprsend-rounded-full suprsend-w-[85px] suprsend-h-[22px]" />
        </div>

        {children}
      </div>
    </div>
  );
}

// --- WhatsApp Preview ---

export default function WhatsappPreview({
  formValues,
  variables,
}: WhatsappPreviewProps) {
  const { timeStr } = useCurrentDateTime();

  const bodyHtml = useMemo(
    () => formatBody(formValues.body_text ?? '', variables),
    [formValues.body_text, variables]
  );

  const resolvedHeaderText = formValues.header_text
    ? renderHandlebars(formValues.header_text, variables)
    : '';

  const resolvedMediaUrl = formValues.header_media_url
    ? makeAbsoluteUrl(renderHandlebars(formValues.header_media_url, variables))
    : '';

  const resolvedFilename = formValues.header_document_filename
    ? renderHandlebars(formValues.header_document_filename, variables)
    : 'Untitled';

  const ctaButtons =
    formValues.button_type === 'CALL_TO_ACTION'
      ? (formValues.cta_buttons ?? []).filter((b) => b.text)
      : [];

  const qrButtons =
    formValues.button_type === 'QUICK_REPLY'
      ? (formValues.quick_reply_buttons ?? []).filter((b) => b.text)
      : [];

  return (
    <WhatsappPhoneFrame>
      <div className="suprsend-flex suprsend-flex-col suprsend-h-full">
        {/* Status bar */}
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-px-6 suprsend-pt-3 suprsend-pb-1 suprsend-bg-[#008069] suprsend-z-20">
          <span className="suprsend-text-white suprsend-text-xs suprsend-font-semibold">
            {timeStr}
          </span>
          <div className="suprsend-flex suprsend-items-center suprsend-gap-1">
            <Signal className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-white" />
            <Wifi className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-white" />
            <BatteryFull className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-white" />
          </div>
        </div>

        {/* WhatsApp Header Bar */}
        <div className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-px-3 suprsend-py-2 suprsend-bg-[#008069] suprsend-z-20">
          <ChevronLeft className="suprsend-w-5 suprsend-h-5 suprsend-text-white suprsend-shrink-0" />
          <div className="suprsend-w-8 suprsend-h-8 suprsend-rounded-full suprsend-bg-[#DFE5E7] suprsend-flex suprsend-items-center suprsend-justify-center suprsend-shrink-0">
            <User className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground" />
          </div>
          <div className="suprsend-flex suprsend-items-center suprsend-gap-0.5 suprsend-flex-1 suprsend-min-w-0">
            <span className="suprsend-text-white suprsend-text-sm suprsend-font-medium suprsend-truncate">
              SuprSend
            </span>
            <svg
              className="suprsend-w-4 suprsend-h-4 suprsend-text-[#00C852] suprsend-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Chat Area */}
        <div
          className="suprsend-flex-1 suprsend-overflow-y-auto suprsend-relative"
          style={{
            backgroundColor: '#ECE5DD',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8bfb0' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          <div className="suprsend-p-2 suprsend-space-y-2">
            {/* Today pill */}
            <div className="suprsend-flex suprsend-justify-center">
              <span className="suprsend-bg-white suprsend-rounded suprsend-px-3 suprsend-py-0.5 suprsend-text-[10px] suprsend-text-muted-foreground suprsend-shadow-sm">
                Today
              </span>
            </div>

            {/* Meta business banner */}
            <div className="suprsend-mx-2">
              <p className="suprsend-text-center suprsend-text-xs suprsend-py-1 suprsend-px-3 suprsend-bg-[#E2F7CB] suprsend-rounded-lg suprsend-text-muted-foreground suprsend-shadow-sm">
                This business uses a secure service from Meta to manage this
                chat. Tap to learn more.
              </p>
            </div>

            {/* Message Bubble */}
            <div className="suprsend-ml-1 suprsend-max-w-[85%]">
              <div className="suprsend-bg-white suprsend-rounded-lg suprsend-shadow-sm suprsend-overflow-hidden">
                {/* Header - Media */}
                {formValues.template_type === 'MEDIA' && (
                  <div>
                    {formValues.header_media_format === 'IMAGE' && (
                      <div className="suprsend-bg-muted suprsend-w-full suprsend-h-[120px] suprsend-flex suprsend-items-center suprsend-justify-center">
                        {resolvedMediaUrl ? (
                          <img
                            src={resolvedMediaUrl}
                            alt="header"
                            className="suprsend-w-full suprsend-h-full suprsend-object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                'none';
                            }}
                          />
                        ) : (
                          <Camera className="suprsend-w-8 suprsend-h-8 suprsend-text-muted-foreground" />
                        )}
                      </div>
                    )}
                    {formValues.header_media_format === 'VIDEO' && (
                      <div className="suprsend-bg-muted suprsend-w-full suprsend-h-[120px] suprsend-flex suprsend-items-center suprsend-justify-center">
                        <div className="suprsend-w-10 suprsend-h-10 suprsend-rounded-full suprsend-bg-black/40 suprsend-flex suprsend-items-center suprsend-justify-center">
                          <Video className="suprsend-w-5 suprsend-h-5 suprsend-text-white" />
                        </div>
                      </div>
                    )}
                    {formValues.header_media_format === 'DOCUMENT' && (
                      <div>
                        <div className="suprsend-bg-muted suprsend-w-full suprsend-h-[80px]" />
                        <div className="suprsend-flex suprsend-items-center suprsend-gap-1.5 suprsend-px-2 suprsend-py-1.5 suprsend-bg-muted">
                          <FileText className="suprsend-w-4 suprsend-h-4 suprsend-text-destructive suprsend-shrink-0" />
                          <span className="suprsend-text-xs suprsend-text-foreground suprsend-truncate">
                            {resolvedFilename}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Content area */}
                <div className="suprsend-px-2 suprsend-pt-1.5 suprsend-pb-1">
                  {/* Header - Text */}
                  {formValues.template_type === 'TEXT' &&
                    resolvedHeaderText && (
                      <p className="suprsend-text-[13px] suprsend-font-semibold suprsend-text-foreground suprsend-break-words suprsend-mb-0.5">
                        {resolvedHeaderText}
                      </p>
                    )}

                  {/* Body */}
                  {bodyHtml && (
                    <p
                      className="suprsend-text-[13px] suprsend-text-foreground suprsend-break-words suprsend-leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    />
                  )}

                  {/* Footer + Timestamp */}
                  <div className="suprsend-flex suprsend-items-end suprsend-justify-between suprsend-mt-0.5">
                    {formValues.footer_text ? (
                      <span className="suprsend-text-[11px] suprsend-text-muted-foreground">
                        {formValues.footer_text}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="suprsend-text-[10px] suprsend-text-muted-foreground suprsend-ml-2 suprsend-shrink-0">
                      {timeStr}
                    </span>
                  </div>
                </div>

                {/* CTA Buttons inside bubble */}
                {ctaButtons.length > 0 && (
                  <div>
                    {ctaButtons.slice(0, 2).map((btn, i) => (
                      <div
                        key={i}
                        className="suprsend-border-t suprsend-border-border suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-gap-1 suprsend-cursor-pointer"
                      >
                        {btn.type === 'PHONE_NUMBER' ? (
                          <Phone className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-primary" />
                        ) : (
                          <ExternalLink className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-primary" />
                        )}
                        <span className="suprsend-text-[13px] suprsend-text-primary">
                          {btn.text}
                        </span>
                      </div>
                    ))}
                    {ctaButtons.length > 2 && (
                      <div className="suprsend-border-t suprsend-border-border suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-gap-1">
                        <List className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-primary" />
                        <span className="suprsend-text-[13px] suprsend-text-primary">
                          See all options
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Reply Buttons outside bubble */}
            {qrButtons.length > 0 && (
              <div className="suprsend-ml-1 suprsend-max-w-[85%] suprsend-space-y-1">
                {qrButtons.slice(0, 2).map((btn, i) => (
                  <div
                    key={i}
                    className="suprsend-bg-white suprsend-rounded-lg suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-gap-1 suprsend-shadow-sm"
                  >
                    <Reply className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-primary" />
                    <span className="suprsend-text-[13px] suprsend-text-primary">
                      {btn.text}
                    </span>
                  </div>
                ))}
                {qrButtons.length > 2 && (
                  <div className="suprsend-bg-white suprsend-rounded-lg suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-gap-1 suprsend-shadow-sm">
                    <List className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-primary" />
                    <span className="suprsend-text-[13px] suprsend-text-primary">
                      See all options
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Input Bar */}
        <div className="suprsend-flex suprsend-items-center suprsend-gap-1.5 suprsend-px-2 suprsend-py-1.5 suprsend-bg-muted suprsend-z-20">
          <Plus className="suprsend-w-5 suprsend-h-5 suprsend-text-muted-foreground suprsend-shrink-0" />
          <div className="suprsend-flex-1 suprsend-bg-white suprsend-rounded-full suprsend-h-8 suprsend-flex suprsend-items-center suprsend-px-3">
            <Smile className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground" />
          </div>
          <Camera className="suprsend-w-5 suprsend-h-5 suprsend-text-muted-foreground suprsend-shrink-0" />
          <Mic className="suprsend-w-5 suprsend-h-5 suprsend-text-muted-foreground suprsend-shrink-0" />
        </div>

        {/* Home indicator */}
        <div className="suprsend-flex suprsend-justify-center suprsend-py-2 suprsend-bg-muted">
          <div className="suprsend-w-28 suprsend-h-1 suprsend-bg-black suprsend-rounded-full" />
        </div>
      </div>
    </WhatsappPhoneFrame>
  );
}
