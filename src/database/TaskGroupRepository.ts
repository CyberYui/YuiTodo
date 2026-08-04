/**
 * Task group repository — CRUD for task groups.
 */

import { getDatabase } from './Database';
import { TaskGroup } from '../types';
import { getRows, getInsertId } from './sqlite-types';

export async function createGroup(name: string, icon = '📋', sortOrder = 0): Promise<number> {
  const db = getDatabase();
  const result = await db.execAsync([{
    sql: `INSERT INTO task_group (name, icon, sort_order, created_at) VALUES (?, ?, ?, ?)`,
    args: [name, icon, sortOrder, Date.now()],
  }], false);
  return getInsertId(result[0]);
}

export async function getAllGroups(): Promise<TaskGroup[]> {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: 'SELECT * FROM task_group ORDER BY sort_order ASC, id ASC', args: [] }],
    true
  );
  const rows = getRows<TaskGroup>(result[0]);
  return rows.length ? rows : [];
}

export async function getGroupById(groupId: number): Promise<TaskGroup | null> {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: 'SELECT * FROM task_group WHERE id = ?', args: [groupId] }],
    true
  );
  return getRows<TaskGroup>(result[0])[0] || null;
}

export async function updateGroup(groupId: number, updates: Partial<TaskGroup>): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const args: any[] = [];
  Object.keys(updates).forEach((key) => {
    if (key === 'id') return;
    fields.push(`${key} = ?`);
    args.push((updates as any)[key]);
  });
  if (fields.length === 0) return;
  args.push(groupId);
  await db.execAsync(
    [{ sql: `UPDATE task_group SET ${fields.join(', ')} WHERE id = ?`, args }],
    false
  );
}

export async function deleteGroup(groupId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{ sql: 'DELETE FROM task_group WHERE id = ?', args: [groupId] }], false);
}
