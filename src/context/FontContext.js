// 字体全局状态管理
// 职责：管理应用字体风格的切换和持久化

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { initDatabase, getDatabase } from '../database/Database';

export const FontStyle = {
  DEFAULT: 'default',
  ROUNDED: 'rounded',
  HARD: 'hard',
  ELEGANT: 'elegant',
};

export const FontStyleLabels = {
  [FontStyle.DEFAULT]: '系统默认',
  [FontStyle.ROUNDED]: '圆润可爱',
  [FontStyle.HARD]: '硬朗简洁',
  [FontStyle.ELEGANT]: '优雅文艺',
};

// Android系统字体映射（视觉差异明显的字体）
export const FontFamilyMap = {
  [FontStyle.DEFAULT]: 'sans-serif',
  [FontStyle.ROUNDED]: 'sans-serif-light',
  [FontStyle.HARD]: 'monospace',
  [FontStyle.ELEGANT]: 'serif',
};

// 字体样式（用于增强视觉差异）
export const FontStyleMap = {
  [FontStyle.DEFAULT]: { fontWeight: 'normal', fontStyle: 'normal' },
  [FontStyle.ROUNDED]: { fontWeight: '300', fontStyle: 'normal' },
  [FontStyle.HARD]: { fontWeight: 'bold', fontStyle: 'normal' },
  [FontStyle.ELEGANT]: { fontWeight: 'normal', fontStyle: 'italic' },
};

const FontContext = createContext();

export function FontProvider({ children }) {
  const [fontStyle, setFontStyleState] = useState(FontStyle.DEFAULT);

  useEffect(() => {
    loadFontSetting();
  }, []);

  async function loadFontSetting() {
    try {
      await initDatabase();
      const db = getDatabase();
      const result = await db.execAsync(
        [{ sql: "SELECT value FROM app_setting WHERE key='font_style'", args: [] }],
        true
      );
      if (result[0].rows.length > 0) {
        setFontStyleState(result[0].rows[0].value);
      }
    } catch (e) {
      // 首次运行使用默认值
    }
  }

  const setFontStyle = useCallback((style) => {
    setFontStyleState(style);
    saveFontSetting(style);
  }, []);

  async function saveFontSetting(style) {
    try {
      await initDatabase();
      const db = getDatabase();
      await db.execAsync(
        [{ sql: "INSERT OR REPLACE INTO app_setting (key, value) VALUES ('font_style', ?)", args: [style] }],
        false
      );
    } catch (e) {
      console.error('保存字体设置失败:', e);
    }
  }

  const fontFamily = FontFamilyMap[fontStyle] || 'sans-serif';

  const value = useMemo(() => ({
    fontStyle,
    setFontStyle,
    fontFamily,
    fontStyleLabel: FontStyleLabels[fontStyle] || '系统默认',
  }), [fontStyle, setFontStyle, fontFamily]);

  return (
    <FontContext.Provider value={value}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont必须在FontProvider内部使用');
  }
  return context;
}
