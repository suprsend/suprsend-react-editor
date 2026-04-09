import '../index.css';
import initCustomHelpers from '@/lib/handlebarHelper';
import { useMemo, useState, useCallback } from 'react';
import type {
  ChannelId,
  FullSuprSendTemplateEditorProviderProps,
  TemplateEditorContextValue,
  TemplateMode,
} from '@/types';
import { TemplateEditorContext } from '@/lib/TemplateEditorContext';
import { useAuthInterceptor } from '@/lib/useAuthInterceptor';
import {
  ThemeContext,
  useThemeResolver,
  useThemeOverridesStyle,
} from '@/lib/ThemeContext';

initCustomHelpers();

export default function SuprSendTemplateProvider({
  workspaceUid,
  templateSlug,
  variantId,
  channels,
  tenantId,
  locale,
  translationLocale,
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
  notificationCategory,
  fallbackVariantId,
}: FullSuprSendTemplateEditorProviderProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(
    channels.length > 0 ? channels[0] : null
  );
  const [internalMode, setInternalMode] = useState<TemplateMode | undefined>(
    undefined
  );
  const currentMode = internalMode ?? mode ?? (version ? 'live' : 'draft');
  const isLive = currentMode === 'live';

  const setMode = useCallback((newMode: TemplateMode) => {
    setInternalMode(newMode);
  }, []);

  const resolvedTheme = useThemeResolver(theme);
  const overridesStyle = useThemeOverridesStyle(themeOverrides);
  const themeValue = useMemo(
    () => ({ resolvedTheme, overridesStyle }),
    [resolvedTheme, overridesStyle]
  );

  const PRIVATE_ONLY_CHANNELS = ['sms', 'whatsapp'];
  const filteredChannels = useMemo(
    () =>
      isPrivate
        ? channels
        : channels.filter((ch) => !PRIVATE_ONLY_CHANNELS.includes(ch)),
    [channels, isPrivate]
  );

  const value = useMemo<TemplateEditorContextValue>(
    () => ({
      workspaceUid,
      templateSlug,
      variantId,
      channels: filteredChannels,
      tenantId,
      locale,
      translationLocale,
      conditions,
      isPrivate,
      isLive,
      setMode,
      selectedChannel: selectedChannel as ChannelId | null,
      setSelectedChannel: setSelectedChannel as (channel: ChannelId) => void,
      accessToken,
      refreshAccessToken,
      recipientDistinctId,
      actorDistinctId,
      mode: currentMode,
      version,
      notificationCategory,
      fallbackVariantId,
    }),
    [
      workspaceUid,
      templateSlug,
      variantId,
      channels,
      tenantId,
      locale,
      translationLocale,
      conditions,
      isPrivate,
      isLive,
      setMode,
      selectedChannel,
      setSelectedChannel,
      accessToken,
      refreshAccessToken,
      recipientDistinctId,
      actorDistinctId,
      currentMode,
      version,
      notificationCategory,
      fallbackVariantId,
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
