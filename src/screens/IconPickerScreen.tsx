/**
 * App icon picker — grid selection with native icon changer.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { APP_ICONS, getAppIcon } from '../theme/appIcons';
import { setSetting } from '../database/SettingsRepository';
import { getSetting } from '../database/SettingsRepository';
import { initDatabase } from '../database/Database';
import { ThemedText } from '../components';
import IconChanger from '../../modules/icon-changer';

export default function IconPickerScreen() {
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState('icon1');

  useEffect(() => { loadSelection(); }, []);

  async function loadSelection() {
    try {
      await initDatabase();
      const savedId = await getSetting('app_icon');
      if (savedId) setSelectedId(savedId);
    } catch {}
  }

  async function saveSelection(id: string) {
    try {
      IconChanger.changeIcon(id);
      await initDatabase();
      await setSetting('app_icon', id);
      setSelectedId(id);
      Alert.alert('图标已更换', '桌面图标已更新，如未生效请重启设备');
    } catch {
      Alert.alert('保存失败', '无法保存图标设置');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: 16 }}>
      <FlatList data={APP_ICONS}
        renderItem={({ item }) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity style={{ flex: 1, alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: isSelected ? theme.primary : theme.separator, backgroundColor: theme.cardBackground, marginBottom: 12, position: 'relative' }}
              onPress={() => saveSelection(item.id)}>
              <Image source={item.file} style={{ width: 60, height: 60, borderRadius: 12, marginBottom: 8 }} />
              <ThemedText style={{ fontSize: 12, fontWeight: '500', color: isSelected ? theme.primary : theme.textPrimary }}>{item.name}</ThemedText>
              {isSelected && <Text style={{ position: 'absolute', top: 8, right: 8, fontSize: 16, fontWeight: '700', color: theme.primary }}>✓</Text>}
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id} numColumns={3} contentContainerStyle={{ paddingHorizontal: 16 }} columnWrapperStyle={{ gap: 12, justifyContent: 'space-between' }} />
    </View>
  );
}
