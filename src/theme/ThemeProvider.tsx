import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { useColorScheme, type ColorSchemeName } from 'react-native';

import { useAppStore } from '@/store/useAppStore';
import type { ThemeId, ThemePreference } from '@/types';
import {
  THEMES,
  THEME_LIST,
  vibrantPalette,
  type Palette,
} from './palette';

export interface ThemeContextValue extends Palette {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  themes: readonly Palette[];
}

const defaultContextValue: ThemeContextValue = {
  ...vibrantPalette,
  themeId: 'vibrant',
  setTheme: () => {},
  themes: THEME_LIST,
};

const ThemeContext = createContext<ThemeContextValue>(defaultContextValue);

function resolveThemeId(
  pref: ThemePreference | undefined,
  systemScheme: ColorSchemeName,
): ThemeId {
  if (pref === 'oled' || pref === 'vibrant' || pref === 'warm') {
    return pref;
  }
  if (pref === 'dark') return 'oled';
  if (pref === 'light') return 'warm';
  if (pref === 'system') return systemScheme === 'dark' ? 'oled' : 'warm';
  return 'vibrant';
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const preference = useAppStore((s) => s.themePreference);
  const setThemePreference = useAppStore((s) => s.setThemePreference);

  const activeThemeId = useMemo(
    () => resolveThemeId(preference, system),
    [preference, system],
  );

  const activePalette = useMemo(
    () => THEMES[activeThemeId] ?? vibrantPalette,
    [activeThemeId],
  );

  const setTheme = useCallback(
    (id: ThemeId) => {
      setThemePreference(id);
    },
    [setThemePreference],
  );

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      ...activePalette,
      themeId: activeThemeId,
      setTheme,
      themes: THEME_LIST,
    }),
    [activePalette, activeThemeId, setTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
