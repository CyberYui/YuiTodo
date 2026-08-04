/**
 * Font state management — font selection, persistence, loading.
 * CRITICAL: Fonts MUST be loaded before rendering any text with custom fontFamily.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { getSetting, setSetting } from '../database/SettingsRepository';
import { FONT_LIST, getFontConfig } from '../theme/fonts';
import { initDatabase } from '../database/Database';

interface FontContextValue {
  fontId: string;
  setFontId: (id: string) => void;
  currentFont: ReturnType<typeof getFontConfig>;
  fontList: typeof FONT_LIST;
  fontsLoaded: boolean;
}

const FontContext = createContext<FontContextValue | null>(null);

// Pre-load all custom fonts used by the app
const FONT_MAP: Record<string, any> = {};
FONT_LIST.forEach((font) => {
  if (font.file) {
    FONT_MAP[font.id] = font.file;
  }
});

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [fontId, setFontIdState] = useState('default');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  // Step 1: Load all custom fonts on mount
  useEffect(() => {
    let mounted = true;
    async function loadFonts() {
      try {
        if (Object.keys(FONT_MAP).length > 0) {
          await Font.loadAsync(FONT_MAP);
        }
      } catch (e) {
        console.error('Font loading failed:', e);
      } finally {
        if (mounted) setFontsLoaded(true);
      }
    }
    loadFonts();
    return () => { mounted = false; };
  }, []);

  // Step 2: After fonts loaded, load saved font setting from DB
  useEffect(() => {
    if (!fontsLoaded) return;
    let mounted = true;
    async function loadFontSetting() {
      try {
        await initDatabase();
        const savedId = await getSetting('font_style');
        if (mounted && savedId && FONT_LIST.find((f) => f.id === savedId)) {
          setFontIdState(savedId);
        }
      } catch (e) {
        console.error('Failed to load font setting:', e);
      } finally {
        if (mounted) setDbReady(true);
      }
    }
    loadFontSetting();
    return () => { mounted = false; };
  }, [fontsLoaded]);

  const setFontId = useCallback((id: string) => {
    setFontIdState(id);
    // Fire-and-forget DB write (don't block UI)
    setSetting('font_style', id).catch(() => {});
  }, []);

  const currentFont = useMemo(() => getFontConfig(fontId), [fontId]);

  const value = useMemo<FontContextValue>(() => ({
    fontId, setFontId, currentFont, fontList: FONT_LIST, fontsLoaded,
  }), [fontId, setFontId, currentFont, fontsLoaded]);

  // Don't render until fonts are loaded to prevent crash from missing font
  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
}

export function useFont(): FontContextValue {
  const ctx = useContext(FontContext);
  if (!ctx) throw new Error('useFont must be used within FontProvider');
  return ctx;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
});
