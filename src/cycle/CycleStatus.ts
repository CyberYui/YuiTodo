/**
 * Recurrence status evaluation — pure boolean checks.
 */

import { isBefore, isAfter, startOfDay } from 'date-fns';
import { RecurrenceRule } from '../types';

export function isRecurrenceActive(rule: RecurrenceRule | null): boolean {
  if (!rule) return false;
  if (rule.is_paused) return false;
  if (rule.end_date && isBefore(new Date(rule.end_date), startOfDay(new Date()))) {
    return false;
  }
  return true;
}

export function isRecurrenceEnded(rule: RecurrenceRule | null): boolean {
  if (!rule) return false;
  if (!rule.end_date) return false;
  return isBefore(new Date(rule.end_date), startOfDay(new Date()));
}

export function isRecurrencePaused(rule: RecurrenceRule | null): boolean {
  if (!rule) return false;
  return Boolean(rule.is_paused);
}

export function isRecurrenceExpired(rule: RecurrenceRule | null): boolean {
  if (!rule || !rule.end_date) return false;
  return isBefore(new Date(rule.end_date), startOfDay(new Date()));
}

export function getRecurrenceStatusText(rule: RecurrenceRule | null): string {
  if (!rule) return '不循环';
  if (isRecurrencePaused(rule)) return '已暂停';
  if (isRecurrenceEnded(rule)) return '已结束';
  return '进行中';
}

export function shouldTaskAppearOnDate(
  task: { start_time: number; deadline: number | null },
  rule: RecurrenceRule | null,
  date: Date | number
): boolean {
  const targetDate = startOfDay(new Date(date));
  const taskStart = startOfDay(new Date(task.start_time));

  if (isBefore(targetDate, taskStart)) return false;

  if (!rule) {
    return targetDate.getTime() === taskStart.getTime();
  }

  if (!isRecurrenceActive(rule)) return false;

  if (task.deadline && isAfter(targetDate, startOfDay(new Date(task.deadline)))) {
    return false;
  }

  return true;
}
