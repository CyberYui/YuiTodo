// 主题全局状态管理（完整版）
// 负责：管理日间/夜间模式的切换逻辑
// 支持：跟随系统 / 强制浅色 / 强制深色 / 定时切换

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, getStyleConfig, getAvailableStyles, hexToRgba } from '../theme/colors';
import { initDatabase, getDatabase } from '../database/Database';

export const ThemeMode = {
  AUTO: 'auto',
  LIGHT: 'light',
  DARK: 'dark',
  SCHEDULED: 'scheduled',
};

export const ThemeModeLabels = {
  [ThemeMode.AUTO]: '跟随系统',
  [ThemeMode.LIGHT]: '浅色模式',
  [ThemeMode.DARK]: '深色模式',
  [ThemeMode.SCHEDULED]: '定时切换',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState(ThemeMode.AUTO);
  const [darkStartTime, setDarkStartTime] = useState('21:00');
  const [lightStartTime, setLightStartTime] = useState('07:00');
  const [themeStyle, setThemeStyleState] = useState('sorted');
  const [taskBgEnabled, setTaskBgEnabledState] = useState(false);
  const [taskBgColor, setTaskBgColorState] = useState('#3B82F6');

  useEffect(() => {
    loadThemeSettings();
  }, []);

  async function loadThemeSettings() {
    try {
      await initDatabase();
      const db = getDatabase();
      const result = await db.execAsync(
        [{ sql: 'SELECT key, value FROM app_setting WHERE key LIKE "theme_%"', args: [] }],
        true
      );
      const rows = result[0].rows;
      rows.forEach((row) => {
        if (row.key === 'theme_mode') setThemeModeState(row.value);
        else if (row.key === 'theme_dark_start') setDarkStartTime(row.value);
        else if (row.key === 'theme_light_start') setLightStartTime(row.value);
        else if (row.key === 'theme_style') {
          const validStyles = ['sorted', 'apple', 'microsoft', 'glass', 'notion', 'sunset', 'forest', 'midnight'];
          if (validStyles.includes(row.value)) setThemeStyleState(row.value);
        }
        else if (row.key === 'task_bg_enabled') setTaskBgEnabledState(row.value === 'true');
        else if (row.key === 'task_bg_color') setTaskBgColorState(row.value || '#3B82F6');
      });
    } catch (error) {
      // 首次运行无设置，使用默认值
    }
  }

  async function saveThemeSetting(key, value) {
    try {
      await initDatabase();
      const db = getDatabase();
      await db.execAsync(
        [{ sql: 'INSERT OR REPLACE INTO app_setting (key, value) VALUES (?, ?)', args: [key, value] }],
        false
      );
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  }

  const setThemeMode = useCallback((mode) => {
    setThemeModeState(mode);
    saveThemeSetting('theme_mode', mode);
  }, []);

  const setDarkStart = useCallback((time) => {
    setDarkStartTime(time);
    saveThemeSetting('theme_dark_start', time);
  }, []);

  const setLightStart = useCallback((time) => {
    setLightStartTime(time);
    saveThemeSetting('theme_light_start', time);
  }, []);

  const setThemeStyle = useCallback((styleId) => {
    setThemeStyleState(styleId);
    saveThemeSetting('theme_style', styleId);
  }, []);

  const setTaskBgEnabled = useCallback((enabled) => {
    setTaskBgEnabledState(enabled);
    saveThemeSetting('task_bg_enabled', String(enabled));
  }, []);

  const setTaskBgColor = useCallback((color) => {
    setTaskBgColorState(color);
    saveThemeSetting('task_bg_color', color);
  }, []);

  const isDark = useMemo(() => {
    return calculateThemeMode(themeMode, systemColorScheme, darkStartTime, lightStartTime) === 'dark';
  }, [themeMode, systemColorScheme, darkStartTime, lightStartTime]);

  const currentTheme = useMemo(() => {
    const mode = calculateThemeMode(themeMode, systemColorScheme, darkStartTime, lightStartTime);
    return getTheme(themeStyle, mode === 'dark');
  }, [themeStyle, themeMode, systemColorScheme, darkStartTime, lightStartTime]);

  useEffect(() => {
    if (themeMode !== ThemeMode.SCHEDULED) return;
    const interval = setInterval(() => {
      setThemeModeState((prev) => prev);
    }, 60000);
    return () => clearInterval(interval);
  }, [themeMode]);

  const value = useMemo(() => ({
    theme: currentTheme,
    themeMode,
    setThemeMode,
    darkStartTime,
    lightStartTime,
    setDarkStart,
    setLightStart,
    isDark,
    themeStyle,
    setThemeStyle,
    availableStyles: getAvailableStyles(),
    styleConfig: getStyleConfig(themeStyle),
    taskBgEnabled,
    taskBgColor,
    setTaskBgEnabled,
    setTaskBgColor,
  }), [currentTheme, themeMode, setThemeMode, darkStartTime, lightStartTime, setDarkStart, setLightStart, isDark, themeStyle, setThemeStyle, taskBgEnabled, taskBgColor, setTaskBgEnabled, setTaskBgColor]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function calculateThemeMode(mode, systemScheme, darkStart, lightStart) {
  switch (mode) {
    case 'light': return 'light';
    case 'dark': return 'dark';
    case 'scheduled': return isTimeForDark(darkStart, lightStart) ? 'dark' : 'light';
    case 'auto':
    default: return systemScheme === 'dark' ? 'dark' : 'light';
  }
}

function isTimeForDark(darkStart, lightStart) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [darkH, darkM] = darkStart.split(':').map(Number);
  const [lightH, lightM] = lightStart.split(':').map(Number);
  const darkMinutes = darkH * 60 + darkM;
  const lightMinutes = lightH * 60 + lightM;

  if (darkMinutes > lightMinutes) {
    return currentMinutes >= darkMinutes || currentMinutes < lightMinutes;
  } else {
    return currentMinutes >= darkMinutes && currentMinutes < lightMinutes;
  }
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
}
