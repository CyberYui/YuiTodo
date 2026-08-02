# YuiTodo - 轻量循环待办清单

一款极简的Android端循环待办清单App，适配一加Ace2 Pro，纯本地存储，零网络请求。

## 📱 功能特性

### 核心功能
- **循环任务**：支持每天/每周/每月/每年/每N天/每N周，共6种循环类型
- **任务状态**：待完成、已完成、延后、归档四种状态
- **滑动交互**：左滑标记完成、右滑延后任务
- **长按编辑**：修改任务内容、循环规则、起止时间
- **智能排序**：今日待办自动置顶，逾期任务优先显示
- **永久循环/到期终止**：可设置循环结束日期，到期自动停止

### 数据统计
- 近7天/30天/全年三个时间维度
- 完成率折线图（SVG原生绘制）
- 每日完成数柱状图（SVG原生绘制）
- 循环任务履约达成率
- 待办/逾期/已完成数量概览

### 视觉与性能
- 浅色/深色双主题，支持跟随系统切换
- 卡片式布局，极简线条，无繁杂动效
- SQLite本地存储，纯离线运行
- 内存占用低，启动快速

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| Expo SDK 51 | React Native开发框架 |
| JavaScript (ES2022) | 编程语言 |
| expo-sqlite | 本地SQLite数据库 |
| react-native-svg | SVG图表绘制 |
| react-native-gesture-handler | 手势交互 |
| react-native-reanimated | 动画引擎 |
| date-fns | 日期计算 |
| @react-navigation | 页面路由 |

## 🚀 本地调试环境搭建

### 前置要求
- Node.js 18+ （推荐使用LTS版本）
- npm 或 yarn 包管理器
- 一加Ace2 Pro手机（或Android模拟器）
- Expo Go App（手机安装，用于预览）

### 安装步骤

```bash
# 1. 克隆/进入项目目录
cd /Users/yui/Documents/GitHub/YuiTodo

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npx expo start
```

### 在手机上预览

1. 在一加Ace2 Pro上安装 **Expo Go**（Google Play商店搜索）
2. 确保手机和电脑在同一WiFi网络
3. 打开Expo Go，扫描终端中显示的QR码
4. App自动加载，可实时预览

## 📦 打包安卓APK

### 方式一：使用EAS Build（推荐）

```bash
# 1. 安装EAS CLI
npm install -g eas-cli

# 2. 登录Expo账号（首次需要注册）
eas login

# 3. 配置打包项目（首次需要）
eas build:configure

# 4. 构建预览版APK
eas build --platform android --profile preview

# 5. 构建发布版APK
eas build --platform android --profile production
```

构建完成后，EAP会提供APK下载链接。下载后传到手机安装即可。

### 方式二：本地构建（需要Android Studio）

```bash
# 1. 生成Android项目文件
npx expo prebuild --platform android

# 2. 使用Gradle打包
cd android
./gradlew assembleRelease
```

APK路径：`android/app/build/outputs/apk/release/app-release.apk`

### 安装APK到一加Ace2 Pro

1. 将APK文件传到手机（USB传输/微信文件传输）
2. 手机上点击APK文件
3. 系统会提示"允许安装未知来源应用"，开启权限
4. 点击安装

> ⚠️ 如果安装失败，请检查手机是否已开启"开发者选项"和"USB调试"

## 📂 项目目录结构

```
YuiTodo/
├── app.json                 # Expo应用配置
├── package.json             # 依赖清单
├── babel.config.js          # Babel配置
├── eas.json                 # EAS打包配置
├── index.js                 # 应用入口
├── App.js                   # 根组件（导航+全局状态）
│
├── src/
│   ├── database/            # 【数据库操作层】
│   │   ├── Database.js      # 数据库初始化
│   │   ├── TaskTable.js     # 任务表CRUD
│   │   ├── RecurrenceTable.js # 循环规则表CRUD
│   │   └── CompletionTable.js # 完成记录表CRUD
│   │
│   ├── cycle/               # 【循环计算层】
│   │   ├── CycleCalculator.js # 核心：计算下次触发日期
│   │   ├── CycleRules.js    # 循环规则定义与验证
│   │   └── CycleStatus.js   # 循环状态判断
│   │
│   ├── statistics/          # 【统计计算层】
│   │   ├── CompletionRate.js # 完成率计算
│   │   ├── DailyCount.js    # 每日完成数统计
│   │   └── OverviewCards.js # 概览数据计算
│   │
│   ├── components/          # 【UI组件层】
│   │   ├── TaskItem.js      # 任务条目（含滑动交互）
│   │   ├── TaskEditorModal.js # 新建/编辑弹窗
│   │   ├── StatChart.js     # SVG折线图/柱状图
│   │   └── StatCard.js      # 统计卡片
│   │
│   ├── screens/             # 【页面层】
│   │   ├── HomeScreen.js    # 首页任务列表
│   │   ├── StatisticsScreen.js # 统计面板
│   │   └── SettingsScreen.js   # 设置页
│   │
│   ├── context/             # 【全局状态层】
│   │   ├── TaskContext.js   # 任务数据管理
│   │   └── ThemeContext.js  # 主题切换管理
│   │
│   ├── theme/               # 【主题样式层】
│   │   ├── colors.js        # 颜色定义
│   │   └── typography.js    # 字体样式
│   │
│   └── utils/               # 【工具函数层】
│       ├── constants.js     # 全局常量
│       └── dateHelpers.js   # 日期工具
│
└── docs/                    # 文档目录
```

## 🔧 常用功能修改指引

### 修改主题颜色
→ 编辑 `src/theme/colors.js`，修改 `LightTheme` 或 `DarkTheme` 中的颜色值

### 新增循环类型
1. 在 `src/utils/constants.js` 的 `RecurrenceType` 中添加新类型
2. 在 `src/cycle/CycleRules.js` 中添加创建函数和验证逻辑
3. 在 `src/cycle/CycleCalculator.js` 的 `calculateNextOccurrence` 中添加计算分支

### 修改数据库表结构
→ 编辑 `src/database/Database.js` 的 `initializeTables` 函数，修改建表SQL

### 修改任务排序规则
→ 编辑 `src/screens/HomeScreen.js` 的 `sortedTasks` 中的 `getPriority` 函数

### 修改统计维度
→ 编辑 `src/statistics/CompletionRate.js` 的 `getPeriodStartDate` 函数

### 修改App包名
→ 编辑 `app.json` 中的 `android.package` 字段

### 添加新页面
1. 在 `src/screens/` 下创建新页面组件
2. 在 `App.js` 的 `Stack.Navigator` 中添加 `Stack.Screen`

## ⚠️ 注意事项

- **数据库升级**：如果修改了表结构，需要卸载重装App（开发阶段），或使用数据库迁移
- **Expo Go限制**：部分原生功能在Expo Go中受限，完整功能需打包后测试
- **一加适配**：已在 `app.json` 中配置为竖屏单屏模式，适配一加Ace2 Pro屏幕
- **数据安全**：所有数据纯本地存储，卸载App会丢失数据，请自行备份

## 📄 许可

个人项目，自由修改使用。
