/**
 * Global constants: enums, defaults, limits.
 * Centralizes all magic values used throughout the app.
 */

import {
  TaskStatus,
  RecurrenceType,
  TaskColorTheme,
  FontConfig,
  ThemeMode,
} from '../types';

export { ThemeMode } from '../types';

export const ThemeModeLabels: Record<ThemeMode, string> = {
  [ThemeMode.AUTO]: '跟随系统',
  [ThemeMode.LIGHT]: '浅色模式',
  [ThemeMode.DARK]: '深色模式',
  [ThemeMode.SCHEDULED]: '定时切换',
};

// ==================== App Version ====================

export const APP_VERSION = '2.0.0';

// ==================== Task Status ====================

export { TaskStatus };

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: '待完成',
  [TaskStatus.DONE]: '已完成',
  [TaskStatus.POSTPONED]: '延后',
  [TaskStatus.ARCHIVED]: '归档',
};

// ==================== Recurrence Type ====================

export { RecurrenceType };

export const RecurrenceLabels: Record<RecurrenceType, string> = {
  [RecurrenceType.DAILY]: '每天',
  [RecurrenceType.WEEKLY]: '每周',
  [RecurrenceType.MONTHLY]: '每月',
  [RecurrenceType.YEARLY]: '每年',
  [RecurrenceType.CUSTOM_DAYS]: '每N天',
  [RecurrenceType.CUSTOM_WEEKS]: '每N周',
};

// ==================== Cycle Limits ====================

export const CYCLE_LIMITS = {
  MIN_DAYS: 1,
  MAX_DAYS: 365,
  MIN_INTERVAL: 1,
  MAX_INTERVAL: 365,
} as const;

// ==================== Default Date Helpers ====================

export const getDefaultStartTime = (): number => Date.now();

export const getDefaultEndTime = (): number =>
  Date.now() + 24 * 60 * 60 * 1000;

// ==================== Task Color Presets (4x4) ====================

export const TASK_COLORS: TaskColorTheme[] = [
  { name: '海洋', bar: '#3B82F6', label: '#06B6D4', date: '#6B7280', bg: '#3B82F620' },
  { name: '森林', bar: '#10B981', label: '#059669', date: '#6B7280', bg: '#10B98120' },
  { name: '日落', bar: '#F59E0B', label: '#D97706', date: '#8B5CF6', bg: '#F59E0B20' },
  { name: '樱花', bar: '#EC4899', label: '#DB2777', date: '#06B6D4', bg: '#EC489920' },
  { name: '紫罗兰', bar: '#8B5CF6', label: '#7C3AED', date: '#F59E0B', bg: '#8B5CF620' },
  { name: '红宝石', bar: '#EF4444', label: '#DC2626', date: '#10B981', bg: '#EF444420' },
  { name: '青碧', bar: '#14B8A6', label: '#0D9488', date: '#6366F1', bg: '#14B8A620' },
  { name: '靛蓝', bar: '#6366F1', label: '#4F46E5', date: '#EC4899', bg: '#6366F120' },
  { name: 'Monokai', bar: '#F92672', label: '#A6E22E', date: '#66D9EF', bg: '#F9267220' },
  { name: 'Dracula', bar: '#FF79C6', label: '#50FA7B', date: '#BD93F9', bg: '#FF79C620' },
  { name: 'Nord', bar: '#88C0D0', label: '#81A1C1', date: '#5E81AC', bg: '#88C0D020' },
  { name: 'One Dark', bar: '#E06C75', label: '#98C379', date: '#61AFEF', bg: '#E06C7520' },
  { name: 'Solarized', bar: '#268BD2', label: '#859900', date: '#2AA198', bg: '#268BD220' },
  { name: 'Gruvbox', bar: '#FE8019', label: '#B8BB26', date: '#FABD2F', bg: '#FE801920' },
  { name: 'Tokyo Night', bar: '#7AA2F7', label: '#9ECE6A', date: '#BB9AF7', bg: '#7AA2F720' },
  { name: 'Catppuccin', bar: '#CBA6F7', label: '#A6E3A1', date: '#89DCEE', bg: '#CBA6F720' },
];

// ==================== Font Styles ====================

export const FONT_STYLES: FontConfig[] = [
  { id: 'default', name: '系统默认', category: 'system', file: null, preview: 'YuiTodo 任务清单' },
  { id: 'rounded', name: '圆润', category: 'rounded', file: null, preview: '圆润可爱风格' },
  { id: 'hard', name: '硬朗', category: 'hard', file: null, preview: '硬朗简洁风格' },
  { id: 'elegant', name: '优雅', category: 'elegant', file: null, preview: '优雅文艺风格' },
];

// ==================== Time Boundaries ====================

export const getTodayStart = (): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
};

export const getTodayEnd = (): number => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.getTime();
};

// ==================== Swipe Threshold ====================

export const SWIPE_THRESHOLD = 80;

// ==================== Recycle Bin ====================

export const RECYCLE_BIN_RETENTION_DAYS = 30;

// ==================== Pomodoro ====================

export const POMODORO_WORK_SECONDS = 25 * 60;
export const POMODORO_BREAK_SECONDS = 5 * 60;
