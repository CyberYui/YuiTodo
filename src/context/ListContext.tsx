/**
 * List state management — task lists.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createList, getAllLists, updateList, deleteList } from '../database/ListRepository';
import { TaskList } from '../types';

interface ListContextValue {
  lists: TaskList[];
  currentListId: number;
  setCurrentListId: (id: number) => void;
  addList: (name: string, icon?: string) => Promise<number>;
  editList: (id: number, updates: any) => Promise<void>;
  removeList: (id: number) => Promise<void>;
  loadLists: () => Promise<void>;
}

const ListContext = createContext<ListContextValue | null>(null);

export function ListProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [currentListId, setCurrentListId] = useState(1);

  const loadLists = useCallback(async () => {
    try {
      const data = await getAllLists();
      if (data.length === 0) {
        await createList('我的任务', '📋', 0);
        const newData = await getAllLists();
        setLists(newData);
      } else {
        setLists(data);
      }
    } catch (error) {
      console.error('Failed to load lists:', error);
    }
  }, []);

  useEffect(() => { loadLists(); }, [loadLists]);

  const addList = useCallback(async (name: string, icon?: string) => {
    const id = await createList(name, icon || '📋', lists.length);
    await loadLists();
    return id;
  }, [lists.length, loadLists]);

  const editList = useCallback(async (id: number, updates: any) => {
    await updateList(id, updates);
    await loadLists();
  }, [loadLists]);

  const removeList = useCallback(async (id: number) => {
    if (id === 1) return;
    await deleteList(id);
    if (currentListId === id) setCurrentListId(1);
    await loadLists();
  }, [currentListId, loadLists]);

  const value = useMemo<ListContextValue>(() => ({
    lists, currentListId, setCurrentListId, addList, editList, removeList, loadLists,
  }), [lists, currentListId, addList, editList, removeList, loadLists]);

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}

export function useList(): ListContextValue {
  const ctx = useContext(ListContext);
  if (!ctx) throw new Error('useList must be used within ListProvider');
  return ctx;
}
