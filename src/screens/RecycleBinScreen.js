// 回收站页面
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import ThemedText from '../components/ThemedText';

export default function RecycleBinScreen({ navigation }) {
  const { theme } = useTheme();
  const { restoreFromRecycleBin, permanentDeleteTask, getRecycleBinTasks, emptyRecycleBin } = useTasks();
  const [deletedTasks, setDeletedTasks] = useState([]);
  const styles = createStyles(theme);

  const loadDeleted = useCallback(async () => {
    const tasks = await getRecycleBinTasks();
    setDeletedTasks(tasks);
  }, [getRecycleBinTasks]);

  useEffect(() => { loadDeleted(); }, [loadDeleted]);

  const handleRestore = async (taskId) => {
    await restoreFromRecycleBin(taskId);
    loadDeleted();
  };

  const handleDeleteForever = (taskId, title) => {
    Alert.alert('永久删除', `确定永久删除"${title}"吗？此操作不可恢复。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => { await permanentDeleteTask(taskId); loadDeleted(); } },
    ]);
  };

  const handleEmpty = () => {
    Alert.alert('清空回收站', '确定清空回收站吗？所有任务将被永久删除。', [
      { text: '取消', style: 'cancel' },
      { text: '清空', style: 'destructive', onPress: async () => { await emptyRecycleBin(); setDeletedTasks([]); } },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.taskItem, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
      <View style={styles.taskContent}>
        <ThemedText style={[styles.taskTitle, { color: theme.textPrimary }]} numberOfLines={1}>{item.title}</ThemedText>
        <ThemedText style={[styles.taskMeta, { color: theme.textTertiary }]}>{new Date(item.deleted_at).toLocaleDateString()}</ThemedText>
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => handleRestore(item.id)} style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
          <Text style={styles.actionBtnText}>恢复</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteForever(item.id, item.title)} style={[styles.actionBtn, { backgroundColor: theme.danger }]}>
          <Text style={styles.actionBtnText}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {deletedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={[styles.emptyText, { color: theme.textTertiary }]}>回收站为空</ThemedText>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <ThemedText style={[styles.headerText, { color: theme.textSecondary }]}>共 {deletedTasks.length} 项 · 30天后自动清除</ThemedText>
            <TouchableOpacity onPress={handleEmpty} style={[styles.emptyBtn, { backgroundColor: theme.danger }]}>
              <Text style={styles.emptyBtnText}>清空</Text>
            </TouchableOpacity>
          </View>
          <FlatList data={deletedTasks} renderItem={renderItem} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list} />
        </>
      )}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    headerText: { fontSize: 13 },
    emptyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    emptyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    list: { paddingHorizontal: 16 },
    taskItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1 },
    taskContent: { flex: 1 },
    taskTitle: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
    taskMeta: { fontSize: 12 },
    taskActions: { flexDirection: 'row', gap: 8 },
    actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 15 },
  });
}
