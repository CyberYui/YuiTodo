// 全局常量定义：状态枚举、循环类型、默认值等
// 集中管理所有魔法值，避免散落在代码各处

// ==================== App版本号 ====================
export const APP_VERSION = '1.5.5';

// ==================== 任务状态枚举 ====================
// 每个任务必定处于以下四种状态之一
export const TaskStatus = {
  PENDING: 'pending',       // 待完成：任务尚未处理
  DONE: 'done',             // 已完成：任务已做完
  POSTPONED: 'postponed',   // 延后：任务推迟到以后
  ARCHIVED: 'archived',     // 归档：任务已归档不再显示在主列表
};

// ==================== 循环规则类型枚举 ====================
// 定义任务的所有可能循环方式
export const RecurrenceType = {
  DAILY: 'daily',                 // 每日循环
  WEEKLY: 'weekly',               // 每周循环
  MONTHLY: 'monthly',             // 每月循环
  YEARLY: 'yearly',               // 每年循环
  CUSTOM_DAYS: 'custom_days',     // 自定义间隔N天
  CUSTOM_WEEKS: 'custom_weeks',   // 自定义间隔N周
};

// ==================== 循环类型中文标签 ====================
// 用于UI显示循环规则的中文名称
export const RecurrenceLabels = {
  [RecurrenceType.DAILY]: '每天',
  [RecurrenceType.WEEKLY]: '每周',
  [RecurrenceType.MONTHLY]: '每月',
  [RecurrenceType.YEARLY]: '每年',
  [RecurrenceType.CUSTOM_DAYS]: '每N天',
  [RecurrenceType.CUSTOM_WEEKS]: '每N周',
};

// ==================== 任务状态中文标签 ====================
export const TaskStatusLabels = {
  [TaskStatus.PENDING]: '待完成',
  [TaskStatus.DONE]: '已完成',
  [TaskStatus.POSTPONED]: '延后',
  [TaskStatus.ARCHIVED]: '归档',
};

// ==================== 循环间隔限制 ====================
// 最短1天，最长1年（365天）
export const CYCLE_LIMITS = {
  MIN_DAYS: 1,          // 最短循环周期：1天
  MAX_DAYS: 365,        // 最长循环周期：1年
  MIN_INTERVAL: 1,      // 最小间隔数：1
  MAX_INTERVAL: 365,    // 最大间隔数：365（即最长365天/周）
};

// ==================== 默认日期范围 ====================
// 任务默认开始时间为当前时刻
export const getDefaultStartTime = () => Date.now();
// 任务默认结束时间为开始时间后24小时
export const getDefaultEndTime = () => Date.now() + 24 * 60 * 60 * 1000;
// ==================== 任务颜色预设（14种主题） ====================
// 每种主题包含：任务条色、循环标签色、日期标签色、背景色
export const TASK_COLORS = [
  { name: '海洋', bar: '#3B82F6', label: '#06B6D4', date: '#6B7280', bg: '#3B82F620' },
  { name: '森林', bar: '#10B981', label: '#F59E0B', date: '#6B7280', bg: '#10B98120' },
  { name: '日落', bar: '#F59E0B', label: '#EF4444', date: '#8B5CF6', bg: '#F59E0B20' },
  { name: '樱花', bar: '#EC4899', label: '#8B5CF6', date: '#06B6D4', bg: '#EC489920' },
  { name: '紫罗兰', bar: '#8B5CF6', label: '#EC4899', date: '#F59E0B', bg: '#8B5CF620' },
  { name: '红宝石', bar: '#EF4444', label: '#F59E0B', date: '#10B981', bg: '#EF444420' },
  // 编程主题
  { name: 'Monokai', bar: '#F92672', label: '#A6E22E', date: '#66D9EF', bg: '#F9267220' },
  { name: 'Dracula', bar: '#FF79C6', label: '#50FA7B', date: '#BD93F9', bg: '#FF79C620' },
  { name: 'Nord', bar: '#88C0D0', label: '#81A1C1', date: '#5E81AC', bg: '#88C0D020' },
  { name: 'One Dark', bar: '#E06C75', label: '#98C379', date: '#61AFEF', bg: '#E06C7520' },
  { name: 'Solarized', bar: '#268BD2', label: '#859900', date: '#2AA198', bg: '#268BD220' },
  { name: 'Gruvbox', bar: '#FE8019', label: '#B8BB26', date: '#FABD2F', bg: '#FE801920' },
  { name: 'Tokyo Night', bar: '#7AA2F7', label: '#9ECE6A', date: '#BB9AF7', bg: '#7AA2F720' },
  { name: 'Catppuccin', bar: '#CBA6F7', label: '#A6E3A1', date: '#89DCEE', bg: '#CBA6F720' },
];

// ==================== 字体预设 ====================
// 可选的字体风格（使用系统字体模拟不同风格）
export const FONT_STYLES = [
  { name: '默认', value: 'normal', label: '系统默认' },
  { name: '圆润', value: 'rounded', label: '圆润可爱' },
  { name: '硬朗', value: 'hard', label: '硬朗简洁' },
  { name: '优雅', value: 'elegant', label: '优雅文艺' },
];

// ==================== 今日时间边界 ====================
// 获取今日0点的毫秒时间戳（用于判断任务是否属于今天）
export const getTodayStart = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
};
// 获取今日23:59:59.999的毫秒时间戳
export const getTodayEnd = () => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.getTime();
};
