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

export interface GetVariantDetailsParams {
  templateSlug: string;
  chanelSlug: string;
  variantId: string;
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

export interface IEmailContent {
  from_name?: string;
  from_address?: string;
  subject?: string;
  cc?: string;
  bcc?: string;
  reply_to?: string;
  extra_to?: string;
  body?: { preheader?: string; email_markup?: string };
}

export interface IEmailContentResponse {
  content?: IEmailContent;
}
