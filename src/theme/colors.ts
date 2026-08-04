/**
 * 10 differentiated theme styles with pixel-perfect definitions.
 * Each theme: colors + card style + checkbox + text + progress bar + decorations.
 */

export interface ThemeStyleDefinition {
  id: string;
  name: string;
  iconName: string;
  cardStyle: string;
  cardRadius: number;
  shadow: boolean;
  leftBar: boolean;
  density: string;
  btnShape: string;
  divider: boolean;
  accentStyle: string;
  checkboxStyle: string;
  checkboxSize: number;
  checkboxRadius?: number;
  progressBarHeight: number;
  fontSize: { title: number; subtitle: number; body: number };
  lineHeight: number;
  completedTextDecoration: string;
  completedTextColor: string;
  monoFont?: boolean;
  light: ThemeColorSet;
  dark: ThemeColorSet;
}

interface ThemeColorSet {
  bg: string; card: string; sep: string; text: string; sub: string; hint: string;
  primary: string; success: string; warn: string; danger: string; done: string;
  swipeDone: string; swipeDel: string; overdue: string;
}

export const THEME_STYLES: Record<string, ThemeStyleDefinition> = {
  apple: {
    id: 'apple', name: 'Apple', iconName: 'apple',
    cardStyle: 'elevated', cardRadius: 22, shadow: false, leftBar: false,
    density: 'spacious', btnShape: 'pill', divider: false, accentStyle: 'filled',
    checkboxStyle: 'circle', checkboxSize: 18, progressBarHeight: 2,
    fontSize: { title: 16, subtitle: 13, body: 13 }, lineHeight: 1.4,
    completedTextDecoration: 'line-through', completedTextColor: '#999999',
    light: { bg: '#F8F9FA', card: '#FFFFFF', sep: '#E5E5EA', text: '#1D1D1F', sub: '#86868B', hint: '#AEAEB2', primary: '#007AFF', success: '#34C759', warn: '#FF9500', danger: '#FF3B30', done: '#34C759', swipeDone: '#E8FAF0', swipeDel: '#FFEDEB', overdue: '#FF3B30' },
    dark: { bg: '#000000', card: '#1C1C1E', sep: '#38383A', text: '#FFFFFF', sub: '#EBEBF5', hint: '#8E8E93', primary: '#0A84FF', success: '#30D158', warn: '#FF9F0A', danger: '#FF453A', done: '#30D158', swipeDone: '#0A3D2A', swipeDel: '#3D0A0A', overdue: '#FF453A' },
  },
  notion: {
    id: 'notion', name: 'Notion', iconName: 'notion',
    cardStyle: 'flat', cardRadius: 6, shadow: false, leftBar: false,
    density: 'compact', btnShape: 'sharp', divider: true, accentStyle: 'subtle',
    checkboxStyle: 'square', checkboxSize: 16, checkboxRadius: 4, progressBarHeight: 0,
    fontSize: { title: 15, subtitle: 14, body: 14 }, lineHeight: 1.5,
    completedTextDecoration: 'line-through', completedTextColor: '#999999',
    light: { bg: '#FFFFFF', card: '#FFFFFF', sep: '#EEEEEE', text: '#37352F', sub: '#787774', hint: '#AEACA6', primary: '#37352F', success: '#0F7B69', warn: '#D9730D', danger: '#FF9500', done: '#0F7B69', swipeDone: '#ECF3ED', swipeDel: '#FDEBEC', overdue: '#FF9500' },
    dark: { bg: '#191919', card: '#2F2F2F', sep: '#373737', text: '#FFFFFF', sub: '#9B9A97', hint: '#6B6B6B', primary: '#FFFFFF', success: '#529E6A', warn: '#D9730D', danger: '#FF9500', done: '#529E6A', swipeDone: '#1A3D1A', swipeDel: '#3D1A1A', overdue: '#FF9500' },
  },
  fluent: {
    id: 'fluent', name: 'Fluent', iconName: 'fluent',
    cardStyle: 'elevated', cardRadius: 12, shadow: true, leftBar: false,
    density: 'standard', btnShape: 'round', divider: false, accentStyle: 'filled',
    checkboxStyle: 'square', checkboxSize: 17, checkboxRadius: 5, progressBarHeight: 6,
    fontSize: { title: 16, subtitle: 12, body: 14 }, lineHeight: 1.4,
    completedTextDecoration: 'line-through', completedTextColor: '#999999',
    light: { bg: '#F3F2F1', card: '#FFFFFF', sep: '#EDEBE9', text: '#242424', sub: '#605E5C', hint: '#979593', primary: '#0078D4', success: '#107C10', warn: '#FFB900', danger: '#E53935', done: '#107C10', swipeDone: '#DFF6DD', swipeDel: '#FDE7E9', overdue: '#E53935' },
    dark: { bg: '#1B1B1B', card: '#292929', sep: '#3D3D3D', text: '#FFFFFF', sub: '#CCCCCC', hint: '#999999', primary: '#4CC2FF', success: '#54B054', warn: '#FFC53D', danger: '#E87070', done: '#54B054', swipeDone: '#1A3D1A', swipeDel: '#3D1A1A', overdue: '#E87070' },
  },
  terminal: {
    id: 'terminal', name: 'Terminal', iconName: 'terminal',
    cardStyle: 'flat', cardRadius: 0, shadow: false, leftBar: false,
    density: 'compact', btnShape: 'sharp', divider: false, accentStyle: 'subtle',
    checkboxStyle: 'text', checkboxSize: 15, progressBarHeight: 0,
    fontSize: { title: 15, subtitle: 15, body: 15 }, lineHeight: 1.3,
    completedTextDecoration: 'line-through', completedTextColor: '#666666',
    monoFont: true,
    light: { bg: '#FFFFFF', card: '#FFFFFF', sep: '#000000', text: '#000000', sub: '#333333', hint: '#666666', primary: '#000000', success: '#008000', warn: '#FF8C00', danger: '#FF0000', done: '#008000', swipeDone: '#F0FFF0', swipeDel: '#FFF0F0', overdue: '#FF0000' },
    dark: { bg: '#1E1E1E', card: '#1E1E1E', sep: '#333333', text: '#D4D4D4', sub: '#9CDCFE', hint: '#6A9955', primary: '#569CD6', success: '#6A9955', warn: '#DCDCAA', danger: '#F44747', done: '#6A9955', swipeDone: '#004D00', swipeDel: '#4D0000', overdue: '#F44747' },
  },
  claude: {
    id: 'claude', name: 'Claude', iconName: 'claude',
    cardStyle: 'elevated', cardRadius: 24, shadow: true, leftBar: false,
    density: 'spacious', btnShape: 'pill', divider: false, accentStyle: 'filled',
    checkboxStyle: 'rounded', checkboxSize: 19, checkboxRadius: 8, progressBarHeight: 3,
    fontSize: { title: 16, subtitle: 14, body: 14 }, lineHeight: 1.6,
    completedTextDecoration: 'none', completedTextColor: '#999999',
    light: { bg: '#FAFAF8', card: '#FFFFFF', sep: '#E8E6E1', text: '#2C2C2C', sub: '#7A7876', hint: '#A8A6A4', primary: '#C47858', success: '#6B8F5A', warn: '#D4A83C', danger: '#E87566', done: '#6B8F5A', swipeDone: '#F0F5ED', swipeDel: '#FDF0EE', overdue: '#E87566' },
    dark: { bg: '#1A1917', card: '#252320', sep: '#35332F', text: '#E8E4DF', sub: '#A8A098', hint: '#7A746E', primary: '#D49070', success: '#8FBC8F', warn: '#D4A853', danger: '#D4847E', done: '#8FBC8F', swipeDone: '#2D4A2D', swipeDel: '#5A2D2D', overdue: '#D4847E' },
  },
  ticktick: {
    id: 'ticktick', name: 'TickTick', iconName: 'ticktick',
    cardStyle: 'elevated', cardRadius: 10, shadow: true, leftBar: true,
    density: 'compact', btnShape: 'round', divider: false, accentStyle: 'filled',
    checkboxStyle: 'square', checkboxSize: 18, checkboxRadius: 6, progressBarHeight: 4,
    fontSize: { title: 16, subtitle: 14, body: 13 }, lineHeight: 1.3,
    completedTextDecoration: 'line-through', completedTextColor: '#999999',
    light: { bg: '#F5F5F5', card: '#FFFFFF', sep: '#E8E8E8', text: '#333333', sub: '#666666', hint: '#999999', primary: '#4CAF50', success: '#4CAF50', warn: '#FF9800', danger: '#F53F3F', done: '#4CAF50', swipeDone: '#E8F5E9', swipeDel: '#FFEBEE', overdue: '#F53F3F' },
    dark: { bg: '#121212', card: '#1E1E1E', sep: '#2C2C2C', text: '#E0E0E0', sub: '#A0A0A0', hint: '#707070', primary: '#66BB6A', success: '#66BB6A', warn: '#FFB74D', danger: '#EF5350', done: '#66BB6A', swipeDone: '#1B5E20', swipeDel: '#B71C1C', overdue: '#EF5350' },
  },
  japanese: {
    id: 'japanese', name: '和风', iconName: 'japanese',
    cardStyle: 'elevated', cardRadius: 18, shadow: false, leftBar: false,
    density: 'spacious', btnShape: 'pill', divider: true, accentStyle: 'subtle',
    checkboxStyle: 'square', checkboxSize: 17, checkboxRadius: 3, progressBarHeight: 2,
    fontSize: { title: 15, subtitle: 13, body: 13 }, lineHeight: 1.5,
    completedTextDecoration: 'line-through', completedTextColor: '#999999',
    light: { bg: '#F8F5F0', card: '#FEFDFB', sep: '#E8E0D4', text: '#212121', sub: '#6B5E50', hint: '#A89888', primary: '#7B9E7B', success: '#6B8F5A', warn: '#C49A3C', danger: '#A8574A', done: '#6B8F5A', swipeDone: '#F0F5ED', swipeDel: '#F5E6E4', overdue: '#A8574A' },
    dark: { bg: '#1A1814', card: '#2C2926', sep: '#3D3935', text: '#E8E4DF', sub: '#A8A098', hint: '#7A746E', primary: '#8FBC8F', success: '#8FBC8F', warn: '#D4A853', danger: '#C4847A', done: '#8FBC8F', swipeDone: '#2D4A2D', swipeDel: '#5A2D2D', overdue: '#C4847A' },
  },
  cyber: {
    id: 'cyber', name: 'Cyber', iconName: 'cyber',
    cardStyle: 'elevated', cardRadius: 8, shadow: false, leftBar: false,
    density: 'standard', btnShape: 'sharp', divider: false, accentStyle: 'outline',
    checkboxStyle: 'square', checkboxSize: 18, checkboxRadius: 4, progressBarHeight: 6,
    fontSize: { title: 16, subtitle: 14, body: 13 }, lineHeight: 1.4,
    completedTextDecoration: 'line-through', completedTextColor: '#666666',
    light: { bg: '#F5F5F5', card: '#FFFFFF', sep: '#E0E0E0', text: '#1A1A1A', sub: '#555555', hint: '#888888', primary: '#4FC3F7', success: '#00E676', warn: '#FFD600', danger: '#FF9800', done: '#00E676', swipeDone: '#E0F7FA', swipeDel: '#FFF3E0', overdue: '#FF9800' },
    dark: { bg: '#1E2228', card: '#282C34', sep: '#3E4451', text: '#E0E0E0', sub: '#B0BEC5', hint: '#6B7280', primary: '#4FC3F7', success: '#00E676', warn: '#FFD600', danger: '#FF9800', done: '#00E676', swipeDone: '#004D40', swipeDel: '#4D2400', overdue: '#FF9800' },
  },
  linear: {
    id: 'linear', name: 'Linear', iconName: 'linear',
    cardStyle: 'flat', cardRadius: 4, shadow: false, leftBar: false,
    density: 'compact', btnShape: 'sharp', divider: false, accentStyle: 'subtle',
    checkboxStyle: 'circle', checkboxSize: 16, progressBarHeight: 0,
    fontSize: { title: 15, subtitle: 13, body: 13 }, lineHeight: 1.4,
    completedTextDecoration: 'line-through', completedTextColor: '#999999',
    light: { bg: '#FFFFFF', card: '#FFFFFF', sep: '#F5F5F5', text: '#1A1A1A', sub: '#666666', hint: '#999999', primary: '#5E6AD2', success: '#2E7D32', warn: '#F57C00', danger: '#FFAB91', done: '#2E7D32', swipeDone: '#E8F5E9', swipeDel: '#FFF3E0', overdue: '#FFAB91' },
    dark: { bg: '#1A1A1A', card: '#222222', sep: '#2E2E2E', text: '#E0E0E0', sub: '#A0A0A0', hint: '#666666', primary: '#7B83EB', success: '#4CAF50', warn: '#FFB74D', danger: '#FF8A65', done: '#4CAF50', swipeDone: '#1B5E20', swipeDel: '#4D2400', overdue: '#FF8A65' },
  },
  sticky: {
    id: 'sticky', name: '便利贴', iconName: 'sticky',
    cardStyle: 'elevated', cardRadius: 20, shadow: true, leftBar: false,
    density: 'spacious', btnShape: 'pill', divider: false, accentStyle: 'filled',
    checkboxStyle: 'square', checkboxSize: 19, checkboxRadius: 5, progressBarHeight: 4,
    fontSize: { title: 16, subtitle: 14, body: 14 }, lineHeight: 1.5,
    completedTextDecoration: 'line-through', completedTextColor: '#999999',
    light: { bg: '#F5F0E8', card: '#FFFEF7', sep: '#E8E0D0', text: '#2C2C2C', sub: '#6B6560', hint: '#9E9892', primary: '#E8A87C', success: '#7A9E6B', warn: '#D4A83C', danger: '#C62828', done: '#7A9E6B', swipeDone: '#F0F5ED', swipeDel: '#F5E6E4', overdue: '#C62828' },
    dark: { bg: '#1A1814', card: '#2C2926', sep: '#3D3935', text: '#E8E4DF', sub: '#A8A098', hint: '#7A746E', primary: '#D4A070', success: '#8FBC8F', warn: '#D4A853', danger: '#D4847E', done: '#8FBC8F', swipeDone: '#2D4A2D', swipeDel: '#5A2D2D', overdue: '#D4847E' },
  },
};

export function getTheme(styleId: string, isDark: boolean) {
  const t = THEME_STYLES[styleId] || THEME_STYLES.apple;
  const c = isDark ? t.dark : t.light;
  return {
    background: c.bg, cardBackground: c.card, separator: c.sep,
    textPrimary: c.text, textSecondary: c.sub, textTertiary: c.hint,
    primary: c.primary, success: c.success, warning: c.warn, danger: c.danger,
    done: c.done, swipeCompleteBg: c.swipeDone, swipeDeleteBg: c.swipeDel,
    overdue: c.overdue,
  };
}

export function getStyleConfig(styleId: string) {
  const t = THEME_STYLES[styleId] || THEME_STYLES.apple;
  return {
    cardStyle: t.cardStyle, cardRadius: t.cardRadius, shadow: t.shadow,
    leftBar: t.leftBar, density: t.density, btnShape: t.btnShape,
    divider: t.divider, accentStyle: t.accentStyle,
    checkboxStyle: t.checkboxStyle, checkboxSize: t.checkboxSize,
    checkboxRadius: t.checkboxRadius || 2, progressBarHeight: t.progressBarHeight,
    fontSize: t.fontSize, lineHeight: t.lineHeight,
    completedTextDecoration: t.completedTextDecoration,
    completedTextColor: t.completedTextColor,
    monoFont: t.monoFont || false,
  };
}

export function getAvailableStyles() {
  return Object.values(THEME_STYLES).map((s) => ({ id: s.id, name: s.name, iconName: s.iconName }));
}

export function hexToRgba(hex: string, alpha: number): string {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(59,130,246,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

export const LightTheme = getTheme('apple', false);
export const DarkTheme = getTheme('apple', true);
