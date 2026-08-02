// 每日完成任务数量统计（异步版本）
// 负责：统计指定时间范围内每天完成的任务数量

import {
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
} from 'date-fns';
import { getDailyCompletions } from '../database/CompletionTable';
import { StatPeriod, getPeriodStartDate } from './CompletionRate';

/**
 * 获取指定时间范围内每天的完成任务数
 * @param {string} period - 时间维度
 * @returns {Promise<Array<{date: number, count: number, label: string}>>}
 */
export async function getDailyCompletionCounts(period) {
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
    return {
      date: dayStart,
      count: completionMap[dayStart] || 0,
      label: getBarLabel(day, period),
    };
  });
}

/**
 * 计算总完成数
 */
export async function getTotalCompletions(period) {
  const data = await getDailyCompletionCounts(period);
  return data.reduce((sum, item) => sum + item.count, 0);
}

/**
 * 计算平均每日完成数
 */
export async function getAverageCompletions(period) {
  const data = await getDailyCompletionCounts(period);
  if (data.length === 0) return 0;
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return Math.round((total / data.length) * 10) / 10;
}

/**
 * 找出完成数最多的一天
 */
export async function getPeakCompletionDay(period) {
  const data = await getDailyCompletionCounts(period);
  if (data.length === 0) return null;

  let peak = data[0];
  data.forEach((item) => {
    if (item.count > peak.count) peak = item;
  });
  return peak.count > 0 ? peak : null;
}

/**
 * 获取柱状图Y轴最大值
 */
export async function getChartMaxValue(period) {
  const data = await getDailyCompletionCounts(period);
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return Math.ceil(maxCount / 5) * 5 || 5;
}

/**
 * 根据时间维度生成柱状图X轴标签
 */
function getBarLabel(day, period) {
  if (period === StatPeriod.YEAR) {
    if (day.getDate() === 1) {
      return format(day, 'M月');
    }
    return '';
  }
  return format(day, 'MM/dd');
}
