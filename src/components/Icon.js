// 统一图标组件 — 20px扁平线性矢量图标
import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ICON_SIZE = 20;
const ICON_COLOR = '#6B7280'; // 默认图标色

// 统一图标：所有图标20px、线性风格、描边1.2px等效
export default function Icon({ name, size = ICON_SIZE, color, style }) {
  const { theme } = useTheme();
  const iconColor = color || theme.textSecondary || ICON_COLOR;

  // 映射到Ionicons名称
  const ioniconsMap = {
    search: 'search-outline',
    settings: 'settings-outline',
    add: 'add-outline',
    close: 'close-outline',
    check: 'checkmark-outline',
    star: 'star-outline',
    starFilled: 'star',
    delete: 'trash-outline',
    edit: 'create-outline',
    calendar: 'calendar-outline',
    time: 'time-outline',
    flag: 'flag-outline',
    folder: 'folder-outline',
    list: 'list-outline',
    sunny: 'sunny-outline',
    moon: 'moon-outline',
    refresh: 'refresh-outline',
    alarm: 'alarm-outline',
    image: 'image-outline',
    person: 'person-outline',
    home: 'home-outline',
    stats: 'stats-chart-outline',
    chevronDown: 'chevron-down-outline',
    chevronUp: 'chevron-up-outline',
    chevronLeft: 'chevron-back-outline',
    chevronRight: 'chevron-forward-outline',
    pause: 'pause-outline',
    play: 'play-outline',
    stop: 'stop-outline',
    bookmark: 'bookmark-outline',
    attach: 'attach-outline',
    copy: 'copy-outline',
    information: 'information-circle-outline',
    warning: 'warning-outline',
    checkmarkCircle: 'checkmark-circle-outline',
    closeCircle: 'close-circle-outline',
    notifications: 'notifications-outline',
    trophy: 'trophy-outline',
    flame: 'flame-outline',
    heart: 'heart-outline',
    heartFilled: 'heart',
    lock: 'lock-closed-outline',
    unlock: 'lock-open-outline',
    mail: 'mail-outline',
    share: 'share-outline',
    filter: 'filter-outline',
    menu: 'menu-outline',
    more: 'ellipsis-horizontal-outline',
    drag: 'reorder-three-outline',
    archive: 'archive-outline',
    today: 'today-outline',
    week: 'calendar-number-outline',
    overdue: 'alert-circle-outline',
    all: 'apps-outline',
    recycle: 'trash-outline',
    restore: 'arrow-undo-outline',
    permanentDelete: 'close-circle-outline',
  };

  // 映射到MaterialCommunityIcons（当Ionicons没有对应图标时）
  const mciMap = {
    tomato: 'timer-outline',
    timerSand: 'timer-sand',
    dragHorizontal: 'drag-horizontal-variant',
    gripHorizontal: 'grip-horizontal',
  };

  if (mciMap[name]) {
    return <MaterialCommunityIcons name={mciMap[name]} size={size} color={iconColor} style={style} />;
  }

  const ioniconName = ioniconsMap[name] || 'ellipse-outline';
  return <Ionicons name={ioniconName} size={size} color={iconColor} style={style} />;
}
