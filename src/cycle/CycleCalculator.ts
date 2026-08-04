/**
 * Core: recurrence date calculator.
 * Given a recurrence rule and base date, computes the next trigger date.
 * This is the most critical algorithm module in the entire app.
 */

import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
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
import { RecurrenceType, RecurrenceRule } from '../types';

export function calculateNextOccurrence(rule: RecurrenceRule, baseDate: Date | number): Date | null {
  if (!rule) return null;
  if (rule.is_paused) return null;

  if (rule.end_date && isBefore(new Date(rule.end_date), startOfDay(new Date()))) {
    return null;
  }

  const base = startOfDay(new Date(baseDate));
  let nextDate: Date | null = null;

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

  while (nextDate && isBefore(nextDate, addDays(base, 1))) {
    nextDate = calculateNextOccurrence(
      { ...rule, end_date: rule.end_date },
      nextDate
    );
    if (!nextDate) break;
    if (isBefore(new Date(rule.end_date || Infinity), nextDate)) {
      return null;
    }
  }

  if (nextDate && rule.end_date && isAfter(nextDate, new Date(rule.end_date))) {
    return null;
  }

  return nextDate;
}

function calculateDaily(base: Date, rule: RecurrenceRule): Date {
  return addDays(base, rule.interval || 1);
}

function calculateWeekly(base: Date, rule: RecurrenceRule): Date {
  const daysOfWeek = rule.days_of_week || [1];
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
  const baseDayOfWeek = getDay(base);
  const currentDayNormalized = baseDayOfWeek === 0 ? 7 : baseDayOfWeek;
  const nextDay = sortedDays.find((d) => d > currentDayNormalized);

  if (nextDay !== undefined) {
    return addDays(base, nextDay - currentDayNormalized);
  }
  const firstDay = sortedDays[0];
  return addDays(base, (7 - currentDayNormalized) + firstDay);
}

function calculateMonthly(base: Date, rule: RecurrenceRule): Date {
  const targetDay = rule.day_of_month || 1;
  const nextMonth = addMonths(base, rule.interval || 1);
  return setDateSafe(nextMonth, targetDay);
}

function calculateYearly(base: Date, rule: RecurrenceRule): Date {
  const targetMonth = (rule.month_of_year || 1) - 1;
  const targetDay = rule.day_of_month || 1;
  const nextYear = addYears(base, rule.interval || 1);
  const withMonth = setMonth(nextYear, targetMonth);
  return setDateSafe(withMonth, targetDay);
}

function calculateCustomDays(base: Date, rule: RecurrenceRule): Date {
  return addDays(base, rule.interval || 1);
}

function calculateCustomWeeks(base: Date, rule: RecurrenceRule): Date {
  return addWeeks(base, rule.interval || 1);
}

function setDateSafe(date: Date, day: number): Date {
  const result = setDate(date, day);
  if (getMonth(result) !== getMonth(date)) {
    return addDays(result, -1);
  }
  return result;
}

export function generateOccurrences(rule: RecurrenceRule, startDate: Date | number, endDate: Date | number): Date[] {
  const occurrences: Date[] = [];
  let current = startOfDay(new Date(startDate));
  const end = startOfDay(new Date(endDate));
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
