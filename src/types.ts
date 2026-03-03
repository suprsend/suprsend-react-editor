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
  templating_language?: string;
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

// --- Generic payload union for API ---

export type ChannelContentPayload =
  | EmailContentPayload
  | IOSPushContentPayload
  | WebpushContentPayload
  | MSTeamsContentPayload;

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
}

export interface MockDataQueryParams {
  tenant_id?: string | null;
  recipient_distinct_id?: string;
  actor_distinct_id?: string;
}
