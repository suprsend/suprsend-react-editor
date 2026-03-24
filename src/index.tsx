export { default as SuprSendEditorProvider } from '@/components/SuprSendEditorProvider';
// eslint-disable-next-line react-refresh/only-export-components
export * from '@/types';

import withSuprSendRoot from '@/lib/withSuprSendRoot';
import _TemplateEditor from '@/templates/TemplateEditor';
import _CommitButton from '@/templates/Commit';
import _EmailPreview from '@/templates/channels/email/Preview';
import _SMSPreview from '@/templates/channels/sms/Preview';
import _InboxPreview from '@/templates/channels/inbox/Preview';
import _WebpushPreview from '@/templates/channels/webpush/Preview';
import _IOSPushPreview from '@/templates/channels/iospush/Preview';
import _AndroidPushPreview from '@/templates/channels/androidpush/Preview';
import _SlackPreview from '@/templates/channels/slack/Preview';
import _MSTeamsPreview from '@/templates/channels/msteams/Preview';
import _WhatsappPreview from '@/templates/channels/whatsapp/Preview';

export const TemplateEditor = withSuprSendRoot(_TemplateEditor);
export const CommitButton = withSuprSendRoot(_CommitButton);
export const EmailPreview = withSuprSendRoot(_EmailPreview);
export const SMSPreview = withSuprSendRoot(_SMSPreview);
export const InboxPreview = withSuprSendRoot(_InboxPreview);
export const WebpushPreview = withSuprSendRoot(_WebpushPreview);
export const IOSPushPreview = withSuprSendRoot(_IOSPushPreview);
export const AndroidPushPreview = withSuprSendRoot(_AndroidPushPreview);
export const SlackPreview = withSuprSendRoot(_SlackPreview);
export const MSTeamsPreview = withSuprSendRoot(_MSTeamsPreview);
export const WhatsappPreview = withSuprSendRoot(_WhatsappPreview);
