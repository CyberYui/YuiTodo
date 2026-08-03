// 提醒全局状态管理
// 职责：管理每日提醒的开关、时间列表、权限、通知调度

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { initDatabase, getDatabase } from '../database/Database';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const ReminderContext = createContext();

async function buildNotificationContent() {
  try {
    await initDatabase();
    const db = getDatabase();
    const result = await db.execAsync(
      [{ sql: "SELECT title FROM task WHERE status = 'pending' ORDER BY start_time ASC LIMIT 5", args: [] }],
      true
    );
    const tasks = result[0].rows;
    const count = tasks.length;
    if (count === 0) {
      return { title: '📋 YuiTodo', body: '今天没有待办任务，好好休息！' };
    }
    const taskNames = tasks.map((t) => t.title);
    const displayNames = taskNames.slice(0, 3).join(' · ');
    const suffix = count > 3 ? ` 等${count}项` : '';
    return {
      title: '📋 YuiTodo',
      body: `${count}项待办：${displayNames}${suffix}`,
    };
  } catch (e) {
    return { title: '📋 YuiTodo', body: '你有待完成的任务' };
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function ReminderProvider({ children }) {
  const [enabled, setEnabledState] = useState(false);
  const [times, setTimes] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  // 应用启动时重新调度通知（处理设备重启场景）
  useEffect(() => {
    if (enabled && times.length > 0 && permissionStatus === 'granted') {
      scheduleAllNotifications();
    }
  }, [permissionStatus]);

  async function loadSettings() {
    try {
      await initDatabase();
      const db = getDatabase();
      const result = await db.execAsync(
        [{ sql: "SELECT key, value FROM app_setting WHERE key LIKE 'reminder_%'", args: [] }],
        true
      );
      const rows = result[0].rows;
      rows.forEach((row) => {
        if (row.key === 'reminder_enabled') {
          setEnabledState(row.value === 'true');
        } else if (row.key === 'reminder_times') {
          try {
            const parsed = JSON.parse(row.value);
            if (Array.isArray(parsed)) setTimes(parsed);
          } catch (e) {}
        }
      });
    } catch (e) {
      // 首次运行使用默认值
    }
  }

  async function saveSetting(key, value) {
    try {
      await initDatabase();
      const db = getDatabase();
      await db.execAsync(
        [{ sql: "INSERT OR REPLACE INTO app_setting (key, value) VALUES (?, ?)", args: [key, value] }],
        false
      );
    } catch (e) {
      console.error('保存提醒设置失败:', e);
    }
  }

  async function checkPermission() {
    if (!Device.isDevice) {
      setPermissionStatus('denied');
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  }

  const requestPermission = useCallback(async () => {
    if (!Device.isDevice) {
      Alert.alert('不支持', '通知功能需要真机使用');
      return false;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  }, []);

  async function clearAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async function scheduleAllNotifications() {
    await clearAllNotifications();
    if (!enabled || times.length === 0) return;

    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);
      const content = await buildNotificationContent();
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
    }
  }

  const setEnabled = useCallback(async (value) => {
    if (value && permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('需要通知权限', '请在系统设置中开启通知权限');
        return;
      }
    }
    setEnabledState(value);
    await saveSetting('reminder_enabled', String(value));
    if (value) {
      await scheduleAllNotifications();
    } else {
      await clearAllNotifications();
    }
  }, [permissionStatus, requestPermission]);

  const addTime = useCallback(async (time) => {
    const newTimes = [...times, time].sort();
    setTimes(newTimes);
    await saveSetting('reminder_times', JSON.stringify(newTimes));
    if (enabled) {
      await scheduleAllNotifications();
    }
  }, [times, enabled]);

  const removeTime = useCallback(async (index) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
    await saveSetting('reminder_times', JSON.stringify(newTimes));
    if (enabled) {
      await scheduleAllNotifications();
    }
  }, [times, enabled]);

  const hasActiveReminders = enabled && times.length > 0;

  const value = useMemo(() => ({
    enabled,
    times,
    permissionStatus,
    requestPermission,
    setEnabled,
    addTime,
    removeTime,
    hasActiveReminders,
    rescheduleAll: scheduleAllNotifications,
  }), [enabled, times, permissionStatus, requestPermission, setEnabled, addTime, removeTime, hasActiveReminders]);

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminder() {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminder必须在ReminderProvider内部使用');
  }
  return context;
}
