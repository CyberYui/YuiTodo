/**
 * Unified icon component — Unicode/emoji-based, zero font dependencies.
 */

import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ICON_SIZE = 20;

const ICON_MAP: Record<string, string> = {
  search: '⌕', settings: '⚙', add: '+', close: '✕', check: '✓',
  star: '☆', starFilled: '★', delete: '🗑', edit: '✎', calendar: '📅',
  time: '🕐', flag: '⚑', folder: '📁', list: '☰', sunny: '☀', moon: '🌙',
  refresh: '↻', alarm: '⏰', image: '🖼', person: '👤', home: '⌂',
  stats: '📊', chevronDown: '▾', chevronUp: '▴', chevronLeft: '◂', chevronRight: '▸',
  pause: '⏸', play: '▶', stop: '⏹', bookmark: '🔖', attach: '📎',
  copy: '⧉', information: 'ℹ', warning: '⚠', checkmarkCircle: '✓',
  closeCircle: '✕', notifications: '🔔', trophy: '🏆', flame: '🔥',
  heart: '♡', heartFilled: '♥', lock: '🔒', unlock: '🔓', mail: '✉',
  share: '↗', filter: '⛃', menu: '☰', more: '⋯', drag: '≡',
  archive: '📦', today: '◉', week: '◫', overdue: '⚠', all: '⊙',
  recycle: '♻', restore: '↶', permanentDelete: '✕',
  tomato: '🍅', timerSand: '⏳', timerOutline: '⏱',
  dragHorizontal: '⇔', gripHorizontal: '≡',
};

interface Props {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export default function Icon({ name, size = ICON_SIZE, color, style }: Props) {
  const { theme } = useTheme();
  const iconColor = color || theme.textSecondary || '#6B7280';
  const char = ICON_MAP[name] || '•';

  return (
    <Text style={[{ color: iconColor, fontSize: size, textAlign: 'center', includeFontPadding: false }, style]}>
      {char}
    </Text>
  );
}
