/**
 * Task step repository — all sub-step CRUD operations.
 */

import { getDatabase } from './Database';
import { TaskStep, StepStats } from '../types';
import { getRows, getInsertId } from './sqlite-types';

export async function createStep(taskId: number, title: string, sortOrder = 0): Promise<number> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: `INSERT INTO task_step (task_id, title, sort_order, status) VALUES (?, ?, ?, 'pending')`,
    args: [taskId, title, sortOrder],
  }], false);
  return getInsertId(result[0]);
}

export async function createSteps(taskId: number, titles: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (let i = 0; i < titles.length; i++) {
    const id = await createStep(taskId, titles[i], i);
    ids.push(id);
  }
  return ids;
}

export async function getStepsByTaskId(taskId: number): Promise<TaskStep[]> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: `SELECT * FROM task_step WHERE task_id = ? ORDER BY sort_order ASC, id ASC`,
    args: [taskId],
  }], true);
  return getRows<any>(result[0]).map((step: any) => ({
    ...step,
    status: step.status === 'completed' ? 'completed' : 'pending',
  }));
}

export async function completeStep(stepId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: `UPDATE task_step SET status = 'completed' WHERE id = ?`,
    args: [stepId],
  }], false);
}

export async function undoStep(stepId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: `UPDATE task_step SET status = 'pending' WHERE id = ?`,
    args: [stepId],
  }], false);
}

export async function getNextPendingStep(taskId: number): Promise<TaskStep | null> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: `SELECT * FROM task_step WHERE task_id = ? AND status = 'pending' ORDER BY sort_order ASC, id ASC LIMIT 1`,
    args: [taskId],
  }], true);
  const rows = getRows<TaskStep>(result[0]);
  return rows.length > 0 ? rows[0] : null;
}

export async function areAllStepsCompleted(taskId: number): Promise<boolean> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed FROM task_step WHERE task_id = ?`,
    args: [taskId],
  }], true);
  const row = getRows<{ total: number; completed: number }>(result[0])[0];
  return row.total > 0 && row.total === row.completed;
}

export async function getStepStats(taskId: number): Promise<StepStats> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed FROM task_step WHERE task_id = ?`,
    args: [taskId],
  }], true);
  const row = getRows<{ total: number; completed: number }>(result[0])[0];
  return { total: row.total || 0, completed: row.completed || 0 };
}

export async function deleteStep(stepId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{ sql: 'DELETE FROM task_step WHERE id = ?', args: [stepId] }], false);
}

export async function deleteStepsByTask(taskId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{ sql: 'DELETE FROM task_step WHERE task_id = ?', args: [taskId] }], false);
}

export async function updateStepTitle(stepId: number, title: string): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: 'UPDATE task_step SET title = ? WHERE id = ?',
    args: [title, stepId],
  }], false);
}
