// 提醒设置页面
// 职责：开关、时间列表、添加/删除时间、权限提示

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { useReminder } from '../context/ReminderContext';
import ThemedText from '../components/ThemedText';

export default function ReminderSettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const { enabled, times, permissionStatus, setEnabled, addTime, removeTime } = useReminder();
  const [showPicker, setShowPicker] = useState(false);
  const styles = createStyles(theme);

  const handleToggle = (value) => {
    setEnabled(value);
  };

  const handleAddTime = () => {
    setShowPicker(true);
  };

  const handlePickerChange = (event, selectedDate) => {
    setShowPicker(false);
    if (event.type === 'dismissed' || !selectedDate) return;
    const hours = String(selectedDate.getHours()).padStart(2, '0');
    const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    if (times.includes(timeStr)) {
      Alert.alert('重复', '该时间点已存在');
      return;
    }
    addTime(timeStr);
  };

  const handleRemoveTime = (index) => {
    Alert.alert('移除提醒', `确定要移除 ${times[index]} 的提醒吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '移除', style: 'destructive', onPress: () => removeTime(index) },
    ]);
  };

  const renderTimeItem = ({ item, index }) => (
    <View style={[styles.timeItem, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
      <ThemedText style={[styles.timeText, { color: theme.textPrimary }]}>⏰ {item}</ThemedText>
      <TouchableOpacity onPress={() => handleRemoveTime(index)} style={styles.removeButton}>
        <ThemedText style={[styles.removeText, { color: theme.danger }]}>移除</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
        <View style={styles.switchRow}>
          <View style={styles.switchLeft}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textPrimary }]}>每日提醒</ThemedText>
            <ThemedText style={[styles.sectionSub, { color: theme.textSecondary }]}>
              {enabled ? `已开启 · ${times.length} 个时间点` : '已关闭'}
            </ThemedText>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: theme.separator, true: theme.primary + '60' }}
            thumbColor={enabled ? theme.primary : '#f4f3f4'}
          />
        </View>
        {permissionStatus === 'denied' && (
          <ThemedText style={[styles.permissionWarn, { color: theme.danger }]}>
            通知权限被拒绝，请在系统设置中开启
          </ThemedText>
        )}
      </View>

      {enabled && (
        <View style={styles.timeSection}>
          <ThemedText style={[styles.label, { color: theme.textTertiary }]}>提醒时间</ThemedText>
          <FlatList
            data={times}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={renderTimeItem}
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.primary }]}
            onPress={handleAddTime}
          >
            <ThemedText style={[styles.addButtonText, { color: theme.primary }]}>+ 添加提醒时间</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'android' ? 'spinner' : 'default'}
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    section: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    switchLeft: { flex: 1 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    sectionSub: { fontSize: 13 },
    permissionWarn: { fontSize: 12, marginTop: 8 },
    timeSection: { flex: 1 },
    label: { fontSize: 12, fontWeight: '600', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
    timeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 10,
      marginBottom: 6,
      borderWidth: 1,
    },
    timeText: { fontSize: 15, fontWeight: '500' },
    removeButton: { paddingHorizontal: 8, paddingVertical: 4 },
    removeText: { fontSize: 13, fontWeight: '500' },
    addButton: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    addButtonText: { fontSize: 15, fontWeight: '600' },
  });
}
