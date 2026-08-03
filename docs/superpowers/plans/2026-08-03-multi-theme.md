# Multi-Style Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-style theme system with 4 visual styles (Apple, Microsoft, Minimal, Glass), task item background colors following theme, and independent light/dark background image settings.

**Architecture:** Extend ThemeContext to support multiple style themes (each with built-in light/dark variants). Create a THEME_STYLES registry. Modify TaskItem to use semi-transparent colored backgrounds. Extend BackgroundContext for light/dark independent image settings. Add style picker and task background settings to SettingsScreen.

**Tech Stack:** React Native, expo-blur (for glassmorphism), expo-sqlite (legacy)

---

## File Structure

### New Files
- `src/components/ThemeStylePicker.js` — Style picker modal/grid (2x2 cards with preview)

### Modified Files
- `src/theme/colors.js` — Replace LightTheme/DarkTheme with THEME_STYLES registry
- `src/context/ThemeContext.js` — Add themeStyle state, expose available styles
- `src/components/TaskItem.js` — Semi-transparent task background following theme color
- `src/context/BackgroundContext.js` — Light/dark independent image settings
- `src/screens/BackgroundSettingsScreen.js` — Add light/dark mode tabs
- `src/screens/SettingsScreen.js` — Add theme style picker and task background settings
- `src/utils/constants.js` — Bump APP_VERSION to 1.5.0
- `app.json` — Bump version to 1.5.0

---

## Task 1: Theme Style Registry

**Files:**
- Modify: `src/theme/colors.js`

- [ ] **Step 1: Replace colors.js with THEME_STYLES registry**

Replace the entire content of `src/theme/colors.js`:

```javascript
// 主题风格定义：4种风格 × 深浅变体
// 每种风格包含完整的配色方案 + 样式属性（圆角、阴影等）

export const THEME_STYLES = {
  apple: {
    id: 'apple',
    name: 'Apple',
    icon: '🍎',
    light: {
      background: '#F5F7FA',
      cardBackground: '#FFFFFF',
      separator: '#E5E7EB',
      textPrimary: '#1D1D1F',
      textSecondary: '#86868B',
      textTertiary: '#AEAEB2',
      primary: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      danger: '#FF3B30',
      pending: '#007AFF',
      done: '#34C759',
      postponed: '#FF9500',
      archived: '#8E8E93',
      swipeCompleteBg: '#D1F5E0',
      swipePostponeBg: '#FFF0D0',
      swipeDeleteBg: '#FFD6D0',
    },
    dark: {
      background: '#1C1C1E',
      cardBackground: '#2C2C2E',
      separator: '#38383A',
      textPrimary: '#FFFFFF',
      textSecondary: '#EBEBF5',
      textTertiary: '#8E8E93',
      primary: '#0A84FF',
      success: '#30D158',
      warning: '#FF9F0A',
      danger: '#FF453A',
      pending: '#0A84FF',
      done: '#30D158',
      postponed: '#FF9F0A',
      archived: '#636366',
      swipeCompleteBg: '#0A3D2A',
      swipePostponeBg: '#3D2A0A',
      swipeDeleteBg: '#3D0A0A',
    },
    cardRadius: 12,
    shadowStyle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft',
    icon: '💜',
    light: {
      background: '#F3F2F1',
      cardBackground: '#FFFFFF',
      separator: '#E1DFDD',
      textPrimary: '#242424',
      textSecondary: '#605E5C',
      textTertiary: '#979593',
      primary: '#6366F1',
      success: '#107C10',
      warning: '#FFB900',
      danger: '#D13438',
      pending: '#6366F1',
      done: '#107C10',
      postponed: '#FFB900',
      archived: '#8A8886',
      swipeCompleteBg: '#DFF6DD',
      swipePostponeBg: '#FFF4CE',
      swipeDeleteBg: '#FDE7E9',
    },
    dark: {
      background: '#202020',
      cardBackground: '#2D2D2D',
      separator: '#3D3D3D',
      textPrimary: '#FFFFFF',
      textSecondary: '#CCCCCC',
      textTertiary: '#999999',
      primary: '#818CF8',
      success: '#54B054',
      warning: '#FFC53D',
      danger: '#E87070',
      pending: '#818CF8',
      done: '#54B054',
      postponed: '#FFC53D',
      archived: '#7A7A7A',
      swipeCompleteBg: '#1A3D1A',
      swipePostponeBg: '#3D330A',
      swipeDeleteBg: '#3D1A1A',
    },
    cardRadius: 2,
    shadowStyle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    borderWidth: 1,
  },
  minimal: {
    id: 'minimal',
    name: '极简',
    icon: '⚪',
    light: {
      background: '#FAFAFA',
      cardBackground: '#FFFFFF',
      separator: '#E0E0E0',
      textPrimary: '#333333',
      textSecondary: '#666666',
      textTertiary: '#999999',
      primary: '#333333',
      success: '#4CAF50',
      warning: '#FF9800',
      danger: '#F44336',
      pending: '#333333',
      done: '#4CAF50',
      postponed: '#FF9800',
      archived: '#9E9E9E',
      swipeCompleteBg: '#E8F5E9',
      swipePostponeBg: '#FFF3E0',
      swipeDeleteBg: '#FFEBEE',
    },
    dark: {
      background: '#111111',
      cardBackground: '#1A1A1A',
      separator: '#333333',
      textPrimary: '#EEEEEE',
      textSecondary: '#AAAAAA',
      textTertiary: '#777777',
      primary: '#EEEEEE',
      success: '#81C784',
      warning: '#FFB74D',
      danger: '#E57373',
      pending: '#EEEEEE',
      done: '#81C784',
      postponed: '#FFB74D',
      archived: '#616161',
      swipeCompleteBg: '#1B3D1B',
      swipePostponeBg: '#3D2E0A',
      swipeDeleteBg: '#3D0A0A',
    },
    cardRadius: 0,
    shadowStyle: null,
  },
  glass: {
    id: 'glass',
    name: '玻璃',
    icon: '🔮',
    light: {
      background: '#E8EAF6',
      cardBackground: 'rgba(255,255,255,0.7)',
      separator: 'rgba(255,255,255,0.3)',
      textPrimary: '#1A1A2E',
      textSecondary: '#4A4A6A',
      textTertiary: '#7A7A9A',
      primary: '#7C4DFF',
      success: '#69F0AE',
      warning: '#FFD740',
      danger: '#FF5252',
      pending: '#7C4DFF',
      done: '#69F0AE',
      postponed: '#FFD740',
      archived: '#B0BEC5',
      swipeCompleteBg: 'rgba(105,240,174,0.2)',
      swipePostponeBg: 'rgba(255,215,64,0.2)',
      swipeDeleteBg: 'rgba(255,82,82,0.2)',
    },
    dark: {
      background: '#1A1A2E',
      cardBackground: 'rgba(30,30,50,0.7)',
      separator: 'rgba(255,255,255,0.1)',
      textPrimary: '#FFFFFF',
      textSecondary: '#B0B0D0',
      textTertiary: '#7070A0',
      primary: '#B388FF',
      success: '#69F0AE',
      warning: '#FFD740',
      danger: '#FF5252',
      pending: '#B388FF',
      done: '#69F0AE',
      postponed: '#FFD740',
      archived: '#708090',
      swipeCompleteBg: 'rgba(105,240,174,0.15)',
      swipePostponeBg: 'rgba(255,215,64,0.15)',
      swipeDeleteBg: 'rgba(255,82,82,0.15)',
    },
    cardRadius: 16,
    shadowStyle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    useBlur: true,
  },
};

// Helper: get theme for current style + mode
export function getTheme(themeStyleId, isDark) {
  const style = THEME_STYLES[themeStyleId] || THEME_STYLES.apple;
  return isDark ? style.dark : style.light;
}

// Helper: get style config (radius, shadow, etc.)
export function getStyleConfig(themeStyleId) {
  const style = THEME_STYLES[themeStyleId] || THEME_STYLES.apple;
  return {
    cardRadius: style.cardRadius,
    shadowStyle: style.shadowStyle,
    borderWidth: style.borderWidth || 0,
    useBlur: style.useBlur || false,
  };
}

// Helper: get all available styles
export function getAvailableStyles() {
  return Object.values(THEME_STYLES).map((s) => ({ id: s.id, name: s.name, icon: s.icon }));
}

// Legacy exports (for backward compatibility during migration)
export const LightTheme = THEME_STYLES.apple.light;
export const DarkTheme = THEME_STYLES.apple.dark;
```

- [ ] **Step 2: Commit**

```bash
cd /Users/yui/Documents/GitHub/YuiTodo
git add src/theme/colors.js
git commit -m "feat: replace LightTheme/DarkTheme with THEME_STYLES registry (4 styles × 2 modes)"
```

---

## Task 2: ThemeContext Extension

**Files:**
- Modify: `src/context/ThemeContext.js`

- [ ] **Step 1: Update imports**

Replace:
```javascript
import { LightTheme, DarkTheme } from '../theme/colors';
```
With:
```javascript
import { getTheme, getStyleConfig, getAvailableStyles } from '../theme/colors';
```

- [ ] **Step 2: Add themeStyle state**

After the existing `themeMode` state, add:
```javascript
const [themeStyle, setThemeStyleState] = useState('apple');
```

- [ ] **Step 3: Load theme style from DB**

In `loadThemeSettings()`, add inside the `rows.forEach`:
```javascript
else if (row.key === 'theme_style') {
  const validStyles = ['apple', 'microsoft', 'minimal', 'glass'];
  if (validStyles.includes(row.value)) setThemeStyleState(row.value);
}
```

- [ ] **Step 4: Add setThemeStyle function**

```javascript
const setThemeStyle = useCallback((styleId) => {
  setThemeStyleState(styleId);
  saveThemeSetting('theme_style', styleId);
}, []);
```

- [ ] **Step 5: Update currentTheme calculation**

Replace the `currentTheme` useMemo:
```javascript
const currentTheme = useMemo(() => {
  const mode = calculateThemeMode(themeMode, systemColorScheme, darkStartTime, lightStartTime);
  return getTheme(themeStyle, mode === 'dark');
}, [themeStyle, themeMode, systemColorScheme, darkStartTime, lightStartTime]);
```

Add a helper:
```javascript
function calculateThemeMode(mode, systemScheme, darkStart, lightStart) {
  switch (mode) {
    case 'light': return 'light';
    case 'dark': return 'dark';
    case 'scheduled': return isTimeForDark(darkStart, lightStart) ? 'dark' : 'light';
    case 'auto':
    default: return systemScheme === 'dark' ? 'dark' : 'light';
  }
}
```

- [ ] **Step 6: Update isDark to use new helper**

```javascript
const isDark = useMemo(() => {
  return calculateThemeMode(themeMode, systemColorScheme, darkStartTime, lightStartTime) === 'dark';
}, [themeMode, systemColorScheme, darkStartTime, lightStartTime]);
```

- [ ] **Step 7: Add task background state**

```javascript
const [taskBgMode, setTaskBgModeState] = useState('follow');
const [taskBgColor, setTaskBgColorState] = useState('#3B82F6');
```

Add load logic for `task_bg_mode` and `task_bg_color`.

Add setters:
```javascript
const setTaskBgMode = useCallback((mode) => {
  setTaskBgModeState(mode);
  saveThemeSetting('task_bg_mode', mode);
}, []);

const setTaskBgColor = useCallback((color) => {
  setTaskBgColorState(color);
  saveThemeSetting('task_bg_color', color);
}, []);
```

- [ ] **Step 8: Update context value**

Add to the value object:
```javascript
themeStyle,
setThemeStyle,
availableStyles: getAvailableStyles(),
taskBgMode,
taskBgColor,
setTaskBgMode,
setTaskBgColor,
styleConfig: getStyleConfig(themeStyle),
isDark,
```

- [ ] **Step 9: Commit**

```bash
git add src/context/ThemeContext.js
git commit -m "feat: extend ThemeContext with multi-style support and task background settings"
```

---

## Task 3: TaskItem Background

**Files:**
- Modify: `src/components/TaskItem.js`

- [ ] **Step 1: Import useTheme for styleConfig**

Add to the existing useTheme destructure:
```javascript
const { theme, taskBgMode, taskBgColor, styleConfig } = useTheme();
```

- [ ] **Step 2: Add background color logic**

After taskTheme definition, add:
```javascript
// Determine card background color
function getCardBackground() {
  if (taskBgMode === 'uniform') {
    return hexToRgba(taskBgColor, isDark ? 0.2 : 0.12);
  }
  // follow mode: use task theme color
  return hexToRgba(taskColor, isDark ? 0.2 : 0.12);
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
```

- [ ] **Step 3: Apply background to card**

Replace the card style:
```javascript
style={[styles.card, { backgroundColor: getCardBackground(), borderRadius: styleConfig?.cardRadius || 10 }]}
```

- [ ] **Step 4: Apply radius to swipe actions**

```javascript
style={[styles.leftAction, { backgroundColor: theme.swipeDeleteBg, borderRadius: styleConfig?.cardRadius || 10 }]}
```
(Same for rightAction)

- [ ] **Step 5: Commit**

```bash
git add src/components/TaskItem.js
git commit -m "feat: task items use semi-transparent themed background"
```

---

## Task 4: BackgroundContext Light/Dark Extension

**Files:**
- Modify: `src/context/BackgroundContext.js`

- [ ] **Step 1: Add light/dark specific state**

Replace single imageUri/opacity with:
```javascript
const [lightImageUri, setLightImageUri] = useState(null);
const [darkImageUri, setDarkImageUri] = useState(null);
const [lightOpacity, setLightOpacityState] = useState(0.6);
const [darkOpacity, setDarkOpacityState] = useState(0.6);
```

- [ ] **Step 2: Update loadSettings to load all 4 values**

```javascript
if (row.key === 'bg_light_image_uri' && row.value) setLightImageUri(row.value);
else if (row.key === 'bg_dark_image_uri' && row.value) setDarkImageUri(row.value);
else if (row.key === 'bg_light_opacity') setLightOpacityState(parseFloat(row.value) || 0.6);
else if (row.key === 'bg_dark_opacity') setDarkOpacityState(parseFloat(row.value) || 0.6);
```

- [ ] **Step 3: Update selectImage to accept mode parameter**

```javascript
const selectImage = useCallback(async (mode = 'light') => {
  // ... existing pick + compress logic ...
  if (mode === 'light') {
    setLightImageUri(destUri);
    await saveSetting('bg_light_image_uri', destUri);
  } else {
    setDarkImageUri(destUri);
    await saveSetting('bg_dark_image_uri', destUri);
  }
}, [lightImageUri, darkImageUri]);
```

- [ ] **Step 4: Update setOpacity to accept mode**

```javascript
const setOpacity = useCallback((value, mode = 'light') => {
  if (mode === 'light') {
    setLightOpacityState(value);
    saveSetting('bg_light_opacity', String(value));
  } else {
    setDarkOpacityState(value);
    saveSetting('bg_dark_opacity', String(value));
  }
}, []);
```

- [ ] **Step 5: Update removeBackground**

Handle both light and dark images.

- [ ] **Step 6: Update context value**

```javascript
lightImageUri,
darkImageUri,
lightOpacity,
darkOpacity,
imageUri: lightImageUri,  // fallback for backward compat
opacity: lightOpacity,
hasBackground: lightImageUri !== null || darkImageUri !== null,
selectImage,
setOpacity,
removeBackground,
```

- [ ] **Step 7: Commit**

```bash
git add src/context/BackgroundContext.js
git commit -m("feat: BackgroundContext supports light/dark independent image settings")
```

---

## Task 5: BackgroundSettingsScreen with Mode Tabs

**Files:**
- Modify: `src/screens/BackgroundSettingsScreen.js`

- [ ] **Step 1: Add mode tab state**

```javascript
const [activeMode, setActiveMode] = useState('light');
```

- [ ] **Step 2: Destructure new context values**

```javascript
const { lightImageUri, darkImageUri, lightOpacity, darkOpacity, hasBackground, selectImage, setOpacity, removeBackground } = useBackground();
```

- [ ] **Step 3: Add tab bar at top**

```javascript
<View style={styles.tabBar}>
  <TouchableOpacity
    style={[styles.tab, activeMode === 'light' && styles.tabActive]}
    onPress={() => setActiveMode('light')}
  >
    <ThemedText style={[styles.tabText, activeMode === 'light' && styles.tabTextActive]}>☀️ 浅色</ThemedText>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.tab, activeMode === 'dark' && styles.tabActive]}
    onPress={() => setActiveMode('dark')}
  >
    <ThemedText style={[styles.tabText, activeMode === 'dark' && styles.tabTextActive]}>🌙 深色</ThemedText>
  </TouchableOpacity>
</View>
```

- [ ] **Step 4: Use activeMode to select image/opacity**

```javascript
const currentImage = activeMode === 'light' ? lightImageUri : darkImageUri;
const currentOpacity = activeMode === 'light' ? lightOpacity : darkOpacity;
```

- [ ] **Step 5: Pass mode to selectImage/setOpacity**

```javascript
onPress={() => selectImage(activeMode)}
onValueChange={(v) => setOpacity(v, activeMode)}
```

- [ ] **Step 6: Add tab styles**

```javascript
tabBar: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, backgroundColor: theme.separator + '40', borderRadius: 8, padding: 3 },
tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
tabActive: { backgroundColor: theme.cardBackground },
tabText: { fontSize: 14, fontWeight: '500' },
tabTextActive: { fontWeight: '700' },
```

- [ ] **Step 7: Commit**

```bash
git add src/screens/BackgroundSettingsScreen.js
git commit -m "feat: BackgroundSettingsScreen with light/dark mode tabs"
```

---

## Task 6: ThemeStylePicker Component

**Files:**
- Create: `src/components/ThemeStylePicker.js`

- [ ] **Step 1: Write the component**

```javascript
// 主题风格选择器
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { THEME_STYLES } from '../theme/colors';
import ThemedText from './ThemedText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function ThemeStylePicker({ visible, onClose }) {
  const { theme, themeStyle, setThemeStyle, availableStyles } = useTheme();

  const handleSelect = (styleId) => {
    setThemeStyle(styleId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: theme.textPrimary }]}>选择主题风格</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={[styles.closeBtn, { color: theme.primary }]}>完成</ThemedText>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.grid}>
          {availableStyles.map((style) => {
            const styleConfig = THEME_STYLES[style.id];
            const isSelected = themeStyle === style.id;
            return (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.card,
                  { borderColor: isSelected ? theme.primary : theme.separator },
                  isSelected && { borderWidth: 2 },
                ]}
                onPress={() => handleSelect(style.id)}
              >
                {/* Mini preview */}
                <View style={[styles.preview, { backgroundColor: styleConfig.light.background }]}>
                  <View style={[styles.previewCard, { backgroundColor: styleConfig.light.cardBackground, borderRadius: styleConfig.cardRadius }]}>
                    <View style={[styles.previewBar, { backgroundColor: styleConfig.light.primary }]} />
                    <ThemedText style={[styles.previewText, { color: styleConfig.light.textPrimary }]}>示例任务</ThemedText>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <ThemedText style={[styles.cardName, { color: theme.textPrimary }]}>{style.icon} {style.name}</ThemedText>
                  {isSelected && <Text style={{ color: theme.primary }}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 18, fontWeight: '700' },
  closeBtn: { fontSize: 16, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  card: { width: CARD_WIDTH, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  preview: { height: 100, padding: 8 },
  previewCard: { flex: 1, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewBar: { width: 3, height: '100%', borderRadius: 2 },
  previewText: { fontSize: 11 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  cardName: { fontSize: 14, fontWeight: '600' },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThemeStylePicker.js
git commit -m "feat: add ThemeStylePicker modal component"
```

---

## Task 7: SettingsScreen Additions

**Files:**
- Modify: `src/screens/SettingsScreen.js`

- [ ] **Step 1: Import ThemeStylePicker**

```javascript
import ThemeStylePicker from '../components/ThemeStylePicker';
```

- [ ] **Step 2: Add state**

```javascript
const [stylePickerVisible, setStylePickerVisible] = useState(false);
```

- [ ] **Step 3: Destructure new values**

```javascript
const { themeStyle, availableStyles, taskBgMode, setTaskBgMode, styleConfig } = useTheme();
const currentStyleName = availableStyles.find(s => s.id === themeStyle)?.name || 'Apple';
```

- [ ] **Step 4: Add "主题风格" row after theme mode row**

```javascript
<TouchableOpacity
  style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
  onPress={() => setStylePickerVisible(true)}
>
  <View style={styles.settingLeft}>
    <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>主题风格</ThemedText>
    <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>{currentStyleName}</ThemedText>
  </View>
  <Text style={[styles.settingArrow, { color: theme.textTertiary }]}>›</Text>
</TouchableOpacity>
```

- [ ] **Step 5: Add "任务背景" row after theme style row**

```javascript
<TouchableOpacity
  style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
  onPress={() => setTaskBgMode(taskBgMode === 'follow' ? 'uniform' : 'follow')}
>
  <View style={styles.settingLeft}>
    <ThemedText style={[styles.settingLabel, { color: theme.textPrimary }]}>任务背景</ThemedText>
    <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>
      {taskBgMode === 'follow' ? '跟随任务主题色' : '全局统一色'}
    </ThemedText>
  </View>
  <View style={[styles.bgPreview, { backgroundColor: taskBgMode === 'follow' ? theme.primary + '20' : taskBgColor + '20' }]} />
</TouchableOpacity>
```

- [ ] **Step 6: Add ThemeStylePicker modal**

```javascript
<ThemeStylePicker visible={stylePickerVisible} onClose={() => setStylePickerVisible(false)} />
```

- [ ] **Step 7: Add bgPreview style**

```javascript
bgPreview: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
```

- [ ] **Step 8: Commit**

```bash
git add src/screens/SettingsScreen.js
git commit -m "feat: add theme style picker and task background toggle to SettingsScreen"
```

---

## Task 8: Version Bump

**Files:**
- Modify: `src/utils/constants.js`
- Modify: `app.json`

- [ ] **Step 1: Bump version**

In `constants.js`: `APP_VERSION = '1.5.0'`
In `app.json`: `"version": "1.5.0"`

- [ ] **Step 2: Commit**

```bash
git add src/utils/constants.js app.json
git commit -m "chore: bump version to 1.5.0"
```

---

## Task 9: Build APK

- [ ] **Step 1: Prebuild**

```bash
cd /Users/yui/Documents/GitHub/YuiTodo
rm -rf android
MACOSX_DEPLOYMENT_TARGET=14.0 npx expo prebuild --platform android
```

- [ ] **Step 2: Build**

```bash
cd android
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home ANDROID_HOME=/opt/homebrew/share/android-commandlinetools ./gradlew assembleRelease
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Copy APK**

```bash
cp android/app/build/outputs/apk/release/app-release.apk /Users/yui/Documents/GitHub/YuiTodo/YuiTodo-v1.5.0.apk
```

- [ ] **Step 4: Cleanup build artifacts**

```bash
cd /Users/yui/Documents/GitHub/YuiTodo
rm -rf android/
```

---

## Self-Review Notes

- All spec sections covered: task background (Task 3), multi-style (Task 1, 2, 6, 7), light/dark backgrounds (Task 4, 5)
- No placeholders found
- Type consistency: `themeStyle` (string id), `taskBgMode` ('follow'|'uniform'), `styleConfig` (object with radius/shadow)
- ThemeContext exports match what SettingsScreen/TaskItem consume
