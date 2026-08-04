/**
 * Task repository — all task CRUD operations.
 * Single source of truth for task data access.
 */

import { getDatabase } from './Database';
import { Task, TaskStatus } from '../types';
import { getRows, getInsertId } from './sqlite-types';

export async function createTask(task: Partial<Task>): Promise<number> {
  const db = getDatabase();
  const now = Date.now();
  await db.execAsync([{
    sql: `INSERT INTO task (title, note, status, start_time, end_time, deadline, start_date, color, recurrence_id, is_starred, group_id, list_id, created_at, updated_at, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      task.title, task.note || '', task.status || TaskStatus.PENDING,
      task.start_time, task.end_time, task.deadline || null,
      task.start_date || task.start_time, task.color || '#3B82F6',
      task.recurrence_id || null, task.is_starred || 0,
      task.group_id || 0, task.list_id || 1, now, now, task.sort_order || 0,
    ],
  }], false);
  const result = await db.execAsync([{ sql: 'SELECT last_insert_rowid() as id', args: [] }], true);
  const idResult = await db.execAsync([{ sql: 'SELECT last_insert_rowid() as id', args: [] }], true);
  return getRows<{ id: number }>(idResult[0])[0]?.id || 0;
}

export async function getTaskById(taskId: number): Promise<Task | null> {
  const db = getDatabase();
  const result = await db.execAsync([{ sql: 'SELECT * FROM task WHERE id = ?', args: [taskId] }], true);
  return getRows<Task>(result[0])[0] || null;
}

export async function getAllActiveTasksIncludingDone(): Promise<Task[]> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: "SELECT * FROM task WHERE status != 'archived' AND (deleted_at IS NULL OR deleted_at = 0) ORDER BY start_time ASC",
    args: [],
  }], true);
  return getRows<Task>(result[0]);
}

export async function getAllActiveTasks(): Promise<Task[]> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: "SELECT * FROM task WHERE status = 'pending' AND (deleted_at IS NULL OR deleted_at = 0) ORDER BY start_time ASC",
    args: [],
  }], true);
  return getRows<Task>(result[0]);
}

export async function updateTask(taskId: number, updates: Partial<Task>): Promise<void> {
  const db = getDatabase();
  const now = Date.now();
  const fields = Object.keys(updates).map((k) => `${k} = ?`);
  fields.push('updated_at = ?');
  const values = [...Object.values(updates), now, taskId];
  await db.execAsync([{ sql: `UPDATE task SET ${fields.join(', ')} WHERE id = ?`, args: values }], false);
}

export async function updateTaskStatus(taskId: number, newStatus: TaskStatus): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: 'UPDATE task SET status = ?, updated_at = ? WHERE id = ?',
    args: [newStatus, Date.now(), taskId],
  }], false);
}

export async function softDeleteTask(taskId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: 'UPDATE task SET deleted_at = ?, updated_at = ? WHERE id = ?',
    args: [Date.now(), Date.now(), taskId],
  }], false);
}

export async function restoreDeletedTask(taskId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: 'UPDATE task SET deleted_at = NULL, updated_at = ? WHERE id = ?',
    args: [Date.now(), taskId],
  }], false);
}

export async function permanentDeleteTask(taskId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{ sql: 'DELETE FROM task WHERE id = ?', args: [taskId] }], false);
}

export async function getDeletedTasks(): Promise<Task[]> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: 'SELECT * FROM task WHERE deleted_at IS NOT NULL AND deleted_at != 0 ORDER BY deleted_at DESC',
    args: [],
  }], true);
  return getRows<Task>(result[0]);
}

export async function cleanupDeletedTasks(): Promise<void> {
  const db = getDatabase();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  await db.execAsync([{
    sql: 'DELETE FROM task WHERE deleted_at IS NOT NULL AND deleted_at < ?',
    args: [thirtyDaysAgo],
  }], false);
}

export async function archiveTask(taskId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: "UPDATE task SET status = 'archived', updated_at = ? WHERE id = ?",
    args: [Date.now(), taskId],
  }], false);
}

export async function updateTaskSortOrder(taskId: number, sortOrder: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: 'UPDATE task SET sort_order = ?, updated_at = ? WHERE id = ?',
    args: [sortOrder, Date.now(), taskId],
  }], false);
}

export async function batchUpdateSortOrders(updates: Array<{ id: number; sortOrder: number }>): Promise<void> {
  const db = getDatabase();
  const now = Date.now();
  for (const { id, sortOrder } of updates) {
    await db.execAsync([{
      sql: 'UPDATE task SET sort_order = ?, updated_at = ? WHERE id = ?',
      args: [sortOrder, now, id],
    }], false);
  }
}
