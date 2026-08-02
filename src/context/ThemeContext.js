// 主题全局状态管理（完整版）
// 负责：管理日间/夜间模式的切换逻辑
// 支持：跟随系统 / 强制浅色 / 强制深色 / 定时切换
//
// 定时切换规则：
// - 用户设置"日落时间"和"日出时间"
// - 当前时间 >= 日落时间 且 < 日出时间 → 深色模式
// - 其他时段 → 浅色模式

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme } from '../theme/colors';
import { initDatabase, getDatabase } from '../database/Database';

// 主题切换模式枚举
export const ThemeMode = {
  AUTO: 'auto',       // 跟随系统
  LIGHT: 'light',     // 强制浅色
  DARK: 'dark',       // 强制深色
  SCHEDULED: 'scheduled', // 定时切换
};

// 主题模式中文标签
export const ThemeModeLabels = {
  [ThemeMode.AUTO]: '跟随系统',
  [ThemeMode.LIGHT]: '浅色模式',
  [ThemeMode.DARK]: '深色模式',
  [ThemeMode.SCHEDULED]: '定时切换',
};

// 创建Context
const ThemeContext = createContext();

/**
 * 主题Provider组件
 */
export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState(ThemeMode.AUTO);
  const [darkStartTime, setDarkStartTime] = useState('21:00'); // 默认深色模式开始时间（21:00）
  const [lightStartTime, setLightStartTime] = useState('07:00'); // 默认浅色模式开始时间（07:00）

  // 从数据库加载主题设置
  useEffect(() => {
    loadThemeSettings();
  }, []);

  /**
   * 从数据库加载主题设置
   */
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
      });
    } catch (error) {
      // 首次运行无设置，使用默认值
    }
  }

  /**
   * 保存主题设置到数据库
   */
  async function saveThemeSetting(key, value) {
    try {
      await initDatabase();
      const db = getDatabase();
      await db.execAsync(
        [{
          sql: `INSERT OR REPLACE INTO app_setting (key, value) VALUES (?, ?)`,
          args: [key, value],
        }],
        false
      );
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  }

  /**
   * 设置主题模式（同时持久化到数据库）
   */
  const setThemeMode = useCallback((mode) => {
    setThemeModeState(mode);
    saveThemeSetting('theme_mode', mode);
  }, []);

  /**
   * 设置深色模式开始时间
   */
  const setDarkStart = useCallback((time) => {
    setDarkStartTime(time);
    saveThemeSetting('theme_dark_start', time);
  }, []);

  /**
   * 设置浅色模式开始时间
   */
  const setLightStart = useCallback((time) => {
    setLightStartTime(time);
    saveThemeSetting('theme_light_start', time);
  }, []);

  /**
   * 计算当前应使用的主题
   */
  const currentTheme = useMemo(() => {
    return calculateCurrentTheme(themeMode, systemColorScheme, darkStartTime, lightStartTime);
  }, [themeMode, systemColorScheme, darkStartTime, lightStartTime]);

  /**
   * 定时模式：每分钟检查一次是否需要切换主题
   */
  useEffect(() => {
    if (themeMode !== ThemeMode.SCHEDULED) return;
    const interval = setInterval(() => {
      // 触发重新计算
      setThemeModeState((prev) => prev); // 强制刷新
    }, 60000); // 每分钟检查一次
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
    isDark: currentTheme === DarkTheme,
  }), [currentTheme, themeMode, setThemeMode, darkStartTime, lightStartTime, setDarkStart, setLightStart]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * 根据模式和系统设置，计算当前应使用的主题
 */
function calculateCurrentTheme(mode, systemScheme, darkStart, lightStart) {
  switch (mode) {
    case ThemeMode.LIGHT:
      return LightTheme;
    case ThemeMode.DARK:
      return DarkTheme;
    case ThemeMode.SCHEDULED:
      return isTimeForDark(darkStart, lightStart) ? DarkTheme : LightTheme;
    case ThemeMode.AUTO:
    default:
      return systemScheme === 'dark' ? DarkTheme : LightTheme;
  }
}

/**
 * 判断当前时间是否应该使用深色模式
 * @param {string} darkStart - 深色模式开始时间 "HH:mm"
 * @param {string} lightStart - 浅色模式开始时间 "HH:mm"
 * @returns {boolean}
 */
function isTimeForDark(darkStart, lightStart) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [darkH, darkM] = darkStart.split(':').map(Number);
  const [lightH, lightM] = lightStart.split(':').map(Number);
  const darkMinutes = darkH * 60 + darkM;
  const lightMinutes = lightH * 60 + lightM;

  if (darkMinutes > lightMinutes) {
    // 例如：21:00 - 07:00（跨午夜）
    return currentMinutes >= darkMinutes || currentMinutes < lightMinutes;
  } else {
    // 例如：07:00 - 21:00（不跨午夜）
    return currentMinutes >= darkMinutes && currentMinutes < lightMinutes;
  }
}

/**
 * 自定义Hook：在子组件中获取主题
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
}
