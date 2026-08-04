/**
 * Font loading hook — manages custom font loading state.
 */

import { useState, useEffect, useCallback } from 'react';
import * as Font from 'expo-font';
import { FONT_LIST } from '../theme/fonts';

export function useFontLoader() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadFonts = useCallback(async () => {
    try {
      const fontMap: Record<string, any> = {};
      FONT_LIST.forEach((font) => {
        if (font.file) fontMap[font.id] = font.file;
      });
      await Font.loadAsync(fontMap);
      setLoaded(true);
    } catch (e: any) {
      console.error('Font loading failed:', e);
      setError(e);
      setLoaded(true);
    }
  }, []);

  useEffect(() => { loadFonts(); }, [loadFonts]);

  return { loaded, error };
}

export function isFontLoaded(fontId: string): boolean {
  if (fontId === 'default') return true;
  return Font.isLoaded(fontId);
}
