/**
 * YuiTodo Type Definitions
 * All entity types, DTOs, and enums used throughout the application.
 */

// ==================== Task Status ====================

export enum TaskStatus {
  PENDING = 'pending',
  DONE = 'done',
  POSTPONED = 'postponed',
  ARCHIVED = 'archived',
}

// ==================== Recurrence ====================

export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM_DAYS = 'custom_days',
  CUSTOM_WEEKS = 'custom_weeks',
}

export interface RecurrenceRule {
  id: number;
  type: RecurrenceType;
  interval: number;
  days_of_week: number[] | null;
  day_of_month: number | null;
  month_of_year: number | null;
  end_date: number | null;
  is_paused: boolean;
  created_at: number;
}

export interface RecurrenceRuleDTO {
  type: RecurrenceType;
  interval?: number;
  days_of_week?: number[];
  day_of_month?: number;
  month_of_year?: number;
  end_date?: number;
  is_paused?: boolean;
}

// ==================== Task ====================

export interface Task {
  id: number;
  title: string;
  note: string;
  status: TaskStatus;
  start_time: number;
  end_time: number;
  deadline: number | null;
  start_date: number;
  color: string;
  recurrence_id: number | null;
  is_starred: number;
  group_id: number;
  list_id: number;
  created_at: number;
  updated_at: number;
  sort_order: number;
  deleted_at: number | null;
  reminder_time: string | null;
}

export interface TaskWithRelations extends Task {
  recurrenceRule: RecurrenceRule | null;
  steps: TaskStep[];
  nextOccurrence: Date | null;
}

export interface TaskCreateDTO {
  title: string;
  note?: string;
  startTime: number;
  endTime: number;
  startDate?: number;
  color?: string;
  groupId?: number;
  listId?: number;
  recurrenceRule?: RecurrenceRuleDTO;
  steps?: string[];
  deadline?: number | null;
  reminderTime?: string | null;
}

export interface TaskUpdateDTO {
  title?: string;
  note?: string;
  start_time?: number;
  end_time?: number;
  start_date?: number;
  color?: string;
  group_id?: number;
  status?: TaskStatus;
  reminder_time?: string | null;
}

// ==================== Task Step ====================

export interface TaskStep {
  id: number;
  task_id: number;
  title: string;
  sort_order: number;
  status: 'pending' | 'completed';
}

export interface StepStats {
  total: number;
  completed: number;
}

// ==================== Completion Record ====================

export interface CompletionRecord {
  id: number;
  task_id: number;
  completed_at: number;
  scheduled_date: number;
}

// ==================== Task List ====================

export interface TaskList {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

// ==================== Task Group ====================

export interface TaskGroup {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
  created_at: number;
}

// ==================== Theme ====================

export enum ThemeMode {
  AUTO = 'auto',
  LIGHT = 'light',
  DARK = 'dark',
  SCHEDULED = 'scheduled',
}

export interface ThemeColors {
  background: string;
  cardBackground: string;
  separator: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  done: string;
  swipeCompleteBg: string;
  swipeDeleteBg: string;
  overdue: string;
}

export interface ThemeStyleConfig {
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
  checkboxRadius: number;
  progressBarHeight: number;
  fontSize: { title: number; subtitle: number; body: number };
  lineHeight: number;
  completedTextDecoration: string;
  completedTextColor: string;
  monoFont: boolean;
}

// ==================== Font ====================

export interface FontConfig {
  id: string;
  name: string;
  file: any;
  preview: string;
  category: string;
}

// ==================== Statistics ====================

export enum StatPeriod {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export interface DailyCompletion {
  date: number;
  count: number;
  label: string;
}

export interface OverviewCounts {
  pending: number;
  overdue: number;
  completed: number;
  postponed: number;
}

export interface TodayProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface RecurrenceFulfillment {
  rate: number;
  totalScheduled: number;
  totalCompleted: number;
}

// ==================== App Icon ====================

export interface AppIcon {
  id: string;
  name: string;
  file: any;
}

// ==================== Task Color Theme ====================

export interface TaskColorTheme {
  name: string;
  bar: string;
  label: string;
  date: string;
  bg: string;
}

// ==================== Chart Data ====================

export interface ChartDataPoint {
  label: string;
  completed?: number;
  count?: number;
}

// ==================== Recurrence Status ====================

export type RecurrenceStatusText = '不循环' | '已暂停' | '已结束' | '进行中';
