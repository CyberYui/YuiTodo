// 循环状态判断
// 负责：判断循环任务当前的状态（是否暂停/是否已结束/是否生效）
// 纯判断逻辑，不涉及日期计算

import { isBefore, isAfter, startOfDay } from 'date-fns';

/**
 * 判断循环规则是否当前生效中（未暂停且未过期）
 * @param {Object} rule - 循环规则对象
 * @returns {boolean} true=生效中
 */
export function isRecurrenceActive(rule) {
  if (!rule) return false;

  // 已暂停 → 不生效
  if (rule.is_paused) return false;

  // 已设置结束日期且结束日期已过 → 不生效
  if (rule.end_date && isBefore(new Date(rule.end_date), startOfDay(new Date()))) {
    return false;
  }

  return true;
}

/**
 * 判断循环规则是否已永久结束（到达结束日期）
 * @param {Object} rule - 循环规则对象
 * @returns {boolean} true=已结束
 */
export function isRecurrenceEnded(rule) {
  if (!rule) return false;

  // 没有结束日期 → 永久循环，永不结束
  if (!rule.end_date) return false;

  // 结束日期已过 → 已结束
  return isBefore(new Date(rule.end_date), startOfDay(new Date()));
}

/**
 * 判断循环规则是否被用户手动暂停
 * @param {Object} rule - 循环规则对象
 * @returns {boolean} true=已暂停
 */
export function isRecurrencePaused(rule) {
  if (!rule) return false;
  return rule.is_paused === 1 || rule.is_paused === true;
}

/**
 * 判断循环规则是否已过期（超过截止日期）
 * 注意：与isRecurrenceEnded不同，这个判断基于rule.end_date
 * @param {Object} rule - 循环规则对象
 * @returns {boolean}
 */
export function isRecurrenceExpired(rule) {
  if (!rule || !rule.end_date) return false;
  return isBefore(new Date(rule.end_date), startOfDay(new Date()));
}

/**
 * 获取循环规则的状态描述文本
 * @param {Object} rule - 循环规则对象
 * @returns {string} 状态描述
 */
export function getRecurrenceStatusText(rule) {
  if (!rule) return '不循环';

  if (isRecurrencePaused(rule)) return '已暂停';
  if (isRecurrenceEnded(rule)) return '已结束';
  return '进行中';
}

/**
 * 判断某个任务在指定日期是否应该出现
 * @param {Object} task - 任务对象（需包含start_time和recurrence_id）
 * @param {Object} rule - 关联的循环规则（如果有的话）
 * @param {Date} date - 要判断的日期
 * @returns {boolean} true=该任务在指定日期应该出现
 */
export function shouldTaskAppearOnDate(task, rule, date) {
  const targetDate = startOfDay(new Date(date));
  const taskStart = startOfDay(new Date(task.start_time));

  // 如果目标日期早于任务开始时间 → 不出现
  if (isBefore(targetDate, taskStart)) return false;

  // 如果没有循环规则 → 一次性任务，只在start_time当天出现
  if (!rule) {
    return targetDate.getTime() === taskStart.getTime();
  }

  // 如果有循环规则但已暂停或不生效 → 不出现
  if (!isRecurrenceActive(rule)) return false;

  // 如果任务有截止日期且目标日期超过截止日期 → 不出现
  if (task.deadline && isAfter(targetDate, startOfDay(new Date(task.deadline)))) {
    return false;
  }

  return true;
}
