import type { ReactNode } from 'react';

export type ChannelId =
  | 'android'
  | 'email'
  | 'inbox'
  | 'ios'
  | 'msteams'
  | 'slack'
  | 'sms'
  | 'webpush'
  | 'whatsapp';

export interface SuprSendTemplateEditorProviderProps {
  workspaceUid: string;
  templateSlug: string;
  variantId: string;
  channels: ChannelId[];
  tenantId: string | null;
  locale: string;
  conditions?: unknown;
  accessToken?: string;
  refreshAccessToken?: (oldToken: string) => Promise<string>;
  recipientDistinctId?: string;
  actorDistinctId?: string;
}

export interface FullSuprSendTemplateEditorProviderProps extends SuprSendTemplateEditorProviderProps {
  children?: React.ReactNode;
}

export interface TemplateEditorContextValue extends SuprSendTemplateEditorProviderProps {
  isPrivate: boolean;
}

export interface SuprSendTemplateEditorProps {
  hideChannelsTab?: boolean;
}

export interface CommitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: () => void;
}

export interface CommitButtonProps {
  onCommit: () => void;
}

export interface UseVariantDetailsParams {
  templateSlug: string;
  chanelSlug: string;
  variantId: string;
}

export interface GetVariantDetailsParams extends UseVariantDetailsParams {
  tenantId: string | null;
  locale: string;
  conditions: unknown;
  workspaceUid: string;
  isPrivate: boolean;
}

export interface EmailMetaDataFormValues {
  subject: string;
  from_name: string;
  from_address: string;
  preheader: string;
  cc: string;
  bcc: string;
  reply_to: string;
  extra_to: string;
  email_markup: string;
}

export interface MergeTagData {
  id: string;
  before: string;
  after: string;
  expression: string;
}

export interface IEmailBody {
  raw?: { html?: string; text?: string };
  type?: string;
  designer?: {
    html?: string;
    text?: string;
    design_json?: Record<string, unknown>;
    display_conditions?: unknown[];
    merge_tags?: MergeTagData[];
  };
  plain_text?: { text?: string };
  preheader?: string;
  email_markup?: string;
}

export interface IEmailContent {
  from_name?: string;
  from_address?: string;
  subject?: string;
  cc?: string;
  bcc?: string;
  reply_to?: string;
  extra_to?: string;
  body?: IEmailBody;
  templating_language?: string;
}

export interface IEmailContentResponse {
  content: IEmailContent;
  email_editor_userid?: string;
}

export type EmailContentPayload = {
  content: IEmailContent;
};

// --- iOS Push ---

export interface IIOSPushContent {
  header: string;
  body: string;
  image_url: string;
  action_url: string;
}

export interface IIOSPushContentResponse {
  content: IIOSPushContent;
}

export type IOSPushFormValues = IIOSPushContent;

export type IOSPushContentPayload = {
  content: Partial<IIOSPushContent>;
};

export interface IOSPushChannelProps {
  variantData: IIOSPushContentResponse;
  variables: Record<string, unknown>;
}

export interface IOSPushPreviewProps {
  formValues: IOSPushFormValues;
  variables: Record<string, unknown>;
}

// --- Web Push ---

export interface IWebpushButton {
  url: string;
  text: string;
}

export interface IWebpushContent {
  header: string;
  body: string;
  buttons: IWebpushButton[];
  image_url: string;
  action_url: string;
}

export interface IWebpushContentResponse {
  content: IWebpushContent;
}

export type WebpushFormValues = IWebpushContent;

export type WebpushContentPayload = {
  content: Partial<IWebpushContent>;
};

export interface WebpushChannelProps {
  variantData: IWebpushContentResponse;
  variables: Record<string, unknown>;
}

export interface WebpushPreviewProps {
  formValues: WebpushFormValues;
  variables: Record<string, unknown>;
}

export type PreviewTab = 'windows' | 'macos';

export interface PreviewFrameProps extends WebpushPreviewProps {
  resolvedImageUrl: string;
}

// --- MS Teams ---

export interface IMSTeamsContent {
  body_type: 'card' | 'text';
  body_card?: string;
  body_text?: string;
}

export interface IMSTeamsContentResponse {
  content: IMSTeamsContent;
}

export type MSTeamsFormValues = {
  body_type: 'card' | 'text';
  body_card: string;
  body_text: string;
};

export type MSTeamsContentPayload = {
  content: Partial<IMSTeamsContent>;
};

export interface MSTeamsChannelProps {
  variantData: IMSTeamsContentResponse;
  variables: Record<string, unknown>;
}

export interface MSTeamsPreviewProps {
  bodyType: 'card' | 'text';
  bodyCard: string;
  bodyText: string;
  variables: Record<string, unknown>;
}

export interface JsonnetPreviewState {
  success: boolean;
  html: string | null;
  error: string | null;
}

export interface MarkdownPreviewProps {
  bodyText: string;
  variables: Record<string, unknown>;
}

export interface JsonnetPreviewProps {
  bodyCard: string;
  variables: Record<string, unknown>;
}

export type AdaptiveCardRenderResult =
  | { success: true; html: string }
  | { success: false; error: string };

// --- Slack ---

export interface ISlackContent {
  body_type: 'block' | 'text';
  body_block?: string;
  body_text?: string;
}

export interface ISlackContentResponse {
  content: ISlackContent;
}

export type SlackFormValues = {
  body_type: 'block' | 'text';
  body_block: string;
  body_text: string;
};

export type SlackContentPayload = {
  content: Partial<ISlackContent>;
};

export interface SlackChannelProps {
  variantData: ISlackContentResponse;
  variables: Record<string, unknown>;
}

export interface SlackPreviewProps {
  bodyType: 'block' | 'text';
  bodyBlock: string;
  bodyText: string;
  variables: Record<string, unknown>;
}

export interface SlackTextPreviewProps {
  bodyText: string;
  variables: Record<string, unknown>;
}

export interface SlackBlockPreviewProps {
  bodyBlock: string;
}

// --- JSONNET Render ---

export interface JsonnetRenderBody {
  snippet: string;
  data: Record<string, unknown>;
  translations?: unknown;
}

export interface JsonnetRenderResponse {
  success: boolean;
  result?: unknown[];
  error?: string;
}

// --- Android Push ---

export interface IAndroidPushButton {
  id: string;
  url: string;
  text: string;
}

export interface IAndroidPushExtraPayloadEntry {
  key: string;
  value: string;
}

export interface IAndroidPushContent {
  header: string;
  body: string;
  subtext: string;
  image_url: string;
  action_url: string;
  buttons: IAndroidPushButton[];
  is_silent: boolean;
  is_sticky: boolean;
  timeout_sec: number;
  group: string;
  icon_small: string;
  channel_sound: string;
  extra_payload: Record<string, string>;
}

export interface AndroidPushFormValues {
  header: string;
  body: string;
  subtext: string;
  image_url: string;
  action_url: string;
  buttons: IAndroidPushButton[];
  is_silent: boolean;
  is_sticky: boolean;
  timeout_sec: number;
  group: string;
  icon_small: string;
  channel_sound: string;
  extra_payload: IAndroidPushExtraPayloadEntry[];
}

export interface IAndroidPushContentResponse {
  content: IAndroidPushContent;
}

export type AndroidPushContentPayload = {
  content: Partial<IAndroidPushContent>;
};

export interface AndroidPushChannelProps {
  variantData: IAndroidPushContentResponse;
  variables: Record<string, unknown>;
}

export interface PhoneFrameProps {
  children?: ReactNode;
  className?: string;
}

export interface AndroidPushPreviewProps {
  formValues: AndroidPushFormValues;
  variables: Record<string, unknown>;
}

// --- Inbox ---

export interface IInboxButton {
  url: string;
  text: string;
  open_in_new_tab: boolean;
}

export interface IInboxAvatar {
  image_url: string;
  url: string;
}

export interface IInboxSubtext {
  text: string;
  url: string;
}

export interface IInboxExpiry {
  expiry_type: string;
  format: string;
  value: string;
  is_expiry_visible: boolean;
}

export interface IInboxContent {
  header: string;
  body: string;
  action_url: string;
  open_in_new_tab: boolean;
  avatar: IInboxAvatar;
  subtext: IInboxSubtext;
  buttons: IInboxButton[];
  is_pinned: boolean;
  is_expiry_enabled: boolean;
  expiry: IInboxExpiry;
  importance: string;
  tags: string[];
  extra_data: string;
}

export interface IInboxContentResponse {
  content: IInboxContent;
}

export type InboxFormValues = Omit<IInboxContent, 'tags'> & {
  tags: { label: string; value: string }[];
};

export type InboxContentPayload = {
  content: Partial<IInboxContent>;
};

export interface InboxChannelProps {
  variantData: IInboxContentResponse;
  variables: Record<string, unknown>;
}

export interface InboxPreviewProps {
  formValues: InboxFormValues;
  variables: Record<string, unknown>;
}

// --- Generic payload union for API ---

export type ChannelContentPayload =
  | EmailContentPayload
  | IOSPushContentPayload
  | WebpushContentPayload
  | MSTeamsContentPayload
  | SlackContentPayload
  | AndroidPushContentPayload
  | InboxContentPayload;

export interface UpdateVariantContentParams extends GetVariantDetailsParams {
  payload: ChannelContentPayload;
  isPrivate: boolean;
}

export interface UploadFileParams {
  workspaceUid: string;
  file: File;
}

export interface UseMockDataParams {
  templateSlug: string;
}

export interface GetMockDataParams extends UseMockDataParams {
  workspaceUid: string;
  tenantId: string | null;
  isPrivate: boolean;
  recipientDistinctId?: string;
  actorDistinctId?: string;
}

export interface TextEditorsProps {
  type: 'html' | 'plaintext';
  value: string;
  onChange: (value: string) => void;
  variables?: Record<string, unknown>;
  onFetchFromHtml?: () => Promise<string | undefined>;
}

export interface MockDataQueryParams {
  tenant_id?: string | null;
  recipient_distinct_id?: string;
  actor_distinct_id?: string;
}

// --- Email Editor ---

export type EditorMode = 'design' | 'html';
export type ActiveTab = 'editor' | 'plain_text';

export interface EmailChannelProps {
  variantData: IEmailContentResponse;
  variables?: Record<string, unknown>;
}

export interface EmailTemplatePlaygroundProps {
  editorMode: EditorMode;
  activeTab: ActiveTab;
  hasEditorTab: boolean;
  variantData: IEmailContentResponse;
  saveContent: (payload: EmailContentPayload) => void;
  designerHtmlRef: { current: string };
  exportHtmlRef: React.RefObject<(() => Promise<string>) | null>;
  rawHtmlRef: { current: string };
  variables?: Record<string, unknown>;
  designerText: string;
  onDesignerTextChange: (v: string) => void;
  rawText: string;
  onRawTextChange: (v: string) => void;
  plainTextOnlyText: string;
  onPlainTextOnlyTextChange: (v: string) => void;
}

export interface IEmailSettingsPreviewBannerProps {
  variantData: IEmailContentResponse;
  onSave: (payload: EmailContentPayload) => void;
  variables?: Record<string, unknown>;
}

export interface Condition {
  variable: string;
  op: string;
  value: string;
}

export interface OuterCondition {
  op: 'AND' | 'OR';
  args: Condition[];
}

export interface DisplayConditionData {
  id?: string;
  version?: string;
  label?: string;
  description?: string;
  expression?: string;
  conditions?: OuterCondition[];
  before?: string;
  after?: string;
}

export interface DisplayConditionInfo {
  data: DisplayConditionData;
  done: (data: DisplayConditionData) => void;
}

export interface MergeTagInfo {
  data: {
    mergeTagGroup?: string | null;
    mergeTags?: Record<string, unknown>;
  };
  done: (result: {
    mergeTagGroup: string | null;
    mergeTagRule: string | null;
  }) => void;
}
