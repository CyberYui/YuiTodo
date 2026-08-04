/**
 * Completion rate calculation utilities.
 */

import { subDays, startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';
import { getDailyCompletions, getCompletionCount } from '../database/CompletionRepository';
import { StatPeriod } from '../types';

export { StatPeriod };

export function getPeriodStartDate(period: StatPeriod): number {
  const now = new Date();
  switch (period) {
    case StatPeriod.WEEK:
      return startOfDay(subDays(now, 6)).getTime();
    case StatPeriod.MONTH:
      return startOfDay(subDays(now, 29)).getTime();
    case StatPeriod.YEAR:
      return startOfDay(subDays(now, 364)).getTime();
    default:
      return startOfDay(subDays(now, 6)).getTime();
  }
}

export async function calculateDailyCompletionRate(period: StatPeriod): Promise<Array<{ date: number; completed: number; label: string; dayLabel: string }>> {
  const startDate = getPeriodStartDate(period);
  const endDate = endOfDay(new Date()).getTime();
  const dailyCompletions = await getDailyCompletions(startDate, endDate);

  const completionMap: Record<number, number> = {};
  dailyCompletions.forEach((record) => {
    const dayStart = startOfDay(new Date(record.date)).getTime();
    completionMap[dayStart] = record.count;
  });

  const days = eachDayOfInterval({ start: new Date(startDate), end: new Date() });
  return days.map((day) => {
    const dayStart = startOfDay(day).getTime();
    return {
      date: dayStart,
      completed: completionMap[dayStart] || 0,
      label: format(day, 'MM/dd'),
      dayLabel: format(day, 'E'),
    };
  });
}

export async function calculateOverallCompletionRate(period: StatPeriod): Promise<{ completed: number; total: number; rate: number }> {
  const startDate = getPeriodStartDate(period);
  const endDate = endOfDay(new Date()).getTime();
  const completed = await getCompletionCount(startDate, endDate);
  return { completed, total: completed, rate: 0 };
}

export async function calculateCompletionTrend(period: StatPeriod): Promise<{ current: number; previous: number; trend: 'up' | 'down' | 'flat' }> {
  const now = new Date();
  const currentStart = getPeriodStartDate(period);
  const currentEnd = endOfDay(now).getTime();
  const currentCount = await getCompletionCount(currentStart, currentEnd);

  const periodDays = period === StatPeriod.WEEK ? 7 : period === StatPeriod.MONTH ? 30 : 365;
  const previousStart = subDays(new Date(currentStart), periodDays);
  const previousEnd = subDays(new Date(currentEnd), periodDays);
  const previousCount = await getCompletionCount(
    startOfDay(previousStart).getTime(),
    endOfDay(previousEnd).getTime()
  );

  let trend: 'up' | 'down' | 'flat' = 'flat';
  if (currentCount > previousCount) trend = 'up';
  else if (currentCount < previousCount) trend = 'down';

  return { current: currentCount, previous: previousCount, trend };
}
