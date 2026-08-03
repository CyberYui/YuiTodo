// 字体加载Hook：管理自定义字体的加载状态
import { useState, useEffect, useCallback } from 'react';
import * as Font from 'expo-font';
import { FONT_LIST } from '../theme/fonts';

export function useFontLoader() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const loadFonts = useCallback(async () => {
    try {
      const fontMap = {};
      FONT_LIST.forEach((font) => {
        if (font.file) {
          fontMap[font.id] = font.file;
        }
      });

      await Font.loadAsync(fontMap);
      setLoaded(true);
    } catch (e) {
      console.error('字体加载失败:', e);
      setError(e);
      setLoaded(true); // 即使失败也继续，使用系统字体
    }
  }, []);

  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  return { loaded, error };
}

// 检查字体是否已加载
export function isFontLoaded(fontId) {
  if (fontId === 'default') return true;
  return Font.isLoaded(fontId);
}
