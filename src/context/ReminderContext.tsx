/**
 * Reminder state management — daily notification scheduling.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getSetting, setSetting } from '../database/SettingsRepository';
import { initDatabase, getDatabase } from '../database/Database';

interface ReminderContextValue {
  enabled: boolean;
  times: string[];
  permissionStatus: string;
  requestPermission: () => Promise<boolean>;
  setEnabled: (value: boolean) => Promise<void>;
  addTime: (time: string) => Promise<void>;
  removeTime: (index: number) => Promise<void>;
  hasActiveReminders: boolean;
  rescheduleAll: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextValue | null>(null);

async function buildNotificationContent(): Promise<{ title: string; body: string }> {
  try {
    await initDatabase();
    const db = getDatabase();
    const result = await db.execAsync(
      [{ sql: "SELECT title FROM task WHERE status = 'pending' ORDER BY start_time ASC LIMIT 5", args: [] }],
      true
    );
    const tasks = (result[0] as any).rows;
    const count = tasks.length;
    if (count === 0) return { title: '📋 YuiTodo', body: '今天没有待办任务，好好休息！' };
    const taskNames = tasks.map((t: any) => t.title);
    const displayNames = taskNames.slice(0, 3).join(' · ');
    const suffix = count > 3 ? ` 等${count}项` : '';
    return { title: '📋 YuiTodo', body: `${count}项待办：${displayNames}${suffix}` };
  } catch {
    return { title: '📋 YuiTodo', body: '你有待完成的任务' };
  }
}

// Notification handler setup moved inside provider init
// to avoid module-scope side effects during app startup

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [times, setTimes] = useState<string[]>([]);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');

  useEffect(() => {
    // Setup notification handler (moved from module scope to avoid early init)
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch (e) {
      console.error('Notification handler setup failed:', e);
    }
    loadSettings();
    checkPermission();
  }, []);

  useEffect(() => {
    if (enabled && times.length > 0 && permissionStatus === 'granted') {
      scheduleAllNotifications();
    }
  }, [permissionStatus]);

  async function loadSettings() {
    try {
      await initDatabase();
      const enabledStr = await getSetting('reminder_enabled');
      const timesStr = await getSetting('reminder_times');
      if (enabledStr === 'true') setEnabledState(true);
      if (timesStr) {
        try {
          const parsed = JSON.parse(timesStr);
          if (Array.isArray(parsed)) setTimes(parsed);
        } catch {}
      }
    } catch {}
  }

  async function checkPermission() {
    if (!Device.isDevice) { setPermissionStatus('denied'); return; }
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  }

  const requestPermission = useCallback(async (): Promise<boolean> => {
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
        trigger: { hour, minute, repeats: true },
      });
    }
  }

  const setEnabled = useCallback(async (value: boolean) => {
    if (value && permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('需要通知权限', '请在系统设置中开启通知权限');
        return;
      }
    }
    setEnabledState(value);
    await setSetting('reminder_enabled', String(value));
    if (value) await scheduleAllNotifications();
    else await clearAllNotifications();
  }, [permissionStatus, requestPermission]);

  const addTime = useCallback(async (time: string) => {
    const newTimes = [...times, time].sort();
    setTimes(newTimes);
    await setSetting('reminder_times', JSON.stringify(newTimes));
    if (enabled) await scheduleAllNotifications();
  }, [times, enabled]);

  const removeTime = useCallback(async (index: number) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
    await setSetting('reminder_times', JSON.stringify(newTimes));
    if (enabled) await scheduleAllNotifications();
  }, [times, enabled]);

  const hasActiveReminders = enabled && times.length > 0;

  const value = useMemo<ReminderContextValue>(() => ({
    enabled, times, permissionStatus, requestPermission, setEnabled,
    addTime, removeTime, hasActiveReminders, rescheduleAll: scheduleAllNotifications,
  }), [enabled, times, permissionStatus, requestPermission, setEnabled,
    addTime, removeTime, hasActiveReminders]);

  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
}

export function useReminder(): ReminderContextValue {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error('useReminder must be used within ReminderProvider');
  return ctx;
}
