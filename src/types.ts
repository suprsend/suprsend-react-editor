import type { ReactNode } from 'react';

export type ChannelId =
  | 'androidpush'
  | 'email'
  | 'inbox'
  | 'iospush'
  | 'ms_teams'
  | 'slack'
  | 'sms'
  | 'webpush'
  | 'whatsapp';

export type TemplateMode = 'live' | 'draft';

// --- Generic channel type helpers ---

export interface VendorApproval {
  vendor_slug: string;
  vendor_uid: string;
  vendor_template_name: string | null;
  vendor_template_id: string | null;
  vendor_locale_code: string | null;
  vendor_template_category: string | null;
  provider_template_id: string | null;
  approval_status: string;
  comment: string | null;
  sent_for_approval_at: string | null;
  approval_status_received_at: string | null;
}

export interface ContentResponse<T> {
  content: T;
  needs_vendor_approval?: boolean;
  approval_status?: string;
  discard_comment?: string;
  vendor_approvals?: VendorApproval[];
  sysgen_template_name?: string;
  locale?: string;
}

export type ContentPayload<T> = {
  content: Partial<T>;
};

export interface ChannelProps<TContent, TResponse = ContentResponse<TContent>> {
  variantData: TResponse;
  variables: Record<string, unknown>;
}

export interface ChannelPreviewProps<T> {
  formValues: T;
  variables: Record<string, unknown>;
}

// --- Common API params ---

export interface BaseApiParams {
  workspaceUid: string;
  templateSlug: string;
  isPrivate: boolean;
  mode?: TemplateMode;
  version?: string;
  variantId: string;
  fallbackVariantId?: string;
  tenantId: string | null;
  locale: string;
  conditions: unknown;
  recipientDistinctId?: string;
  actorDistinctId?: string;
}

export interface ThemeOverrides {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  radius?: string;
}

export interface SuprSendTemplateEditorProviderProps {
  workspaceUid: string;
  templateSlug: string;
  variantId: string;
  channels: ChannelId[];
  tenantId: string | null;
  locale: string;
  theme?: 'light' | 'dark' | 'system';
  themeOverrides?: ThemeOverrides;
  mode?: TemplateMode;
  conditions?: unknown;
  accessToken?: string;
  refreshAccessToken?: (oldToken: string) => Promise<string>;
  recipientDistinctId?: string;
  actorDistinctId?: string;
  isPrivate?: boolean;
  version?: string;
  notificationCategory?: string;
  fallbackVariantId?: string;
}

export interface FullSuprSendTemplateEditorProviderProps extends SuprSendTemplateEditorProviderProps {
  children?: React.ReactNode;
}

export interface TemplateEditorContextValue extends SuprSendTemplateEditorProviderProps {
  isPrivate: boolean;
  isLive: boolean;
  notificationCategory?: string;
  setMode: (mode: TemplateMode) => void;
  selectedChannel: ChannelId | null;
  setSelectedChannel: (channel: ChannelId) => void;
}

export interface SuprSendTemplateEditorProps {
  hideChannelsTab?: boolean;
  hideActionButtons?: boolean;
  hideTestButton?: boolean;
  onCommit?: () => void;
}

export interface ChannelActionsProps {
  isLive: boolean;
  hideActionButtons: boolean;
  hideTestButton: boolean;
  onCommit?: () => void;
  setMode: (mode: TemplateMode) => void;
}

export interface CommitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: () => void;
}

export interface CommitButtonProps {
  onCommit: () => void;
}

export interface CommitVariant {
  channel: string;
  id: string;
  has_diff?: boolean;
  is_deleted?: boolean;
  errors?: Record<string, string[]>;
  name?: string;
}

export interface PropertyDiff {
  has_diff: boolean;
  draft?: unknown;
  live?: unknown;
}

export interface PreCommitValidateResponse {
  is_new: boolean;
  has_changes: boolean;
  properties: Record<string, PropertyDiff>;
  variants: CommitVariant[];
}

export interface CommitTemplateParams extends BaseApiParams {
  commitMessage: string;
  variants: CommitVariant[];
}

export interface UseCommitTemplateParams {
  templateSlug: string;
}

export interface CommitTemplateMutationPayload {
  commitMessage: string;
  variants: CommitVariant[];
}

export interface UseVariantDetailsParams {
  templateSlug: string;
  chanelSlug: string;
  variantId: string;
}

export interface GetVariantDetailsParams extends UseVariantDetailsParams, BaseApiParams {}

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

export interface IEmailContentResponse extends ContentResponse<IEmailContent> {
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

export type IIOSPushContentResponse = ContentResponse<IIOSPushContent>;
export type IOSPushFormValues = IIOSPushContent;
export type IOSPushContentPayload = ContentPayload<IIOSPushContent>;
export type IOSPushChannelProps = ChannelProps<IIOSPushContent>;
export type IOSPushPreviewProps = ChannelPreviewProps<IOSPushFormValues>;

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

export type IWebpushContentResponse = ContentResponse<IWebpushContent>;
export type WebpushFormValues = IWebpushContent;
export type WebpushContentPayload = ContentPayload<IWebpushContent>;
export type WebpushChannelProps = ChannelProps<IWebpushContent>;
export type WebpushPreviewProps = ChannelPreviewProps<WebpushFormValues>;

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

export type IMSTeamsContentResponse = ContentResponse<IMSTeamsContent>;

export type MSTeamsFormValues = {
  body_type: 'card' | 'text';
  body_card: string;
  body_text: string;
};

export type MSTeamsContentPayload = ContentPayload<IMSTeamsContent>;
export type MSTeamsChannelProps = ChannelProps<IMSTeamsContent>;

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

export type ISlackContentResponse = ContentResponse<ISlackContent>;

export type SlackFormValues = {
  body_type: 'block' | 'text';
  body_block: string;
  body_text: string;
};

export type SlackContentPayload = ContentPayload<ISlackContent>;
export type SlackChannelProps = ChannelProps<ISlackContent>;

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
  variables: Record<string, unknown>;
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

// --- SMS ---

export interface ISMSContent {
  body: string;
  _parsed_body?: string;
  _examples?: string[];
  type: string;
  header: string;
  category: string;
  templating_language: string;
}

export type ISMSContentResponse = ContentResponse<ISMSContent>;

export type SMSFormValues = {
  body: string;
  header: string;
  category: string;
};

export type SMSContentPayload = ContentPayload<ISMSContent>;
export type SMSChannelProps = ChannelProps<ISMSContent>;
export type SMSPreviewProps = ChannelPreviewProps<SMSFormValues>;

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

export type IAndroidPushContentResponse = ContentResponse<IAndroidPushContent>;
export type AndroidPushContentPayload = ContentPayload<IAndroidPushContent>;
export type AndroidPushChannelProps = ChannelProps<IAndroidPushContent>;

export interface PhoneFrameProps {
  children?: ReactNode;
  className?: string;
}

export type AndroidPushPreviewProps = ChannelPreviewProps<AndroidPushFormValues>;

// --- WhatsApp ---

export type WhatsappCategory = 'UTILITY' | 'MARKETING';
export type WhatsappTemplateType = 'TEXT' | 'MEDIA';
export type WhatsappHeaderFormat = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
export type WhatsappButtonType = 'NONE' | 'QUICK_REPLY' | 'CALL_TO_ACTION';

export interface IWhatsappURLButton {
  type: 'URL';
  text: string;
  url_type: 'static' | 'dynamic';
  url_static_part: string;
  url_dynamic_part?: string;
  _examples?: string[];
}

export interface IWhatsappPhoneButton {
  type: 'PHONE_NUMBER';
  text: string;
  phone_number: string;
}

export interface IWhatsappQuickReplyButton {
  type: 'QUICK_REPLY';
  text: string;
}

export type IWhatsappButton =
  | IWhatsappURLButton
  | IWhatsappPhoneButton
  | IWhatsappQuickReplyButton;
export type IWhatsappCTAButton = IWhatsappURLButton | IWhatsappPhoneButton;

export interface IWhatsappHeader {
  format: WhatsappHeaderFormat;
  text?: string;
  media_url?: string;
  filename?: string;
  _parsed_text?: string;
  _examples?: string[];
}

export interface IWhatsappContent {
  category?: WhatsappCategory;
  body?: { text: string; _parsed_text?: string; _examples?: string[] };
  footer?: { text: string; _parsed_text?: string };
  header?: IWhatsappHeader;
  button_type?: WhatsappButtonType;
  buttons?: IWhatsappButton[];
}

export type IWhatsappContentResponse = ContentResponse<IWhatsappContent>;

export interface WhatsappFormValues {
  category: string;
  template_type: WhatsappTemplateType;
  header_text: string;
  header_media_format: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  header_media_url: string;
  header_document_filename: string;
  body_text: string;
  footer_text: string;
  button_type: WhatsappButtonType;
  cta_buttons: IWhatsappCTAButton[];
  quick_reply_buttons: IWhatsappQuickReplyButton[];
}

export type WhatsappContentPayload = ContentPayload<IWhatsappContent>;
export type WhatsappChannelProps = ChannelProps<IWhatsappContent>;
export type WhatsappPreviewProps = ChannelPreviewProps<WhatsappFormValues>;

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
  expiry: IInboxExpiry | null;
  importance: string;
  tags: string[];
  extra_data: string;
}

export type IInboxContentResponse = ContentResponse<IInboxContent>;

export type InboxFormValues = Omit<IInboxContent, 'tags'> & {
  tags: { label: string; value: string }[];
};

export type InboxContentPayload = ContentPayload<IInboxContent>;
export type InboxChannelProps = ChannelProps<IInboxContent>;
export type InboxPreviewProps = ChannelPreviewProps<InboxFormValues>;

export interface EmailPreviewProps {
  variantData: IEmailContentResponse;
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
  | WhatsappContentPayload
  | SMSContentPayload
  | InboxContentPayload;

export interface UpdateVariantContentParams extends GetVariantDetailsParams {
  payload: ChannelContentPayload;
}

export interface UploadFileParams {
  workspaceUid: string;
  file: File;
}

export interface UseMockDataParams {
  templateSlug: string;
}

export interface GetMockDataParams extends UseMockDataParams, BaseApiParams {}

export interface TextEditorsProps {
  type: 'html' | 'plaintext';
  value: string;
  onChange: (value: string) => void;
  variables?: Record<string, unknown>;
  disabled?: boolean;
  onWarningChange?: (warning: string) => void;
  /** Auto-generated plain text shown when value is empty. Edits are not saved until user modifies it. */
  autoValue?: string;
}

export interface MockDataQueryParams {
  tenant_id?: string | null;
  recipient_distinct_id?: string;
  actor_distinct_id?: string;
  variant_id?: string;
  fallback_variant_id?: string;
  locale?: string;
  conditions?: unknown;
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
  rawHtmlValue: string;
  onRawHtmlValueChange: (v: string) => void;
  rawText: string;
  onRawTextChange: (v: string) => void;
  plainTextOnlyText: string;
  onPlainTextOnlyTextChange: (v: string) => void;
  disabled?: boolean;
  onWarningChange?: (warning: string) => void;
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

// --- Test Modal ---

export interface TestModalIdentity {
  identity_type: string;
  value?: string;
  value_json?: Record<string, unknown>;
  id_provider?: string;
}

export interface MockTestPayload {
  distinct_id: string;
  identities: TestModalIdentity[];
  category?: string;
  tenant_id?: string;
}

export interface ChannelVariantMockTestParams extends BaseApiParams {
  channel: string;
  payload: MockTestPayload;
}

export interface TestButtonProps {
  onTestSent?: () => void;
}

// --- Vendor Approval ---

export type VendorApprovalChannelContent = IWhatsappContent | ISMSContent;

export interface VendorFromAPI {
  id: string;
  nickname: string;
  unique_identifier: string | null;
  vendor: {
    name: string;
    slug: string;
    logo: string;
    is_template_approval_required: boolean;
  };
  is_enabled: boolean;
}

export interface MergedVendorRow {
  key: string;
  label: string;
  approval: VendorApproval | null;
  hasVendor: boolean;
}

export type VendorApprovalModalState =
  | { type: 'closed' }
  | { type: 'approve'; approval: VendorApproval; readOnly: boolean }
  | { type: 'updateStatus'; approval: VendorApproval; defaultStatus: 'approved' | 'rejected' };

export interface VendorApproveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: VendorApproval;
  content: IWhatsappContent | ISMSContent;
  sysgenTemplateName: string;
  locale: string;
  channelSlug: string;
  readOnly?: boolean;
  onConfirmSuccess?: () => void;
}

export interface UpdateStatusFormValues {
  status: 'approved' | 'rejected';
  templateName: string;
  templateId: string;
  language: string;
  category: string;
  providerTemplateId: string;
  rejectionReason: string;
}

export interface UpdateStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: VendorApproval;
  channelSlug: string;
  sysgenTemplateName: string;
  locale?: string;
  contentCategory?: string;
  defaultStatus?: 'approved' | 'rejected';
}

export interface VendorApprovalBannerProps {
  channelSlug: string;
  vendorApprovals?: VendorApproval[];
  sysgenTemplateName?: string;
  locale?: string;
  content?: VendorApprovalChannelContent;
}
