/**
 * Recurrence rule repository — all recurrence CRUD operations.
 */

import { getDatabase } from './Database';
import { RecurrenceRule } from '../types';
import { getRows, getInsertId } from './sqlite-types';

export async function createRecurrenceRule(rule: Partial<RecurrenceRule>): Promise<number> {
  const db = getDatabase();
  const now = Date.now();
  const daysOfWeekJson = rule.days_of_week ? JSON.stringify(rule.days_of_week) : null;
  const result = await db.execAsync([{
    sql: `INSERT INTO recurrence_rule (type, interval, days_of_week, day_of_month, month_of_year, end_date, is_paused, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      rule.type, rule.interval || 1, daysOfWeekJson,
      rule.day_of_month || null, rule.month_of_year || null,
      rule.end_date || null, rule.is_paused ? 1 : 0, now,
    ],
  }], false);
  return getInsertId(result[0]);
}

export async function getRecurrenceRuleById(ruleId: number): Promise<RecurrenceRule | null> {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: 'SELECT * FROM recurrence_rule WHERE id = ?', args: [ruleId] }],
    true
  );
  const rows = getRows<any>(result[0]);
  if (rows.length === 0) return null;
  return {
    ...rows[0],
    days_of_week: rows[0].days_of_week ? JSON.parse(rows[0].days_of_week) : null,
    is_paused: rows[0].is_paused === 1,
  };
}

export async function updateRecurrenceRule(ruleId: number, updates: Partial<RecurrenceRule>): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const args: any[] = [];

  Object.keys(updates).forEach((key) => {
    if (key === 'id' || key === 'created_at') return;
    fields.push(`${key} = ?`);
    if (key === 'days_of_week') {
      args.push((updates as any)[key] ? JSON.stringify((updates as any)[key]) : null);
    } else if (key === 'is_paused') {
      args.push((updates as any)[key] ? 1 : 0);
    } else {
      args.push((updates as any)[key]);
    }
  });

  if (fields.length === 0) return;
  args.push(ruleId);

  await db.execAsync(
    [{ sql: `UPDATE recurrence_rule SET ${fields.join(', ')} WHERE id = ?`, args }],
    false
  );
}

export async function pauseRecurrenceRule(ruleId: number): Promise<void> {
  await updateRecurrenceRule(ruleId, { is_paused: true });
}

export async function resumeRecurrenceRule(ruleId: number): Promise<void> {
  await updateRecurrenceRule(ruleId, { is_paused: false });
}

export async function deleteRecurrenceRule(ruleId: number): Promise<void> {
  const db = getDatabase();
  await db.execAsync(
    [{ sql: 'DELETE FROM recurrence_rule WHERE id = ?', args: [ruleId] }],
    false
  );
}

export async function getPausedRules(): Promise<RecurrenceRule[]> {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: 'SELECT * FROM recurrence_rule WHERE is_paused = 1', args: [] }],
    true
  );
  return getRows<any>(result[0]).map((rule: any) => ({
    ...rule,
    days_of_week: rule.days_of_week ? JSON.parse(rule.days_of_week) : null,
    is_paused: true,
  }));
}
