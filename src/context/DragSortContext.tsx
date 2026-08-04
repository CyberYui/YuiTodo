/**
 * Drag-and-drop sorting state management.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import { batchUpdateSortOrders } from '../database/TaskRepository';

interface DragSortContextValue {
  draggingTaskId: number | null;
  dragOverIndex: number | null;
  dragY: Animated.Value;
  startDrag: (taskId: number) => void;
  updateDragOver: (index: number | null) => void;
  endDrag: () => void;
  reorderTasks: (tasks: any[], fromIndex: number, toIndex: number) => Promise<any[]>;
}

const DragSortContext = createContext<DragSortContextValue | null>(null);

export function DragSortProvider({ children }: { children: React.ReactNode }) {
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragY = useRef(new Animated.Value(0)).current;

  const startDrag = useCallback((taskId: number) => {
    setDraggingTaskId(taskId);
  }, []);

  const updateDragOver = useCallback((index: number | null) => {
    setDragOverIndex(index);
  }, []);

  const endDrag = useCallback(() => {
    setDraggingTaskId(null);
    setDragOverIndex(null);
    dragY.setValue(0);
  }, [dragY]);

  const reorderTasks = useCallback(async (tasks: any[], fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return tasks;
    const newTasks = [...tasks];
    const [moved] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, moved);
    const updates = newTasks.map((t, idx) => ({ id: t.id, sortOrder: idx }));
    await batchUpdateSortOrders(updates);
    return newTasks;
  }, []);

  const value = useMemo<DragSortContextValue>(() => ({
    draggingTaskId, dragOverIndex, dragY, startDrag, updateDragOver, endDrag, reorderTasks,
  }), [draggingTaskId, dragOverIndex, dragY, startDrag, updateDragOver, endDrag, reorderTasks]);

  return <DragSortContext.Provider value={value}>{children}</DragSortContext.Provider>;
}

export function useDragSort(): DragSortContextValue {
  const ctx = useContext(DragSortContext);
  if (!ctx) throw new Error('useDragSort must be used within DragSortProvider');
  return ctx;
}
