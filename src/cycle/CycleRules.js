// 循环规则定义与验证
// 负责：定义每种循环类型的参数结构，验证用户输入的循环参数是否合法
// 这是循环计算的"配置层"，不包含日期计算逻辑

import { RecurrenceType, CYCLE_LIMITS } from '../utils/constants';

/**
 * 创建每日循环规则的配置对象
 * @returns {Object} 规则配置
 */
export function createDailyRule() {
  return {
    type: RecurrenceType.DAILY,
    interval: 1,  // 每1天
  };
}

/**
 * 创建每周循环规则的配置对象
 * @param {number[]} daysOfWeek - 每周哪几天触发，1=周一，7=周日，如[1,3,5]表示周一三五
 * @returns {Object} 规则配置
 */
export function createWeeklyRule(daysOfWeek = [1]) {
  return {
    type: RecurrenceType.WEEKLY,
    interval: 1,  // 每1周
    days_of_week: daysOfWeek,
  };
}

/**
 * 创建每月循环规则的配置对象
 * @param {number} dayOfMonth - 每月第几天触发（1-31）
 * @returns {Object} 规则配置
 */
export function createMonthlyRule(dayOfMonth = 1) {
  return {
    type: RecurrenceType.MONTHLY,
    interval: 1,  // 每1月
    day_of_month: dayOfMonth,
  };
}

/**
 * 创建每年循环规则的配置对象
 * @param {number} monthOfYear - 每年第几个月触发（1-12）
 * @param {number} dayOfMonth - 该月第几天触发（1-31）
 * @returns {Object} 规则配置
 */
export function createYearlyRule(monthOfYear = 1, dayOfMonth = 1) {
  return {
    type: RecurrenceType.YEARLY,
    interval: 1,  // 每1年
    month_of_year: monthOfYear,
    day_of_month: dayOfMonth,
  };
}

/**
 * 创建自定义间隔天数的循环规则
 * @param {number} intervalDays - 间隔天数（1-365）
 * @returns {Object} 规则配置
 */
export function createCustomDaysRule(intervalDays) {
  return {
    type: RecurrenceType.CUSTOM_DAYS,
    interval: intervalDays,
  };
}

/**
 * 创建自定义间隔周数的循环规则
 * @param {number} intervalWeeks - 间隔周数（1-52）
 * @returns {Object} 规则配置
 */
export function createCustomWeeksRule(intervalWeeks) {
  return {
    type: RecurrenceType.CUSTOM_WEEKS,
    interval: intervalWeeks,
  };
}

/**
 * 验证循环规则参数是否合法
 * @param {Object} rule - 规则配置对象
 * @returns {{ valid: boolean, error: string|null }} 验证结果
 */
export function validateRecurrenceRule(rule) {
  // 检查type是否合法
  const validTypes = Object.values(RecurrenceType);
  if (!validTypes.includes(rule.type)) {
    return { valid: false, error: '循环类型不合法' };
  }

  // 检查interval范围
  if (rule.interval !== undefined) {
    if (rule.interval < CYCLE_LIMITS.MIN_INTERVAL || rule.interval > CYCLE_LIMITS.MAX_INTERVAL) {
      return { valid: false, error: `间隔数必须在${CYCLE_LIMITS.MIN_INTERVAL}到${CYCLE_LIMITS.MAX_INTERVAL}之间` };
    }
  }

  // 根据类型检查特定字段
  switch (rule.type) {
    case RecurrenceType.WEEKLY:
      // 每周模式必须指定具体哪几天
      if (!rule.days_of_week || rule.days_of_week.length === 0) {
        return { valid: false, error: '每周循环需指定具体哪几天' };
      }
      // 检查日期范围合法性（1-7）
      const hasInvalidDay = rule.days_of_week.some(
        (d) => d < 1 || d > 7
      );
      if (hasInvalidDay) {
        return { valid: false, error: '每周日期必须在1（周一）到7（周日）之间' };
      }
      break;

    case RecurrenceType.MONTHLY:
      // 每月模式必须指定第几天
      if (rule.day_of_month < 1 || rule.day_of_month > 31) {
        return { valid: false, error: '每月日期必须在1到31之间' };
      }
      break;

    case RecurrenceType.YEARLY:
      // 每年模式必须指定月份和日期
      if (rule.month_of_year < 1 || rule.month_of_year > 12) {
        return { valid: false, error: '月份必须在1到12之间' };
      }
      if (rule.day_of_month < 1 || rule.day_of_month > 31) {
        return { valid: false, error: '日期必须在1到31之间' };
      }
      break;

    case RecurrenceType.CUSTOM_DAYS:
      // 自定义天数：最短1天，最长365天
      if (rule.interval < CYCLE_LIMITS.MIN_DAYS || rule.interval > CYCLE_LIMITS.MAX_DAYS) {
        return { valid: false, error: `间隔天数必须在${CYCLE_LIMITS.MIN_DAYS}到${CYCLE_LIMITS.MAX_DAYS}之间` };
      }
      break;

    case RecurrenceType.CUSTOM_WEEKS:
      // 自定义周数：最短1周，最长52周
      if (rule.interval < 1 || rule.interval > 52) {
        return { valid: false, error: '间隔周数必须在1到52之间' };
      }
      break;

    default:
      break;
  }

  return { valid: true, error: null };
}
