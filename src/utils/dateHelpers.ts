/**
 * Date utility functions — all pure, deterministic, no side effects.
 */

import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  differenceInDays,
  startOfDay,
  endOfDay,
  isValid,
} from 'date-fns';

// ==================== Formatting ====================

export function formatDateFriendly(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isToday(date)) return `今天 ${format(date, 'HH:mm')}`;
  if (isTomorrow(date)) return `明天 ${format(date, 'HH:mm')}`;
  return format(date, 'MM月dd日 HH:mm');
}

export function formatDateShort(timestamp: number): string {
  if (!timestamp) return '';
  return format(new Date(timestamp), 'MM月dd日');
}

export function formatTime(timestamp: number): string {
  if (!timestamp) return '';
  return format(new Date(timestamp), 'HH:mm');
}

// ==================== Comparison ====================

export function isExpired(timestamp: number | null): boolean {
  if (!timestamp) return false;
  return isPast(new Date(timestamp));
}

export function isDateToday(timestamp: number | null): boolean {
  if (!timestamp) return false;
  return isToday(new Date(timestamp));
}

export function isDateFuture(timestamp: number | null): boolean {
  if (!timestamp) return false;
  return isFuture(new Date(timestamp));
}

// ==================== Computation ====================

export function daysBetween(timestampA: number, timestampB: number): number {
  const dateA = startOfDay(new Date(timestampA));
  const dateB = startOfDay(new Date(timestampB));
  return differenceInDays(dateB, dateA);
}

export function getStartOfDay(timestamp: number): number {
  return startOfDay(new Date(timestamp)).getTime();
}

export function getEndOfDay(timestamp: number): number {
  return endOfDay(new Date(timestamp)).getTime();
}

export function isValidTimestamp(timestamp: number): boolean {
  if (!timestamp || typeof timestamp !== 'number') return false;
  return isValid(new Date(timestamp));
}
