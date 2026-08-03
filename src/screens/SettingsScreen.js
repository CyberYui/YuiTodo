// 设置页面
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme, ThemeMode, ThemeModeLabels } from '../context/ThemeContext';
import { useFont } from '../context/FontContext';
import { useTasks } from '../context/TaskContext';
import { APP_VERSION } from '../utils/constants';
import { deleteTask } from '../database/TaskTable';
import { deleteCompletionsByTask } from '../database/CompletionTable';
import { deleteStepsByTask } from '../database/TaskStepTable';
import ThemePicker from '../components/ThemePicker';
import ThemeStylePicker from '../components/ThemeStylePicker';
import GroupManagementModal from '../components/GroupManagementModal';
import ThemedText from '../components/ThemedText';
import { useBackground } from '../context/BackgroundContext';
import { useReminder } from '../context/ReminderContext';

const TASK_BG_PRESETS = ['#3B82F6', '#EF4444', '#F59E0B', '#22C55E', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

export default function SettingsScreen({ navigation }) {
  const { theme, themeMode, isDark, themeStyle, availableStyles, taskBgEnabled, taskBgColor, setTaskBgEnabled, setTaskBgColor } = useTheme();
  const currentStyleName = availableStyles.find(s => s.id === themeStyle)?.name || 'Apple';
  const { currentFont } = useFont();
  const { tasks, loadTasks, groups, addGroup, editGroup, removeGroup, loadGroups, resetDemoTasks } = useTasks();
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [stylePickerVisible, setStylePickerVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const { hasBackground } = useBackground();
  const { enabled: reminderEnabled, times: reminderTimes } = useReminder();
  const styles = createStyles(theme);

  const handleClearAllTasks = () => {
    Alert.alert('清空所有任务', '此操作将删除所有任务和完成记录，且不可恢复。确定继续吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确认清空', style: 'destructive', onPress: async () => {
        for (const task of tasks) { await deleteStepsByTask(task.id); await deleteCompletionsByTask(task.id); await deleteTask(task.id); }
        await loadTasks();
        Alert.alert('完成', '所有任务已清空');
      }},
    ]);
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        version: APP_VERSION,
        exportTime: new Date().toISOString(),
        tasks: tasks,
      };
      const json = JSON.stringify(exportData, null, 2);
      const fileName = `yuitodo-backup-${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('导出成功', `文件已保存到: ${fileUri}`);
      }
    } catch (e) {
      Alert.alert('导出失败', e.message || '请重试');
    }
  };

  const handleResetDemo = () => {
    Alert.alert('重置示例任务', '将清空当前任务并重新生成演示任务。确定继续吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确认重置', style: 'default', onPress: async () => {
        await resetDemoTasks();
        Alert.alert('完成', '已重新生成演示任务');
      }},
    ]);
  };

  const handleSaveGroups = async (updatedList, deletedId) => {
    try {
      if (deletedId) {
        await removeGroup(deletedId);
      }
      for (const g of updatedList) {
        if (g.isNew) {
          await addGroup(g.name, g.icon);
        } else if (g.isEdited) {
          await editGroup(g.id, { name: g.name, icon: g.icon });
        }
      }
      await loadGroups();
      return updatedList;
    } catch (error) {
      Alert.alert('操作失败', error.message || '请重试');
      return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>外观</Text>
      <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackground }]} onPress={() => setThemePickerVisible(true)}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>主题模式</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>{ThemeModeLabels[themeMode]}</ThemedText>
        </View>
        <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
      </TouchableOpacity>
      <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>当前外观</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>{isDark ? '深色模式' : '浅色模式'}</ThemedText>
        </View>
        <View style={[styles.themeIndicator, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: theme.separator }]} />
      </View>
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => setStylePickerVisible(true)}
      >
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>主题风格</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>{currentStyleName}</ThemedText>
        </View>
        <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => navigation.navigate('IconPicker')}
      >
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>应用图标</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>更换桌面图标</ThemedText>
        </View>
        <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => setTaskBgEnabled(!taskBgEnabled)}
      >
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>任务背景色</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>
            {taskBgEnabled ? '已开启 · 点击色块更换' : '已关闭 · 使用白色卡片'}
          </ThemedText>
        </View>
        <View style={[styles.toggleIndicator, { backgroundColor: taskBgEnabled ? theme.primary : theme.separator }]}>
          {taskBgEnabled && <Text style={styles.toggleCheck}>✓</Text>}
        </View>
      </TouchableOpacity>
      {taskBgEnabled && (
        <View style={[styles.colorRow, { backgroundColor: theme.cardBackground }]}>
          {TASK_BG_PRESETS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                taskBgColor === color && { borderWidth: 3, borderColor: theme.textPrimary },
              ]}
              onPress={() => setTaskBgColor(color)}
            />
          ))}
        </View>
      )}
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => navigation.navigate('BackgroundSettings')}
      >
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>背景图片</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>
            {hasBackground ? '已设置' : '未设置'}
          </ThemedText>
        </View>
        <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
      </TouchableOpacity>

      {/* 字体选择 */}
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>字体</Text>
      <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackground }]} onPress={() => navigation.navigate('FontPicker')}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>字体风格</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>{currentFont.name}</ThemedText>
        </View>
        <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
      </TouchableOpacity>
      <View style={[styles.fontPreview, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
        <ThemedText style={[styles.fontPreviewLabel, { color: theme.textTertiary }]}>当前字体预览</ThemedText>
        <ThemedText style={[styles.fontPreviewText, { color: theme.textPrimary }]}>
          {currentFont.preview}
        </ThemedText>
        <ThemedText style={[styles.fontPreviewSub, { color: theme.textSecondary }]}>
          📝 完成项目报告 · 收集数据、撰写初稿
        </ThemedText>
        <ThemedText style={[styles.fontPreviewSub, { color: theme.textTertiary }]}>
          今天 · 已完成 3/5 · 循环任务
        </ThemedText>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>提醒</Text>
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => navigation.navigate('ReminderSettings')}
      >
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>每日提醒</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>
            {reminderEnabled ? `已开启 · ${reminderTimes.length}个时间点` : '已关闭'}
          </ThemedText>
        </View>
        <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
      </TouchableOpacity>

      {/* 任务分组管理 */}
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>任务分组</Text>
      <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackground }]} onPress={() => setGroupModalVisible(true)}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>管理分组</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>{groups.length} 个分组</ThemedText>
        </View>
        <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
      </TouchableOpacity>

      {/* 数据管理 */}
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>数据管理</Text>
      <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>任务总数</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>{tasks.length} 条</ThemedText>
        </View>
      </View>
      <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackground }]} onPress={handleExportData}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.primary }]}>导出数据</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textTertiary }]}>导出为JSON文件</ThemedText>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackground }]} onPress={() => navigation.navigate('RecycleBin')}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>回收站</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>已删除的任务</ThemedText>
        </View>
        <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackground }]} onPress={handleResetDemo}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.primary }]}>重置示例任务</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textTertiary }]}>清空并重新生成演示任务</ThemedText>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackground }]} onPress={handleClearAllTasks}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.danger }]}>清空所有任务</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textTertiary }]}>删除所有任务和完成记录</ThemedText>
        </View>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>关于</Text>
      <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>版本</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>{APP_VERSION}</ThemedText>
        </View>
      </View>
      <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>适配机型</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>OnePlus Ace 2 Pro / Android 13-14</ThemedText>
        </View>
      </View>
      <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>数据存储</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>纯本地SQLite，无网络请求</ThemedText>
        </View>
      </View>
      <View style={{ height: 40 }} />
      <ThemePicker visible={themePickerVisible} onClose={() => setThemePickerVisible(false)} />
      <ThemeStylePicker visible={stylePickerVisible} onClose={() => setStylePickerVisible(false)} />
      <GroupManagementModal
        visible={groupModalVisible}
        groups={groups}
        onClose={() => setGroupModalVisible(false)}
        onSave={handleSaveGroups}
      />
    </ScrollView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: 16 },
    sectionTitle: { fontSize: 12, fontWeight: '600', marginTop: 16, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 10, marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
    settingLeft: { flex: 1 },
    settingLabel: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
    settingValue: { fontSize: 12 },
    settingArrow: { fontSize: 20, fontWeight: '300', marginLeft: 8 },
    themeIndicator: { width: 24, height: 24, borderRadius: 12, borderWidth: 1 },
    toggleIndicator: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    toggleCheck: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    colorRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginBottom: 6, gap: 8, flexWrap: 'wrap' },
    colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
    fontPreview: { padding: 14, borderRadius: 10, marginBottom: 6, borderWidth: 1 },
    fontPreviewLabel: { fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
    fontPreviewText: { fontSize: 18, marginBottom: 6 },
    fontPreviewSub: { fontSize: 14, marginBottom: 3 },

  });
}
