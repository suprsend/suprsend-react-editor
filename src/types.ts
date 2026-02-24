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
  tenantId: string | null;
  locale: string;
  conditions?: unknown;
  channels: ChannelId[];
}

export interface TemplateEditorContextValue extends SuprSendTemplateEditorProviderProps {
  isPrivate: boolean;
  accessToken?: string;
  refreshAccessToken?: (oldToken: string) => Promise<string>;
}

export interface FullSuprSendTemplateEditorProviderProps extends TemplateEditorContextValue {
  children?: React.ReactNode;
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

export interface useVariantDetailsParams {
  templateSlug: string;
  chanelSlug: string;
  variantId: string;
}

export interface GetVariantDetailsParams extends useVariantDetailsParams {
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

export interface UpdateVariantContentParams extends GetVariantDetailsParams {
  payload: EmailContentPayload;
}

export interface UploadFileParams {
  workspaceUid: string;
  file: File;
}
