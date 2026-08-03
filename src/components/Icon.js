// 统一图标组件 — 纯文本/Unicode实现（无字体依赖）
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ICON_SIZE = 20;

// 所有图标使用Unicode字符，零字体依赖
const ICON_MAP = {
  // 基础图标
  search: '⌕',
  settings: '⚙',
  add: '+',
  close: '✕',
  check: '✓',
  star: '☆',
  starFilled: '★',
  delete: '🗑',
  edit: '✎',
  calendar: '📅',
  time: '🕐',
  flag: '⚑',
  folder: '📁',
  list: '☰',
  sunny: '☀',
  moon: '🌙',
  refresh: '↻',
  alarm: '⏰',
  image: '🖼',
  person: '👤',
  home: '⌂',
  stats: '📊',
  chevronDown: '▾',
  chevronUp: '▴',
  chevronLeft: '◂',
  chevronRight: '▸',
  pause: '⏸',
  play: '▶',
  stop: '⏹',
  bookmark: '🔖',
  attach: '📎',
  copy: '⧉',
  information: 'ℹ',
  warning: '⚠',
  checkmarkCircle: '✓',
  closeCircle: '✕',
  notifications: '🔔',
  trophy: '🏆',
  flame: '🔥',
  heart: '♡',
  heartFilled: '♥',
  lock: '🔒',
  unlock: '🔓',
  mail: '✉',
  share: '↗',
  filter: '⛃',
  menu: '☰',
  more: '⋯',
  drag: '≡',
  archive: '📦',
  today: '◉',
  week: '◫',
  overdue: '⚠',
  all: '⊙',
  recycle: '♻',
  restore: '↶',
  permanentDelete: '✕',
  // 番茄钟
  tomato: '🍅',
  timerSand: '⏳',
  timerOutline: '⏱',
  dragHorizontal: '⇔',
  gripHorizontal: '≡',
};

export default function Icon({ name, size = ICON_SIZE, color, style }) {
  const { theme } = useTheme();
  const iconColor = color || theme.textSecondary || '#6B7280';
  const char = ICON_MAP[name] || '•';

  return (
    <Text style={[styles.icon, { color: iconColor, fontSize: size }, style]}>
      {char}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
