/**
 * Reminder settings — toggle, time list, add/remove, permission prompt.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { useReminder } from '../context/ReminderContext';
import { ThemedText } from '../components';

export default function ReminderSettingsScreen() {
  const { theme } = useTheme();
  const { enabled, times, permissionStatus, setEnabled, addTime, removeTime } = useReminder();
  const [showPicker, setShowPicker] = useState(false);

  const handleAddTime = useCallback(() => setShowPicker(true), []);

  const handlePickerChange = useCallback((event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'dismissed' || !selectedDate) return;
    const timeStr = `${String(selectedDate.getHours()).padStart(2, '0')}:${String(selectedDate.getMinutes()).padStart(2, '0')}`;
    if (times.includes(timeStr)) { Alert.alert('重复', '该时间点已存在'); return; }
    addTime(timeStr);
  }, [times, addTime]);

  const handleRemoveTime = useCallback((index: number) => {
    Alert.alert('移除提醒', `确定要移除 ${times[index]} 的提醒吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '移除', style: 'destructive', onPress: () => removeTime(index) },
    ]);
  }, [times, removeTime]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      <View style={{ borderRadius: 12, borderWidth: 1, borderColor: theme.separator, backgroundColor: theme.cardBackground, padding: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 4 }}>每日提醒</ThemedText>
            <ThemedText style={{ fontSize: 13, color: theme.textSecondary }}>{enabled ? `已开启 · ${times.length} 个时间点` : '已关闭'}</ThemedText>
          </View>
          <Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: theme.separator, true: theme.primary + '60' }} thumbColor={enabled ? theme.primary : '#f4f3f4'} />
        </View>
        {permissionStatus === 'denied' && <ThemedText style={{ fontSize: 12, marginTop: 8, color: theme.danger }}>通知权限被拒绝，请在系统设置中开启</ThemedText>}
      </View>
      {enabled && (
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 12, fontWeight: '600', color: theme.textTertiary, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' }}>提醒时间</ThemedText>
          <FlatList data={times} keyExtractor={(item, i) => `${item}-${i}`}
            renderItem={({ item, index }) => (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: theme.separator, backgroundColor: theme.cardBackground }}>
                <ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>⏰ {item}</ThemedText>
                <TouchableOpacity onPress={() => handleRemoveTime(index)} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                  <ThemedText style={{ fontSize: 13, fontWeight: '500', color: theme.danger }}>移除</ThemedText>
                </TouchableOpacity>
              </View>
            )} scrollEnabled={false} />
          <TouchableOpacity style={{ borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8, borderColor: theme.primary }} onPress={handleAddTime}>
            <ThemedText style={{ fontSize: 15, fontWeight: '600', color: theme.primary }}>+ 添加提醒时间</ThemedText>
          </TouchableOpacity>
        </View>
      )}
      {showPicker && <DateTimePicker value={new Date()} mode="time" is24Hour display={Platform.OS === 'android' ? 'spinner' : 'default'} onChange={handlePickerChange} />}
    </View>
  );
}
