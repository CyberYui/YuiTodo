// 任务主表CRUD操作
import { getDatabase } from './Database';
import { TaskStatus } from '../utils/constants';

export async function createTask(task) {
  const db = getDatabase();
  const now = Date.now();
  await db.execAsync([{
    sql: `INSERT INTO task (title, note, status, start_time, end_time, deadline, start_date, color, recurrence_id, is_starred, group_id, created_at, updated_at, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [task.title, task.note || '', TaskStatus.PENDING, task.start_time, task.end_time, task.deadline || null, task.start_date || task.start_time, task.color || '#3B82F6', task.recurrence_id || null, task.is_starred || 0, task.group_id || 0, now, now, task.sort_order || 0],
  }], false);
  const idResult = await db.execAsync([{ sql: 'SELECT last_insert_rowid() as id', args: [] }], true);
  return idResult[0].rows[0]?.id;
}

export async function getTaskById(taskId) {
  const db = getDatabase();
  const result = await db.execAsync([{ sql: 'SELECT * FROM task WHERE id = ?', args: [taskId] }], true);
  return result[0].rows.length > 0 ? result[0].rows[0] : null;
}

export async function getAllActiveTasksIncludingDone() {
  const db = getDatabase();
  const result = await db.execAsync([{ sql: "SELECT * FROM task WHERE status != 'archived' AND (deleted_at IS NULL OR deleted_at = 0) ORDER BY start_time ASC", args: [] }], true);
  return result[0].rows;
}

export async function getAllActiveTasks() {
  const db = getDatabase();
  const result = await db.execAsync([{ sql: "SELECT * FROM task WHERE status = 'pending' AND (deleted_at IS NULL OR deleted_at = 0) ORDER BY start_time ASC", args: [] }], true);
  return result[0].rows;
}

export async function updateTask(taskId, updates) {
  const db = getDatabase();
  const now = Date.now();
  const fields = Object.keys(updates).map((k) => `${k} = ?`);
  fields.push('updated_at = ?');
  const values = [...Object.values(updates), now, taskId];
  await db.execAsync([{ sql: `UPDATE task SET ${fields.join(', ')} WHERE id = ?`, args: values }], false);
}

export async function updateTaskStatus(taskId, newStatus) {
  const db = getDatabase();
  await db.execAsync([{ sql: 'UPDATE task SET status = ?, updated_at = ? WHERE id = ?', args: [newStatus, Date.now(), taskId] }], false);
}

// 软删除（移入回收站）
export async function softDeleteTask(taskId) {
  const db = getDatabase();
  await db.execAsync([{ sql: 'UPDATE task SET deleted_at = ?, updated_at = ? WHERE id = ?', args: [Date.now(), Date.now(), taskId] }], false);
}

// 恢复已删除任务
export async function restoreDeletedTask(taskId) {
  const db = getDatabase();
  await db.execAsync([{ sql: 'UPDATE task SET deleted_at = NULL, updated_at = ? WHERE id = ?', args: [Date.now(), taskId] }], false);
}

// 永久删除
export async function permanentDeleteTask(taskId) {
  const db = getDatabase();
  await db.execAsync([{ sql: 'DELETE FROM task WHERE id = ?', args: [taskId] }], false);
}

// 获取回收站任务
export async function getDeletedTasks() {
  const db = getDatabase();
  const result = await db.execAsync([{ sql: 'SELECT * FROM task WHERE deleted_at IS NOT NULL AND deleted_at != 0 ORDER BY deleted_at DESC', args: [] }], true);
  return result[0].rows;
}

// 清理超过30天的已删除任务
export async function cleanupDeletedTasks() {
  const db = getDatabase();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  await db.execAsync([{ sql: 'DELETE FROM task WHERE deleted_at IS NOT NULL AND deleted_at < ?', args: [thirtyDaysAgo] }], false);
}

export async function restoreTask(task) {
  const db = getDatabase();
  const now = Date.now();
  // 软删除恢复：直接更新deleted_at为NULL，保留原有ID和步骤关联
  await db.execAsync([{
    sql: 'UPDATE task SET deleted_at = NULL, updated_at = ? WHERE id = ?',
    args: [now, task.id],
  }], false);
}

export async function archiveTask(taskId) {
  const db = getDatabase();
  await db.execAsync([{ sql: "UPDATE task SET status = 'archived', updated_at = ? WHERE id = ?", args: [Date.now(), taskId] }], false);
}

// 更新任务排序
export async function updateTaskSortOrder(taskId, sortOrder) {
  const db = getDatabase();
  await db.execAsync([{ sql: 'UPDATE task SET sort_order = ?, updated_at = ? WHERE id = ?', args: [sortOrder, Date.now(), taskId] }], false);
}

// 批量更新排序
export async function batchUpdateSortOrders(updates) {
  const db = getDatabase();
  const now = Date.now();
  for (const { id, sortOrder } of updates) {
    await db.execAsync([{ sql: 'UPDATE task SET sort_order = ?, updated_at = ? WHERE id = ?', args: [sortOrder, now, id] }], false);
  }
}
