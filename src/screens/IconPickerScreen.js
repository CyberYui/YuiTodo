// App图标选择页面
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { APP_ICONS, getAppIcon } from '../theme/appIcons';
import { initDatabase, getDatabase } from '../database/Database';
import ThemedText from '../components/ThemedText';
import IconChanger from '../../modules/icon-changer';

export default function IconPickerScreen({ navigation }) {
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState('icon1');
  const styles = createStyles(theme);

  useEffect(() => {
    loadSelection();
  }, []);

  async function loadSelection() {
    try {
      await initDatabase();
      const db = getDatabase();
      const result = await db.execAsync([{ sql: "SELECT value FROM app_setting WHERE key='app_icon'", args: [] }], true);
      if (result[0].rows.length > 0) setSelectedId(result[0].rows[0].value);
    } catch (e) {}
  }

  async function saveSelection(id) {
    try {
      // 调用原生模块更换图标
      IconChanger.changeIcon(id);
      // 保存设置到数据库
      await initDatabase();
      const db = getDatabase();
      await db.execAsync([{ sql: "INSERT OR REPLACE INTO app_setting (key, value) VALUES ('app_icon', ?)", args: [id] }], false);
      setSelectedId(id);
      Alert.alert('图标已更换', '桌面图标已更新，如未生效请重启设备');
    } catch (e) {
      Alert.alert('保存失败', '无法保存图标设置');
    }
  }

  const renderItem = ({ item }) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity style={[styles.iconCard, { borderColor: isSelected ? theme.primary : theme.separator, backgroundColor: theme.cardBackground }]} onPress={() => saveSelection(item.id)}>
        <Image source={item.file} style={styles.iconImage} />
        <ThemedText style={[styles.iconName, { color: isSelected ? theme.primary : theme.textPrimary }]}>{item.name}</ThemedText>
        {isSelected && <Text style={[styles.checkMark, { color: theme.primary }]}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={APP_ICONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, paddingTop: 16 },
    grid: { paddingHorizontal: 16 },
    row: { gap: 12, justifyContent: 'space-between' },
    iconCard: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, marginBottom: 12, position: 'relative' },
    iconImage: { width: 60, height: 60, borderRadius: 12, marginBottom: 8 },
    iconName: { fontSize: 12, fontWeight: '500' },
    checkMark: { position: 'absolute', top: 8, right: 8, fontSize: 16, fontWeight: '700' },
  });
}
