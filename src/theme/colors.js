// 主题风格定义：8种精选风格 × 深浅变体
// 每种风格包含完整配色 + 样式属性（圆角、阴影、字体、标题栏等）
//
// 设计原则：
// - 主题影响整个App：标题栏、设置页、任务卡片、按钮等
// - 任务卡片统一使用白色背景 + 用户可选的任务背景色
// - 深浅变体在对比度、饱和度上独立调校

export const THEME_STYLES = {
  // ─── 1. Sorted 风格：极简、留白、彩色左条 ───
  sorted: {
    id: 'sorted',
    name: 'Sorted',
    icon: '✨',
    light: {
      background: '#FAFAF9', cardBackground: '#FFFFFF', separator: '#F0EFED',
      textPrimary: '#292524', textSecondary: '#78716C', textTertiary: '#A8A29E',
      primary: '#3B82F6', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444',
      pending: '#3B82F6', done: '#22C55E', postponed: '#F59E0B', archived: '#A8A29E',
      swipeCompleteBg: '#DCFCE7', swipePostponeBg: '#FEF3C7', swipeDeleteBg: '#FEE2E2',
    },
    dark: {
      background: '#1C1917', cardBackground: '#292524', separator: '#44403C',
      textPrimary: '#FAFAF9', textSecondary: '#D6D3D1', textTertiary: '#A8A29E',
      primary: '#60A5FA', success: '#4ADE80', warning: '#FBBF24', danger: '#F87171',
      pending: '#60A5FA', done: '#4ADE80', postponed: '#FBBF24', archived: '#78716C',
      swipeCompleteBg: '#14532D', swipePostponeBg: '#451A03', swipeDeleteBg: '#450A0A',
    },
    cardRadius: 8,
    shadowStyle: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    leftBarWidth: 3,
    fontFamily: 'default',
    headerStyle: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0EFED' },
    sectionTitleColor: '#A8A29E',
    chipActiveBg: '#3B82F6',
  },

  // ─── 2. Apple 风格：大圆角、优雅阴影、SF 设计语言 ───
  apple: {
    id: 'apple',
    name: 'Apple',
    icon: '🍎',
    light: {
      background: '#F5F5F7', cardBackground: '#FFFFFF', separator: '#E5E5E7',
      textPrimary: '#1D1D1F', textSecondary: '#86868B', textTertiary: '#AEAEB2',
      primary: '#007AFF', success: '#34C759', warning: '#FF9500', danger: '#FF3B30',
      pending: '#007AFF', done: '#34C759', postponed: '#FF9500', archived: '#8E8E93',
      swipeCompleteBg: '#E8FAF0', swipePostponeBg: '#FFF8E8', swipeDeleteBg: '#FFEDEB',
    },
    dark: {
      background: '#000000', cardBackground: '#1C1C1E', separator: '#38383A',
      textPrimary: '#FFFFFF', textSecondary: '#EBEBF5', textTertiary: '#8E8E93',
      primary: '#0A84FF', success: '#30D158', warning: '#FF9F0A', danger: '#FF453A',
      pending: '#0A84FF', done: '#30D158', postponed: '#FF9F0A', archived: '#636366',
      swipeCompleteBg: '#0A3D2A', swipePostponeBg: '#3D2A0A', swipeDeleteBg: '#3D0A0A',
    },
    cardRadius: 14,
    shadowStyle: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
    leftBarWidth: 0,
    fontFamily: 'default',
    headerStyle: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5E7' },
    sectionTitleColor: '#86868B',
    chipActiveBg: '#007AFF',
  },

  // ─── 3. Microsoft 风格：清爽卡片、紫色强调 ───
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft',
    icon: '💜',
    light: {
      background: '#F8F8F8', cardBackground: '#FFFFFF', separator: '#EBEBEB',
      textPrimary: '#242424', textSecondary: '#605E5C', textTertiary: '#979593',
      primary: '#6366F1', success: '#107C10', warning: '#FFB900', danger: '#D13438',
      pending: '#6366F1', done: '#107C10', postponed: '#FFB900', archived: '#8A8886',
      swipeCompleteBg: '#DFF6DD', swipePostponeBg: '#FFF4CE', swipeDeleteBg: '#FDE7E9',
    },
    dark: {
      background: '#1B1B1B', cardBackground: '#292929', separator: '#3D3D3D',
      textPrimary: '#FFFFFF', textSecondary: '#CCCCCC', textTertiary: '#999999',
      primary: '#818CF8', success: '#54B054', warning: '#FFC53D', danger: '#E87070',
      pending: '#818CF8', done: '#54B054', postponed: '#FFC53D', archived: '#7A7A7A',
      swipeCompleteBg: '#1A3D1A', swipePostponeBg: '#3D330A', swipeDeleteBg: '#3D1A1A',
    },
    cardRadius: 6,
    shadowStyle: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
    leftBarWidth: 3,
    fontFamily: 'default',
    headerStyle: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
    sectionTitleColor: '#979593',
    chipActiveBg: '#6366F1',
  },

  // ─── 4. Glass 风格：半透明、现代感 ───
  glass: {
    id: 'glass',
    name: 'Glass',
    icon: '🔮',
    light: {
      background: '#F0F4FF', cardBackground: '#FFFFFF', separator: 'rgba(0,0,0,0.06)',
      textPrimary: '#1A1A2E', textSecondary: '#555577', textTertiary: '#8888AA',
      primary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444',
      pending: '#6366F1', done: '#10B981', postponed: '#F59E0B', archived: '#94A3B8',
      swipeCompleteBg: 'rgba(16,185,129,0.15)', swipePostponeBg: 'rgba(245,158,11,0.15)', swipeDeleteBg: 'rgba(239,68,68,0.15)',
    },
    dark: {
      background: '#0F0F23', cardBackground: 'rgba(255,255,255,0.1)', separator: 'rgba(255,255,255,0.08)',
      textPrimary: '#F8FAFC', textSecondary: '#94A3B8', textTertiary: '#64748B',
      primary: '#818CF8', success: '#34D399', warning: '#FBBF24', danger: '#F87171',
      pending: '#818CF8', done: '#34D399', postponed: '#FBBF24', archived: '#475569',
      swipeCompleteBg: 'rgba(52,211,153,0.12)', swipePostponeBg: 'rgba(251,191,36,0.12)', swipeDeleteBg: 'rgba(248,113,113,0.12)',
    },
    cardRadius: 16,
    shadowStyle: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
    leftBarWidth: 3,
    fontFamily: 'default',
    headerStyle: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
    sectionTitleColor: '#8888AA',
    chipActiveBg: '#6366F1',
  },

  // ─── 5. Notion 风格：编辑式、暖灰、衬线标题 ───
  notion: {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    light: {
      background: '#FFFFFF', cardBackground: '#F7F6F3', separator: '#E8E7E4',
      textPrimary: '#37352F', textSecondary: '#787774', textTertiary: '#AEACA6',
      primary: '#37352F', success: '#0F7B69', warning: '#D9730D', danger: '#E03E3E',
      pending: '#37352F', done: '#0F7B69', postponed: '#D9730D', archived: '#AEACA6',
      swipeCompleteBg: '#ECF3ED', swipePostponeBg: '#FDF3E9', swipeDeleteBg: '#FDEBEC',
    },
    dark: {
      background: '#191919', cardBackground: '#2F2F2F', separator: '#373737',
      textPrimary: '#FFFFFF', textSecondary: '#9B9A97', textTertiary: '#6B6B6B',
      primary: '#FFFFFF', success: '#529E6A', warning: '#D9730D', danger: '#E03E3E',
      pending: '#FFFFFF', done: '#529E6A', postponed: '#D9730D', archived: '#6B6B6B',
      swipeCompleteBg: '#1A3D1A', swipePostponeBg: '#3D330A', swipeDeleteBg: '#3D1A1A',
    },
    cardRadius: 4,
    shadowStyle: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
    leftBarWidth: 0,
    fontFamily: 'zcool-xiaowei',
    headerStyle: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8E7E4' },
    sectionTitleColor: '#AEACA6',
    chipActiveBg: '#37352F',
  },

  // ─── 6. Sunset 风格：暖橙渐变、活力 ───
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    icon: '🌅',
    light: {
      background: '#FFF8F3', cardBackground: '#FFFFFF', separator: '#F5E6D8',
      textPrimary: '#3D1F00', textSecondary: '#8B5E3C', textTertiary: '#C49A7A',
      primary: '#F97316', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444',
      pending: '#F97316', done: '#22C55E', postponed: '#F59E0B', archived: '#C49A7A',
      swipeCompleteBg: '#DCFCE7', swipePostponeBg: '#FEF3C7', swipeDeleteBg: '#FEE2E2',
    },
    dark: {
      background: '#1A0E00', cardBackground: '#2D1A08', separator: '#4A2C10',
      textPrimary: '#FFF5EB', textSecondary: '#D4A574', textTertiary: '#996644',
      primary: '#FB923C', success: '#4ADE80', warning: '#FBBF24', danger: '#F87171',
      pending: '#FB923C', done: '#4ADE80', postponed: '#FBBF24', archived: '#996644',
      swipeCompleteBg: '#14532D', swipePostponeBg: '#451A03', swipeDeleteBg: '#450A0A',
    },
    cardRadius: 12,
    shadowStyle: { shadowColor: '#F97316', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    leftBarWidth: 4,
    fontFamily: 'huakang',
    headerStyle: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F5E6D8' },
    sectionTitleColor: '#C49A7A',
    chipActiveBg: '#F97316',
  },

  // ─── 7. Forest 风格：自然绿、沉稳 ───
  forest: {
    id: 'forest',
    name: 'Forest',
    icon: '🌿',
    light: {
      background: '#F4F9F4', cardBackground: '#FFFFFF', separator: '#DCE8DC',
      textPrimary: '#1A2E1A', textSecondary: '#4A6B4A', textTertiary: '#7A9B7A',
      primary: '#2D7D46', success: '#15803D', warning: '#D97706', danger: '#DC2626',
      pending: '#2D7D46', done: '#15803D', postponed: '#D97706', archived: '#7A9B7A',
      swipeCompleteBg: '#DCFCE7', swipePostponeBg: '#FEF3C7', swipeDeleteBg: '#FEE2E2',
    },
    dark: {
      background: '#0A1A0A', cardBackground: '#1A2E1A', separator: '#2D4A2D',
      textPrimary: '#ECFDF5', textSecondary: '#86EFAC', textTertiary: '#4ADE80',
      primary: '#34D399', success: '#22C55E', warning: '#FBBF24', danger: '#F87171',
      pending: '#34D399', done: '#22C55E', postponed: '#FBBF24', archived: '#4ADE80',
      swipeCompleteBg: '#14532D', swipePostponeBg: '#451A03', swipeDeleteBg: '#450A0A',
    },
    cardRadius: 10,
    shadowStyle: { shadowColor: '#2D7D46', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    leftBarWidth: 3,
    fontFamily: 'fukai',
    headerStyle: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#DCE8DC' },
    sectionTitleColor: '#7A9B7A',
    chipActiveBg: '#2D7D46',
  },

  // ─── 8. Midnight 风格：深蓝紫、科技感 ───
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    icon: '🌃',
    light: {
      background: '#F5F3FF', cardBackground: '#FFFFFF', separator: '#E0DBF5',
      textPrimary: '#1E1033', textSecondary: '#6B5B8A', textTertiary: '#9D8DBD',
      primary: '#7C3AED', success: '#10B981', warning: '#F59E0B', danger: '#EF4444',
      pending: '#7C3AED', done: '#10B981', postponed: '#F59E0B', archived: '#9D8DBD',
      swipeCompleteBg: '#D1FAE5', swipePostponeBg: '#FEF3C7', swipeDeleteBg: '#FEE2E2',
    },
    dark: {
      background: '#0C0521', cardBackground: '#1A0F3D', separator: '#2D1B5E',
      textPrimary: '#F5F3FF', textSecondary: '#C4B5FD', textTertiary: '#8B80B5',
      primary: '#A78BFA', success: '#34D399', warning: '#FBBF24', danger: '#F87171',
      pending: '#A78BFA', done: '#34D399', postponed: '#FBBF24', archived: '#8B80B5',
      swipeCompleteBg: '#14532D', swipePostponeBg: '#451A03', swipeDeleteBg: '#450A0A',
    },
    cardRadius: 10,
    shadowStyle: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    leftBarWidth: 3,
    fontFamily: 'maple',
    headerStyle: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0DBF5' },
    sectionTitleColor: '#9D8DBD',
    chipActiveBg: '#7C3AED',
  },
};

// Helper: get theme colors for current style + mode
export function getTheme(themeStyleId, isDark) {
  const style = THEME_STYLES[themeStyleId] || THEME_STYLES.sorted;
  return isDark ? style.dark : style.light;
}

// Helper: get style config (radius, shadow, font, etc.)
export function getStyleConfig(themeStyleId) {
  const style = THEME_STYLES[themeStyleId] || THEME_STYLES.sorted;
  return {
    cardRadius: style.cardRadius,
    shadowStyle: style.shadowStyle,
    leftBarWidth: style.leftBarWidth || 0,
    fontFamily: style.fontFamily || 'default',
    headerStyle: style.headerStyle || {},
    sectionTitleColor: style.sectionTitleColor,
    chipActiveBg: style.chipActiveBg,
  };
}

// Helper: get all available styles
export function getAvailableStyles() {
  return Object.values(THEME_STYLES).map((s) => ({ id: s.id, name: s.name, icon: s.icon }));
}

// Helper: convert hex to rgba
export function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return `rgba(59,130,246,${alpha})`;
  }
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Legacy exports (for backward compatibility)
export const LightTheme = THEME_STYLES.sorted.light;
export const DarkTheme = THEME_STYLES.sorted.dark;
