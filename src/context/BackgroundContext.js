// 背景图片全局状态管理
// 职责：管理任务列表背景图片的选择、压缩、透明度、持久化

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { initDatabase, getDatabase } from '../database/Database';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const BackgroundContext = createContext();

const STORAGE_DIR = `${FileSystem.documentDirectory}backgrounds/`;

export function BackgroundProvider({ children }) {
  const [imageUri, setImageUri] = useState(null);
  const [opacity, setOpacityState] = useState(0.6);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      await initDatabase();
      const db = getDatabase();
      const result = await db.execAsync(
        [{ sql: "SELECT key, value FROM app_setting WHERE key LIKE 'background_%'", args: [] }],
        true
      );
      const rows = result[0].rows;
      rows.forEach((row) => {
        if (row.key === 'background_image_uri' && row.value) {
          setImageUri(row.value);
        } else if (row.key === 'background_opacity') {
          setOpacityState(parseFloat(row.value) || 0.6);
        }
      });
    } catch (e) {
      // 首次运行使用默认值
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSetting(key, value) {
    try {
      await initDatabase();
      const db = getDatabase();
      await db.execAsync(
        [{ sql: "INSERT OR REPLACE INTO app_setting (key, value) VALUES (?, ?)", args: [key, value] }],
        false
      );
    } catch (e) {
      console.error('保存背景设置失败:', e);
    }
  }

  const selectImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '请允许访问相册以选择背景图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const originalUri = result.assets[0].uri;

    const compressed = await ImageManipulator.manipulateAsync(
      originalUri,
      [{ resize: { width: 1080 } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
    );

    const dirInfo = await FileSystem.getInfoAsync(STORAGE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
    }

    const fileName = `background_${Date.now()}.jpg`;
    const destUri = `${STORAGE_DIR}${fileName}`;
    await FileSystem.copyAsync({ from: compressed.uri, to: destUri });

    if (imageUri && imageUri.startsWith(STORAGE_DIR)) {
      try { await FileSystem.deleteAsync(imageUri); } catch (e) {}
    }

    setImageUri(destUri);
    await saveSetting('background_image_uri', destUri);
  }, [imageUri]);

  const setOpacity = useCallback((value) => {
    setOpacityState(value);
    saveSetting('background_opacity', String(value));
  }, []);

  const removeBackground = useCallback(async () => {
    if (imageUri && imageUri.startsWith(STORAGE_DIR)) {
      try { await FileSystem.deleteAsync(imageUri); } catch (e) {}
    }
    setImageUri(null);
    await saveSetting('background_image_uri', '');
  }, [imageUri]);

  const hasBackground = useMemo(() => imageUri !== null, [imageUri]);

  const value = useMemo(() => ({
    imageUri,
    opacity,
    hasBackground,
    isLoading,
    selectImage,
    setOpacity,
    removeBackground,
  }), [imageUri, opacity, hasBackground, isLoading, selectImage, setOpacity, removeBackground]);

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground必须在BackgroundProvider内部使用');
  }
  return context;
}
