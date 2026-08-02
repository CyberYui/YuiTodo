// 任务主表CRUD操作（legacy API异步版本）
// 负责：任务的增删改查全部数据库操作
// 所有函数返回Promise，需要用await调用

import { getDatabase } from './Database';
import { TaskStatus } from '../utils/constants';

/**
 * 创建一个新任务
 * @param {Object} task - 任务对象
 * @returns {Promise<number>} 新创建任务的ID
 */
export async function createTask(task) {
  const db = getDatabase();
  const now = Date.now();

  await db.execAsync(
    [{
      sql: `INSERT INTO task (title, note, status, start_time, end_time, deadline, start_date, color, recurrence_id, is_starred, group_id, created_at, updated_at, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        task.title,
        task.note || '',
        TaskStatus.PENDING,
        task.start_time,
        task.end_time,
        task.deadline || null,
        task.start_date || task.start_time,
        task.color || '#3B82F6',
        task.recurrence_id || null,
        task.is_starred || 0,
        task.group_id || 0,
        now,
        now,
        task.sort_order || 0,
      ],
    }],
    false
  );

  // 获取刚插入的 rowid
  const idResult = await db.execAsync(
    [{ sql: 'SELECT last_insert_rowid() as id', args: [] }],
    true
  );
  return idResult[0].rows[0]?.id;
}

/**
 * 根据ID查询单个任务
 * @param {number} taskId - 任务ID
 * @returns {Promise<Object|null>} 任务对象，不存在则返回null
 */
export async function getTaskById(taskId) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: 'SELECT * FROM task WHERE id = ?', args: [taskId] }],
    true // readOnly
  );

  const rows = result[0].rows;
  return rows.length > 0 ? rows[0] : null;
}

/**
 * 查询所有非归档状态的任务（包括已完成）
 * 今日任务优先，其余按时间先后排序
 * @returns {Promise<Array<Object>>} 任务数组
 */
export async function getAllActiveTasksIncludingDone() {
  const db = getDatabase();

  // 计算今日时间范围
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

  const result = await db.execAsync(
    [{
      sql: `SELECT * FROM task
            WHERE status != ?
            ORDER BY
              CASE WHEN start_date BETWEEN ? AND ? THEN 0 ELSE 1 END,
              sort_order DESC,
              start_date ASC`,
      args: [TaskStatus.ARCHIVED, todayStart, todayEnd],
    }],
    true
  );

  return result[0].rows.length ? result[0].rows : [];
}

/**
 * 查询所有非归档状态的任务（不含已完成）
 * @returns {Promise<Array<Object>>} 任务数组
 */
export async function getAllActiveTasks() {
  const db = getDatabase();

  // 计算今日时间范围
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

  const result = await db.execAsync(
    [{
      sql: `SELECT * FROM task
            WHERE status != ? AND status != ?
            ORDER BY
              CASE WHEN start_date BETWEEN ? AND ? THEN 0 ELSE 1 END,
              sort_order DESC,
              start_date ASC`,
      args: [TaskStatus.ARCHIVED, TaskStatus.DONE, todayStart, todayEnd],
    }],
    true
  );

  return result[0].rows.length ? result[0].rows : [];
}

/**
 * 更新任务信息
 * @param {number} taskId - 任务ID
 * @param {Object} updates - 需要更新的字段
 */
export async function updateTask(taskId, updates) {
  const db = getDatabase();
  const now = Date.now();

  // 构建动态SQL：只更新传入的字段
  const fields = [];
  const args = [];

  Object.keys(updates).forEach((key) => {
    if (key === 'created_at') return; // 不允许修改创建时间
    fields.push(`${key} = ?`);
    args.push(updates[key]);
  });

  // 自动更新updated_at字段
  fields.push('updated_at = ?');
  args.push(now);

  // 加入WHERE条件的taskId
  args.push(taskId);

  await db.execAsync(
    [{ sql: `UPDATE task SET ${fields.join(', ')} WHERE id = ?`, args }],
    false
  );
}

/**
 * 修改任务状态
 * @param {number} taskId - 任务ID
 * @param {string} newStatus - 新状态
 */
export async function updateTaskStatus(taskId, newStatus) {
  await updateTask(taskId, { status: newStatus });
}

/**
 * 删除任务（硬删除）
 * @param {number} taskId - 任务ID
 */
export async function deleteTask(taskId) {
  const db = getDatabase();
  await db.execAsync(
    [{ sql: 'DELETE FROM task WHERE id = ?', args: [taskId] }],
    false
  );
}

/**
 * 软删除：将任务标记为归档状态
 * @param {number} taskId - 任务ID
 */
export async function archiveTask(taskId) {
  await updateTaskStatus(taskId, TaskStatus.ARCHIVED);
}
