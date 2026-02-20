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

export interface TemplateEditorContextValue {
  workspaceUid: string;
  templateSlug: string;
  variantId: string;
  tenantId: string | null;
  locale: string;
  conditions?: unknown;
  channels: ChannelId[];
}

export interface SuprSendTemplateEditorProviderProps extends TemplateEditorContextValue {
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
}
