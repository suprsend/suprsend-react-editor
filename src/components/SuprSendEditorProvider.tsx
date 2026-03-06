import '../index.css';
import { useMemo } from 'react';
import type {
  FullSuprSendTemplateEditorProviderProps,
  TemplateEditorContextValue,
} from '@/types';
import { TemplateEditorContext } from '@/lib/TemplateEditorContext';
import { useAuthInterceptor } from '@/lib/useAuthInterceptor';

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
}: FullSuprSendTemplateEditorProviderProps) {
  const isPrivate = true; // TODO: Determine if the template is private based on your logic
  const isLive = mode === 'live';

  const value = useMemo<TemplateEditorContextValue>(
    () => ({
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
