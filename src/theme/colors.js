// 主题风格定义 v1.6.0 — 10套差异化主题
// 每套主题：配色 + 卡片样式 + 按钮形状 + 间距密度 + 布局特征

export const THEME_STYLES = {

  // ─── 1. Sorted（默认）轻阴影 + 细条 + 留白 ───
  sorted: {
    id: 'sorted', name: 'Sorted', icon: '✨', cardStyle: 'elevated', radius: 8,
    shadow: true, leftBar: true, density: 'spacious', btnShape: 'round',
    divider: false, accentStyle: 'filled',
    light: { bg: '#FAFAF9', card: '#FFFFFF', sep: '#F0EFED', text: '#292524', sub: '#78716C', hint: '#A8A29E', primary: '#3B82F6', success: '#22C55E', warn: '#F59E0B', danger: '#EF4444', done: '#22C55E', swipeDone: '#DCFCE7', swipeDel: '#FEE2E2' },
    dark: { bg: '#1C1917', card: '#292524', sep: '#44403C', text: '#FAFAF9', sub: '#D6D3D1', hint: '#A8A29E', primary: '#60A5FA', success: '#4ADE80', warn: '#FBBF24', danger: '#F87171', done: '#4ADE80', swipeDone: '#14532D', swipeDel: '#450A0A' },
  },

  // ─── 2. Apple 大圆角 + 无细条 + 纯白卡片 ───
  apple: {
    id: 'apple', name: 'Apple', icon: '🍎', cardStyle: 'elevated', radius: 16,
    shadow: true, leftBar: false, density: 'spacious', btnShape: 'pill',
    divider: false, accentStyle: 'filled',
    light: { bg: '#F5F5F7', card: '#FFFFFF', sep: '#E5E5E7', text: '#1D1D1F', sub: '#86868B', hint: '#AEAEB2', primary: '#007AFF', success: '#34C759', warn: '#FF9500', danger: '#FF3B30', done: '#34C759', swipeDone: '#E8FAF0', swipeDel: '#FFEDEB' },
    dark: { bg: '#000000', card: '#1C1C1E', sep: '#38383A', text: '#FFFFFF', sub: '#EBEBF5', hint: '#8E8E93', primary: '#0A84FF', success: '#30D158', warn: '#FF9F0A', danger: '#FF453A', done: '#30D158', swipeDone: '#0A3D2A', swipeDel: '#3D0A0A' },
  },

  // ─── 3. Notion 扁平 + 无边 + 分割线 + 紧凑 ───
  notion: {
    id: 'notion', name: 'Notion', icon: '📝', cardStyle: 'flat', radius: 4,
    shadow: false, leftBar: false, density: 'compact', btnShape: 'sharp',
    divider: true, accentStyle: 'subtle',
    light: { bg: '#FFFFFF', card: '#FFFFFF', sep: '#E8E7E4', text: '#37352F', sub: '#787774', hint: '#AEACA6', primary: '#37352F', success: '#0F7B69', warn: '#D9730D', danger: '#E03E3E', done: '#0F7B69', swipeDone: '#ECF3ED', swipeDel: '#FDEBEC' },
    dark: { bg: '#191919', card: '#2F2F2F', sep: '#373737', text: '#FFFFFF', sub: '#9B9A97', hint: '#6B6B6B', primary: '#FFFFFF', success: '#529E6A', warn: '#D9730D', danger: '#E03E3E', done: '#529E6A', swipeDone: '#1A3D1A', swipeDel: '#3D1A1A' },
  },

  // ─── 4. Microsoft 边框卡片 + 紫色 ───
  microsoft: {
    id: 'microsoft', name: 'Microsoft', icon: '💜', cardStyle: 'bordered', radius: 6,
    shadow: false, leftBar: true, density: 'standard', btnShape: 'round',
    divider: false, accentStyle: 'filled',
    light: { bg: '#F8F8F8', card: '#FFFFFF', sep: '#EBEBEB', text: '#242424', sub: '#605E5C', hint: '#979593', primary: '#6366F1', success: '#107C10', warn: '#FFB900', danger: '#D13438', done: '#107C10', swipeDone: '#DFF6DD', swipeDel: '#FDE7E9' },
    dark: { bg: '#1B1B1B', card: '#292929', sep: '#3D3D3D', text: '#FFFFFF', sub: '#CCCCCC', hint: '#999999', primary: '#818CF8', success: '#54B054', warn: '#FFC53D', danger: '#E87070', done: '#54B054', swipeDone: '#1A3D1A', swipeDel: '#3D1A1A' },
  },

  // ─── 5. Glass 半透明 + 大圆角 + 轻阴影 ───
  glass: {
    id: 'glass', name: 'Glass', icon: '🔮', cardStyle: 'glass', radius: 18,
    shadow: true, leftBar: true, density: 'spacious', btnShape: 'pill',
    divider: false, accentStyle: 'filled',
    light: { bg: '#F0F4FF', card: '#FFFFFF', sep: 'rgba(0,0,0,0.06)', text: '#1A1A2E', sub: '#555577', hint: '#8888AA', primary: '#6366F1', success: '#10B981', warn: '#F59E0B', danger: '#EF4444', done: '#10B981', swipeDone: '#D1FAE5', swipeDel: '#FEE2E2' },
    dark: { bg: '#0F0F23', card: 'rgba(255,255,255,0.1)', sep: 'rgba(255,255,255,0.08)', text: '#F8FAFC', sub: '#94A3B8', hint: '#64748B', primary: '#818CF8', success: '#34D399', warn: '#FBBF24', danger: '#F87171', done: '#34D399', swipeDone: 'rgba(52,211,153,0.12)', swipeDel: 'rgba(248,113,113,0.12)' },
  },

  // ─── 6. Sunset 暖橙 + 圆润 + 紧凑 ───
  sunset: {
    id: 'sunset', name: 'Sunset', icon: '🌅', cardStyle: 'elevated', radius: 12,
    shadow: true, leftBar: true, density: 'compact', btnShape: 'pill',
    divider: false, accentStyle: 'filled',
    light: { bg: '#FFF8F3', card: '#FFFFFF', sep: '#F5E6D8', text: '#3D1F00', sub: '#8B5E3C', hint: '#C49A7A', primary: '#F97316', success: '#22C55E', warn: '#F59E0B', danger: '#EF4444', done: '#22C55E', swipeDone: '#DCFCE7', swipeDel: '#FEE2E2' },
    dark: { bg: '#1A0E00', card: '#2D1A08', sep: '#4A2C10', text: '#FFF5EB', sub: '#D4A574', hint: '#996644', primary: '#FB923C', success: '#4ADE80', warn: '#FBBF24', danger: '#F87171', done: '#4ADE80', swipeDone: '#14532D', swipeDel: '#450A0A' },
  },

  // ─── 7. Forest 自然绿 + 边框 ───
  forest: {
    id: 'forest', name: 'Forest', icon: '🌿', cardStyle: 'bordered', radius: 10,
    shadow: false, leftBar: true, density: 'standard', btnShape: 'round',
    divider: false, accentStyle: 'subtle',
    light: { bg: '#F4F9F4', card: '#FFFFFF', sep: '#DCE8DC', text: '#1A2E1A', sub: '#4A6B4A', hint: '#7A9B7A', primary: '#2D7D46', success: '#15803D', warn: '#D97706', danger: '#DC2626', done: '#15803D', swipeDone: '#DCFCE7', swipeDel: '#FEE2E2' },
    dark: { bg: '#0A1A0A', card: '#1A2E1A', sep: '#2D4A2D', text: '#ECFDF5', sub: '#86EFAC', hint: '#4ADE80', primary: '#34D399', success: '#22C55E', warn: '#FBBF24', danger: '#F87171', done: '#22C55E', swipeDone: '#14532D', swipeDel: '#450A0A' },
  },

  // ─── 8. Midnight 深蓝紫 + 扁平 + 霓虹强调 ───
  midnight: {
    id: 'midnight', name: 'Midnight', icon: '🌃', cardStyle: 'flat', radius: 10,
    shadow: false, leftBar: true, density: 'standard', btnShape: 'round',
    divider: true, accentStyle: 'outline',
    light: { bg: '#F5F3FF', card: '#FFFFFF', sep: '#E0DBF5', text: '#1E1033', sub: '#6B5B8A', hint: '#9D8DBD', primary: '#7C3AED', success: '#10B981', warn: '#F59E0B', danger: '#EF4444', done: '#10B981', swipeDone: '#D1FAE5', swipeDel: '#FEE2E2' },
    dark: { bg: '#0C0521', card: '#1A0F3D', sep: '#2D1B5E', text: '#F5F3FF', sub: '#C4B5FD', hint: '#8B80B5', primary: '#A78BFA', success: '#34D399', warn: '#FBBF24', danger: '#F87171', done: '#34D399', swipeDone: '#14532D', swipeDel: '#450A0A' },
  },

  // ─── 9. Neon 赛博朋克 + 暗色 + 等宽 ───
  neon: {
    id: 'neon', name: 'Neon', icon: '⚡', cardStyle: 'bordered', radius: 4,
    shadow: false, leftBar: true, density: 'compact', btnShape: 'sharp',
    divider: false, accentStyle: 'outline',
    light: { bg: '#F0F0F0', card: '#FFFFFF', sep: '#D0D0D0', text: '#1A1A1A', sub: '#555555', hint: '#888888', primary: '#00BCD4', success: '#00E676', warn: '#FFD600', danger: '#FF1744', done: '#00E676', swipeDone: '#E0F7FA', swipeDel: '#FFEBEE' },
    dark: { bg: '#0A0A0A', card: '#1A1A1A', sep: '#333333', text: '#00E5FF', sub: '#80DEEA', hint: '#4DD0E1', primary: '#00E5FF', success: '#00E676', warn: '#FFD600', danger: '#FF1744', done: '#00E676', swipeDone: '#004D40', swipeDel: '#B71C1C' },
  },

  // ─── 10. Paper 编辑式 + 衬线 + 宽松 ───
  paper: {
    id: 'paper', name: 'Paper', icon: '📄', cardStyle: 'lined', radius: 2,
    shadow: false, leftBar: false, density: 'spacious', btnShape: 'sharp',
    divider: true, accentStyle: 'subtle',
    light: { bg: '#FAF8F5', card: '#FFFFFF', sep: '#E5E2DC', text: '#2C2C2C', sub: '#6B6560', hint: '#9E9892', primary: '#8B7355', success: '#5A7D4A', warn: '#C49A3C', danger: '#B85450', done: '#5A7D4A', swipeDone: '#E8F0E4', swipeDel: '#F5E6E4' },
    dark: { bg: '#1A1814', card: '#2C2926', sep: '#3D3935', text: '#E8E4DF', sub: '#A8A098', hint: '#7A746E', primary: '#C4A882', success: '#8FBC8F', warn: '#D4A853', danger: '#D4847E', done: '#8FBC8F', swipeDone: '#2D4A2D', swipeDel: '#5A2D2D' },
  },

};

// ─── Helpers ───

export function getTheme(styleId, isDark) {
  const t = THEME_STYLES[styleId] || THEME_STYLES.sorted;
  const c = isDark ? t.dark : t.light;
  return {
    background: c.bg, cardBackground: c.card, separator: c.sep,
    textPrimary: c.text, textSecondary: c.sub, textTertiary: c.hint,
    primary: c.primary, success: c.success, warning: c.warn, danger: c.danger,
    done: c.done, swipeCompleteBg: c.swipeDone, swipeDeleteBg: c.swipeDel,
  };
}

export function getStyleConfig(styleId) {
  const t = THEME_STYLES[styleId] || THEME_STYLES.sorted;
  return {
    cardStyle: t.cardStyle, radius: t.radius, shadow: t.shadow,
    leftBar: t.leftBar, density: t.density, btnShape: t.btnShape,
    divider: t.divider, accentStyle: t.accentStyle,
  };
}

export function getAvailableStyles() {
  return Object.values(THEME_STYLES).map((s) => ({ id: s.id, name: s.name, icon: s.icon }));
}

export function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(59,130,246,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

export const LightTheme = getTheme('sorted', false);
export const DarkTheme = getTheme('sorted', true);
