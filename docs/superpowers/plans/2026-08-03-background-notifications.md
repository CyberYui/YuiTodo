# Background Image + Notification Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add background image support for the task list area and multi-time daily notification reminders to YuiTodo.

**Architecture:** Two new Context providers (BackgroundContext, ReminderContext) manage state and persistence via app_setting table. New settings screens follow existing patterns (SettingsScreen entries → dedicated pages). HomeScreen wraps content in ImageBackground. expo-notifications handles scheduling with Android 13+ permission flow.

**Tech Stack:** React Native, expo-image-picker, expo-file-system, expo-image-manipulator, expo-notifications, expo-device, expo-sqlite (legacy)

---

## File Structure

### New Files
- `src/context/BackgroundContext.js` — Background image state (uri, opacity) + image selection/compression
- `src/context/ReminderContext.js` — Reminder state (enabled, times[]) + notification scheduling
- `src/screens/BackgroundSettingsScreen.js` — Background settings page (preview + opacity slider)
- `src/screens/ReminderSettingsScreen.js` — Reminder settings page (toggle + time list)

### Modified Files
- `src/database/Database.js` — Add `reminder_time` column to task table in migration
- `src/screens/HomeScreen.js` — Wrap content in ImageBackground
- `src/screens/SettingsScreen.js` — Add "背景图片" and "每日提醒" entry rows
- `src/components/TaskEditorModal.js` — Add "提醒时间" override option
- `src/context/TaskContext.js` — Reschedule notifications on app init
- `src/utils/constants.js` — Bump APP_VERSION to 1.4.0
- `App.js` — Add BackgroundProvider, ReminderProvider, new routes
- `app.json` — Bump version to 1.4.0

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Expo + Community packages**

Run:
```bash
cd /Users/yui/Documents/GitHub/YuiTodo
npx expo install expo-image-picker expo-file-system expo-image-manipulator expo-notifications expo-device @react-native-community/slider @react-native-community/datetimepicker
```

Expected: All packages installed successfully, package.json updated.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json yarn.lock
git commit -m "deps: add image-picker, file-system, image-manipulator, notifications, device, slider, datetimepicker"
```

---

## Task 2: Database Migration — Add reminder_time Column

**Files:**
- Modify: `src/database/Database.js`

- [ ] **Step 1: Bump DB version and add migration**

In `src/database/Database.js`, change `CURRENT_DB_VERSION` from `3` to `4`.

In the `migrateSchema` function, add a new version block after the `if (currentVersion < 2)` block:

```js
if (currentVersion < 4) {
  try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN reminder_time TEXT', args: [] }], false); } catch (e) {}
}
```

- [ ] **Step 2: Commit**

```bash
git add src/database/Database.js
git commit -m "db: add reminder_time column to task table (v4 migration)"
```

---

## Task 3: BackgroundContext

**Files:**
- Create: `src/context/BackgroundContext.js`

- [ ] **Step 1: Write the BackgroundContext**

Create `src/context/BackgroundContext.js`:

```javascript
// 背景图片全局状态管理
// 职责：管理任务列表背景图片的选择、压缩、透明度、持久化

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { initDatabase, getDatabase } from '../database/Database';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

const BackgroundContext = createContext();

const STORAGE_DIR = `${FileSystem.documentDirectory}backgrounds/`;

export function BackgroundProvider({ children }) {
  const [imageUri, setImageUri] = useState(null);
  const [opacity, setOpacityState] = useState(0.6);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      await initDatabase();
      const db = getDatabase();
      const result = await db.execAsync(
        [{ sql: "SELECT key, value FROM app_setting WHERE key LIKE 'background_%'", args: [] }],
        true
      );
      const rows = result[0].rows;
      rows.forEach((row) => {
        if (row.key === 'background_image_uri' && row.value) {
          setImageUri(row.value);
        } else if (row.key === 'background_opacity') {
          setOpacityState(parseFloat(row.value) || 0.6);
        }
      });
    } catch (e) {
      // 首次运行使用默认值
    } finally {
      setIsLoading(false);
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
      console.error('保存背景设置失败:', e);
    }
  }

  const selectImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '请允许访问相册以选择背景图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const originalUri = result.assets[0].uri;

    // 压缩图片
    const compressed = await ImageManipulator.manipulateAsync(
      originalUri,
      [{ resize: { width: 1080 } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 确保存储目录存在
    const dirInfo = await FileSystem.getInfoAsync(STORAGE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
    }

    // 复制到应用目录
    const fileName = `background_${Date.now()}.jpg`;
    const destUri = `${STORAGE_DIR}${fileName}`;
    await FileSystem.copyAsync({ from: compressed.uri, to: destUri });

    // 删除旧背景文件
    if (imageUri && imageUri.startsWith(STORAGE_DIR)) {
      try { await FileSystem.deleteAsync(imageUri); } catch (e) {}
    }

    setImageUri(destUri);
    await saveSetting('background_image_uri', destUri);
  }, [imageUri]);

  const setOpacity = useCallback((value) => {
    setOpacityState(value);
    saveSetting('background_opacity', String(value));
  }, []);

  const removeBackground = useCallback(async () => {
    if (imageUri && imageUri.startsWith(STORAGE_DIR)) {
      try { await FileSystem.deleteAsync(imageUri); } catch (e) {}
    }
    setImageUri(null);
    await saveSetting('background_image_uri', '');
  }, [imageUri]);

  const hasBackground = useMemo(() => imageUri !== null, [imageUri]);

  const value = useMemo(() => ({
    imageUri,
    opacity,
    hasBackground,
    isLoading,
    selectImage,
    setOpacity,
    removeBackground,
  }), [imageUri, opacity, hasBackground, isLoading, selectImage, setOpacity, removeBackground]);

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground必须在BackgroundProvider内部使用');
  }
  return context;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/BackgroundContext.js
git commit -m "feat: add BackgroundContext for task list background image"
```

---

## Task 4: BackgroundSettingsScreen

**Files:**
- Create: `src/screens/BackgroundSettingsScreen.js`

- [ ] **Step 1: Write the BackgroundSettingsScreen**

Create `src/screens/BackgroundSettingsScreen.js`:

```javascript
// 背景设置页面
// 职责：选图、预览、透明度调节

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';
import { useBackground } from '../context/BackgroundContext';
import ThemedText from '../components/ThemedText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BackgroundSettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const { imageUri, opacity, hasBackground, selectImage, setOpacity, removeBackground } = useBackground();
  const styles = createStyles(theme);

  const handleRemove = () => {
    Alert.alert('移除背景', '确定要移除当前背景图片吗？', [
      { text: '取消', style: 'cancel' },
      { text: '移除', style: 'destructive', onPress: removeBackground },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 预览区 */}
      <View style={styles.previewSection}>
        {hasBackground ? (
          <ImageBackground
            source={{ uri: imageUri }}
            style={styles.previewImage}
            imageStyle={[styles.previewImageStyle, { opacity }]}
          >
            <View style={styles.previewOverlay}>
              <View style={styles.previewCard}>
                <ThemedText style={styles.previewCardTitle}>今天</ThemedText>
                <ThemedText style={styles.previewCardItem}>☑ 写周报</ThemedText>
                <ThemedText style={styles.previewCardItem}>☐ 运动 30 分钟</ThemedText>
                <ThemedText style={styles.previewCardItem}>☐ 阅读 1 小时</ThemedText>
              </View>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.emptyPreview}>
            <ThemedText style={styles.emptyText}>未设置背景</ThemedText>
            <ThemedText style={styles.emptySub}>点击下方按钮选择图片</ThemedText>
          </View>
        )}
      </View>

      {/* 操作按钮 */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={selectImage}>
          <ThemedText style={styles.buttonText}>
            {hasBackground ? '更换图片' : '选择图片'}
          </ThemedText>
        </TouchableOpacity>
        {hasBackground && (
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.danger }]} onPress={handleRemove}>
            <ThemedText style={styles.buttonText}>移除背景</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* 透明度控制 */}
      {hasBackground && (
        <View style={[styles.opacitySection, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
          <View style={styles.opacityHeader}>
            <ThemedText style={[styles.opacityLabel, { color: theme.textPrimary }]}>透明度</ThemedText>
            <ThemedText style={[styles.opacityValue, { color: theme.textSecondary }]}>
              {Math.round(opacity * 100)}%
            </ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={opacity}
            onValueChange={setOpacity}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.separator}
            thumbTintColor={theme.primary}
          />
          <View style={styles.opacityLabels}>
            <ThemedText style={[styles.opacityExtreme, { color: theme.textTertiary }]}>透明</ThemedText>
            <ThemedText style={[styles.opacityExtreme, { color: theme.textTertiary }]}>不透明</ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    previewSection: { height: 280, margin: 16, borderRadius: 12, overflow: 'hidden' },
    previewImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    previewImageStyle: { borderRadius: 0 },
    previewOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    previewCard: {
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: 12,
      padding: 16,
      width: SCREEN_WIDTH - 80,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    previewCardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    previewCardItem: { fontSize: 14, marginBottom: 4 },
    emptyPreview: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.cardBackground },
    emptyText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    emptySub: { fontSize: 13 },
    buttonSection: { paddingHorizontal: 16, gap: 8 },
    button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    opacitySection: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1 },
    opacityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    opacityLabel: { fontSize: 15, fontWeight: '600' },
    opacityValue: { fontSize: 15, fontWeight: '700' },
    slider: { width: '100%', height: 40 },
    opacityLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    opacityExtreme: { fontSize: 12 },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/BackgroundSettingsScreen.js
git commit -m "feat: add BackgroundSettingsScreen with preview and opacity control"
```

---

## Task 5: ReminderContext

**Files:**
- Create: `src/context/ReminderContext.js`

- [ ] **Step 1: Write the ReminderContext**

Create `src/context/ReminderContext.js`:

```javascript
// 提醒全局状态管理
// 职责：管理每日提醒的开关、时间列表、权限、通知调度

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { initDatabase, getDatabase } from '../database/Database';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const ReminderContext = createContext();

// 通知内容生成器
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

// 配置通知行为
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

  // 清除所有已调度通知
  async function clearAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // 重新调度所有通知
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
```

- [ ] **Step 2: Commit**

```bash
git add src/context/ReminderContext.js
git commit -m "feat: add ReminderContext with notification scheduling"
```

---

## Task 6: ReminderSettingsScreen

**Files:**
- Create: `src/screens/ReminderSettingsScreen.js`

- [ ] **Step 1: Write the ReminderSettingsScreen**

Create `src/screens/ReminderSettingsScreen.js`:

```javascript
// 提醒设置页面
// 职责：开关、时间列表、添加/删除时间、权限提示

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { useReminder } from '../context/ReminderContext';
import ThemedText from '../components/ThemedText';

export default function ReminderSettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const { enabled, times, permissionStatus, setEnabled, addTime, removeTime } = useReminder();
  const [showPicker, setShowPicker] = useState(false);
  const styles = createStyles(theme);

  const handleToggle = (value) => {
    setEnabled(value);
  };

  const handleAddTime = () => {
    setShowPicker(true);
  };

  const handlePickerChange = (event, selectedDate) => {
    setShowPicker(false);
    if (event.type === 'dismissed' || !selectedDate) return;
    const hours = String(selectedDate.getHours()).padStart(2, '0');
    const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    if (times.includes(timeStr)) {
      Alert.alert('重复', '该时间点已存在');
      return;
    }
    addTime(timeStr);
  };

  const handleRemoveTime = (index) => {
    Alert.alert('移除提醒', `确定要移除 ${times[index]} 的提醒吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '移除', style: 'destructive', onPress: () => removeTime(index) },
    ]);
  };

  const renderTimeItem = ({ item, index }) => (
    <View style={[styles.timeItem, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
      <ThemedText style={[styles.timeText, { color: theme.textPrimary }]}>⏰ {item}</ThemedText>
      <TouchableOpacity onPress={() => handleRemoveTime(index)} style={styles.removeButton}>
        <ThemedText style={[styles.removeText, { color: theme.danger }]}>移除</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 总开关 */}
      <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}>
        <View style={styles.switchRow}>
          <View style={styles.switchLeft}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textPrimary }]}>每日提醒</ThemedText>
            <ThemedText style={[styles.sectionSub, { color: theme.textSecondary }]}>
              {enabled ? `已开启 · ${times.length} 个时间点` : '已关闭'}
            </ThemedText>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: theme.separator, true: theme.primary + '60' }}
            thumbColor={enabled ? theme.primary : '#f4f3f4'}
          />
        </View>
        {permissionStatus === 'denied' && (
          <ThemedText style={[styles.permissionWarn, { color: theme.danger }]}>
            通知权限被拒绝，请在系统设置中开启
          </ThemedText>
        )}
      </View>

      {/* 时间列表 */}
      {enabled && (
        <View style={styles.timeSection}>
          <ThemedText style={[styles.label, { color: theme.textTertiary }]}>提醒时间</ThemedText>
          <FlatList
            data={times}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={renderTimeItem}
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.primary }]}
            onPress={handleAddTime}
          >
            <ThemedText style={[styles.addButtonText, { color: theme.primary }]}>+ 添加提醒时间</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'android' ? 'spinner' : 'default'}
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    section: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    switchLeft: { flex: 1 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    sectionSub: { fontSize: 13 },
    permissionWarn: { fontSize: 12, marginTop: 8 },
    timeSection: { flex: 1 },
    label: { fontSize: 12, fontWeight: '600', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
    timeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 10,
      marginBottom: 6,
      borderWidth: 1,
    },
    timeText: { fontSize: 15, fontWeight: '500' },
    removeButton: { paddingHorizontal: 8, paddingVertical: 4 },
    removeText: { fontSize: 13, fontWeight: '500' },
    addButton: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    addButtonText: { fontSize: 15, fontWeight: '600' },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/ReminderSettingsScreen.js
git commit -m "feat: add ReminderSettingsScreen with time list management"
```

---

## Task 7: Update HomeScreen with ImageBackground

**Files:**
- Modify: `src/screens/HomeScreen.js`

- [ ] **Step 1: Add ImageBackground to HomeScreen**

At the top of the imports, add:
```javascript
import { ImageBackground } from 'react-native';
```

Add the `useBackground` import:
```javascript
import { useBackground } from '../context/BackgroundContext';
```

In the HomeScreen component, add:
```javascript
const { imageUri, opacity, hasBackground } = useBackground();
```

Replace the outermost `<View style={dynamicStyles.container}>` in the return with a conditional container:

```javascript
const Container = hasBackground ? ImageBackground : View;
const imageProps = hasBackground ? {
  source: { uri: imageUri },
  imageStyle: { opacity },
} : {};

return (
  <Container style={dynamicStyles.container} {...imageProps}>
    {/* existing topBar + FlatList/content — keep exactly the same */}
  </Container>
);
```

This dynamically switches between `ImageBackground` and plain `View` based on whether a background is set.

- [ ] **Step 2: Commit**

```bash
git add src/screens/HomeScreen.js
git commit -m "feat: wrap HomeScreen content in ImageBackground"
```

---

## Task 8: Update SettingsScreen with New Entries

**Files:**
- Modify: `src/screens/SettingsScreen.js`

- [ ] **Step 1: Add background and reminder entries**

In the "外观" section, after the theme indicator row, add:

```javascript
<TouchableOpacity
  style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
  onPress={() => navigation.navigate('BackgroundSettings')}
>
  <View style={styles.settingLeft}>
    <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>背景图片</ThemedText>
    <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>
      {hasBackground ? '已设置' : '未设置'}
    </ThemedText>
  </View>
  <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
</TouchableOpacity>
```

Add the `useBackground` import and hook call:
```javascript
import { useBackground } from '../context/BackgroundContext';
// ...
const { hasBackground } = useBackground();
```

Add a new "提醒" section after the "字体" section:

```javascript
<Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>提醒</Text>
<TouchableOpacity
  style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
  onPress={() => navigation.navigate('ReminderSettings')}
>
  <View style={styles.settingLeft}>
    <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>每日提醒</ThemedText>
    <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>
      {reminderEnabled ? `已开启 · ${reminderTimes.length}个时间点` : '已关闭'}
    </ThemedText>
  </View>
  <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
</TouchableOpacity>
```

Add the `useReminder` import and hook call:
```javascript
import { useReminder } from '../context/ReminderContext';
// ...
const { enabled: reminderEnabled, times: reminderTimes } = useReminder();
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/SettingsScreen.js
git commit -m "feat: add background and reminder entries to SettingsScreen"
```

---

## Task 9: Update App.js with New Providers and Routes

**Files:**
- Modify: `App.js`

- [ ] **Step 1: Add provider imports and wrap**

Add imports:
```javascript
import { BackgroundProvider } from './src/context/BackgroundContext';
import { ReminderProvider } from './src/context/ReminderContext';
import BackgroundSettingsScreen from './src/screens/BackgroundSettingsScreen';
import ReminderSettingsScreen from './src/screens/ReminderSettingsScreen';
```

Update Provider nesting (inside FontProvider, before TaskProvider):
```javascript
<FontProvider>
  <BackgroundProvider>
    <ReminderProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ReminderProvider>
  </BackgroundProvider>
</FontProvider>
```

Add routes inside Stack.Navigator:
```javascript
<Stack.Screen
  name="BackgroundSettings"
  component={BackgroundSettingsScreen}
  options={{ title: '背景图片' }}
/>
<Stack.Screen
  name="ReminderSettings"
  component={ReminderSettingsScreen}
  options={{ title: '每日提醒' }}
/>
```

- [ ] **Step 2: Commit**

```bash
git add App.js
git commit -m "feat: add BackgroundProvider, ReminderProvider, and new routes"
```

---

## Task 10: Update Version Number

**Files:**
- Modify: `src/utils/constants.js`
- Modify: `app.json`

- [ ] **Step 1: Bump version**

In `src/utils/constants.js`, change:
```javascript
export const APP_VERSION = '1.4.0';
```

In `app.json`, change:
```json
"version": "1.4.0"
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/constants.js app.json
git commit -m "chore: bump version to 1.4.0"
```

---

## Task 11: TaskEditorModal — Add Reminder Time Override

**Files:**
- Modify: `src/components/TaskEditorModal.js`

- [ ] **Step 1: Add reminder time option to task editor**

Add import:
```javascript
import { useReminder } from '../context/ReminderContext';
```

Add hook call in component:
```javascript
const { times: globalTimes } = useReminder();
```

Add a new section in the editor form (after recurrence/color sections):

```javascript
{/* 提醒时间覆盖 */}
<ThemedText style={[styles.sectionLabel, { color: theme.textTertiary }]}>提醒时间</ThemedText>
<TouchableOpacity
  style={[styles.reminderRow, { backgroundColor: theme.cardBackground, borderColor: theme.separator }]}
  onPress={() => setShowReminderPicker(true)}
>
  <ThemedText style={[styles.reminderText, { color: theme.textPrimary }]}>
    {task.reminder_time
      ? `自定义: ${task.reminder_time}`
      : `跟随全局 (${globalTimes.length > 0 ? globalTimes.join(', ') : '未设置'})`}
  </ThemedText>
  {task.reminder_time && (
    <TouchableOpacity onPress={() => handleReminderTimeRemove()}>
      <ThemedText style={{ color: theme.danger }}>移除覆盖</ThemedText>
    </TouchableOpacity>
  )}
</TouchableOpacity>
```

Add state and handlers:
```javascript
const [showReminderPicker, setShowReminderPicker] = useState(false);

const handleReminderTimeSet = (time) => {
  setTask((prev) => ({ ...prev, reminder_time: time }));
  setShowReminderPicker(false);
};

const handleReminderTimeRemove = () => {
  setTask((prev) => ({ ...prev, reminder_time: null }));
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TaskEditorModal.js
git commit -m "feat: add per-task reminder time override in TaskEditorModal"
```

---

## Task 12: TaskContext — Reschedule Notifications on Init

**Files:**
- Modify: `src/context/TaskContext.js`

- [ ] **Step 1: Import and call reschedule on init**

Add import:
```javascript
import { useReminder } from './src/context/ReminderContext';
```

Note: Since TaskContext is a Provider that wraps consumers of useReminder, and ReminderProvider is above TaskProvider in the tree, we cannot use the hook directly in TaskContext. Instead, we handle rescheduling in AppContent or via an effect in ReminderContext itself.

**Revised approach:** Add a `useEffect` in ReminderContext that reschedules on mount:

In `ReminderContext.js`, add after the existing `useEffect`:
```javascript
// 应用启动时重新调度通知（处理设备重启场景）
useEffect(() => {
  if (enabled && times.length > 0 && permissionStatus === 'granted') {
    scheduleAllNotifications();
  }
}, [permissionStatus]);
```

No changes needed to TaskContext.js.

- [ ] **Step 2: Commit (if ReminderContext was modified)**

```bash
git add src/context/ReminderContext.js
git commit -m "feat: reschedule notifications on app start when permission granted"
```

---

## Task 13: Build and Test

- [ ] **Step 1: Build APK**

```bash
cd /Users/yui/Documents/GitHub/YuiTodo
MACOSX_DEPLOYMENT_TARGET=14.0 npx expo run:android --variant release
```

Or use the existing build workflow:
```bash
cd /Users/yui/Documents/GitHub/YuiTodo
MACOSX_DEPLOYMENT_TARGET=14.0 npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

- [ ] **Step 2: Deploy and test**

```bash
cp android/app/build/outputs/apk/release/app-release.apk /Applications/YuiTodo.apk
```

Test checklist:
- [ ] Open Settings → 背景图片 → select image → adjust opacity → verify HomeScreen shows background
- [ ] Open Settings → 每日提醒 → enable → grant permission → add time points → verify notification scheduled
- [ ] Kill app → wait for reminder time → verify notification appears
- [ ] Edit task → set custom reminder time → verify override works
- [ ] Reboot phone → open app → verify notifications rescheduled

---

## Self-Review Notes

- All spec sections covered: background (Task 3, 4, 7, 8), reminder (Task 5, 6, 8, 11, 12), permissions (Task 5), data model (Task 2), UI (Task 4, 6, 7, 8)
- No placeholders found
- Type consistency: `reminder_time` (TEXT) used in both DB and TaskEditorModal; `times` (string[]) consistent in ReminderContext and ReminderSettingsScreen
- Provider nesting order matches spec: Theme → Font → Background → Reminder → Task
