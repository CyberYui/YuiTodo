# YuiTodo

一款轻量级的 Android 循环待办清单应用，适配一加 Ace 2 Pro，纯本地存储，零网络请求。

![Platform](https://img.shields.io/badge/platform-Android-green)
![Language](https://img.shields.io/badge/language-TypeScript-blue)
![Framework](https://img.shields.io/badge/framework-Expo%20SDK%2051-orange)
![Version](https://img.shields.io/badge/version-2.0.0-blue)

## 架构概览

YuiTodo 采用分层解耦架构，严格遵循函数式编程规范，对标 Sorted3、微软 Todo、滴答清单行业标准。

### 五层架构

```
┌─────────────────────────────────┐
│        UI 展示层 (Screens)       │  页面组件，纯渲染 + 交互
├─────────────────────────────────┤
│        UI 组件层 (Components)    │  原子化组件，可复用
├─────────────────────────────────┤
│     状态管理层 (Context/Hooks)   │  全局状态，单向数据流
├─────────────────────────────────┤
│     业务逻辑层 (Cycle/Statistics)│  纯函数，无副作用
├─────────────────────────────────┤
│     数据持久层 (Database)        │  仓库模式，统一接口
└─────────────────────────────────┘
```

### 设计原则

- **纯函数组件**：全部使用函数组件 + Hooks，无类组件（ErrorBoundary 除外）
- **纯函数业务逻辑**：所有计算、循环、校验均为无副作用纯函数
- **层级绝对隔离**：UI 不直接操作数据库，业务逻辑不依赖 UI
- **单向数据流**：Context → Component → Event → Context
- **原子化组件**：所有 UI 元素独立封装，高内聚低耦合

## 功能特性

### 核心功能
- **循环任务**：每天/每周/每月/每年/每N天/每N周，6种循环类型
- **任务状态**：待完成、已完成、延后、归档四种状态
- **滑动交互**：左滑标记完成、右滑删除任务
- **长按编辑**：修改任务内容、循环规则、起止时间
- **智能分组**：按今日/月份自动归档，逾期优先显示
- **步骤管理**：支持多子步骤，自动检测完成状态
- **拖拽排序**：长按拖拽调整任务顺序
- **撤销删除**：5秒撤销Toast提示

### 个性化
- **10套主题风格**：Apple/Notion/Fluent/Terminal/Claude/TickTick/和风/Cyber/Linear/便利贴
- **16种任务颜色**：4x4配色矩阵
- **11种自定义字体**：系统默认 + 10种中文字体
- **深浅双主题**：跟随系统/强制浅色/强制深色/定时切换
- **自定义背景**：支持深浅模式独立背景图片
- **应用图标更换**：11种桌面图标可选

### 数据统计
- **多维度统计**：近7天/30天/全年
- **可视化图表**：折线图（趋势）、柱状图（每日完成数）
- **年度热力图**：GitHub风格全年完成热力图
- **履约率统计**：循环任务完成达成率

### 提醒
- **每日提醒**：多时间点、自定义通知内容
- **任务级提醒覆盖**：单任务可覆盖全局提醒时间

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.2.0 | UI框架 |
| React Native | 0.74.5 | 移动端框架 |
| Expo SDK | 51 | 开发框架 |
| TypeScript | 5.3+ | 类型系统 |
| expo-sqlite | ^14.0.3 | 本地SQLite数据库 |
| react-navigation | ^6.1.0 | 页面路由 |
| react-native-svg | 15.2.0 | SVG图表 |
| react-native-gesture-handler | ~2.16.0 | 手势交互 |
| react-native-reanimated | ~3.10.0 | 动画引擎 |
| date-fns | ^3.6.0 | 日期计算 |
| expo-notifications | ~0.28.19 | 推送通知 |
| expo-font | ~12.0.0 | 自定义字体 |

## 项目结构

```
YuiTodo/
├── app.json                 # Expo 应用配置
├── package.json             # 依赖清单（v2.0.0）
├── tsconfig.json            # TypeScript 配置
├── babel.config.js          # Babel 配置（含reanimated插件）
├── eas.json                 # EAS Build 配置
├── index.js                 # 应用入口
├── App.tsx                  # 根组件（导航+全局状态）
├── assets/                  # 静态资源
│   ├── fonts/               # 自定义字体文件
│   └── *.png               # 图标与图片
├── modules/                 # 原生模块
│   └── icon-changer/       # Android桌面图标更换
└── scripts/                 # 构建脚本
    └── patch-expo-sqlite.js # SQLite兼容性修复
src/
    ├── types/              # TypeScript类型定义
    │   └── index.ts        # 所有实体类型、枚举、接口
    ├── database/           # 数据持久层（仓库模式）
    │   ├── Database.ts     # 数据库初始化与迁移
    │   ├── TaskRepository.ts
    │   ├── TaskStepRepository.ts
    │   ├── RecurrenceRepository.ts
    │   ├── CompletionRepository.ts
    │   ├── ListRepository.ts
    │   ├── TaskGroupRepository.ts
    │   └── SettingsRepository.ts
    ├── cycle/              # 循环计算层（纯函数）
    │   ├── CycleCalculator.ts  # 下次触发日期计算
    │   ├── CycleStatus.ts      # 循环状态判断
    │   └── CycleRules.ts       # 循环规则工厂与校验
    ├── statistics/         # 统计计算层（纯函数）
    │   ├── CompletionRate.ts
    │   ├── DailyCount.ts
    │   └── OverviewCards.ts
    ├── context/            # 全局状态层
    │   ├── ThemeContext.tsx
    │   ├── FontContext.tsx
    │   ├── TaskContext.tsx
    │   ├── ListContext.tsx
    │   ├── BackgroundContext.tsx
    │   ├── ReminderContext.tsx
    │   └── DragSortContext.tsx
    ├── theme/              # 主题样式层
    │   ├── colors.ts       # 10套主题配色
    │   ├── fonts.ts        # 字体配置
    │   ├── typography.ts   # 字体样式
    │   └── appIcons.ts     # 应用图标配置
    ├── hooks/              # 自定义Hooks
    │   └── useFontLoader.ts
    ├── utils/              # 工具函数层
    │   ├── constants.ts    # 全局常量、枚举、魔法值
    │   └── dateHelpers.ts  # 日期工具函数
    ├── components/         # UI组件层
    │   ├── ErrorBoundary.tsx
    │   ├── Icon.tsx
    │   ├── ThemedText.tsx
    │   ├── TaskItem.tsx
    │   ├── TaskEditorModal.tsx
    │   ├── ColorPicker.tsx
    │   ├── CalendarPicker.tsx
    │   ├── StatChart.tsx
    │   ├── StatCard.tsx
    │   ├── AnnualHeatmap.tsx
    │   ├── ThemePicker.tsx
    │   ├── ThemeStylePicker.tsx
    │   ├── GroupManagementModal.tsx
    │   ├── FontPicker.tsx
    │   └── PomodoroTimer.tsx
    └── screens/            # 页面层
        ├── HomeScreen.tsx
        ├── SettingsScreen.tsx
        ├── StatisticsScreen.tsx
        ├── BackgroundSettingsScreen.tsx
        ├── RecycleBinScreen.tsx
        ├── IconPickerScreen.tsx
        └── ReminderSettingsScreen.tsx
```

## 本地开发

### 前置要求
- Node.js 18+
- npm 或 pnpm
- Expo Go App（手机预览）
- Android Studio（打包APK）

### 安装运行

```bash
# 克隆项目
git clone https://github.com/CyberYui/YuiTodo.git
cd YuiTodo

# 安装依赖
npm install

# 启动开发服务器
npx expo start
```

## 打包 APK

### 方式一：EAS Build（推荐）
```bash
# 安装 EAS CLI
npm install -g eas-cli

# 配置 EAS
eas build:configure

# 构建预览版 APK
eas build --platform android --profile preview
```

### 方式二：本地 Gradle
```bash
# 生成 Android 项目
npx expo prebuild --platform android

# 构建发布版
cd android
./gradlew assembleRelease
```

APK 路径：`android/app/build/outputs/apk/release/app-release.apk`

## 数据库结构

### 表清单

| 表名 | 说明 |
|------|------|
| `task` | 任务主表 |
| `task_step` | 任务子步骤 |
| `recurrence_rule` | 循环规则 |
| `completion_record` | 完成记录 |
| `task_list` | 任务列表 |
| `task_group` | 任务分组 |
| `app_setting` | 应用设置（键值对） |

### 当前版本
- Schema 版本：6
- 迁移路径：1→2→4→5→6

## 核心算法

### 循环日期计算
- **DAILY**: `base + interval days`
- **WEEKLY**: 找到下一个匹配的星期几
- **MONTHLY**: 设置到指定日期，溢出取月末
- **YEARLY**: 设置到指定月日
- **CUSTOM_DAYS**: `base + interval days`
- **CUSTOM_WEEKS**: `base + interval weeks`

### 安全日期设置
`setDateSafe(date, day)`: 若目标日期溢出当月，自动回退到当月最后一天。

## 注意事项

- **数据库升级**：修改表结构后需增加 `CURRENT_DB_VERSION` 并添加迁移逻辑
- **数据安全**：所有数据纯本地存储，卸载 App 会丢失数据
- **适配机型**：已配置为竖屏单屏模式，适配一加 Ace 2 Pro
- **ErrorBoundary**：React 框架要求错误边界必须是类组件，这是唯一的类组件

## 许可

个人项目，自由修改使用。

---

**远程仓库**: https://github.com/CyberYui/YuiTodo
