// 首页 v1.6.0
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView, ImageBackground, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBackground } from '../context/BackgroundContext';
import { useTasks } from '../context/TaskContext';
import { useList } from '../context/ListContext';
import { TaskStatus } from '../utils/constants';
import { isDateToday, isExpired } from '../utils/dateHelpers';
import TaskEditorModal from '../components/TaskEditorModal';
import TaskItem from '../components/TaskItem';
import ErrorBoundary from '../components/ErrorBoundary';
import ThemedText from '../components/ThemedText';

const SMART_FILTERS = [
  { id: 'all', name: '全部' },
  { id: 'today', name: '今天' },
  { id: 'week', name: '本周' },
  { id: 'overdue', name: '已逾期' },
];

export default function HomeScreen({ navigation }) {
  const { theme, styleConfig, isDark } = useTheme();
  const { getCurrentImage, getCurrentOpacity, hasBackground } = useBackground();
  const { tasks, isLoading, groups, currentGroupId, setCurrentGroupId, currentListId, setCurrentListId, completeTask, removeTask, restoreTask, toggleStep, toggleStar } = useTasks();
  const { lists } = useList();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [smartFilter, setSmartFilter] = useState('all');
  const [undoItem, setUndoItem] = useState(null);
  const undoTimerRef = useRef(null);
  const undoAnim = useRef(new Animated.Value(0)).current;

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
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    switch (filter) {
      case 'today':
        return taskList.filter(t => {
          const d = new Date(t.start_date || t.start_time);
          return d >= today && d < new Date(today.getTime() + 86400000);
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
    return { today, months: future, completed };
  }, [tasks, currentGroupId, searchQuery, smartFilter, filterBySmart]);

  const listData = useMemo(() => {
    const items = [];
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
  }, [groupedTasks, expandedMonths, showCompleted]);

  const toggleMonth = useCallback((monthKey) => { setExpandedMonths((prev) => ({ ...prev, [monthKey]: !prev[monthKey] })); }, []);
  const toggleCompleted = useCallback(() => { setShowCompleted((prev) => !prev); }, []);
  const handleComplete = useCallback((taskId) => { completeTask(taskId); }, [completeTask]);
  const handleLongPress = useCallback((task) => { setEditingTask(task); setEditorVisible(true); }, []);
  const handleNewTask = useCallback(() => { setEditingTask(null); setEditorVisible(true); }, []);

  const renderItem = ({ item }) => {
    if (item.type === 'header') return <MonthHeader label={item.label} count={item.count} expanded={item.expanded} onPress={item.monthKey ? () => toggleMonth(item.monthKey) : undefined} />;
    if (item.type === 'completed_header') return <CompletedHeader count={item.count} expanded={item.expanded} onPress={toggleCompleted} />;
    return <TaskItem task={item.task} onPress={handleLongPress} onSwipeComplete={() => handleComplete(item.task.id)} onSwipeDelete={() => handleDeleteWithUndo(item.task.id)} onToggleStep={toggleStep} onToggleStar={toggleStar} />;
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
      <View style={[styles.topBar, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity style={[styles.newButton, { backgroundColor: theme.primary, borderRadius: btnRadius }]} onPress={handleNewTask} activeOpacity={0.7}>
          <ThemedText style={styles.newButtonText}>+ 新建任务</ThemedText>
        </TouchableOpacity>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.searchToggleBtn} onPress={() => setSearchActive(!searchActive)}>
            <ThemedText style={[styles.searchToggleText, { color: searchActive ? theme.primary : theme.textSecondary }]}>🔍</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statButton} onPress={() => navigation.navigate('Settings')}>
            <ThemedText style={[styles.statButtonText, { color: theme.primary }]}>设置</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 列表切换 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listBar} contentContainerStyle={styles.listBarContent}>
        {lists.map((list) => (
          <TouchableOpacity key={list.id} style={[styles.listChip, { backgroundColor: currentListId === list.id ? theme.primary : theme.cardBackground, borderColor: currentListId === list.id ? list.id : theme.separator, borderWidth: 1 }]} onPress={() => setCurrentListId(list.id)}>
            <ThemedText style={[styles.listChipText, { color: currentListId === list.id ? '#FFFFFF' : theme.textSecondary }]}>{list.icon} {list.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 智能列表过滤 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.smartFilterBar} contentContainerStyle={styles.smartFilterContent}>
        {SMART_FILTERS.map((f) => (
          <TouchableOpacity key={f.id} style={[styles.smartFilterChip, { backgroundColor: smartFilter === f.id ? theme.primary : theme.cardBackground, borderColor: smartFilter === f.id ? theme.primary : theme.separator, borderWidth: 1 }]} onPress={() => setSmartFilter(f.id)}>
            <ThemedText style={[styles.smartFilterText, { color: smartFilter === f.id ? '#FFFFFF' : theme.textSecondary }]}>{f.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {searchActive && (
        <View style={[styles.searchBar, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
          <TextInput style={[styles.searchInput, { color: theme.textPrimary }]} placeholder="搜索任务..." placeholderTextColor={theme.textTertiary} value={searchQuery} onChangeText={setSearchQuery} autoFocus />
          {searchQuery.length > 0 && (<TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}><Text style={[styles.searchClearText, { color: theme.textTertiary }]}>✕</Text></TouchableOpacity>)}
        </View>
      )}

      {isLoading ? (
        <View style={styles.centerContent}><ThemedText style={{ color: theme.textSecondary }}>加载中...</ThemedText></View>
      ) : listData.length === 0 ? (
        <View style={{ flex: 1 }}>
          {groupChoirComponent}
          <View style={styles.centerContent}>
            {searchQuery ? (
              <><ThemedText style={[styles.emptyText, { color: theme.textTertiary }]}>未找到匹配任务</ThemedText><ThemedText style={[styles.emptyHint, { color: theme.textTertiary }]}>换个关键词试试</ThemedText></>
            ) : (
              <><ThemedText style={[styles.emptyText, { color: theme.textTertiary }]}>暂无待办任务</ThemedText><ThemedText style={[styles.emptyHint, { color: theme.textTertiary }]}>点击"新建任务"开始</ThemedText></>
            )}
          </View>
        </View>
      ) : (
        <FlatList data={listData} keyExtractor={(item) => item.id} renderItem={renderItem} ListHeaderComponent={groupChoirComponent} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} initialNumToRender={10} maxToRenderPerBatch={5} windowSize={5} />
      )}

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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#00000015' },
  newButton: { paddingHorizontal: 16, paddingVertical: 8 },
  newButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  topBarRight: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  searchToggleBtn: { paddingHorizontal: 8, paddingVertical: 8 },
  searchToggleText: { fontSize: 18 },
    listBar: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: '#00000008' },
    listBarContent: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    listChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
    listChipText: { fontSize: 13, fontWeight: '500' },
    smartFilterBar: { maxHeight: 44 },
  smartFilterContent: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  smartFilterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  smartFilterText: { fontSize: 13, fontWeight: '500' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  searchClearBtn: { padding: 4, marginLeft: 8 },
  searchClearText: { fontSize: 14 },
  listContent: { paddingVertical: 8 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, marginBottom: 4 },
  emptyHint: { fontSize: 13 },
  undoBar: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  undoText: { fontSize: 14, fontWeight: '500' },
  undoBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  undoBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
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
