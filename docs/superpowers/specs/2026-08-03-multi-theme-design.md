# YuiTodo 多风格主题系统 + 任务背景设计

**日期**: 2026-08-03
**版本**: v1.5.0
**状态**: 待实现

---

## 1. 任务条目背景色

### 1.1 需求概述

任务条目背景从纯白/纯深色改为半透明主题色，增强视觉区分度。默认跟随任务主题色，可全局覆盖为统一色。

### 1.2 设计决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 默认行为 | 跟随任务主题色 | 用户已选颜色主题，自动体现个性化 |
| 全局覆盖 | 可选统一色 | 满足偏好简洁风格的用户 |
| 透明度 | 浅色 12%，深色 20% | 确保文字可读性，同时体现色彩 |
| 左色条保留 | 是 | 强化色彩标识，视觉层次更丰富 |

### 1.3 技术实现

#### TaskItem.js 修改
- 卡片背景从 `theme.cardBackground` 改为 `taskColor + opacity`（如 `rgba(59,130,246,0.12)`）
- 新增 `useTaskBackground()` hook 或从 ThemeContext 获取全局覆盖设置
- 左色条保持不变

#### 全局覆盖设置
- 在 ThemeContext 中添加 `taskBackgroundMode` 和 `taskBackgroundColor`
- `taskBackgroundMode`: `'follow'` (跟随任务) | `'uniform'` (全局统一)
- `taskBackgroundColor`: 统一模式下的颜色值

---

## 2. 多风格主题系统

### 2.1 需求概述

从单一浅色/深色扩展为多种风格主题，每种风格内含深浅变体。

### 2.2 风格定义

#### 2.2.1 Apple 风格
| 属性 | 浅色 | 深色 |
|------|------|------|
| 页面背景 | #F5F7FA | #1C1C1E |
| 卡片背景 | #FFFFFF | #2C2C2E |
| 主色 | #007AFF | #0A84FF |
| 圆角 | 12px | 12px |
| 阴影 | 0 2px 8px rgba(0,0,0,0.06) | 0 2px 8px rgba(0,0,0,0.3) |
| 字体 | SF Pro 风格 | 同左 |

#### 2.2.2 Microsoft To Do 风格
| 属性 | 浅色 | 深色 |
|------|------|------|
| 页面背景 | #F3F2F1 | #202020 |
| 卡片背景 | #FFFFFF | #2D2D2D |
| 主色 | #6366F1 | #818CF8 |
| 圆角 | 2px | 2px |
| 阴影 | 0 1px 3px rgba(0,0,0,0.08) | 0 1px 3px rgba(0,0,0,0.4) |
| 边框 | 1px solid #E1DFDD | 1px solid #3D3D3D |

#### 2.2.3 极简主义风格
| 属性 | 浅色 | 深色 |
|------|------|------|
| 页面背景 | #FAFAFA | #111111 |
| 卡片背景 | transparent | transparent |
| 主色 | #333333 | #EEEEEE |
| 圆角 | 0px | 0px |
| 阴影 | none | none |
| 分割线 | 1px solid #E0E0E0 | 1px solid #333333 |

#### 2.2.4 玻璃拟态风格
| 属性 | 浅色 | 深色 |
|------|------|------|
| 页面背景 | 渐变 #E8EAF6→#F3E5F5 | 渐变 #1A1A2E→#16213E |
| 卡片背景 | rgba(255,255,255,0.7) | rgba(30,30,50,0.7) |
| 主色 | #7C4DFF | #B388FF |
| 圆角 | 16px | 16px |
| 阴影 | 0 8px 32px rgba(0,0,0,0.1) | 0 8px 32px rgba(0,0,0,0.4) |
| 模糊 | backdrop-blur(20px) | backdrop-blur(20px) |

### 2.3 主题数据结构

```js
// 主题配置结构
const THEME_STYLES = {
  apple: {
    name: 'Apple',
    light: { /* Apple 浅色配色 */ },
    dark: { /* Apple 深色配色 */ },
    cardRadius: 12,
    shadowStyle: { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation },
  },
  microsoft: {
    name: 'Microsoft',
    light: { /* Microsoft 浅色配色 */ },
    dark: { /* Microsoft 深色配色 */ },
    cardRadius: 2,
    shadowStyle: { /* ... */ },
  },
  minimal: {
    name: '极简',
    light: { /* 极简浅色配色 */ },
    dark: { /* 极简深色配色 */ },
    cardRadius: 0,
    shadowStyle: null,
  },
  glass: {
    name: '玻璃',
    light: { /* 玻璃浅色配色 */ },
    dark: { /* 玻璃深色配色 */ },
    cardRadius: 16,
    shadowStyle: { /* ... */ },
  },
};
```

### 2.4 ThemeContext 扩展

新增状态：
- `themeStyle`: 当前风格 ID（'apple'|'microsoft'|'minimal'|'glass'）
- `setThemeStyle(id)`: 切换风格
- `availableStyles`: 可用风格列表

修改逻辑：
- `currentTheme` 计算时结合 `themeStyle` 和 `isDark`
- 从 `THEME_STYLES[themeStyle][isDark ? 'dark' : 'light']` 获取配色

---

## 3. 深浅色独立背景

### 3.1 需求概述

背景图片可分别为浅色模式和深色模式设置不同的图片和透明度。

### 3.2 BackgroundContext 扩展

新增状态：
- `lightImageUri` / `darkImageUri`: 深浅模式各自的背景图
- `lightOpacity` / `darkOpacity`: 深浅模式各自的透明度
- `syncMode`: 是否同步（修改一个自动同步到另一个）

修改逻辑：
- HomeScreen 根据 `isDark` 选择对应的 imageUri 和 opacity
- BackgroundSettingsScreen 顶部增加深浅切换标签，可分别设置

### 3.3 BackgroundSettingsScreen 修改

1. 顶部新增 Segmented Control：浅色模式 | 深色模式
2. 根据选中模式显示对应的预览和设置
3. 每个模式独立保存 imageUri 和 opacity

---

## 4. 设置页面新增

### 4.1 主题风格选择
在"外观"区域新增：
- "主题风格"行：显示当前风格名 → 打开风格选择器（网格卡片预览）
- "任务背景"行：跟随主题 / 自定义颜色

### 4.2 风格选择器
- 2x2 网格展示 4 种风格
- 每个风格卡片展示该风格的配色预览（模拟任务列表）
- 选中后实时预览

---

## 5. 数据持久化

### 5.1 app_setting 表新增

| key | value |
|-----|-------|
| `theme_style` | `'apple'` / `'microsoft'` / `'minimal'` / `'glass'` |
| `task_bg_mode` | `'follow'` / `'uniform'` |
| `task_bg_color` | `'#3B82F6'` |
| `bg_light_image_uri` | 浅色背景图路径 |
| `bg_light_opacity` | `'0.6'` |
| `bg_dark_image_uri` | 深色背景图路径 |
| `bg_dark_opacity` | `'0.6'` |

---

## 6. 版本号

- APP_VERSION: `1.5.0`
- app.json version: `1.5.0`

---

## 7. 待确认风险点

1. **玻璃拟态的模糊效果**：React Native 原生不支持 backdrop-blur，需使用 `expo-blur` 的 `BlurView` 实现
2. **主题切换动画**：风格切换时可能需要过渡动画，初期可不做
3. **性能**：半透明背景 + 模糊可能影响低端设备滚动流畅度
