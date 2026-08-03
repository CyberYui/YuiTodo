// 主题全局状态管理
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, getStyleConfig, getAvailableStyles, THEME_STYLES } from '../theme/colors';
import { initDatabase, getDatabase } from '../database/Database';

export const ThemeMode = { AUTO: 'auto', LIGHT: 'light', DARK: 'dark', SCHEDULED: 'scheduled' };
export const ThemeModeLabels = { [ThemeMode.AUTO]: '跟随系统', [ThemeMode.LIGHT]: '浅色模式', [ThemeMode.DARK]: '深色模式', [ThemeMode.SCHEDULED]: '定时切换' };

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState(ThemeMode.AUTO);
  const [darkStartTime, setDarkStartTime] = useState('21:00');
  const [lightStartTime, setLightStartTime] = useState('07:00');
  const [themeStyle, setThemeStyleState] = useState('sorted');
  const [taskBgEnabled, setTaskBgEnabledState] = useState(false);
  const [taskBgColor, setTaskBgColorState] = useState('#3B82F6');

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      await initDatabase();
      const db = getDatabase();
      const result = await db.execAsync([{ sql: 'SELECT key, value FROM app_setting WHERE key LIKE "theme_%"', args: [] }], true);
      const rows = result[0].rows;
      rows.forEach((row) => {
        if (row.key === 'theme_mode') setThemeModeState(row.value);
        else if (row.key === 'theme_dark_start') setDarkStartTime(row.value);
        else if (row.key === 'theme_light_start') setLightStartTime(row.value);
        else if (row.key === 'theme_style') { if (THEME_STYLES[row.value]) setThemeStyleState(row.value); }
        else if (row.key === 'task_bg_enabled') setTaskBgEnabledState(row.value === 'true');
        else if (row.key === 'task_bg_color') setTaskBgColorState(row.value || '#3B82F6');
      });
    } catch (e) {}
  }

  async function saveSetting(key, value) {
    try { await initDatabase(); const db = getDatabase(); await db.execAsync([{ sql: 'INSERT OR REPLACE INTO app_setting (key, value) VALUES (?, ?)', args: [key, value] }], false); } catch (e) {}
  }

  const setThemeMode = useCallback((m) => { setThemeModeState(m); saveSetting('theme_mode', m); }, []);
  const setDarkStart = useCallback((t) => { setDarkStartTime(t); saveSetting('theme_dark_start', t); }, []);
  const setLightStart = useCallback((t) => { setLightStartTime(t); saveSetting('theme_light_start', t); }, []);
  const setThemeStyle = useCallback((s) => { setThemeStyleState(s); saveSetting('theme_style', s); }, []);
  const setTaskBgEnabled = useCallback((e) => { setTaskBgEnabledState(e); saveSetting('task_bg_enabled', String(e)); }, []);
  const setTaskBgColor = useCallback((c) => { setTaskBgColorState(c); saveSetting('task_bg_color', c); }, []);

  const isDark = useMemo(() => calcMode(themeMode, systemColorScheme, darkStartTime, lightStartTime) === 'dark', [themeMode, systemColorScheme, darkStartTime, lightStartTime]);
  const currentTheme = useMemo(() => { const m = calcMode(themeMode, systemColorScheme, darkStartTime, lightStartTime); return getTheme(themeStyle, m === 'dark'); }, [themeStyle, themeMode, systemColorScheme, darkStartTime, lightStartTime]);

  const value = useMemo(() => ({
    theme: currentTheme, themeMode, setThemeMode, darkStartTime, lightStartTime, setDarkStart, setLightStart, isDark,
    themeStyle, setThemeStyle, availableStyles: getAvailableStyles(), styleConfig: getStyleConfig(themeStyle),
    taskBgEnabled, taskBgColor, setTaskBgEnabled, setTaskBgColor,
  }), [currentTheme, themeMode, setThemeMode, darkStartTime, lightStartTime, setDarkStart, setLightStart, isDark, themeStyle, setThemeStyle, taskBgEnabled, taskBgColor, setTaskBgEnabled, setTaskBgColor]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function calcMode(mode, scheme, darkStart, lightStart) {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  if (mode === 'scheduled') return isTimeForDark(darkStart, lightStart) ? 'dark' : 'light';
  return scheme === 'dark' ? 'dark' : 'light';
}

function isTimeForDark(darkStart, lightStart) {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  const [dh, dm] = darkStart.split(':').map(Number);
  const [lh, lm] = lightStart.split(':').map(Number);
  const dMin = dh * 60 + dm, lMin = lh * 60 + lm;
  return dMin > lMin ? (m >= dMin || m < lMin) : (m >= dMin && m < lMin);
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme必须在ThemeProvider内部使用');
  return ctx;
}
