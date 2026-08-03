// 字体全局状态管理
// 职责：管理应用字体风格的切换、持久化、加载

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { initDatabase, getDatabase } from '../database/Database';
import { FONT_LIST, getFontConfig } from '../theme/fonts';

const FontContext = createContext();

export function FontProvider({ children }) {
  const [fontId, setFontIdState] = useState('default');

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
        const savedId = result[0].rows[0].value;
        // 验证字体ID是否有效
        const fontConfig = FONT_LIST.find((f) => f.id === savedId);
        if (fontConfig) {
          setFontIdState(savedId);
        }
      }
    } catch (e) {
      // 首次运行使用默认值
    }
  }

  const setFontId = useCallback((id) => {
    setFontIdState(id);
    saveFontSetting(id);
  }, []);

  async function saveFontSetting(id) {
    try {
      await initDatabase();
      const db = getDatabase();
      await db.execAsync(
        [{ sql: "INSERT OR REPLACE INTO app_setting (key, value) VALUES ('font_style', ?)", args: [id] }],
        false
      );
    } catch (e) {
      console.error('保存字体设置失败:', e);
    }
  }

  const currentFont = useMemo(() => getFontConfig(fontId), [fontId]);

  const value = useMemo(() => ({
    fontId,
    setFontId,
    currentFont,
    fontList: FONT_LIST,
  }), [fontId, setFontId, currentFont]);

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
