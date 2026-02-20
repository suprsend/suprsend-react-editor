import '../index.css';
import { useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import type {
  SuprSendTemplateEditorProviderProps,
  TemplateEditorContextValue,
} from '@/types';
import { TemplateEditorContext } from '@/lib/TemplateEditorContext';
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
}: SuprSendTemplateEditorProviderProps) {
  console.log('SDK PROPS:', {
    workspaceUid,
    templateSlug,
    variantId,
    channels,
    tenantId,
    locale,
    conditions,
  });
  const value = useMemo<TemplateEditorContextValue>(
    () => ({
      workspaceUid,
      templateSlug,
      variantId,
      channels,
      tenantId,
      locale,
      conditions,
    }),
    [
      workspaceUid,
      templateSlug,
      variantId,
      channels,
      tenantId,
      locale,
      conditions,
    ]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TemplateEditorContext.Provider value={value}>
        {children}
      </TemplateEditorContext.Provider>
    </QueryClientProvider>
  );
}
