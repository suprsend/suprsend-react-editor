import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ThemeOverrides } from '@/types';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const ThemeContext = createContext<ResolvedTheme>('light');
export const ThemeOverridesContext = createContext<React.CSSProperties>({});

export function useResolvedTheme() {
  return useContext(ThemeContext);
}

export function useThemeOverrides() {
  return useContext(ThemeOverridesContext);
}

export function useThemeOverridesStyle(
  overrides?: ThemeOverrides
): React.CSSProperties {
  return useMemo(() => {
    if (!overrides) return {};
    const style: Record<string, string> = {};
    for (const [key, value] of Object.entries(overrides)) {
      if (value !== undefined) {
        const cssVar = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        style[`--${cssVar}`] = value;
      }
    }
    return style as React.CSSProperties;
  }, [overrides]);
}

export function useThemeResolver(theme: Theme): ResolvedTheme {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    if (theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) =>
      setSystemTheme(e.matches ? 'dark' : 'light');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  return theme === 'system' ? systemTheme : theme;
}
