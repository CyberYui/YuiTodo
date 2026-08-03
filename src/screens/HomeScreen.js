// 首页：任务列表主页面（v1.2.1完整版）
// 职责：展示所有任务列表 + 月份归档 + 折叠交互 + 隐藏已完成
//
// 列表结构：
// 1. 今日任务（始终置顶，不折叠）
// 2. 月份归档（按年份+月份分组，默认折叠）
// 3. 已完成任务（默认隐藏，底部显示数量）

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView, ImageBackground } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBackground } from '../context/BackgroundContext';
import { useTasks } from '../context/TaskContext';
import { TaskStatus } from '../utils/constants';
import { isDateToday, isExpired } from '../utils/dateHelpers';
import TaskEditorModal from '../components/TaskEditorModal';
import TaskItem from '../components/TaskItem';
import ErrorBoundary from '../components/ErrorBoundary';
import ThemedText from '../components/ThemedText';

export default function HomeScreen({ navigation }) {
  const { theme, styleConfig } = useTheme();
  const { imageUri, opacity, hasBackground } = useBackground();
  const { tasks, isLoading, groups, currentGroupId, setCurrentGroupId, completeTask, removeTask, toggleStep, toggleStar } = useTasks();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showCompleted, setShowCompleted] = useState(false);

  /**
   * 将任务按月份分组
   */
  const groupedTasks = useMemo(() => {
    const today = [];
    const future = {};
    const completed = [];

    tasks.forEach((task) => {
      // 分组过滤
      if (currentGroupId !== 0 && task.group_id !== currentGroupId) return;

      if (task.status === TaskStatus.DONE) {
        completed.push(task);
        return;
      }
      const taskDate = task.start_date || task.start_time;
      if (isDateToday(taskDate)) {
        const isOverdue = isExpired(task.end_time) && task.status === TaskStatus.PENDING;
        today.push({ ...task, _priority: isOverdue ? 1 : 0 });
      } else {
        const d = new Date(taskDate);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!future[monthKey]) future[monthKey] = [];
        future[monthKey].push(task);
      }
    });

    today.sort((a, b) => a._priority - b._priority || a.start_time - b.start_time);
    Object.keys(future).forEach((key) => {
      future[key].sort((a, b) => (a.start_date || a.start_time) - (b.start_date || b.start_time));
    });

    return { today, months: future, completed };
  }, [tasks, currentGroupId]);

  /**
   * 构建渲染列表数据
   */
  const listData = useMemo(() => {
    const items = [];

    // 今日任务
    if (groupedTasks.today.length > 0) {
      items.push({ type: 'header', id: 'header-today', label: '今天', count: groupedTasks.today.length, expanded: true });
      groupedTasks.today.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
    }

    // 月份归档（按月份倒序）
    const monthKeys = Object.keys(groupedTasks.months).sort().reverse();
    monthKeys.forEach((monthKey) => {
      const monthTasks = groupedTasks.months[monthKey];
      const isExpanded = expandedMonths[monthKey] || false;
      const [year, month] = monthKey.split('-');
      items.push({ type: 'header', id: `header-${monthKey}`, label: `${year}年${parseInt(month)}月`, count: monthTasks.length, expanded: isExpanded, monthKey });
      if (isExpanded) monthTasks.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
    });

    // 已完成任务
    if (groupedTasks.completed.length > 0) {
      items.push({ type: 'completed_header', id: 'header-completed', count: groupedTasks.completed.length, expanded: showCompleted });
      if (showCompleted) groupedTasks.completed.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
    }

    return items;
  }, [groupedTasks, expandedMonths, showCompleted]);

  const toggleMonth = useCallback((monthKey) => {
    setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));
  }, []);

  const toggleCompleted = useCallback(() => {
    setShowCompleted((prev) => !prev);
  }, []);

  const handleComplete = useCallback((taskId) => { completeTask(taskId); }, [completeTask]);

  const handleDelete = useCallback((taskId) => {
    Alert.alert('删除任务', '确定要删除这个任务吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => removeTask(taskId) },
    ]);
  }, [removeTask]);

  const handleToggleStep = useCallback((taskId, stepId) => {
    toggleStep(taskId, stepId);
  }, [toggleStep]);

  const handleLongPress = useCallback((task) => {
    setEditingTask(task);
    setEditorVisible(true);
  }, []);

  const handleNewTask = useCallback(() => {
    setEditingTask(null);
    setEditorVisible(true);
  }, []);

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return <MonthHeader label={item.label} count={item.count} expanded={item.expanded} onPress={item.monthKey ? () => toggleMonth(item.monthKey) : undefined} />;
    }
    if (item.type === 'completed_header') {
      return <CompletedHeader count={item.count} expanded={item.expanded} onPress={toggleCompleted} />;
    }
    return (
      <TaskItem
        task={item.task}
        onPress={handleLongPress}
        onSwipeComplete={() => handleComplete(item.task.id)}
        onSwipeDelete={() => handleDelete(item.task.id)}
        onToggleStep={handleToggleStep}
        onToggleStar={toggleStar}
      />
    );
  };

  const headerStyle = styleConfig?.headerStyle || {};
  const dynamicStyles = createStyles(theme);

  const groupChoirComponent = groups.length > 0 ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.groupBar} contentContainerStyle={dynamicStyles.groupBarContent}>
      <TouchableOpacity
        style={[dynamicStyles.groupChip, { backgroundColor: currentGroupId === 0 ? theme.primary : theme.separator + '40' }]}
        onPress={() => setCurrentGroupId(0)}
      >
        <ThemedText style={[dynamicStyles.groupChipText, { color: currentGroupId === 0 ? '#FFFFFF' : theme.textSecondary }]}>全部</ThemedText>
      </TouchableOpacity>
      {groups.map((group) => (
        <TouchableOpacity
          key={group.id}
          style={[dynamicStyles.groupChip, { backgroundColor: currentGroupId === group.id ? theme.primary : theme.separator + '40' }]}
          onPress={() => setCurrentGroupId(group.id)}
        >
          <ThemedText style={[dynamicStyles.groupChipText, { color: currentGroupId === group.id ? '#FFFFFF' : theme.textSecondary }]}>
            {group.icon} {group.name}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ) : null;

  const Container = hasBackground ? ImageBackground : View;
  const imageProps = hasBackground ? {
    source: { uri: imageUri },
    imageStyle: { opacity },
  } : {};

  return (
    <Container style={dynamicStyles.container} {...imageProps}>
      <View style={[dynamicStyles.topBar, headerStyle]}>
        <TouchableOpacity style={[dynamicStyles.newButton, { backgroundColor: theme.primary }]} onPress={handleNewTask} activeOpacity={0.7}>
          <ThemedText style={dynamicStyles.newButtonText}>+ 新建任务</ThemedText>
        </TouchableOpacity>
        <View style={dynamicStyles.topBarRight}>
          <TouchableOpacity style={dynamicStyles.statButton} onPress={() => navigation.navigate('Settings')}>
            <ThemedText style={[dynamicStyles.statButtonText, { color: theme.primary }]}>设置 ({tasks.length})</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={dynamicStyles.centerContent}>
          <ThemedText style={{ color: theme.textSecondary }}>加载中...</ThemedText>
          <ThemedText style={{ color: theme.textTertiary, fontSize: 12, marginTop: 8 }}>DB初始化中...</ThemedText>
        </View>
      ) : listData.length === 0 ? (
        <View style={{ flex: 1 }}>
          {groupChoirComponent}
          <View style={dynamicStyles.centerContent}>
            <ThemedText style={[dynamicStyles.emptyText, { color: theme.textTertiary }]}>暂无待办任务</ThemedText>
            <ThemedText style={[dynamicStyles.emptyHint, { color: theme.textTertiary }]}>点击"新建任务"开始</ThemedText>
          </View>
        </View>
      ) : (
        <FlatList data={listData} keyExtractor={(item) => item.id} renderItem={renderItem} ListHeaderComponent={groupChoirComponent} contentContainerStyle={dynamicStyles.listContent} showsVerticalScrollIndicator={false} initialNumToRender={10} maxToRenderPerBatch={5} windowSize={5} />
      )}

      <ErrorBoundary>
        <TaskEditorModal
          visible={editorVisible}
          task={editingTask}
          onClose={() => { setEditorVisible(false); setEditingTask(null); }}
          onSave={() => { setEditorVisible(false); setEditingTask(null); }}
        />
      </ErrorBoundary>
    </Container>
  );
}

function MonthHeader({ label, count, expanded, onPress }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity style={styles.monthHeader} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={[styles.monthArrow, { color: theme.textTertiary }]}>{expanded ? '▼' : '▶'}</Text>
      <ThemedText style={[styles.monthLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
      <View style={[styles.monthCount, { backgroundColor: theme.primary + '20' }]}>
        <ThemedText style={[styles.monthCountText, { color: theme.primary }]}>{count}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function CompletedHeader({ count, expanded, onPress }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity style={styles.completedHeader} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.monthArrow, { color: theme.textTertiary }]}>{expanded ? '▼' : '▶'}</Text>
      <ThemedText style={[styles.completedLabel, { color: theme.textTertiary }]}>已完成 {count} 项</ThemedText>
    </TouchableOpacity>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.separator },
    newButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    newButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    topBarRight: { flexDirection: 'row', gap: 4 },
    statButton: { paddingHorizontal: 12, paddingVertical: 8 },
    statButtonText: { fontSize: 14, fontWeight: '600' },
    listContent: { paddingVertical: 8 },
    groupBar: { borderBottomWidth: 1, borderBottomColor: theme.separator, maxHeight: 48 },
    groupBarContent: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    groupChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
    groupChipText: { fontSize: 13, fontWeight: '500' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, marginBottom: 4 },
    emptyHint: { fontSize: 13 },
    monthHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    monthArrow: { fontSize: 12, width: 16 },
    monthLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
    monthCount: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    monthCountText: { fontSize: 11, fontWeight: '600' },
    completedHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8, marginTop: 8 },
    completedLabel: { fontSize: 13, fontWeight: '500' },
  });
}
