# YuiTodo

一款轻量级的 Android 循环待办清单应用，适配一加 Ace 2 Pro，纯本地存储，零网络请求。

![Platform](https://img.shields.io/badge/platform-Android-green) ![Language](https://img.shields.io/badge/language-JavaScript-blue) ![Framework](https://img.shields.io/badge/framework%20Expo%20SDK%2051-orange)

## 功能特性

### 核心功能
- **循环任务**：支持每天/每周/每月/每年/每N天/每N周，共6种循环类型
- **任务状态**：待完成、已完成、延后、归档四种状态
- **滑动交互**：左滑标记完成、右滑删除任务
- **长按编辑**：修改任务内容、循环规则、起止时间
- **智能排序**：今日待办自动置顶，逾期任务优先显示
- **步骤管理**：支持为任务添加多个子步骤，逐步完成
- **月份归档**：非当月任务自动归档到对应月份分组

### 个性化
- **14种颜色主题**：预设14种精心搭配的色彩方案
- **4种字体风格**：系统默认、圆润可爱、硬朗简洁、优雅文艺
- **自定义分组**：支持创建、编辑、删除任务分组
- **深浅双主题**：支持跟随系统/强制浅色/强制深色/定时切换

### 数据统计
- 近7天/30天/全年三个时间维度
- 完成率折线图、每日完成数柱状图
- 循环任务履约达成率
- 待办/逾期/已完成数量概览

## 技术栈

| 技术 | 说明 |
|------|------|
| Expo SDK 51 | React Native 开发框架 |
| JavaScript (ES2022) | 编程语言 |
| expo-sqlite | 本地 SQLite 数据库 |
| react-native-svg | SVG 图表绘制 |
| react-native-gesture-handler | 手势交互 |
| date-fns | 日期计算 |
| @react-navigation | 页面路由 |

## 项目结构

```
YuiTodo/
├── app.json                 # Expo 应用配置
├── package.json             # 依赖清单
├── index.js                 # 应用入口
├── App.js                   # 根组件（导航+全局状态）
├── assets/                  # 图标与图片资源
├── src/
│   ├── database/            # 数据库操作层
│   ├── cycle/               # 循环计算层
│   ├── statistics/          # 统计计算层
│   ├── components/          # UI 组件层
│   ├── screens/             # 页面层
│   ├── context/             # 全局状态层
│   ├── theme/               # 主题样式层
│   └── utils/               # 工具函数层
└── docs/                    # 文档目录
```

## 本地开发

### 前置要求
- Node.js 18+
- npm 或 yarn
- Expo Go App（手机安装，用于预览）

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

```bash
# 生成 Android 项目文件
npx expo prebuild --platform android

# 打包发布版 APK
cd android
./gradlew assembleRelease
```

APK 路径：`android/app/build/outputs/apk/release/app-release.apk`

## 注意事项

- **数据库升级**：修改表结构后需卸载重装 App
- **数据安全**：所有数据纯本地存储，卸载 App 会丢失数据
- **适配机型**：已配置为竖屏单屏模式，适配一加 Ace 2 Pro

## 许可

个人项目，自由修改使用。
