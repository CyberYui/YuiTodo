/**
 * Settings screen — appearance, font, reminders, groups, data management.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme, ThemeMode, ThemeModeLabels } from '../context/ThemeContext';
import { useFont } from '../context/FontContext';
import { useTasks } from '../context/TaskContext';
import { useBackground } from '../context/BackgroundContext';
import { useReminder } from '../context/ReminderContext';
import { APP_VERSION } from '../utils/constants';
import { permanentDeleteTask } from '../database/TaskRepository';
import { deleteCompletionsByTask } from '../database/CompletionRepository';
import { deleteStepsByTask } from '../database/TaskStepRepository';
import { ThemePicker, ThemeStylePicker, GroupManagementModal, ThemedText } from '../components';

const TASK_BG_PRESETS = ['#3B82F6', '#EF4444', '#F59E0B', '#22C55E', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

export default function SettingsScreen({ navigation }: any) {
  const { theme, themeMode, isDark, themeStyle, availableStyles, taskBgEnabled, taskBgColor, setTaskBgEnabled, setTaskBgColor } = useTheme();
  const currentStyleName = availableStyles.find((s) => s.id === themeStyle)?.name || 'Apple';
  const { currentFont } = useFont();
  const { tasks, loadTasks, groups, addGroup, editGroup, removeGroup, loadGroups, resetDemoTasks } = useTasks();
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [stylePickerVisible, setStylePickerVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const { hasBackground } = useBackground();
  const { enabled: reminderEnabled, times: reminderTimes } = useReminder();

  const handleClearAllTasks = useCallback(() => {
    Alert.alert('清空所有任务', '此操作将删除所有任务和完成记录，且不可恢复。确定继续吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确认清空', style: 'destructive', onPress: async () => {
        for (const task of tasks) {
          await deleteStepsByTask(task.id);
          await deleteCompletionsByTask(task.id);
          await permanentDeleteTask(task.id);
        }
        await loadTasks();
        Alert.alert('完成', '所有任务已清空');
      }},
    ]);
  }, [tasks, loadTasks]);

  const handleExportData = useCallback(async () => {
    try {
      const exportData = { version: APP_VERSION, exportTime: new Date().toISOString(), tasks };
      const json = JSON.stringify(exportData, null, 2);
      const fileUri = `${FileSystem.documentDirectory}yuitodo-backup-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(fileUri, json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('导出成功', `文件已保存到: ${fileUri}`);
      }
    } catch (e: any) {
      Alert.alert('导出失败', e.message || '请重试');
    }
  }, [tasks]);

  const handleResetDemo = useCallback(() => {
    Alert.alert('重置示例任务', '将清空当前任务并重新生成演示任务。确定继续吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确认重置', style: 'default', onPress: async () => {
        await resetDemoTasks();
        Alert.alert('完成', '已重新生成演示任务');
      }},
    ]);
  }, [resetDemoTasks]);

  const handleSaveGroups = useCallback(async (updatedList: any[], deletedId?: number) => {
    try {
      if (deletedId) await removeGroup(deletedId);
      for (const g of updatedList) {
        if (g.isNew) await addGroup(g.name, g.icon);
        else if (g.isEdited) await editGroup(g.id, { name: g.name, icon: g.icon });
      }
      await loadGroups();
      return updatedList;
    } catch (e: any) {
      Alert.alert('操作失败', e.message || '请重试');
      return null;
    }
  }, [addGroup, editGroup, removeGroup, loadGroups]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textTertiary, marginTop: 16, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' }}>外观</Text>
      <TouchableOpacity style={s.item} onPress={() => setThemePickerVisible(true)}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>主题模式</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{ThemeModeLabels[themeMode]}</ThemedText></View>
        <Text style={{ fontSize: 20, fontWeight: '300', color: theme.textTertiary }}>›</Text>
      </TouchableOpacity>
      <View style={s.item}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>当前外观</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{isDark ? '深色模式' : '浅色模式'}</ThemedText></View>
        <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: theme.separator, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }} />
      </View>
      <TouchableOpacity style={s.item} onPress={() => setStylePickerVisible(true)}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>主题风格</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{currentStyleName}</ThemedText></View>
        <Text style={{ fontSize: 20, fontWeight: '300', color: theme.textTertiary }}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.item} onPress={() => navigation.navigate('IconPicker')}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>应用图标</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>更换桌面图标</ThemedText></View>
        <Text style={{ fontSize: 20, fontWeight: '300', color: theme.textTertiary }}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.item} onPress={() => setTaskBgEnabled(!taskBgEnabled)}>
        <View style={s.left}>
          <ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>任务背景色</ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{taskBgEnabled ? '已开启 · 点击色块更换' : '已关闭 · 使用白色卡片'}</ThemedText>
        </View>
        <View style={{ width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: taskBgEnabled ? theme.primary : theme.separator }}>
          {taskBgEnabled && <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>✓</Text>}
        </View>
      </TouchableOpacity>
      {taskBgEnabled && (
        <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginBottom: 6, gap: 8, flexWrap: 'wrap', backgroundColor: theme.cardBackground }}>
          {TASK_BG_PRESETS.map((color) => (
            <TouchableOpacity key={color} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color, borderWidth: taskBgColor === color ? 3 : 2, borderColor: taskBgColor === color ? theme.textPrimary : 'transparent' }}
              onPress={() => setTaskBgColor(color)} />
          ))}
        </View>
      )}
      <TouchableOpacity style={s.item} onPress={() => navigation.navigate('BackgroundSettings')}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>背景图片</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{hasBackground ? '已设置' : '未设置'}</ThemedText></View>
        <Text style={{ fontSize: 20, fontWeight: '300', color: theme.textTertiary }}>›</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textTertiary, marginTop: 16, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' }}>字体</Text>
      <TouchableOpacity style={s.item} onPress={() => navigation.navigate('FontPicker')}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>字体风格</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{currentFont.name}</ThemedText></View>
        <Text style={{ fontSize: 20, fontWeight: '300', color: theme.textTertiary }}>›</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textTertiary, marginTop: 16, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' }}>提醒</Text>
      <TouchableOpacity style={s.item} onPress={() => navigation.navigate('ReminderSettings')}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>每日提醒</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{reminderEnabled ? `已开启 · ${reminderTimes.length}个时间点` : '已关闭'}</ThemedText></View>
        <Text style={{ fontSize: 20, fontWeight: '300', color: theme.textTertiary }}>›</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textTertiary, marginTop: 16, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' }}>任务分组</Text>
      <TouchableOpacity style={s.item} onPress={() => setGroupModalVisible(true)}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>管理分组</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{groups.length} 个分组</ThemedText></View>
        <Text style={{ fontSize: 20, fontWeight: '300', color: theme.textTertiary }}>›</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textTertiary, marginTop: 16, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' }}>数据管理</Text>
      <View style={s.item}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>任务总数</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{tasks.length} 条</ThemedText></View>
      </View>
      <TouchableOpacity style={s.item} onPress={handleExportData}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.primary }}>导出数据</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textTertiary }}>导出为JSON文件</ThemedText></View>
      </TouchableOpacity>
      <TouchableOpacity style={s.item} onPress={() => navigation.navigate('RecycleBin')}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>回收站</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>已删除的任务</ThemedText></View>
        <Text style={{ fontSize: 20, fontWeight: '300', color: theme.textTertiary }}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.item} onPress={handleResetDemo}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.primary }}>重置示例任务</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textTertiary }}>清空并重新生成演示任务</ThemedText></View>
      </TouchableOpacity>
      <TouchableOpacity style={s.item} onPress={handleClearAllTasks}>
        <View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.danger }}>清空所有任务</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textTertiary }}>删除所有任务和完成记录</ThemedText></View>
      </TouchableOpacity>

      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textTertiary, marginTop: 16, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' }}>关于</Text>
      <View style={s.item}><View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>版本</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{APP_VERSION}</ThemedText></View></View>
      <View style={s.item}><View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>适配机型</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>OnePlus Ace 2 Pro / Android 13-14</ThemedText></View></View>
      <View style={s.item}><View style={s.left}><ThemedText style={{ fontSize: 15, fontWeight: '500', color: theme.textPrimary }}>数据存储</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>纯本地SQLite，无网络请求</ThemedText></View></View>
      <View style={{ height: 40 }} />
      <ThemePicker visible={themePickerVisible} onClose={() => setThemePickerVisible(false)} />
      <ThemeStylePicker visible={stylePickerVisible} onClose={() => setStylePickerVisible(false)} />
      <GroupManagementModal visible={groupModalVisible} groups={groups} onClose={() => setGroupModalVisible(false)} onSave={handleSaveGroups} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 10, marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
  left: { flex: 1 },
});
