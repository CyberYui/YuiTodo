/**
 * Recurrence rule factory and validation.
 * Defines the parameter structure for each recurrence type and validates input.
 */

import { RecurrenceType, CYCLE_LIMITS } from '../utils/constants';
import { RecurrenceRuleDTO } from '../types';

export function createDailyRule(): RecurrenceRuleDTO {
  return { type: RecurrenceType.DAILY, interval: 1 };
}

export function createWeeklyRule(daysOfWeek: number[] = [1]): RecurrenceRuleDTO {
  return { type: RecurrenceType.WEEKLY, interval: 1, days_of_week: daysOfWeek };
}

export function createMonthlyRule(dayOfMonth = 1): RecurrenceRuleDTO {
  return { type: RecurrenceType.MONTHLY, interval: 1, day_of_month: dayOfMonth };
}

export function createYearlyRule(monthOfYear = 1, dayOfMonth = 1): RecurrenceRuleDTO {
  return { type: RecurrenceType.YEARLY, interval: 1, month_of_year: monthOfYear, day_of_month: dayOfMonth };
}

export function createCustomDaysRule(intervalDays: number): RecurrenceRuleDTO {
  return { type: RecurrenceType.CUSTOM_DAYS, interval: intervalDays };
}

export function createCustomWeeksRule(intervalWeeks: number): RecurrenceRuleDTO {
  return { type: RecurrenceType.CUSTOM_WEEKS, interval: intervalWeeks };
}

interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateRecurrenceRule(rule: RecurrenceRuleDTO): ValidationResult {
  const validTypes = Object.values(RecurrenceType);
  if (!validTypes.includes(rule.type)) {
    return { valid: false, error: '循环类型不合法' };
  }

  if (rule.interval !== undefined) {
    if (rule.interval < CYCLE_LIMITS.MIN_INTERVAL || rule.interval > CYCLE_LIMITS.MAX_INTERVAL) {
      return { valid: false, error: `间隔数必须在${CYCLE_LIMITS.MIN_INTERVAL}到${CYCLE_LIMITS.MAX_INTERVAL}之间` };
    }
  }

  switch (rule.type) {
    case RecurrenceType.WEEKLY:
      if (!rule.days_of_week || rule.days_of_week.length === 0) {
        return { valid: false, error: '每周循环需指定具体哪几天' };
      }
      if (rule.days_of_week.some((d) => d < 1 || d > 7)) {
        return { valid: false, error: '每周日期必须在1（周一）到7（周日）之间' };
      }
      break;
    case RecurrenceType.MONTHLY:
      if (rule.day_of_month !== undefined && (rule.day_of_month < 1 || rule.day_of_month > 31)) {
        return { valid: false, error: '每月日期必须在1到31之间' };
      }
      break;
    case RecurrenceType.YEARLY:
      if (rule.month_of_year !== undefined && (rule.month_of_year < 1 || rule.month_of_year > 12)) {
        return { valid: false, error: '月份必须在1到12之间' };
      }
      if (rule.day_of_month !== undefined && (rule.day_of_month < 1 || rule.day_of_month > 31)) {
        return { valid: false, error: '日期必须在1到31之间' };
      }
      break;
    case RecurrenceType.CUSTOM_DAYS:
      if (rule.interval !== undefined && (rule.interval < CYCLE_LIMITS.MIN_DAYS || rule.interval > CYCLE_LIMITS.MAX_DAYS)) {
        return { valid: false, error: `间隔天数必须在${CYCLE_LIMITS.MIN_DAYS}到${CYCLE_LIMITS.MAX_DAYS}之间` };
      }
      break;
    case RecurrenceType.CUSTOM_WEEKS:
      if (rule.interval !== undefined && (rule.interval < 1 || rule.interval > 52)) {
        return { valid: false, error: '间隔周数必须在1到52之间' };
      }
      break;
    default:
      break;
  }

  return { valid: true, error: null };
}
