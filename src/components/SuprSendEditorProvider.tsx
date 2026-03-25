import '../index.css';
import initCustomHelpers from '@/lib/handlebarHelper';
import { useMemo } from 'react';
import type {
  FullSuprSendTemplateEditorProviderProps,
  TemplateEditorContextValue,
} from '@/types';
import { TemplateEditorContext } from '@/lib/TemplateEditorContext';
import { useAuthInterceptor } from '@/lib/useAuthInterceptor';
import {
  ThemeContext,
  useThemeResolver,
  useThemeOverridesStyle,
} from '@/lib/ThemeContext';

initCustomHelpers();

export default function SuprSendEditorProvider({
  workspaceUid,
  templateSlug,
  variantId,
  channels,
  tenantId,
  locale,
  theme = 'light',
  themeOverrides,
  conditions,
  children,
  accessToken,
  refreshAccessToken,
  recipientDistinctId,
  actorDistinctId,
  mode,
  isPrivate = false,
  version,
}: FullSuprSendTemplateEditorProviderProps) {
  const isLive = mode === 'live' || !!version;
  const resolvedTheme = useThemeResolver(theme);
  const overridesStyle = useThemeOverridesStyle(themeOverrides);
  const themeValue = useMemo(
    () => ({ resolvedTheme, overridesStyle }),
    [resolvedTheme, overridesStyle]
  );

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
      version,
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
      version,
    ]
  );

  useAuthInterceptor({ accessToken, refreshAccessToken, isPrivate });

  return (
    <ThemeContext.Provider value={themeValue}>
      <TemplateEditorContext.Provider value={value}>
        {children}
      </TemplateEditorContext.Provider>
    </ThemeContext.Provider>
  );
}
