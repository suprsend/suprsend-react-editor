import '../index.css';
import { useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import type {
  FullSuprSendTemplateEditorProviderProps,
  TemplateEditorContextValue,
} from '@/types';
import { TemplateEditorContext } from '@/lib/TemplateEditorContext';
import { useAuthInterceptor } from '@/lib/useAuthInterceptor';
import { queryClient } from '@/apis';

export default function SuprSendTemplateEditorProvider({
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
}: FullSuprSendTemplateEditorProviderProps) {
  const isPrivate = true; // TODO: Determine if the template is private based on your logic

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
      accessToken,
      refreshAccessToken,
      recipientDistinctId,
      actorDistinctId,
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
      accessToken,
      refreshAccessToken,
      recipientDistinctId,
      actorDistinctId,
    ]
  );

  useAuthInterceptor({ accessToken, refreshAccessToken, isPrivate });

  return (
    <QueryClientProvider client={queryClient}>
      <TemplateEditorContext.Provider value={value}>
        {children}
      </TemplateEditorContext.Provider>
    </QueryClientProvider>
  );
}
