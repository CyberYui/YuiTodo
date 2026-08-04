/**
 * Home screen — sidebar smart lists + search + task list + FAB.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ScrollView, ImageBackground, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBackground } from '../context/BackgroundContext';
import { useTasks } from '../context/TaskContext';
import { useList } from '../context/ListContext';
import { useDragSort } from '../context/DragSortContext';
import { TaskStatus } from '../utils/constants';
import { isDateToday, isExpired } from '../utils/dateHelpers';
import { TaskEditorModal, TaskItem, ErrorBoundary, ThemedText, Icon } from '../components';
import { TaskWithRelations } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 72;

const SMART_FILTERS = [
  { id: 'all', name: '全部', iconName: 'all' },
  { id: 'today', name: '今天', iconName: 'today' },
  { id: 'week', name: '本周', iconName: 'week' },
  { id: 'overdue', name: '逾期', iconName: 'overdue' },
];

export default function HomeScreen({ navigation }: any) {
  const { theme, styleConfig, isDark } = useTheme();
  const { getCurrentImage, getCurrentOpacity, hasBackground } = useBackground();
  const { tasks, isLoading, groups, currentGroupId, setCurrentGroupId, completeTask, removeTask, restoreTask, toggleStep, toggleStar } = useTasks();
  const { lists, currentListId, setCurrentListId } = useList();
  const { draggingTaskId, startDrag, endDrag } = useDragSort();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [smartFilter, setSmartFilter] = useState('all');
  const [undoItem, setUndoItem] = useState<TaskWithRelations | null>(null);
  const [topBarCollapsed, setTopBarCollapsed] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoAnim = useRef(new Animated.Value(0)).current;

  const filterBySmart = useCallback((taskList: TaskWithRelations[], filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(today.getTime() + 86400000);
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);

    switch (filter) {
      case 'today': return taskList.filter((t) => { const d = new Date(t.start_date || t.start_time); return d >= today && d < todayEnd; });
      case 'week': return taskList.filter((t) => { const d = new Date(t.start_date || t.start_time); return d >= today && d < weekEnd; });
      case 'overdue': return taskList.filter((t) => isExpired(t.end_time) && t.status === TaskStatus.PENDING);
      default: return taskList;
    }
  }, []);

  const groupedTasks = useMemo(() => {
    const today: TaskWithRelations[] = [];
    const future: Record<string, TaskWithRelations[]> = {};
    const completed: TaskWithRelations[] = [];
    const query = searchQuery.toLowerCase().trim();
    let filteredTasks = tasks;

    if (currentGroupId !== 0) filteredTasks = filteredTasks.filter((t) => t.group_id === currentGroupId);
    if (query) filteredTasks = filteredTasks.filter((t) => t.title?.toLowerCase().includes(query) || t.note?.toLowerCase().includes(query));
    filteredTasks = filterBySmart(filteredTasks, smartFilter);

    if (smartFilter !== 'all') {
      filteredTasks.forEach((task) => {
        if (task.status === TaskStatus.DONE) { completed.push(task); return; }
        const isOverdue = isExpired(task.end_time) && task.status === TaskStatus.PENDING;
        today.push({ ...task, _priority: isOverdue ? 1 : 0 } as any);
      });
      today.sort((a: any, b: any) => a._priority - b._priority || a.start_time - b.start_time);
      return { today, months: {}, completed, isSmartFiltered: true };
    }

    filteredTasks.forEach((task) => {
      if (task.status === TaskStatus.DONE) { completed.push(task); return; }
      const taskDate = task.start_date || task.start_time;
      if (isDateToday(taskDate)) {
        const isOverdue = isExpired(task.end_time) && task.status === TaskStatus.PENDING;
        today.push({ ...task, _priority: isOverdue ? 1 : 0 } as any);
      } else {
        const d = new Date(taskDate);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!future[monthKey]) future[monthKey] = [];
        future[monthKey].push(task);
      }
    });
    today.sort((a: any, b: any) => a._priority - b._priority || a.start_time - b.start_time);
    Object.keys(future).forEach((key) => { future[key].sort((a, b) => (a.start_date || a.start_time) - (b.start_date || b.start_time)); });
    return { today, months: future, completed, isSmartFiltered: false };
  }, [tasks, currentGroupId, searchQuery, smartFilter, filterBySmart]);

  const listData = useMemo(() => {
    const items: Array<{ type: string; id: string; label?: string; count?: number; expanded?: boolean; monthKey?: string; task?: TaskWithRelations }> = [];
    const isSmart = groupedTasks.isSmartFiltered;

    if (isSmart) {
      if (groupedTasks.today.length > 0) {
        items.push({ type: 'header', id: 'header-smart', label: SMART_FILTERS.find((f) => f.id === smartFilter)?.name || '结果', count: groupedTasks.today.length, expanded: true });
        groupedTasks.today.forEach((task: any) => items.push({ type: 'task', id: `task-${task.id}`, task }));
      }
    } else {
      if (groupedTasks.today.length > 0) {
        items.push({ type: 'header', id: 'header-today', label: '今天', count: groupedTasks.today.length, expanded: true });
        groupedTasks.today.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
      }
      Object.keys(groupedTasks.months).sort().reverse().forEach((monthKey) => {
        const monthTasks = groupedTasks.months[monthKey];
        const isExpanded = expandedMonths[monthKey] || false;
        const [year, month] = monthKey.split('-');
        items.push({ type: 'header', id: `header-${monthKey}`, label: `${year}年${parseInt(month)}月`, count: monthTasks.length, expanded: isExpanded, monthKey });
        if (isExpanded) monthTasks.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
      });
    }

    if (groupedTasks.completed.length > 0) {
      items.push({ type: 'completed_header', id: 'header-completed', count: groupedTasks.completed.length, expanded: showCompleted });
      if (showCompleted) groupedTasks.completed.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
    }
    return items;
  }, [groupedTasks, expandedMonths, showCompleted, smartFilter]);

  const handleDeleteWithUndo = useCallback((taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    removeTask(taskId);
    setUndoItem(task);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    Animated.timing(undoAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    undoTimerRef.current = setTimeout(() => {
      Animated.timing(undoAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setUndoItem(null));
    }, 5000);
  }, [tasks, removeTask, undoAnim]);

  const handleUndo = useCallback(() => {
    if (undoItem) {
      restoreTask(undoItem);
      setUndoItem(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      Animated.timing(undoAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [undoItem, restoreTask, undoAnim]);

  const toggleMonth = useCallback((monthKey: string) => {
    setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] }));
  }, []);

  const toggleCompleted = useCallback(() => setShowCompleted((p) => !p), []);
  const handleComplete = useCallback((taskId: number) => { completeTask(taskId); }, [completeTask]);
  const handleLongPress = useCallback((task: TaskWithRelations) => { setEditingTask(task); setEditorVisible(true); }, []);
  const handleNewTask = useCallback(() => { setEditingTask(null); setEditorVisible(true); }, []);
  const handleDragStart = useCallback((taskId: number) => { startDrag(taskId); }, [startDrag]);

  const renderItem = useCallback(({ item }: any) => {
    if (item.type === 'header') return <MonthHeader label={item.label!} count={item.count!} expanded={item.expanded!} onPress={item.monthKey ? () => toggleMonth(item.monthKey) : undefined} />;
    if (item.type === 'completed_header') return <CompletedHeader count={item.count!} expanded={item.expanded!} onPress={toggleCompleted} />;
    const isDragging = draggingTaskId === item.task.id;
    return (
      <View style={isDragging ? { transform: [{ scale: 1.05 }], elevation: 8, zIndex: 10 } : {}}>
        <TaskItem task={item.task} onPress={handleLongPress}
          onSwipeComplete={() => handleComplete(item.task.id)} onSwipeDelete={() => handleDeleteWithUndo(item.task.id)}
          onToggleStep={toggleStep} onToggleStar={toggleStar} onDragStart={handleDragStart} showDragHandle={smartFilter === 'all'} />
      </View>
    );
  }, [draggingTaskId, handleLongPress, handleComplete, handleDeleteWithUndo, toggleStep, toggleStar, handleDragStart, smartFilter, toggleMonth, toggleCompleted]);

  const imageUri = getCurrentImage(isDark);
  const opacity = getCurrentOpacity(isDark);
  const btnShape = styleConfig?.btnShape || 'round';
  const btnRadius = btnShape === 'pill' ? 20 : btnShape === 'sharp' ? 4 : 8;

  const groupChoir = groups.length > 0 ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 48 }} contentContainerStyle={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
      <TouchableOpacity style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: currentGroupId === 0 ? theme.primary : theme.cardBackground, borderColor: currentGroupId === 0 ? theme.primary : theme.separator, borderWidth: 1 }}
        onPress={() => setCurrentGroupId(0)}>
        <ThemedText style={{ fontSize: 13, fontWeight: '500', color: currentGroupId === 0 ? '#FFFFFF' : theme.textSecondary }}>全部</ThemedText>
      </TouchableOpacity>
      {groups.map((group) => (
        <TouchableOpacity key={group.id} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: currentGroupId === group.id ? theme.primary : theme.cardBackground, borderColor: currentGroupId === group.id ? theme.primary : theme.separator, borderWidth: 1 }}
          onPress={() => setCurrentGroupId(group.id)}>
          <ThemedText style={{ fontSize: 13, fontWeight: '500', color: currentGroupId === group.id ? '#FFFFFF' : theme.textSecondary }}>{group.icon} {group.name}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ) : null;

  const undoTranslateY = undoAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] });
  const Container: any = hasBackground ? ImageBackground : View;
  const imageProps = hasBackground ? { source: { uri: imageUri }, imageStyle: { opacity } } : {};

  return (
    <Container style={{ flex: 1 }} {...(imageProps as any)}>
      <View style={s.mainRow}>
        <View style={[s.sidebar, { backgroundColor: theme.cardBackground, borderRightColor: theme.separator }]}>
          {SMART_FILTERS.map((f) => {
            const isActive = smartFilter === f.id;
            return (
              <TouchableOpacity key={f.id} style={[s.sidebarItem, isActive && { backgroundColor: theme.primary + '15' }]}
                onPress={() => setSmartFilter(f.id)} activeOpacity={0.7}>
                <Icon name={f.iconName} size={20} color={isActive ? theme.primary : theme.textTertiary} />
                <ThemedText style={{ fontSize: 10, color: isActive ? theme.primary : theme.textTertiary }}>{f.name}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ flex: 1 }}>
          <View style={[s.topBar, { backgroundColor: theme.cardBackground }]}>
            {searchActive ? (
              <View style={[s.searchInline, { backgroundColor: theme.background, borderColor: theme.separator }]}>
                <Icon name="search" size={16} color={theme.textTertiary} />
                <TextInput style={[s.searchInput, { color: theme.textPrimary }]} placeholder="搜索..." placeholderTextColor={theme.textTertiary} value={searchQuery} onChangeText={setSearchQuery} autoFocus />
                {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}><Icon name="closeCircle" size={16} color={theme.textTertiary} /></TouchableOpacity>}
                <TouchableOpacity onPress={() => { setSearchActive(false); setSearchQuery(''); }}>
                  <ThemedText style={{ fontSize: 13, fontWeight: '500', color: theme.primary }}>取消</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.topBarRow}>
                <TouchableOpacity style={s.iconBtn} onPress={() => setSearchActive(true)} activeOpacity={0.6}><Icon name="search" /></TouchableOpacity>
                <TouchableOpacity style={s.iconBtn} onPress={() => setTopBarCollapsed(!topBarCollapsed)} activeOpacity={0.6}><Icon name={topBarCollapsed ? 'chevronDown' : 'chevronUp'} /></TouchableOpacity>
                <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Settings')} activeOpacity={0.6}><Icon name="settings" /></TouchableOpacity>
              </View>
            )}
          </View>
          {!topBarCollapsed && (
            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.separator, paddingBottom: 6, backgroundColor: theme.cardBackground }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 36 }} contentContainerStyle={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, gap: 6 }}>
                {lists.map((list) => (
                  <TouchableOpacity key={list.id} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: currentListId === list.id ? theme.primary : theme.background, borderColor: currentListId === list.id ? theme.primary : theme.separator, borderWidth: 1 }}
                    onPress={() => setCurrentListId(list.id)}>
                    <ThemedText style={{ fontSize: 11, fontWeight: '500', color: currentListId === list.id ? '#FFFFFF' : theme.textSecondary }}>{list.icon} {list.name}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {isLoading ? (
            <View style={s.center}><ThemedText style={{ color: theme.textSecondary }}>加载中...</ThemedText></View>
          ) : listData.length === 0 ? (
            <View style={{ flex: 1 }}>
              {groupChoir}
              <View style={s.center}>
                {searchQuery ? (
                  <><ThemedText style={{ fontSize: 15, marginBottom: 4, color: theme.textTertiary }}>未找到匹配任务</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textTertiary }}>换个关键词试试</ThemedText></>
                ) : (
                  <><ThemedText style={{ fontSize: 15, marginBottom: 4, color: theme.textTertiary }}>暂无待办任务</ThemedText><ThemedText style={{ fontSize: 12, color: theme.textTertiary }}>点击+开始</ThemedText></>
                )}
              </View>
            </View>
          ) : (
            <FlatList data={listData} keyExtractor={(item) => item.id} renderItem={renderItem}
              ListHeaderComponent={groupChoir} contentContainerStyle={{ paddingVertical: 4 }}
              showsVerticalScrollIndicator={false} initialNumToRender={10} maxToRenderPerBatch={5} windowSize={5}
              scrollEnabled={!draggingTaskId} />
          )}
        </View>
      </View>
      <TouchableOpacity style={[s.fab, { backgroundColor: theme.primary, borderRadius: btnRadius }]} onPress={handleNewTask} activeOpacity={0.8}>
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      {undoItem && (
        <Animated.View style={[s.undoBar, { backgroundColor: theme.cardBackground, borderColor: theme.separator, transform: [{ translateY: undoTranslateY }] }]}>
          <ThemedText style={{ fontSize: 13, fontWeight: '500', color: theme.textPrimary }}>任务已删除</ThemedText>
          <TouchableOpacity onPress={handleUndo} style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, backgroundColor: theme.primary }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>撤销</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <ErrorBoundary>
        <TaskEditorModal visible={editorVisible} task={editingTask}
          onClose={() => { setEditorVisible(false); setEditingTask(null); }}
          onSave={() => { setEditorVisible(false); setEditingTask(null); }} />
      </ErrorBoundary>
    </Container>
  );
}

function MonthHeader({ label, count, expanded, onPress }: { label: string; count: number; expanded: boolean; onPress?: () => void }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 16, marginVertical: 3, borderRadius: 8, gap: 8, backgroundColor: theme.cardBackground }}
      onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={{ fontSize: 12, width: 16, color: theme.textTertiary }}>{expanded ? '▼' : '▶'}</Text>
      <ThemedText style={{ fontSize: 13, fontWeight: '600', flex: 1, color: theme.textSecondary }}>{label}</ThemedText>
      <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: theme.primary + '20' }}>
        <ThemedText style={{ fontSize: 11, fontWeight: '600', color: theme.primary }}>{count}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function CompletedHeader({ count, expanded, onPress }: { count: number; expanded: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 16, marginVertical: 3, borderRadius: 8, gap: 8, backgroundColor: theme.cardBackground }}
      onPress={onPress} activeOpacity={0.7}>
      <Text style={{ fontSize: 12, width: 16, color: theme.textTertiary }}>{expanded ? '▼' : '▶'}</Text>
      <ThemedText style={{ fontSize: 13, fontWeight: '600', flex: 1, color: theme.textTertiary }}>已完成 {count} 项</ThemedText>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  mainRow: { flex: 1, flexDirection: 'row' },
  sidebar: { width: SIDEBAR_WIDTH, borderRightWidth: 1, paddingTop: 8 },
  sidebarItem: { alignItems: 'center', paddingVertical: 10, gap: 2 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#00000010' },
  topBarRow: { flexDirection: 'row', gap: 4, alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  iconBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  searchInline: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, gap: 6 },
  searchInput: { flex: 1, fontSize: 13, padding: 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
  undoBar: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8 },
});
