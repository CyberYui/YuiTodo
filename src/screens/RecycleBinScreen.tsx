/**
 * Recycle bin — soft-deleted tasks with restore/permanent delete.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { ThemedText } from '../components';
import { Task } from '../types';

export default function RecycleBinScreen() {
  const { theme } = useTheme();
  const { restoreFromRecycleBin, permanentDeleteTask, getRecycleBinTasks, emptyRecycleBin } = useTasks();
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);

  const loadDeleted = useCallback(async () => {
    const tasks = await getRecycleBinTasks();
    setDeletedTasks(tasks);
  }, [getRecycleBinTasks]);

  useEffect(() => { loadDeleted(); }, [loadDeleted]);

  const handleRestore = useCallback(async (taskId: number) => {
    await restoreFromRecycleBin(taskId);
    loadDeleted();
  }, [restoreFromRecycleBin, loadDeleted]);

  const handleDeleteForever = useCallback((taskId: number, title: string) => {
    Alert.alert('永久删除', `确定永久删除"${title}"吗？此操作不可恢复。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => { await permanentDeleteTask(taskId); loadDeleted(); } },
    ]);
  }, [permanentDeleteTask, loadDeleted]);

  const handleEmpty = useCallback(() => {
    Alert.alert('清空回收站', '确定清空回收站吗？所有任务将被永久删除。', [
      { text: '取消', style: 'cancel' },
      { text: '清空', style: 'destructive', onPress: async () => { await emptyRecycleBin(); setDeletedTasks([]); } },
    ]);
  }, [emptyRecycleBin]);

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: theme.separator, backgroundColor: theme.cardBackground }}>
      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontSize: 15, fontWeight: '500', marginBottom: 2, color: theme.textPrimary }} numberOfLines={1}>{item.title}</ThemedText>
        <ThemedText style={{ fontSize: 12, color: theme.textTertiary }}>{new Date(item.deleted_at!).toLocaleDateString()}</ThemedText>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={() => handleRestore(item.id)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.primary }}>
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>恢复</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteForever(item.id, item.title)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.danger }}>
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [theme, handleRestore, handleDeleteForever]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {deletedTasks.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={{ fontSize: 15, color: theme.textTertiary }}>回收站为空</ThemedText>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <ThemedText style={{ fontSize: 13, color: theme.textSecondary }}>共 {deletedTasks.length} 项 · 30天后自动清除</ThemedText>
            <TouchableOpacity onPress={handleEmpty} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.danger }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>清空</Text>
            </TouchableOpacity>
          </View>
          <FlatList data={deletedTasks} renderItem={renderItem} keyExtractor={(item) => String(item.id)} contentContainerStyle={{ paddingHorizontal: 16 }} />
        </>
      )}
    </View>
  );
}
