// 主题风格定义：4种精选风格 × 深浅变体
// 每种风格包含完整配色 + 样式属性（圆角、阴影、任务背景等）
//
// 设计原则：
// - 任务背景使用极淡的主题色融合，而非边框式色块
// - 深浅变体在对比度、饱和度上独立调校
// - 圆角/阴影/间距符合各风格的设计语言

export const THEME_STYLES = {
  // ─── Sorted 风格：极简、留白、彩色左条 ───
  sorted: {
    id: 'sorted',
    name: 'Sorted',
    icon: '✨',
    light: {
      background: '#FAFAF9',
      cardBackground: '#FFFFFF',
      separator: '#F0EFED',
      textPrimary: '#292524',
      textSecondary: '#78716C',
      textTertiary: '#A8A29E',
      primary: '#3B82F6',
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
      pending: '#3B82F6',
      done: '#22C55E',
      postponed: '#F59E0B',
      archived: '#A8A29E',
      swipeCompleteBg: '#DCFCE7',
      swipePostponeBg: '#FEF3C7',
      swipeDeleteBg: '#FEE2E2',
    },
    dark: {
      background: '#1C1917',
      cardBackground: '#292524',
      separator: '#44403C',
      textPrimary: '#FAFAF9',
      textSecondary: '#D6D3D1',
      textTertiary: '#A8A29E',
      primary: '#60A5FA',
      success: '#4ADE80',
      warning: '#FBBF24',
      danger: '#F87171',
      pending: '#60A5FA',
      done: '#4ADE80',
      postponed: '#FBBF24',
      archived: '#78716C',
      swipeCompleteBg: '#14532D',
      swipePostponeBg: '#451A03',
      swipeDeleteBg: '#450A0A',
    },
    cardRadius: 8,
    shadowStyle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    taskBgAlpha: 0.06,
    taskBgStyle: 'tint',
  },

  // ─── Apple 风格：大圆角、优雅阴影、SF 设计语言 ───
  apple: {
    id: 'apple',
    name: 'Apple',
    icon: '🍎',
    light: {
      background: '#F5F5F7',
      cardBackground: '#FFFFFF',
      separator: '#E5E5E7',
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
      swipeCompleteBg: '#E8FAF0',
      swipePostponeBg: '#FFF8E8',
      swipeDeleteBg: '#FFEDEB',
    },
    dark: {
      background: '#000000',
      cardBackground: '#1C1C1E',
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
    cardRadius: 14,
    shadowStyle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    taskBgAlpha: 0.05,
    taskBgStyle: 'shadow',
  },

  // ─── Microsoft To Do 风格：清爽卡片、紫色强调 ───
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft',
    icon: '💜',
    light: {
      background: '#F8F8F8',
      cardBackground: '#FFFFFF',
      separator: '#EBEBEB',
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
      background: '#1B1B1B',
      cardBackground: '#292929',
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
    cardRadius: 6,
    shadowStyle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    taskBgAlpha: 0.07,
    taskBgStyle: 'tint',
    cardBorderWidth: 1,
    cardBorderColor: '#EBEBEB',
  },

  // ─── Glass 风格：半透明、渐变、现代感 ───
  glass: {
    id: 'glass',
    name: 'Glass',
    icon: '🔮',
    light: {
      background: '#F0F4FF',
      cardBackground: 'rgba(255,255,255,0.75)',
      separator: 'rgba(0,0,0,0.06)',
      textPrimary: '#1A1A2E',
      textSecondary: '#555577',
      textTertiary: '#8888AA',
      primary: '#6366F1',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      pending: '#6366F1',
      done: '#10B981',
      postponed: '#F59E0B',
      archived: '#94A3B8',
      swipeCompleteBg: 'rgba(16,185,129,0.15)',
      swipePostponeBg: 'rgba(245,158,11,0.15)',
      swipeDeleteBg: 'rgba(239,68,68,0.15)',
    },
    dark: {
      background: '#0F0F23',
      cardBackground: 'rgba(255,255,255,0.08)',
      separator: 'rgba(255,255,255,0.08)',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textTertiary: '#64748B',
      primary: '#818CF8',
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      pending: '#818CF8',
      done: '#34D399',
      postponed: '#FBBF24',
      archived: '#475569',
      swipeCompleteBg: 'rgba(52,211,153,0.12)',
      swipePostponeBg: 'rgba(251,191,36,0.12)',
      swipeDeleteBg: 'rgba(248,113,113,0.12)',
    },
    cardRadius: 16,
    shadowStyle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    taskBgAlpha: 0.08,
    taskBgStyle: 'tint',
    useBlur: true,
  },
};

// Helper: get theme colors for current style + mode
export function getTheme(themeStyleId, isDark) {
  const style = THEME_STYLES[themeStyleId] || THEME_STYLES.sorted;
  return isDark ? style.dark : style.light;
}

// Helper: get style config (radius, shadow, etc.)
export function getStyleConfig(themeStyleId) {
  const style = THEME_STYLES[themeStyleId] || THEME_STYLES.sorted;
  return {
    cardRadius: style.cardRadius,
    shadowStyle: style.shadowStyle,
    borderWidth: style.cardBorderWidth || 0,
    borderColor: style.cardBorderColor,
    useBlur: style.useBlur || false,
    taskBgAlpha: style.taskBgAlpha || 0.06,
    taskBgStyle: style.taskBgStyle || 'tint',
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
