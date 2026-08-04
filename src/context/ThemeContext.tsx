/**
 * Theme state management — mode, style, scheduled switching.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, getStyleConfig, getAvailableStyles } from '../theme/colors';
import { getSetting, setSetting, getSettingsByPrefix } from '../database/SettingsRepository';
import { THEME_STYLES } from '../theme/colors';
import { initDatabase } from '../database/Database';
import { ThemeMode, ThemeModeLabels } from '../utils/constants';
export { ThemeMode } from '../utils/constants';
export { ThemeModeLabels } from '../utils/constants';

interface ThemeContextValue {
  theme: ReturnType<typeof getTheme>;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  darkStartTime: string;
  lightStartTime: string;
  setDarkStart: (time: string) => void;
  setLightStart: (time: string) => void;
  isDark: boolean;
  themeStyle: string;
  setThemeStyle: (style: string) => void;
  availableStyles: ReturnType<typeof getAvailableStyles>;
  styleConfig: ReturnType<typeof getStyleConfig>;
  taskBgEnabled: boolean;
  taskBgColor: string;
  setTaskBgEnabled: (enabled: boolean) => void;
  setTaskBgColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function calcMode(mode: ThemeMode, scheme: string | null | undefined, darkStart: string, lightStart: string): 'light' | 'dark' {
  if (mode === ThemeMode.LIGHT) return 'light';
  if (mode === ThemeMode.DARK) return 'dark';
  if (mode === ThemeMode.SCHEDULED) return isTimeForDark(darkStart, lightStart) ? 'dark' : 'light';
  return scheme === 'dark' ? 'dark' : 'light';
}

function isTimeForDark(darkStart: string, lightStart: string): boolean {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  const [dh, dm] = darkStart.split(':').map(Number);
  const [lh, lm] = lightStart.split(':').map(Number);
  const dMin = dh * 60 + dm;
  const lMin = lh * 60 + lm;
  return dMin > lMin ? (m >= dMin || m < lMin) : (m >= dMin && m < lMin);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(ThemeMode.AUTO);
  const [darkStartTime, setDarkStartTime] = useState('21:00');
  const [lightStartTime, setLightStartTime] = useState('07:00');
  const [themeStyle, setThemeStyleState] = useState('apple');
  const [taskBgEnabled, setTaskBgEnabledState] = useState(false);
  const [taskBgColor, setTaskBgColorState] = useState('#3B82F6');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      await initDatabase();
      const settings = await getSettingsByPrefix('theme_');
      settings.forEach((row) => {
        if (row.key === 'theme_mode') setThemeModeState(row.value as ThemeMode);
        else if (row.key === 'theme_dark_start') setDarkStartTime(row.value);
        else if (row.key === 'theme_light_start') setLightStartTime(row.value);
        else if (row.key === 'theme_style') { if (THEME_STYLES[row.value]) setThemeStyleState(row.value); }
        else if (row.key === 'task_bg_enabled') setTaskBgEnabledState(row.value === 'true');
        else if (row.key === 'task_bg_color') setTaskBgColorState(row.value || '#3B82F6');
      });
    } catch {}
  }

  const setThemeMode = useCallback((m: ThemeMode) => {
    setThemeModeState(m);
    setSetting('theme_mode', m);
  }, []);

  const setDarkStart = useCallback((t: string) => {
    setDarkStartTime(t);
    setSetting('theme_dark_start', t);
  }, []);

  const setLightStart = useCallback((t: string) => {
    setLightStartTime(t);
    setSetting('theme_light_start', t);
  }, []);

  const setThemeStyle = useCallback((s: string) => {
    setThemeStyleState(s);
    setSetting('theme_style', s);
  }, []);

  const setTaskBgEnabled = useCallback((e: boolean) => {
    setTaskBgEnabledState(e);
    setSetting('task_bg_enabled', String(e));
  }, []);

  const setTaskBgColor = useCallback((c: string) => {
    setTaskBgColorState(c);
    setSetting('task_bg_color', c);
  }, []);

  const isDark = useMemo(() =>
    calcMode(themeMode, systemColorScheme, darkStartTime, lightStartTime) === 'dark',
    [themeMode, systemColorScheme, darkStartTime, lightStartTime]
  );

  const currentTheme = useMemo(() => {
    const m = calcMode(themeMode, systemColorScheme, darkStartTime, lightStartTime);
    return getTheme(themeStyle, m === 'dark');
  }, [themeStyle, themeMode, systemColorScheme, darkStartTime, lightStartTime]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme: currentTheme, themeMode, setThemeMode, darkStartTime, lightStartTime,
    setDarkStart, setLightStart, isDark,
    themeStyle, setThemeStyle, availableStyles: getAvailableStyles(),
    styleConfig: getStyleConfig(themeStyle),
    taskBgEnabled, taskBgColor, setTaskBgEnabled, setTaskBgColor,
  }), [currentTheme, themeMode, setThemeMode, darkStartTime, lightStartTime,
    setDarkStart, setLightStart, isDark, themeStyle, setThemeStyle,
    taskBgEnabled, taskBgColor, setTaskBgEnabled, setTaskBgColor]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
