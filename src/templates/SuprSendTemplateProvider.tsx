import '../index.css';
import initCustomHelpers from '@/lib/handlebarHelper';
import { useMemo, useState, useCallback } from 'react';
import type {
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
}: FullSuprSendTemplateEditorProviderProps) {
  const [internalMode, setInternalMode] = useState<TemplateMode | undefined>(undefined);
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
      setMode,
      accessToken,
      refreshAccessToken,
      recipientDistinctId,
      actorDistinctId,
      mode: currentMode,
      version,
      notificationCategory,
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
      setMode,
      accessToken,
      refreshAccessToken,
      recipientDistinctId,
      actorDistinctId,
      currentMode,
      version,
      notificationCategory,
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
