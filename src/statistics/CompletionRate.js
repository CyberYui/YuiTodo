// 完成率计算工具（异步版本）
// 负责：计算指定时间范围内的任务完成率

import {
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
} from 'date-fns';
import { getDailyCompletions, getCompletionCount } from '../database/CompletionTable';

/**
 * 统计时间维度枚举
 */
export const StatPeriod = {
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

/**
 * 根据时间维度获取起始日期
 */
export function getPeriodStartDate(period) {
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

/**
 * 计算近N天每天的任务完成率
 * @param {string} period - 时间维度
 * @returns {Promise<Array<{date: number, completed: number, label: string}>>}
 */
export async function calculateDailyCompletionRate(period) {
  const startDate = getPeriodStartDate(period);
  const endDate = endOfDay(new Date()).getTime();

  const dailyCompletions = await getDailyCompletions(startDate, endDate);

  const completionMap = {};
  dailyCompletions.forEach((record) => {
    const dayStart = startOfDay(new Date(record.date)).getTime();
    completionMap[dayStart] = record.count;
  });

  const days = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(),
  });

  return days.map((day) => {
    const dayStart = startOfDay(day).getTime();
    const completed = completionMap[dayStart] || 0;

    return {
      date: dayStart,
      completed,
      label: format(day, 'MM/dd'),
      dayLabel: format(day, 'E'),
    };
  });
}

/**
 * 计算整体完成率
 */
export async function calculateOverallCompletionRate(period) {
  const startDate = getPeriodStartDate(period);
  const endDate = endOfDay(new Date()).getTime();
  const completed = await getCompletionCount(startDate, endDate);

  return { completed, total: completed, rate: 0 };
}

/**
 * 计算完成率趋势
 */
export async function calculateCompletionTrend(period) {
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

  let trend = 'flat';
  if (currentCount > previousCount) trend = 'up';
  else if (currentCount < previousCount) trend = 'down';

  return { current: currentCount, previous: previousCount, trend };
}
