// 设置页面（v1.2.6完整版）
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme, ThemeMode, ThemeModeLabels } from '../context/ThemeContext';
import { useFont, FontStyleLabels, FontFamilyMap, FontStyleMap } from '../context/FontContext';
import { useTasks } from '../context/TaskContext';
import { APP_VERSION } from '../utils/constants';
import { deleteTask } from '../database/TaskTable';
import { deleteCompletionsByTask } from '../database/CompletionTable';
import { deleteStepsByTask } from '../database/TaskStepTable';
import ThemePicker from '../components/ThemePicker';
import GroupManagementModal from '../components/GroupManagementModal';
import FontPicker from '../components/FontPicker';
import ThemedText from '../components/ThemedText';

export default function SettingsScreen() {
  const { theme, themeMode, isDark } = useTheme();
  const { fontStyleLabel } = useFont();
  const { tasks, loadTasks, groups, addGroup, editGroup, removeGroup, loadGroups, resetDemoTasks } = useTasks();
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [fontPickerVisible, setFontPickerVisible] = useState(false);
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
      // Handle deletion
      if (deletedId) {
        await removeGroup(deletedId);
      }
      // Handle edits and adds
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
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>主题模式</Text>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{ThemeModeLabels[themeMode]}</Text>
        </View>
        <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
      </TouchableOpacity>
      <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingLeft}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>当前外观</Text>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{isDark ? '深色模式' : '浅色模式'}</Text>
        </View>
        <View style={[styles.themeIndicator, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: theme.separator }]} />
      </View>

      {/* 字体选择 */}
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>字体</Text>
      <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingLeft}>
          <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>字体风格</ThemedText>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>{fontStyleLabel}</ThemedText>
        </View>
        <TouchableOpacity style={[styles.fontSelectBtn, { backgroundColor: theme.primary + '20' }]} onPress={() => setFontPickerVisible(true)}>
          <ThemedText style={[styles.fontSelectBtnText, { color: theme.primary }]}>选择</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={[styles.fontPreview, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
        <ThemedText style={[styles.fontPreviewLabel, { color: theme.textTertiary }]}>当前字体预览</ThemedText>
        <ThemedText style={[styles.fontPreviewText, { color: theme.textPrimary }]}>
          YuiTodo 任务清单
        </ThemedText>
        <ThemedText style={[styles.fontPreviewSub, { color: theme.textSecondary }]}>
          今日待办：完成项目报告
        </ThemedText>
        <ThemedText style={[styles.fontPreviewSub, { color: theme.textTertiary }]}>
          The quick brown fox jumps
        </ThemedText>
      </View>

      {/* 任务分组管理 */}
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>任务分组</Text>
      <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackground }]} onPress={() => setGroupModalVisible(true)}>
        <View style={styles.settingLeft}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>管理分组</Text>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{groups.length} 个分组</Text>
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
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>版本</Text>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{APP_VERSION}</Text>
        </View>
      </View>
      <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingLeft}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>适配机型</Text>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>OnePlus Ace 2 Pro / Android 13-14</Text>
        </View>
      </View>
      <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingLeft}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>数据存储</Text>
          <Text style={[styles.settingValue, { color: theme.textSecondary }]}>纯本地SQLite，无网络请求</Text>
        </View>
      </View>
      <View style={{ height: 40 }} />
      <ThemePicker visible={themePickerVisible} onClose={() => setThemePickerVisible(false)} />
      <GroupManagementModal
        visible={groupModalVisible}
        groups={groups}
        onClose={() => setGroupModalVisible(false)}
        onSave={handleSaveGroups}
      />
      <FontPicker visible={fontPickerVisible} onClose={() => setFontPickerVisible(false)} />
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
    fontPreview: { padding: 14, borderRadius: 10, marginBottom: 6, borderWidth: 1 },
    fontPreviewLabel: { fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
    fontPreviewText: { fontSize: 18, marginBottom: 6 },
    fontPreviewSub: { fontSize: 14, marginBottom: 3 },
    fontSelectBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
    fontSelectBtnText: { fontSize: 13, fontWeight: '600' },
  });
}
