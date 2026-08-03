// 背景图片全局状态管理
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Linking } from 'react-native';
import { initDatabase, getDatabase } from '../database/Database';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const BackgroundContext = createContext();
const STORAGE_DIR = `${FileSystem.documentDirectory}backgrounds/`;

export function BackgroundProvider({ children }) {
  const [lightImageUri, setLightImageUri] = useState(null);
  const [darkImageUri, setDarkImageUri] = useState(null);
  const [lightOpacity, setLightOpacityState] = useState(0.6);
  const [darkOpacity, setDarkOpacityState] = useState(0.6);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');

  useEffect(() => { loadSettings(); checkPermission(); }, []);

  async function loadSettings() {
    try {
      await initDatabase();
      const db = getDatabase();
      const result = await db.execAsync([{ sql: "SELECT key, value FROM app_setting WHERE key LIKE 'background_%'", args: [] }], true);
      const rows = result[0].rows;
      rows.forEach((row) => {
        if (row.key === 'bg_light_image_uri' && row.value) setLightImageUri(row.value);
        else if (row.key === 'bg_dark_image_uri' && row.value) setDarkImageUri(row.value);
        else if (row.key === 'bg_light_opacity') setLightOpacityState(parseFloat(row.value) || 0.6);
        else if (row.key === 'bg_dark_opacity') setDarkOpacityState(parseFloat(row.value) || 0.6);
      });
    } catch (e) {} finally { setIsLoading(false); }
  }

  async function saveSetting(key, value) {
    try { await initDatabase(); const db = getDatabase(); await db.execAsync([{ sql: "INSERT OR REPLACE INTO app_setting (key, value) VALUES (?, ?)", args: [key, value] }], false); } catch (e) {}
  }

  async function checkPermission() {
    try { const { status } = await ImagePicker.getMediaLibraryPermissionsAsync(); setPermissionStatus(status); } catch (e) {}
  }

  const requestPermission = useCallback(async () => {
    try {
      const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status === 'granted') { setPermissionStatus('granted'); return true; }
      if (!canAskAgain) { Alert.alert('需要相册权限', '请在系统设置中手动开启', [{ text: '取消', style: 'cancel' }, { text: '去设置', onPress: () => Linking.openSettings() }]); setPermissionStatus('denied'); return false; }
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissionStatus(result.status);
      return result.status === 'granted';
    } catch (e) { return false; }
  }, []);

  const selectImage = useCallback(async (mode = 'light') => {
    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') { const granted = await requestPermission(); if (!granted) return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 1 });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const originalUri = result.assets[0].uri;
      const compressed = await ImageManipulator.manipulateAsync(originalUri, [{ resize: { width: 1080 } }], { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG });
      const dirInfo = await FileSystem.getInfoAsync(STORAGE_DIR);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
      const fileName = `background_${Date.now()}.jpg`;
      const destUri = `${STORAGE_DIR}${fileName}`;
      await FileSystem.copyAsync({ from: compressed.uri, to: destUri });
      const targetUri = mode === 'light' ? lightImageUri : darkImageUri;
      if (targetUri && targetUri.startsWith(STORAGE_DIR)) { try { await FileSystem.deleteAsync(targetUri); } catch (e) {} }
      if (mode === 'light') { setLightImageUri(destUri); await saveSetting('bg_light_image_uri', destUri); }
      else { setDarkImageUri(destUri); await saveSetting('bg_dark_image_uri', destUri); }
    } catch (e) { Alert.alert('选择失败', '无法打开相册，请检查权限设置'); }
  }, [lightImageUri, darkImageUri, requestPermission]);

  const setOpacity = useCallback((value, mode = 'light') => {
    if (mode === 'light') { setLightOpacityState(value); saveSetting('bg_light_opacity', String(value)); }
    else { setDarkOpacityState(value); saveSetting('bg_dark_opacity', String(value)); }
  }, []);

  const removeBackground = useCallback(async () => {
    if (lightImageUri && lightImageUri.startsWith(STORAGE_DIR)) try { await FileSystem.deleteAsync(lightImageUri); } catch (e) {}
    if (darkImageUri && darkImageUri.startsWith(STORAGE_DIR)) try { await FileSystem.deleteAsync(darkImageUri); } catch (e) {}
    setLightImageUri(null); setDarkImageUri(null);
    await saveSetting('bg_light_image_uri', ''); await saveSetting('bg_dark_image_uri', '');
  }, [lightImageUri, darkImageUri]);

  // 根据深浅模式返回对应的图片和透明度
  const getCurrentImage = useCallback((isDark) => isDark ? darkImageUri : lightImageUri, [lightImageUri, darkImageUri]);
  const getCurrentOpacity = useCallback((isDark) => isDark ? darkOpacity : lightOpacity, [lightOpacity, darkOpacity]);

  const hasBackground = useMemo(() => lightImageUri !== null || darkImageUri !== null, [lightImageUri, darkImageUri]);

  const value = useMemo(() => ({
    lightImageUri, darkImageUri, lightOpacity, darkOpacity,
    getCurrentImage, getCurrentOpacity,
    hasBackground, isLoading, permissionStatus, requestPermission,
    selectImage, setOpacity, removeBackground,
  }), [lightImageUri, darkImageUri, lightOpacity, darkOpacity, hasBackground, isLoading, permissionStatus, requestPermission, selectImage, setOpacity, removeBackground, getCurrentImage, getCurrentOpacity]);

  return <BackgroundContext.Provider value={value}>{children}</BackgroundContext.Provider>;
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) throw new Error('useBackground必须在BackgroundProvider内部使用');
  return context;
}
