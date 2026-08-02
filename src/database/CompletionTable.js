// 每日完成记录表CRUD操作（legacy API异步版本）
// 负责：记录每次任务完成的历史数据，供统计面板使用

import { getDatabase } from './Database';
import { getStartOfDay, getEndOfDay } from '../utils/dateHelpers';

/**
 * 记录一次任务完成
 * @param {number} taskId - 完成的任务ID
 * @param {number} scheduledDate - 计划完成日期（Unix毫秒）
 */
export async function recordCompletion(taskId, scheduledDate) {
  const db = getDatabase();
  const now = Date.now();

  await db.execAsync(
    [{
      sql: `INSERT INTO completion_record (task_id, completed_at, scheduled_date)
            VALUES (?, ?, ?)`,
      args: [taskId, now, scheduledDate],
    }],
    false
  );
}

/**
 * 取消一条完成记录
 * @param {number} taskId - 任务ID
 * @param {number} scheduledDate - 对应的计划日期
 */
export async function removeCompletion(taskId, scheduledDate) {
  const db = getDatabase();
  await db.execAsync(
    [{
      sql: `DELETE FROM completion_record
            WHERE task_id = ? AND scheduled_date = ?`,
      args: [taskId, scheduledDate],
    }],
    false
  );
}

/**
 * 查询指定日期范围内的完成记录数
 * @param {number} startDate - 起始日期（Unix毫秒）
 * @param {number} endDate - 结束日期（Unix毫秒）
 * @returns {Promise<number>} 完成记录总数
 */
export async function getCompletionCount(startDate, endDate) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{
      sql: `SELECT COUNT(*) as count FROM completion_record
            WHERE scheduled_date BETWEEN ? AND ?`,
      args: [startDate, endDate],
    }],
    true
  );

  return result[0].rows[0]?.count || 0;
}

/**
 * 按日期分组统计每日完成任务数
 * @param {number} startDate - 起始日期（Unix毫秒）
 * @param {number} endDate - 结束日期（Unix毫秒）
 * @returns {Promise<Array<{date: number, count: number}>>}
 */
export async function getDailyCompletions(startDate, endDate) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{
      sql: `SELECT scheduled_date as date, COUNT(*) as count
            FROM completion_record
            WHERE scheduled_date BETWEEN ? AND ?
            GROUP BY scheduled_date
            ORDER BY scheduled_date ASC`,
      args: [startDate, endDate],
    }],
    true
  );

  return result[0].rows;
}

/**
 * 查询指定日期是否有完成记录
 * @param {number} taskId - 任务ID
 * @param {number} date - 查询日期（Unix毫秒）
 * @returns {Promise<boolean>}
 */
export async function isCompletedOnDate(taskId, date) {
  const db = getDatabase();
  const dayStart = getStartOfDay(date);
  const dayEnd = getEndOfDay(date);

  const result = await db.execAsync(
    [{
      sql: `SELECT id FROM completion_record
            WHERE task_id = ? AND scheduled_date BETWEEN ? AND ? LIMIT 1`,
      args: [taskId, dayStart, dayEnd],
    }],
    true
  );

  return result[0].rows.length > 0;
}

/**
 * 获取某个任务的全部完成记录
 * @param {number} taskId - 任务ID
 * @returns {Promise<Array<Object>>}
 */
export async function getCompletionsByTask(taskId) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{
      sql: `SELECT * FROM completion_record
            WHERE task_id = ?
            ORDER BY scheduled_date ASC`,
      args: [taskId],
    }],
    true
  );

  return result[0].rows;
}

/**
 * 删除某个任务的所有完成记录
 * @param {number} taskId - 任务ID
 */
export async function deleteCompletionsByTask(taskId) {
  const db = getDatabase();
  await db.execAsync(
    [{ sql: 'DELETE FROM completion_record WHERE task_id = ?', args: [taskId] }],
    false
  );
}
