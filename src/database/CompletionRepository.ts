/**
 * Completion record repository — task completion history.
 */

import { getDatabase } from './Database';
import { getStartOfDay, getEndOfDay } from '../utils/dateHelpers';
import { CompletionRecord } from '../types';
import { getRows } from './sqlite-types';

export async function recordCompletion(taskId: number, scheduledDate: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: `INSERT INTO completion_record (task_id, completed_at, scheduled_date) VALUES (?, ?, ?)`,
    args: [taskId, Date.now(), scheduledDate],
  }], false);
}

export async function removeCompletion(taskId: number, scheduledDate: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: `DELETE FROM completion_record WHERE task_id = ? AND scheduled_date = ?`,
    args: [taskId, scheduledDate],
  }], false);
}

export async function getCompletionCount(startDate: number, endDate: number): Promise<number> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: `SELECT COUNT(*) as count FROM completion_record WHERE scheduled_date BETWEEN ? AND ?`,
    args: [startDate, endDate],
  }], true);
  return getRows<{ count: number }>(result[0])[0]?.count || 0;
}

export async function getDailyCompletions(startDate: number, endDate: number): Promise<Array<{ date: number; count: number }>> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: `SELECT scheduled_date as date, COUNT(*) as count FROM completion_record
           WHERE scheduled_date BETWEEN ? AND ? GROUP BY scheduled_date ORDER BY scheduled_date ASC`,
    args: [startDate, endDate],
  }], true);
  return getRows<{ date: number; count: number }>(result[0]);
}

export async function isCompletedOnDate(taskId: number, date: number): Promise<boolean> {
  const db = getDatabase();
  const dayStart = getStartOfDay(date);
  const dayEnd = getEndOfDay(date);
  const result = await db.execAsync([{
    sql: `SELECT id FROM completion_record WHERE task_id = ? AND scheduled_date BETWEEN ? AND ? LIMIT 1`,
    args: [taskId, dayStart, dayEnd],
  }], true);
  return getRows(result[0]).length > 0;
}

export async function getCompletionsByTask(taskId: number): Promise<CompletionRecord[]> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: `SELECT * FROM completion_record WHERE task_id = ? ORDER BY scheduled_date ASC`,
    args: [taskId],
  }], true);
  return getRows<CompletionRecord>(result[0]);
}

export async function deleteCompletionsByTask(taskId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync(
    [{ sql: 'DELETE FROM completion_record WHERE task_id = ?', args: [taskId] }],
    false
  );
}
