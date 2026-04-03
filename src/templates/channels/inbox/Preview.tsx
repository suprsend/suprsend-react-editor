import { useMemo } from 'react';
import { Bell, MoreHorizontal } from '@/assets/icons';
import HandlebarsRenderer, {
  renderHandlebars,
} from '@/components/custom-ui/HandlebarsRenderer';
import { InboxMarkdownRenderer } from '@/components/custom-ui/MarkdownRenderer';
import { makeAbsoluteUrl } from '@/lib/utils';
import type { InboxPreviewProps } from '@/types';
import defaultAvatar from '@/assets/defaultPreviewIcon.png';

export default function InboxPreview({
  formValues,
  variables,
}: InboxPreviewProps) {
  const resolvedAvatar = useMemo(() => {
    const url = formValues.avatar?.image_url;
    if (!url) return defaultAvatar;
    const rendered = renderHandlebars(url, variables);
    return rendered ? makeAbsoluteUrl(rendered) : defaultAvatar;
  }, [formValues.avatar?.image_url, variables]);

  const resolvedHeader = useMemo(
    () => renderHandlebars(formValues.header || '', variables),
    [formValues.header, variables]
  );

  const resolvedBody = useMemo(
    () => renderHandlebars(formValues.body || '', variables),
    [formValues.body, variables]
  );

  const resolvedSubtext = useMemo(
    () => renderHandlebars(formValues.subtext?.text || '', variables),
    [formValues.subtext?.text, variables]
  );

  const hasButtons = formValues.buttons?.some((b) => b.text);

  return (
    <div className="suprsend-w-[450px] suprsend-select-none">
      {/* Bell icon with badge */}
      <div className="suprsend-flex suprsend-justify-center suprsend-mb-4">
        <div className="suprsend-relative">
          <Bell className="suprsend-w-6 suprsend-h-6" />
          <div className="suprsend-absolute suprsend--top-1 suprsend--right-1 suprsend-w-4 suprsend-h-4 suprsend-bg-primary suprsend-rounded-full suprsend-flex suprsend-items-center suprsend-justify-center">
            <span className="suprsend-text-[9px] suprsend-text-background suprsend-font-bold">
              1
            </span>
          </div>
        </div>
      </div>

      {/* Notification panel */}
      <div className="suprsend-bg-white suprsend-border suprsend-rounded-md suprsend-shadow-lg suprsend-overflow-hidden suprsend-max-h-[500px] suprsend-flex suprsend-flex-col">
        {/* Header */}
        <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-p-5">
          <h3 className="suprsend-text-lg suprsend-font-semibold suprsend-text-foreground">
            Notifications
          </h3>
          <span className="suprsend-text-xs suprsend-text-primary suprsend-cursor-default">
            Mark all as read
          </span>
        </div>

        {/* Tabs */}
        <div className="suprsend-flex suprsend-gap-4 suprsend-px-5 suprsend-border-b suprsend-border-border">
          <div className="suprsend-relative suprsend-pb-2 suprsend-flex suprsend-items-center suprsend-gap-1">
            <span className="suprsend-text-xs suprsend-font-semibold suprsend-text-foreground">
              All
            </span>
            <p className="suprsend-bg-muted py-[1px] px-1.5 suprsend-rounded-full">
              <span className="suprsend-text-xs suprsend-text-muted-foreground">
                1
              </span>
            </p>
            <span className="suprsend-absolute suprsend-bottom-0 suprsend-left-[-6px] suprsend-right-[-6px] suprsend-h-1 suprsend-bg-primary suprsend-rounded-t" />
          </div>
          <div className="">
            <span className="suprsend-text-xs suprsend-font-semibold suprsend-text-muted-foreground">
              Mentions
            </span>
          </div>
          <div className="">
            <span className="suprsend-text-xs suprsend-font-semibold suprsend-text-muted-foreground">
              Replies
            </span>
          </div>
        </div>

        {/* Scrollable notification area */}
        <div className="suprsend-flex-1 suprsend-overflow-y-auto">
        {/* Notification item */}
        <div className="suprsend-bg-primary/10 suprsend-px-5 suprsend-py-4">
          <div className="suprsend-flex suprsend-items-start suprsend-gap-3">
            {/* Unread dot */}
            <div className="suprsend-flex suprsend-items-center suprsend-shrink-0 ">
              <div className="suprsend-w-2 suprsend-h-2 suprsend-rounded-full suprsend-bg-primary" />
            </div>

            {/* Avatar */}
            <img
              src={resolvedAvatar}
              alt="avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
              className="suprsend-w-10 suprsend-h-10 suprsend-rounded-full suprsend-object-cover suprsend-shrink-0"
            />

            {/* Content */}
            <div className="suprsend-flex-1 suprsend-min-w-0">
              {/* Header + time row */}
              <div className="suprsend-flex suprsend-items-start suprsend-justify-between suprsend-gap-2">
                <div className="suprsend-flex-1 suprsend-min-w-0">
                  <p className="suprsend-text-sm suprsend-text-foreground suprsend-break-words suprsend-m-0">
                    <span className="suprsend-font-semibold">
                      {resolvedHeader}
                    </span>
                  </p>
                </div>
              </div>

              {/* Body */}

              <div className="suprsend-mt-0.5">
                <InboxMarkdownRenderer className="suprsend-text-sm suprsend-text-foreground suprsend-break-words [&_p]:suprsend-m-0 [&_p]:suprsend-text-sm">
                  {resolvedBody}
                </InboxMarkdownRenderer>
              </div>

              <p className="suprsend-text-xs suprsend-text-muted-foreground suprsend-mt-1 suprsend-m-0">
                {resolvedSubtext}
              </p>

              {/* Action buttons */}
              {hasButtons && (
                <div className="suprsend-flex suprsend-gap-2 suprsend-mt-2">
                  {formValues.buttons.map(
                    (btn, i) =>
                      btn.text && (
                        <span
                          key={i}
                          className={`suprsend-px-4 suprsend-py-1.5 suprsend-rounded suprsend-text-xs suprsend-font-medium ${
                            i === 0
                              ? 'suprsend-bg-primary suprsend-text-background'
                              : 'suprsend-border suprsend-border-border suprsend-text-foreground suprsend-bg-background'
                          }`}
                        >
                          <HandlebarsRenderer
                            template={btn.text}
                            data={variables}
                            className="suprsend-m-0 suprsend-inline"
                          />
                        </span>
                      )
                  )}
                </div>
              )}
            </div>

            <div className="suprsend-flex suprsend-flex-col suprsend-items-center suprsend-space-y-1.5 suprsend-shrink-0">
              <span className="suprsend-text-xs suprsend-text-muted-foreground">
                now
              </span>
              <MoreHorizontal className="suprsend-w-4 suprsend-h-4 suprsend-text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Empty space below notification */}
        <div className="suprsend-h-48" />
        </div>

        {/* Footer */}
        <div className="suprsend-flex suprsend-items-center suprsend-justify-center suprsend-gap-1.5 suprsend-py-3 suprsend-border-t suprsend-border-border">
          <img
            src="https://app.suprsend.com/favicon.ico"
            alt="SuprSend"
            className="suprsend-w-4 suprsend-h-4"
          />
          <span className="suprsend-text-xs suprsend-text-muted-foreground">
            Powered by SuprSend
          </span>
        </div>
      </div>
    </div>
  );
}
