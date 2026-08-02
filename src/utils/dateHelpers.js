// 日期工具函数：封装常用的日期格式化、比较、计算逻辑
// 所有函数纯函数，无副作用，输入相同则输出相同

import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  differenceInDays,
  startOfDay,
  endOfDay,
  parseISO,
  isValid,
} from 'date-fns';

// ==================== 格式化函数 ====================

/**
 * 将毫秒时间戳格式化为中文友好日期字符串
 * @param {number} timestamp - Unix毫秒时间戳
 * @returns {string} 格式化后的日期字符串
 *
 * 规则：
 * - 今天 → 显示"今天 HH:mm"
 * - 明天 → 显示"明天 HH:mm"
 * - 其他 → 显示"MM月DD日 HH:mm"
 */
export function formatDateFriendly(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);

  if (isToday(date)) {
    return `今天 ${format(date, 'HH:mm')}`;
  }
  if (isTomorrow(date)) {
    return `明天 ${format(date, 'HH:mm')}`;
  }
  return format(date, 'MM月dd日 HH:mm');
}

/**
 * 将毫秒时间戳格式化为短日期（不含时间）
 * @param {number} timestamp - Unix毫秒时间戳
 * @returns {string} 如 "07月15日"
 */
export function formatDateShort(timestamp) {
  if (!timestamp) return '';
  return format(new Date(timestamp), 'MM月dd日');
}

/**
 * 将毫秒时间戳格式化为24小时制时间
 * @param {number} timestamp - Unix毫秒时间戳
 * @returns {string} 如 "14:30"
 */
export function formatTime(timestamp) {
  if (!timestamp) return '';
  return format(new Date(timestamp), 'HH:mm');
}

// ==================== 判断函数 ====================

/**
 * 判断某个时间戳是否已过期（早于当前时刻）
 * @param {number} timestamp - Unix毫秒时间戳
 * @returns {boolean}
 */
export function isExpired(timestamp) {
  if (!timestamp) return false;
  return isPast(new Date(timestamp));
}

/**
 * 判断某个时间戳是否属于今天
 * @param {number} timestamp - Unix毫秒时间戳
 * @returns {boolean}
 */
export function isDateToday(timestamp) {
  if (!timestamp) return false;
  return isToday(new Date(timestamp));
}

/**
 * 判断某个时间戳是否属于未来
 * @param {number} timestamp - Unix毫秒时间戳
 * @returns {boolean}
 */
export function isDateFuture(timestamp) {
  if (!timestamp) return false;
  return isFuture(new Date(timestamp));
}

// ==================== 计算函数 ====================

/**
 * 计算两个时间戳之间相差的天数
 * @param {number} timestampA - 较早的时间戳
 * @param {number} timestampB - 较晚的时间戳
 * @returns {number} 相差天数（正整数）
 */
export function daysBetween(timestampA, timestampB) {
  const dateA = startOfDay(new Date(timestampA));
  const dateB = startOfDay(new Date(timestampB));
  return differenceInDays(dateB, dateA);
}

/**
 * 获取某一天的开始时刻（00:00:00.000）
 * @param {number} timestamp - 任意毫秒时间戳
 * @returns {number} 当天0点的毫秒时间戳
 */
export function getStartOfDay(timestamp) {
  return startOfDay(new Date(timestamp)).getTime();
}

/**
 * 获取某一天的结束时刻（23:59:59.999）
 * @param {number} timestamp - 任意毫秒时间戳
 * @returns {number} 当天结束的毫秒时间戳
 */
export function getEndOfDay(timestamp) {
  return endOfDay(new Date(timestamp)).getTime();
}

/**
 * 验证时间戳是否有效
 * @param {number} timestamp - 待验证的时间戳
 * @returns {boolean}
 */
export function isValidTimestamp(timestamp) {
  if (!timestamp || typeof timestamp !== 'number') return false;
  return isValid(new Date(timestamp));
}
