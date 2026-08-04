/**
 * Daily completion count statistics.
 */

import { subDays, startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';
import { getDailyCompletions } from '../database/CompletionRepository';
import { StatPeriod } from '../types';
import { getPeriodStartDate } from './CompletionRate';

export async function getDailyCompletionCounts(period: StatPeriod): Promise<Array<{ date: number; count: number; label: string }>> {
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
      count: completionMap[dayStart] || 0,
      label: getBarLabel(day, period),
    };
  });
}

export async function getTotalCompletions(period: StatPeriod): Promise<number> {
  const data = await getDailyCompletionCounts(period);
  return data.reduce((sum, item) => sum + item.count, 0);
}

export async function getAverageCompletions(period: StatPeriod): Promise<number> {
  const data = await getDailyCompletionCounts(period);
  if (data.length === 0) return 0;
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return Math.round((total / data.length) * 10) / 10;
}

export async function getPeakCompletionDay(period: StatPeriod): Promise<{ date: number; count: number; label: string } | null> {
  const data = await getDailyCompletionCounts(period);
  if (data.length === 0) return null;
  let peak = data[0];
  data.forEach((item) => {
    if (item.count > peak.count) peak = item;
  });
  return peak.count > 0 ? peak : null;
}

function getBarLabel(day: Date, period: StatPeriod): string {
  if (period === StatPeriod.YEAR) {
    if (day.getDate() === 1) return format(day, 'M月');
    return '';
  }
  return format(day, 'MM/dd');
}
