/**
 * Background image state management.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { getSetting, setSetting, getSettingsByPrefix } from '../database/SettingsRepository';
import { initDatabase } from '../database/Database';

interface BackgroundContextValue {
  lightImageUri: string | null;
  darkImageUri: string | null;
  lightOpacity: number;
  darkOpacity: number;
  getCurrentImage: (isDark: boolean) => string | null;
  getCurrentOpacity: (isDark: boolean) => number;
  hasBackground: boolean;
  isLoading: boolean;
  permissionStatus: string;
  requestPermission: () => Promise<boolean>;
  selectImage: (mode?: 'light' | 'dark') => Promise<void>;
  setOpacity: (value: number, mode?: 'light' | 'dark') => void;
  removeBackground: () => Promise<void>;
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null);
const STORAGE_DIR = `${FileSystem.documentDirectory}backgrounds/`;

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [lightImageUri, setLightImageUri] = useState<string | null>(null);
  const [darkImageUri, setDarkImageUri] = useState<string | null>(null);
  const [lightOpacity, setLightOpacityState] = useState(0.6);
  const [darkOpacity, setDarkOpacityState] = useState(0.6);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  async function loadSettings() {
    try {
      await initDatabase();
      const settings = await getSettingsByPrefix('bg_');
      settings.forEach((row) => {
        if (row.key === 'bg_light_image_uri' && row.value) setLightImageUri(row.value);
        else if (row.key === 'bg_dark_image_uri' && row.value) setDarkImageUri(row.value);
        else if (row.key === 'bg_light_opacity') setLightOpacityState(parseFloat(row.value) || 0.6);
        else if (row.key === 'bg_dark_opacity') setDarkOpacityState(parseFloat(row.value) || 0.6);
      });
    } catch (e) {
      console.error('Background loadSettings failed:', e);
    } finally { setIsLoading(false); }
  }

  async function checkPermission() {
    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      setPermissionStatus(status);
    } catch {}
  }

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status === 'granted') { setPermissionStatus('granted'); return true; }
      if (!canAskAgain) {
        Alert.alert('需要相册权限', '请在系统设置中手动开启', [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => Linking.openSettings() },
        ]);
        setPermissionStatus('denied');
        return false;
      }
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissionStatus(result.status);
      return result.status === 'granted';
    } catch { return false; }
  }, []);

  const selectImage = useCallback(async (mode: 'light' | 'dark' = 'light') => {
    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const originalUri = result.assets[0].uri;
      const compressed = await ImageManipulator.manipulateAsync(originalUri, [{ resize: { width: 1080 } }], { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG });
      const dirInfo = await FileSystem.getInfoAsync(STORAGE_DIR);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
      const fileName = `background_${Date.now()}.jpg`;
      const destUri = `${STORAGE_DIR}${fileName}`;
      await FileSystem.copyAsync({ from: compressed.uri, to: destUri });
      const targetUri = mode === 'light' ? lightImageUri : darkImageUri;
      if (targetUri && targetUri.startsWith(STORAGE_DIR)) {
        try { await FileSystem.deleteAsync(targetUri); } catch {}
      }
      if (mode === 'light') {
        setLightImageUri(destUri);
        await setSetting('bg_light_image_uri', destUri);
      } else {
        setDarkImageUri(destUri);
        await setSetting('bg_dark_image_uri', destUri);
      }
    } catch {
      Alert.alert('选择失败', '无法打开相册，请检查权限设置');
    }
  }, [lightImageUri, darkImageUri, requestPermission]);

  const setOpacity = useCallback((value: number, mode: 'light' | 'dark' = 'light') => {
    if (mode === 'light') {
      setLightOpacityState(value);
      setSetting('bg_light_opacity', String(value)).catch(() => {});
    } else {
      setDarkOpacityState(value);
      setSetting('bg_dark_opacity', String(value)).catch(() => {});
    }
  }, []);

  const removeBackground = useCallback(async () => {
    try {
      if (lightImageUri && lightImageUri.startsWith(STORAGE_DIR)) {
        try { await FileSystem.deleteAsync(lightImageUri); } catch {}
      }
      if (darkImageUri && darkImageUri.startsWith(STORAGE_DIR)) {
        try { await FileSystem.deleteAsync(darkImageUri); } catch {}
      }
      setLightImageUri(null);
      setDarkImageUri(null);
      await setSetting('bg_light_image_uri', '');
      await setSetting('bg_dark_image_uri', '');
    } catch (e) {
      console.error('removeBackground failed:', e);
    }
  }, [lightImageUri, darkImageUri]);

  const getCurrentImage = useCallback((isDark: boolean) => isDark ? darkImageUri : lightImageUri, [lightImageUri, darkImageUri]);
  const getCurrentOpacity = useCallback((isDark: boolean) => isDark ? darkOpacity : lightOpacity, [lightOpacity, darkOpacity]);
  const hasBackground = useMemo(() => lightImageUri !== null || darkImageUri !== null, [lightImageUri, darkImageUri]);

  const value = useMemo<BackgroundContextValue>(() => ({
    lightImageUri, darkImageUri, lightOpacity, darkOpacity,
    getCurrentImage, getCurrentOpacity, hasBackground, isLoading,
    permissionStatus, requestPermission, selectImage, setOpacity, removeBackground,
  }), [lightImageUri, darkImageUri, lightOpacity, darkOpacity, hasBackground,
    isLoading, permissionStatus, requestPermission, selectImage, setOpacity,
    removeBackground, getCurrentImage, getCurrentOpacity]);

  return <BackgroundContext.Provider value={value}>{children}</BackgroundContext.Provider>;
}

export function useBackground(): BackgroundContextValue {
  const ctx = useContext(BackgroundContext);
  if (!ctx) throw new Error('useBackground must be used within BackgroundProvider');
  return ctx;
}
