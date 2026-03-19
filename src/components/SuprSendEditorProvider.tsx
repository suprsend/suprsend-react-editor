import '../index.css';
import initCustomHelpers from '@/lib/handlebarHelper';
import { useMemo } from 'react';
import type {
  FullSuprSendTemplateEditorProviderProps,
  TemplateEditorContextValue,
} from '@/types';
import { TemplateEditorContext } from '@/lib/TemplateEditorContext';
import { useAuthInterceptor } from '@/lib/useAuthInterceptor';

initCustomHelpers();

export default function SuprSendEditorProvider({
  workspaceUid,
  templateSlug,
  variantId,
  channels,
  tenantId,
  locale,
  conditions,
  children,
  accessToken,
  refreshAccessToken,
  recipientDistinctId,
  actorDistinctId,
  mode,
  isPrivate = false,
}: FullSuprSendTemplateEditorProviderProps) {
  const isLive = mode === 'live';

  const PRIVATE_ONLY_CHANNELS = ['sms', 'whatsapp'];
  const filteredChannels = isPrivate
    ? channels
    : channels.filter((ch) => !PRIVATE_ONLY_CHANNELS.includes(ch));

  const value = useMemo<TemplateEditorContextValue>(
    () => ({
      workspaceUid,
      templateSlug,
      variantId,
      channels: filteredChannels,
      tenantId,
      locale,
      conditions,
      isPrivate,
      isLive,
      accessToken,
      refreshAccessToken,
      recipientDistinctId,
      actorDistinctId,
      mode,
    }),
    [
      workspaceUid,
      templateSlug,
      variantId,
      channels,
      tenantId,
      locale,
      conditions,
      isPrivate,
      isLive,
      accessToken,
      refreshAccessToken,
      recipientDistinctId,
      actorDistinctId,
      mode,
    ]
  );

  useAuthInterceptor({ accessToken, refreshAccessToken, isPrivate });

  return (
    <TemplateEditorContext.Provider value={value}>
      {children}
    </TemplateEditorContext.Provider>
  );
}
