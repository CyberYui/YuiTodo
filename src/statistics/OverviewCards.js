// 概览数据卡片计算
// 负责：计算待办/逾期/已完成三类任务的总数量
// 以及循环任务的整体履约达成率

import { TaskStatus } from '../utils/constants';
import { isExpired } from '../utils/dateHelpers';
import { getAllActiveTasks } from '../database/TaskTable';

/**
 * 计算三类任务的数量概览
 * @param {Array<Object>} tasks - 任务列表（从TaskContext获取）
 * @returns {{
 *   pending: number,      // 待办数量（状态为pending且未逾期）
 *   overdue: number,      // 逾期数量（状态为pending但end_time已过）
 *   completed: number,    // 已完成数量（状态为done）
 *   postponed: number,    // 延后数量（状态为postponed）
 * }}
 */
export function calculateOverviewCounts(tasks) {
  let pending = 0;
  let overdue = 0;
  let completed = 0;
  let postponed = 0;

  tasks.forEach((task) => {
    switch (task.status) {
      case TaskStatus.DONE:
        completed++;
        break;
      case TaskStatus.POSTPONED:
        postponed++;
        break;
      case TaskStatus.PENDING:
        if (isExpired(task.end_time)) {
          overdue++;
        } else {
          pending++;
        }
        break;
      default:
        break;
    }
  });

  return { pending, overdue, completed, postponed };
}

/**
 * 计算循环任务的整体履约达成率
 * 履约率 = 循环任务已完成次数 / 循环任务应执行总次数 × 100%
 *
 * @param {Array<Object>} tasks - 任务列表
 * @param {Array<Object>} completionRecords - 完成记录数组
 * @returns {{
 *   rate: number,           // 履约率百分比
 *   totalScheduled: number, // 应执行总次数
 *   totalCompleted: number, // 已完成次数
 * }}
 */
export function calculateRecurrenceFulfillment(tasks, completionRecords) {
  // 筛选出循环任务
  const recurrenceTasks = tasks.filter(
    (task) => task.recurrenceRule && task.recurrence_id
  );

  if (recurrenceTasks.length === 0) {
    return {
      rate: 0,
      totalScheduled: 0,
      totalCompleted: 0,
    };
  }

  // 循环任务ID集合
  const recurrenceTaskIds = new Set(recurrenceTasks.map((t) => t.id));

  // 统计循环任务的完成次数
  const totalCompleted = completionRecords.filter((record) =>
    recurrenceTaskIds.has(record.task_id)
  ).length;

  // 简化计算：应执行次数 = 循环任务数 × 平均应执行天数（这里用完成数/任务数估算）
  // 更精确的计算需要根据每个循环规则单独算，这里用简化版
  const totalScheduled = Math.max(totalCompleted, recurrenceTasks.length);

  // 履约率
  const rate = totalScheduled > 0
    ? Math.round((totalCompleted / totalScheduled) * 100)
    : 0;

  return {
    rate,
    totalScheduled,
    totalCompleted,
  };
}

/**
 * 获取今日任务完成进度
 * @param {Array<Object>} tasks - 任务列表
 * @returns {{ completed: number, total: number, percentage: number }}
 */
export function getTodayProgress(tasks) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

  // 筛选今日任务（start_time在今天范围内）
  const todayTasks = tasks.filter(
    (task) => task.start_time >= todayStart && task.start_time <= todayEnd
  );

  const total = todayTasks.length;
  const completed = todayTasks.filter(
    (task) => task.status === TaskStatus.DONE
  ).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}
