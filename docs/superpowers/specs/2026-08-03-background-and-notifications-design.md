# YuiTodo 背景图片 + 系统提醒功能设计

**日期**: 2026-08-03
**版本**: v1.4.0
**状态**: 待实现

---

## 1. 背景图片功能

### 1.1 需求概述

用户可从手机相册选择壁纸图片，应用到任务列表作为背景，并支持调整透明度。

### 1.2 设计决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 应用范围 | 仅任务列表区域 | 聚焦任务体验，其他页面保持干净 |
| 交互方式 | 独立设置页面 | 大图预览，分层控制，体验完整 |
| 图片存储 | 复制到应用 documentDirectory | 避免 URI 失效问题，持久化可靠 |
| 透明度控制 | 0-100% 滑条 | 实时预览，自动保存 |
| 状态管理 | BackgroundContext | 全局一致，与 ThemeContext/FontContext 同级 |

### 1.3 技术实现

#### 新增依赖
- `expo-image-picker` — 从相册选择图片
- `expo-file-system` — 复制图片到应用目录

#### 新增文件
- `src/context/BackgroundContext.js` — 背景状态管理
- `src/screens/BackgroundSettingsScreen.js` — 背景设置页面

#### 修改文件
- `App.js` — 添加 BackgroundProvider、BackgroundSettingsScreen 路由
- `src/screens/HomeScreen.js` — 添加 ImageBackground
- `src/screens/SettingsScreen.js` — 添加"背景图片"入口行

#### HomeScreen 结构变更
```
<View container>
  <ImageBackground source={imageUri} opacity={opacity}>
    <View contentContainer>
      {/* 现有的 topBar + FlatList */}
    </View>
  </ImageBackground>
</View>
```

任务卡片保持 `rgba(255,255,255,0.9)` 以上不透明度确保可读性。

#### BackgroundContext 接口
```js
const {
  imageUri,        // string | null — 背景图片路径
  opacity,         // number — 0.0 ~ 1.0
  hasBackground,   // boolean
  selectImage,     // () => Promise<void> — 打开图片选择器
  setOpacity,      // (value: number) => void — 设置透明度
  removeBackground // () => void — 移除背景
} = useBackground();
```

#### 数据持久化（app_setting 表）
| key | value |
|-----|-------|
| `background_image_uri` | 图片文件路径字符串 |
| `background_opacity` | `"0.6"` (字符串) |

### 1.4 BackgroundSettingsScreen UI

1. **顶部预览区**：当前背景图全屏预览（带当前透明度效果）
2. **操作按钮区**：
   - "选择图片" 按钮
   - "移除背景" 按钮（仅当有背景时显示）
3. **透明度控制区**：
   - 滑条 (Slider) 0-100%
   - 当前百分比数字显示
   - 实时预览更新

---

## 2. 系统提醒功能

### 2.1 需求概述

用户可设置多个每日提醒时间点，到时间后系统横幅/锁屏通知提醒未完成任务。

### 2.2 设计决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 提醒模式 | 全局 + 任务独立覆盖 | 兼顾简单和灵活 |
| 提醒次数 | 多时段 | 覆盖全天不同场景 |
| 通知内容 | 计数 + 任务名 | 信息量适中，一目了然 |
| 权限处理 | 首次开启时申请 | 符合 Android 13+ 规范 |
| 开机恢复 | 应用启动时重新调度 | 设备重启后提醒不丢失 |

### 2.3 技术实现

#### 新增依赖
- `expo-notifications` — 调度/取消通知、权限申请
- `expo-device` — 检查设备兼容性

#### 新增文件
- `src/context/ReminderContext.js` — 提醒状态管理
- `src/screens/ReminderSettingsScreen.js` — 提醒设置页面

#### 修改文件
- `App.js` — 添加 ReminderProvider、ReminderSettingsScreen 路由
- `src/screens/SettingsScreen.js` — 添加"每日提醒"入口行
- `src/components/TaskEditorModal.js` — 添加"提醒时间"覆盖选项
- `src/context/TaskContext.js` — initApp 时重新调度通知
- `src/database/Database.js` — task 表新增 reminder_time 列

#### ReminderContext 接口
```js
const {
  enabled,           // boolean — 提醒总开关
  times,             // string[] — 提醒时间列表 ["09:00", "18:00"]
  permissionStatus,  // 'granted' | 'denied' | 'undetermined'
  requestPermission, // () => Promise<boolean>
  setEnabled,        // (value: boolean) => void
  addTime,           // (time: string) => void — 添加提醒时间
  removeTime,        // (index: number) => void — 移除提醒时间
  hasActiveReminders // boolean — 是否有有效的提醒
} = useReminder();
```

#### 通知调度逻辑
```js
// 为每个时间点创建每日重复触发器
await Notifications.scheduleNotificationAsync({
  content: {
    title: '📋 YuiTodo',
    body: `${count}项待办：${taskNames.join(' · ')}`,
  },
  trigger: {
    hour: hours,
    minute: minutes,
    repeats: true,  // 每日重复
  },
});
```

#### TaskEditorModal 新增选项
- 新增"提醒时间"行，默认"跟随全局设置"
- 点击可打开时间选择器，设置该任务专属提醒时间
- 设置后显示当前覆盖的时间

#### 数据持久化

**app_setting 表**:
| key | value |
|-----|-------|
| `reminder_enabled` | `"true"` / `"false"` |
| `reminder_times` | `["09:00","18:00","21:00"]` (JSON 字符串) |

**task 表新增字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| `reminder_time` | TEXT | 可选，覆盖全局提醒时间 |

### 2.4 ReminderSettingsScreen UI

1. **总开关区**：启用/禁用提醒（首次开启触发权限申请）
2. **时间列表区**：
   - 每个时间点一行，可点击编辑/删除
   - "添加提醒时间"按钮
3. **权限状态提示**：
   - 已授权 → 不显示
   - 被拒绝 → 提示去系统设置开启

### 2.5 权限处理流程

```
用户开启开关 → 检查权限状态
  ├─ 已授权 → 直接调度通知
  ├─ 未确定 → 调用 requestPermissionsAsync()
  │   ├─ 同意 → 调度通知
  │   └─ 拒绝 → 提示用户，开关回弹
  └─ 已拒绝 → 提示"请在系统设置中开启通知权限"
```

---

## 3. 导航路由新增

| 路由名 | 组件 | 标题 |
|--------|------|------|
| `BackgroundSettings` | `BackgroundSettingsScreen` | 背景图片 |
| `ReminderSettings` | `ReminderSettingsScreen` | 每日提醒 |

---

## 4. Provider 嵌套顺序

```
GestureHandlerRootView
  └─ SafeAreaProvider
      └─ ThemeProvider
          └─ FontProvider
              └─ BackgroundProvider
                  └─ ReminderProvider
                      └─ TaskProvider
                          └─ AppContent
```

---

## 5. 版本号

- APP_VERSION: `1.4.0`
- app.json version: `1.4.0`

---

## 6. 待确认风险点

1. **expo-notifications 在 Expo Go 中的限制**：开发期间可测试，生产构建完全支持
2. **后台通知可靠性**：Android 厂商省电策略可能影响到达率，属系统层面问题
3. **图片文件大小**：选择后自动复制到应用目录，不压缩（用户自行选择合适尺寸的图片）
