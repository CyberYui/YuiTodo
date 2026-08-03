// 列表全局状态管理
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createList, getAllLists, updateList, deleteList } from '../database/ListTable';

const ListContext = createContext();

export function ListProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(1);

  useEffect(() => { loadLists(); }, []);

  async function loadLists() {
    try {
      const data = await getAllLists();
      if (data.length === 0) {
        // 创建默认列表
        await createList('我的任务', '📋', 0);
        const newData = await getAllLists();
        setLists(newData);
      } else {
        setLists(data);
      }
    } catch (e) {
      console.error('加载列表失败:', e);
    }
  }

  const addList = useCallback(async (name, icon) => {
    const id = await createList(name, icon || '📋', lists.length);
    await loadLists();
    return id;
  }, [lists.length]);

  const editList = useCallback(async (id, updates) => {
    await updateList(id, updates);
    await loadLists();
  }, []);

  const removeList = useCallback(async (id) => {
    if (id === 1) return; // 不能删除默认列表
    await deleteList(id);
    if (currentListId === id) setCurrentListId(1);
    await loadLists();
  }, [currentListId]);

  const value = useMemo(() => ({
    lists,
    currentListId,
    setCurrentListId,
    addList,
    editList,
    removeList,
    loadLists,
  }), [lists, currentListId, addList, editList, removeList]);

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}

export function useList() {
  const context = useContext(ListContext);
  if (!context) throw new Error('useList必须在ListProvider内部使用');
  return context;
}
