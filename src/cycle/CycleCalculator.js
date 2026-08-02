// 核心：循环日期计算器
// 负责：根据循环规则和基准日期，计算下一次触发日期
// 这是整个App最核心的算法模块，所有循环任务的调度依赖此模块

import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  nextDay,
  setDay,
  setMonth,
  setDate,
  startOfDay,
  isBefore,
  isAfter,
  getDay,
  getDate,
  getMonth,
} from 'date-fns';
import { RecurrenceType } from '../utils/constants';

/**
 * 根据循环规则计算下一次触发日期
 *
 * @param {Object} rule - 循环规则对象（从数据库读取的recurrence_rule行）
 * @param {Date} baseDate - 基准日期（通常取任务开始时间或上次完成时间）
 * @returns {Date|null} 下次触发日期，如果循环已结束则返回null
 *
 * 核心逻辑：
 * 1. 判断循环是否已暂停或结束 → 返回null
 * 2. 根据循环类型分别计算
 * 3. 如果计算出的日期早于baseDate，继续往后推直到晚于baseDate
 */
export function calculateNextOccurrence(rule, baseDate) {
  // 如果循环规则为空，说明是一次性任务，无下次触发
  if (!rule) return null;

  // 如果循环已暂停，不计算下次触发
  if (rule.is_paused) return null;

  // 如果循环设置了结束日期且已过期，不再触发
  if (rule.end_date && isBefore(new Date(rule.end_date), startOfDay(new Date()))) {
    return null;
  }

  const base = startOfDay(new Date(baseDate));
  let nextDate = null;

  // 根据循环类型分发给对应的计算函数
  switch (rule.type) {
    case RecurrenceType.DAILY:
      nextDate = calculateDaily(base, rule);
      break;

    case RecurrenceType.WEEKLY:
      nextDate = calculateWeekly(base, rule);
      break;

    case RecurrenceType.MONTHLY:
      nextDate = calculateMonthly(base, rule);
      break;

    case RecurrenceType.YEARLY:
      nextDate = calculateYearly(base, rule);
      break;

    case RecurrenceType.CUSTOM_DAYS:
      nextDate = calculateCustomDays(base, rule);
      break;

    case RecurrenceType.CUSTOM_WEEKS:
      nextDate = calculateCustomWeeks(base, rule);
      break;

    default:
      return null;
  }

  // 如果计算结果早于基准日期，继续往后推直到超过基准日期
  // 这保证了返回的"下次"日期一定在baseDate之后
  while (nextDate && isBefore(nextDate, addDays(base, 1))) {
    nextDate = calculateNextOccurrence(
      { ...rule, end_date: rule.end_date },
      nextDate
    );
    // 防止无限循环（理论上不会发生，但安全起见）
    if (!nextDate) break;
    if (isBefore(new Date(rule.end_date || Infinity), nextDate)) {
      return null;
    }
  }

  // 检查计算出的日期是否超过循环结束日期
  if (nextDate && rule.end_date && isAfter(nextDate, new Date(rule.end_date))) {
    return null;
  }

  return nextDate;
}

/**
 * 每日循环：基准日期 + interval天
 */
function calculateDaily(base, rule) {
  return addDays(base, rule.interval || 1);
}

/**
 * 每周循环：找到下一个指定的星期几
 * 例如days_of_week=[1,3,5]（周一三五），从base开始找下一个匹配的日期
 */
function calculateWeekly(base, rule) {
  const daysOfWeek = rule.days_of_week || [1]; // 默认每周一
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b); // 升序排列

  // 找到base之后的下一个匹配日
  // 注意：date-fns中getDay()返回0(周日)-6(周六)，我们的规则用1(周一)-7(周日)
  const baseDayOfWeek = getDay(base); // 0=周日, 1=周一, ...6=周六
  // 转换为我们的格式：1=周一...7=周日
  const currentDayNormalized = baseDayOfWeek === 0 ? 7 : baseDayOfWeek;

  // 找下一个大于当前日的匹配日
  const nextDay = sortedDays.find((d) => d > currentDayNormalized);

  if (nextDay !== undefined) {
    // 本周内就能找到
    const daysToAdd = nextDay - currentDayNormalized;
    return addDays(base, daysToAdd);
  } else {
    // 本周没有，回到下周第一个匹配日
    const firstDay = sortedDays[0];
    const daysToAdd = (7 - currentDayNormalized) + firstDay;
    return addDays(base, daysToAdd);
  }
}

/**
 * 每月循环：设置到指定日期（day_of_month）
 * 如果当月没有该日期（如31日但当月只有30天），则取当月最后一天
 */
function calculateMonthly(base, rule) {
  const targetDay = rule.day_of_month || 1;
  const nextMonth = addMonths(base, rule.interval || 1);
  return setDateSafe(nextMonth, targetDay);
}

/**
 * 每年循环：设置到指定月份和日期
 */
function calculateYearly(base, rule) {
  const targetMonth = (rule.month_of_year || 1) - 1; // date-fns月份从0开始
  const targetDay = rule.day_of_month || 1;
  const nextYear = addYears(base, rule.interval || 1);
  const withMonth = setMonth(nextYear, targetMonth);
  return setDateSafe(withMonth, targetDay);
}

/**
 * 自定义间隔天数：基准日期 + interval天
 */
function calculateCustomDays(base, rule) {
  return addDays(base, rule.interval || 1);
}

/**
 * 自定义间隔周数：基准日期 + interval周
 */
function calculateCustomWeeks(base, rule) {
  return addWeeks(base, rule.interval || 1);
}

/**
 * 安全设置日期：如果目标日期超出当月天数，自动取当月最后一天
 * 例如：setDateSafe(2月, 31) → 2月28日（或29日闰年）
 */
function setDateSafe(date, day) {
  const result = setDate(date, day);
  // 如果设置后月份变了，说明溢出，回退一天
  if (getMonth(result) !== getMonth(date)) {
    return addDays(result, -1);
  }
  return result;
}

/**
 * 计算两个日期之间该循环规则应触发的所有日期
 * 用于批量生成或预览循环任务
 *
 * @param {Object} rule - 循环规则
 * @param {Date} startDate - 起始日期
 * @param {Date} endDate - 结束日期
 * @returns {Date[]} 所有应触发的日期数组
 */
export function generateOccurrences(rule, startDate, endDate) {
  const occurrences = [];
  let current = startOfDay(new Date(startDate));
  const end = startOfDay(new Date(endDate));

  // 安全限制：最多生成365个日期，防止死循环
  let count = 0;
  const MAX_OCCURRENCES = 365;

  while (isBefore(current, end) && count < MAX_OCCURRENCES) {
    const next = calculateNextOccurrence(rule, current);
    if (!next || isAfter(next, end)) break;
    occurrences.push(next);
    current = next;
    count++;
  }

  return occurrences;
}
