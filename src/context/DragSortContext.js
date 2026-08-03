// 拖拽排序状态管理
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { batchUpdateSortOrders } from '../database/TaskTable';

const DragSortContext = createContext();

export function DragSortProvider({ children }) {
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragY = useRef(new Animated.Value(0)).current;

  const startDrag = useCallback((taskId) => {
    setDraggingTaskId(taskId);
  }, []);

  const updateDragOver = useCallback((index) => {
    setDragOverIndex(index);
  }, []);

  const endDrag = useCallback(() => {
    setDraggingTaskId(null);
    setDragOverIndex(null);
    dragY.setValue(0);
  }, [dragY]);

  const reorderTasks = useCallback(async (tasks, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return tasks;
    const newTasks = [...tasks];
    const [moved] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, moved);
    // 批量更新数据库排序
    const updates = newTasks.map((t, idx) => ({ id: t.id, sortOrder: idx }));
    await batchUpdateSortOrders(updates);
    return newTasks;
  }, []);

  const value = {
    draggingTaskId,
    dragOverIndex,
    dragY,
    startDrag,
    updateDragOver,
    endDrag,
    reorderTasks,
  };

  return (
    <DragSortContext.Provider value={value}>
      {children}
    </DragSortContext.Provider>
  );
}

export function useDragSort() {
  const context = useContext(DragSortContext);
  if (!context) throw new Error('useDragSort必须在DragSortProvider内部使用');
  return context;
}
