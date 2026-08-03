// 首页 v1.7.0 — 重构布局：侧边栏智能列表 + 内嵌搜索 + FAB
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView, ImageBackground, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBackground } from '../context/BackgroundContext';
import { useTasks } from '../context/TaskContext';
import { useList } from '../context/ListContext';
import { useDragSort } from '../context/DragSortContext';
import { TaskStatus } from '../utils/constants';
import { isDateToday, isExpired } from '../utils/dateHelpers';
import TaskEditorModal from '../components/TaskEditorModal';
import TaskItem from '../components/TaskItem';
import ErrorBoundary from '../components/ErrorBoundary';
import ThemedText from '../components/ThemedText';
import Icon from '../components/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 72;

const SMART_FILTERS = [
  { id: 'all', name: '全部', iconName: 'all' },
  { id: 'today', name: '今天', iconName: 'today' },
  { id: 'week', name: '本周', iconName: 'week' },
  { id: 'overdue', name: '逾期', iconName: 'overdue' },
];

export default function HomeScreen({ navigation }) {
  const { theme, styleConfig, isDark } = useTheme();
  const { getCurrentImage, getCurrentOpacity, hasBackground } = useBackground();
  const { tasks, isLoading, groups, currentGroupId, setCurrentGroupId, currentListId, setCurrentListId, completeTask, removeTask, restoreTask, toggleStep, toggleStar } = useTasks();
  const { lists } = useList();
  const { draggingTaskId, startDrag, updateDragOver, endDrag, reorderTasks } = useDragSort();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [smartFilter, setSmartFilter] = useState('all');
  const [undoItem, setUndoItem] = useState(null);
  const [topBarCollapsed, setTopBarCollapsed] = useState(false);
  const undoTimerRef = useRef(null);
  const undoAnim = useRef(new Animated.Value(0)).current;
  const dragFromIndex = useRef(null);

  // 拖拽排序处理
  const handleDragStart = useCallback((taskId) => {
    startDrag(taskId);
    const idx = listData.findIndex(item => item.type === 'task' && item.task.id === taskId);
    dragFromIndex.current = idx;
  }, [listData, startDrag]);

  const handleDragEnd = useCallback(async () => {
    if (dragOverIndex.current != null && dragFromIndex.current != null && dragOverIndex.current !== dragFromIndex.current) {
      // 执行重排序
      const taskItems = listData.filter(item => item.type === 'task');
      const newOrder = await reorderTasks(taskItems.map(i => i.task), dragFromIndex.current, dragOverIndex.current);
      if (newOrder) {
        // 触发任务重新加载
        // 注意：实际应用中这里需要更新tasks状态
      }
    }
    dragFromIndex.current = null;
    dragOverIndex.current = null;
    endDrag();
  }, [listData, reorderTasks, endDrag]);

  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragOverIndex = useRef(null);
  dragOverIndex.current = dragOverIdx;

  const imageUri = getCurrentImage(isDark);
  const opacity = getCurrentOpacity(isDark);
  const btnShape = styleConfig?.btnShape || 'round';
  const btnRadius = btnShape === 'pill' ? 20 : btnShape === 'sharp' ? 4 : styleConfig?.radius || 8;

  // 撤销删除
  const handleDeleteWithUndo = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
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

  // 智能列表过滤
  const filterBySmart = useCallback((taskList, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(today.getTime() + 86400000);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    switch (filter) {
      case 'today':
        return taskList.filter(t => {
          const d = new Date(t.start_date || t.start_time);
          return d >= today && d < todayEnd;
        });
      case 'week':
        return taskList.filter(t => {
          const d = new Date(t.start_date || t.start_time);
          return d >= today && d < weekEnd;
        });
      case 'overdue':
        return taskList.filter(t => isExpired(t.end_time) && t.status === TaskStatus.PENDING);
      default:
        return taskList;
    }
  }, []);

  const groupedTasks = useMemo(() => {
    const today = [], future = {}, completed = [];
    const query = searchQuery.toLowerCase().trim();
    let filteredTasks = tasks;

    // 分组过滤
    if (currentGroupId !== 0) {
      filteredTasks = filteredTasks.filter(t => t.group_id === currentGroupId);
    }
    // 搜索过滤
    if (query) {
      filteredTasks = filteredTasks.filter(t =>
        t.title?.toLowerCase().includes(query) || t.note?.toLowerCase().includes(query)
      );
    }
    // 智能列表过滤
    filteredTasks = filterBySmart(filteredTasks, smartFilter);

    // 智能列表激活时：扁平化展示，不分组按月归档
    if (smartFilter !== 'all') {
      filteredTasks.forEach((task) => {
        if (task.status === TaskStatus.DONE) { completed.push(task); return; }
        const isOverdue = isExpired(task.end_time) && task.status === TaskStatus.PENDING;
        today.push({ ...task, _priority: isOverdue ? 1 : 0 });
      });
      today.sort((a, b) => a._priority - b._priority || a.start_time - b.start_time);
      return { today, months: {}, completed, isSmartFiltered: true };
    }

    // 全部模式：按今日/月份/已完成分组
    filteredTasks.forEach((task) => {
      if (task.status === TaskStatus.DONE) { completed.push(task); return; }
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
    Object.keys(future).forEach((key) => { future[key].sort((a, b) => (a.start_date || a.start_time) - (b.start_date || b.start_time)); });
    return { today, months: future, completed, isSmartFiltered: false };
  }, [tasks, currentGroupId, searchQuery, smartFilter, filterBySmart]);

  const listData = useMemo(() => {
    const items = [];
    const isSmart = groupedTasks.isSmartFiltered;

    // 智能列表模式：扁平展示，无月份分组
    if (isSmart) {
      if (groupedTasks.today.length > 0) {
        items.push({ type: 'header', id: 'header-smart', label: SMART_FILTERS.find(f => f.id === smartFilter)?.name || '结果', count: groupedTasks.today.length, expanded: true });
        groupedTasks.today.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
      }
      if (groupedTasks.completed.length > 0) {
        items.push({ type: 'completed_header', id: 'header-completed', count: groupedTasks.completed.length, expanded: showCompleted });
        if (showCompleted) groupedTasks.completed.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
      }
      return items;
    }

    // 全部模式：按今日/月份/已完成分组
    if (groupedTasks.today.length > 0) {
      items.push({ type: 'header', id: 'header-today', label: '今天', count: groupedTasks.today.length, expanded: true });
      groupedTasks.today.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
    }
    const monthKeys = Object.keys(groupedTasks.months).sort().reverse();
    monthKeys.forEach((monthKey) => {
      const monthTasks = groupedTasks.months[monthKey];
      const isExpanded = expandedMonths[monthKey] || false;
      const [year, month] = monthKey.split('-');
      items.push({ type: 'header', id: `header-${monthKey}`, label: `${year}年${parseInt(month)}月`, count: monthTasks.length, expanded: isExpanded, monthKey });
      if (isExpanded) monthTasks.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
    });
    if (groupedTasks.completed.length > 0) {
      items.push({ type: 'completed_header', id: 'header-completed', count: groupedTasks.completed.length, expanded: showCompleted });
      if (showCompleted) groupedTasks.completed.forEach((task) => items.push({ type: 'task', id: `task-${task.id}`, task }));
    }
    return items;
  }, [groupedTasks, expandedMonths, showCompleted, smartFilter]);

  const toggleMonth = useCallback((monthKey) => { setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] })); }, []);
  const toggleCompleted = useCallback(() => { setShowCompleted((prev) => !prev); }, []);
  const handleComplete = useCallback((taskId) => { completeTask(taskId); }, [completeTask]);
  const handleLongPress = useCallback((task) => { setEditingTask(task); setEditorVisible(true); }, []);
  const handleNewTask = useCallback(() => { setEditingTask(null); setEditorVisible(true); }, []);

  const renderItem = ({ item, index }) => {
    if (item.type === 'header') return <MonthHeader label={item.label} count={item.count} expanded={item.expanded} onPress={item.monthKey ? () => toggleMonth(item.monthKey) : undefined} />;
    if (item.type === 'completed_header') return <CompletedHeader count={item.count} expanded={item.expanded} onPress={toggleCompleted} />;
    const isDragging = draggingTaskId === item.task.id;
    return (
      <View style={isDragging ? { transform: [{ scale: 1.05 }], elevation: 8, zIndex: 10 } : {}}>
        <TaskItem
          task={item.task}
          onPress={handleLongPress}
          onSwipeComplete={() => handleComplete(item.task.id)}
          onSwipeDelete={() => handleDeleteWithUndo(item.task.id)}
          onToggleStep={toggleStep}
          onToggleStar={toggleStar}
          onDragStart={handleDragStart}
          showDragHandle={smartFilter === 'all'}
        />
      </View>
    );
  };

  const groupChoirComponent = groups.length > 0 ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={groupStyles.groupBar} contentContainerStyle={groupStyles.groupBarContent}>
      <TouchableOpacity style={[groupStyles.groupChip, { backgroundColor: currentGroupId === 0 ? theme.primary : theme.cardBackground, borderColor: currentGroupId === 0 ? theme.primary : theme.separator, borderWidth: 1 }]} onPress={() => setCurrentGroupId(0)}>
        <ThemedText style={[groupStyles.groupChipText, { color: currentGroupId === 0 ? '#FFFFFF' : theme.textSecondary }]}>全部</ThemedText>
      </TouchableOpacity>
      {groups.map((group) => (
        <TouchableOpacity key={group.id} style={[groupStyles.groupChip, { backgroundColor: currentGroupId === group.id ? theme.primary : theme.cardBackground, borderColor: currentGroupId === group.id ? theme.primary : theme.separator, borderWidth: 1 }]} onPress={() => setCurrentGroupId(group.id)}>
          <ThemedText style={[groupStyles.groupChipText, { color: currentGroupId === group.id ? '#FFFFFF' : theme.textSecondary }]}>{group.icon} {group.name}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ) : null;

  const undoTranslateY = undoAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] });

  const Container = hasBackground ? ImageBackground : View;
  const imageProps = hasBackground ? { source: { uri: imageUri }, imageStyle: { opacity } } : {};

  return (
    <Container style={styles.container} {...imageProps}>
      {/* 主体：左侧边栏 + 右侧内容 */}
      <View style={styles.mainRow}>
        {/* 左侧智能列表侧边栏 */}
        <View style={[styles.sidebar, { backgroundColor: theme.cardBackground, borderRightColor: theme.separator }]}>
          {SMART_FILTERS.map((f) => {
            const isActive = smartFilter === f.id;
            return (
              <TouchableOpacity key={f.id} style={[styles.sidebarItem, isActive && { backgroundColor: theme.primary + '15' }]} onPress={() => setSmartFilter(f.id)} activeOpacity={0.7}>
                <Icon name={f.iconName} size={20} color={isActive ? theme.primary : theme.textTertiary} />
                <ThemedText style={[styles.sidebarLabel, { color: isActive ? theme.primary : theme.textTertiary }]}>{f.name}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 右侧主内容区 */}
        <View style={styles.contentArea}>
          {/* 顶部栏：内嵌搜索 + 折叠按钮 */}
          <View style={[styles.topBar, { backgroundColor: theme.cardBackground }]}>
            {searchActive ? (
              <View style={[styles.searchInline, { backgroundColor: theme.background, borderColor: theme.separator }]}>
                <Icon name="search" size={16} color={theme.textTertiary} />
                <TextInput style={[styles.searchInput, { color: theme.textPrimary }]} placeholder="搜索..." placeholderTextColor={theme.textTertiary} value={searchQuery} onChangeText={setSearchQuery} autoFocus />
                {searchQuery.length > 0 && (<TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}><Icon name="closeCircle" size={16} color={theme.textTertiary} /></TouchableOpacity>)}
                <TouchableOpacity onPress={() => { setSearchActive(false); setSearchQuery(''); }} style={styles.searchCancelBtn}>
                  <ThemedText style={[styles.searchCancelText, { color: theme.primary }]}>取消</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.topBarRow}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setSearchActive(true)} activeOpacity={0.6}>
                  <Icon name="search" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setTopBarCollapsed(!topBarCollapsed)} activeOpacity={0.6}>
                  <Icon name={topBarCollapsed ? 'chevronDown' : 'chevronUp'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')} activeOpacity={0.6}>
                  <Icon name="settings" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 可折叠区域：列表切换 + 分组标签 */}
          {!topBarCollapsed && (
            <View style={[styles.collapsible, { backgroundColor: theme.cardBackground, borderBottomColor: theme.separator }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listBar} contentContainerStyle={styles.listBarContent}>
                {lists.map((list) => (
                  <TouchableOpacity key={list.id} style={[styles.listChip, { backgroundColor: currentListId === list.id ? theme.primary : theme.background, borderColor: currentListId === list.id ? theme.primary : theme.separator, borderWidth: 1 }]} onPress={() => setCurrentListId(list.id)}>
                    <ThemedText style={[styles.listChipText, { color: currentListId === list.id ? '#FFFFFF' : theme.textSecondary }]}>{list.icon} {list.name}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 任务列表 */}
          {isLoading ? (
            <View style={styles.centerContent}><ThemedText style={{ color: theme.textSecondary }}>加载中...</ThemedText></View>
          ) : listData.length === 0 ? (
            <View style={{ flex: 1 }}>
              {groupChoirComponent}
              <View style={styles.centerContent}>
                {searchQuery ? (
                  <><ThemedText style={[styles.emptyText, { color: theme.textTertiary }]}>未找到匹配任务</ThemedText><ThemedText style={[styles.emptyHint, { color: theme.textTertiary }]}>换个关键词试试</ThemedText></>
                ) : (
                  <><ThemedText style={[styles.emptyText, { color: theme.textTertiary }]}>暂无待办任务</ThemedText><ThemedText style={[styles.emptyHint, { color: theme.textTertiary }]}>点击+开始</ThemedText></>
                )}
              </View>
            </View>
          ) : (
            <FlatList
              data={listData}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListHeaderComponent={groupChoirComponent}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={5}
              scrollEnabled={!draggingTaskId}
            />
          )}
        </View>
      </View>

      {/* 悬浮按钮：新建任务 */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary, borderRadius: btnRadius }]} onPress={handleNewTask} activeOpacity={0.8}>
        <Icon name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 撤销删除 Toast */}
      {undoItem && (
        <Animated.View style={[styles.undoBar, { backgroundColor: theme.cardBackground, borderColor: theme.separator, transform: [{ translateY: undoTranslateY }] }]}>
          <ThemedText style={[styles.undoText, { color: theme.textPrimary }]}>任务已删除</ThemedText>
          <TouchableOpacity onPress={handleUndo} style={[styles.undoBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.undoBtnText}>撤销</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ErrorBoundary>
        <TaskEditorModal visible={editorVisible} task={editingTask} onClose={() => { setEditorVisible(false); setEditingTask(null); }} onSave={() => { setEditorVisible(false); setEditingTask(null); }} />
      </ErrorBoundary>
    </Container>
  );
}

function MonthHeader({ label, count, expanded, onPress }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={[monthStyles.container, { backgroundColor: theme.cardBackground }]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={[monthStyles.arrow, { color: theme.textTertiary }]}>{expanded ? '▼' : '▶'}</Text>
      <ThemedText style={[monthStyles.label, { color: theme.textSecondary }]}>{label}</ThemedText>
      <View style={[monthStyles.count, { backgroundColor: theme.primary + '20' }]}>
        <ThemedText style={[monthStyles.countText, { color: theme.primary }]}>{count}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function CompletedHeader({ count, expanded, onPress }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={[monthStyles.container, { backgroundColor: theme.cardBackground }]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[monthStyles.arrow, { color: theme.textTertiary }]}>{expanded ? '▼' : '▶'}</Text>
      <ThemedText style={[monthStyles.label, { color: theme.textTertiary }]}>已完成 {count} 项</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainRow: { flex: 1, flexDirection: 'row' },
  // 左侧智能列表侧边栏
  sidebar: { width: SIDEBAR_WIDTH, borderRightWidth: 1, paddingTop: 8 },
  sidebarItem: { alignItems: 'center', paddingVertical: 10, gap: 2 },
  sidebarIcon: { fontSize: 16 },
  sidebarLabel: { fontSize: 10 },
  // 右侧主内容区
  contentArea: { flex: 1 },
  // 顶部栏
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#00000010' },
  topBarRow: { flexDirection: 'row', gap: 4, alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  iconBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  // 内嵌搜索
  searchInline: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, gap: 6 },
  searchInput: { flex: 1, fontSize: 13, padding: 0 },
  searchClearBtn: { padding: 4 },
  searchClearText: { fontSize: 12 },
  searchCancelBtn: { paddingLeft: 8 },
  searchCancelText: { fontSize: 13, fontWeight: '500' },
  // 可折叠区域
  collapsible: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 6 },
  listBar: { maxHeight: 36 },
  listBarContent: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  listChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  listChipText: { fontSize: 11, fontWeight: '500' },
  // 任务列表
  listContent: { paddingVertical: 4 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, marginBottom: 4 },
  emptyHint: { fontSize: 12 },
  // 悬浮按钮
  fab: { position: 'absolute', bottom: 24, right: 20, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
  fabText: { color: '#FFFFFF', fontSize: 24, fontWeight: '300' },
  // 撤销删除
  undoBar: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  undoText: { fontSize: 13, fontWeight: '500' },
  undoBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  undoBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});

const groupStyles = StyleSheet.create({
  groupBar: { maxHeight: 48 },
  groupBarContent: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  groupChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  groupChipText: { fontSize: 13, fontWeight: '500' },
});

const monthStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 16, marginVertical: 3, borderRadius: 8, gap: 8 },
  arrow: { fontSize: 12, width: 16 },
  label: { fontSize: 13, fontWeight: '600', flex: 1 },
  count: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 11, fontWeight: '600' },
});
