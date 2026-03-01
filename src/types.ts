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

export interface IEmailBody {
  raw?: { html?: string; text?: string };
  type?: string;
  designer?: {
    html?: string;
    text?: string;
    design_json?: Record<string, unknown>;
    display_conditions?: unknown[];
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

// --- Generic payload union for API ---

export type ChannelContentPayload = EmailContentPayload | IOSPushContentPayload | WebpushContentPayload;

export interface UpdateVariantContentParams extends GetVariantDetailsParams {
  payload: ChannelContentPayload;
}

export interface UploadFileParams {
  workspaceUid: string;
  file: File;
}

export interface UseMockDataParams {
  templateSlug: string;
  recipientDistinctId?: string;
  actorDistinctId?: string;
}

export interface GetMockDataParams extends UseMockDataParams {
  workspaceUid: string;
  tenantId: string | null;
}

export interface TextEditorsProps {
  type: 'html' | 'plaintext';
  value: string;
  onChange: (value: string) => void;
  variables?: Record<string, unknown>;
}
