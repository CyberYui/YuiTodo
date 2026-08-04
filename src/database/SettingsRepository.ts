/**
 * Settings repository — key-value app settings storage.
 */

import { getDatabase } from './Database';
import { getRows } from './sqlite-types';

export async function getSetting(key: string): Promise<string | null> {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: 'SELECT value FROM app_setting WHERE key = ?', args: [key] }],
    true
  );
  const rows = getRows<{ value: string }>(result[0]);
  return rows.length > 0 ? rows[0].value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDatabase();
  await db.execAsync([{
    sql: 'INSERT OR REPLACE INTO app_setting (key, value) VALUES (?, ?)',
    args: [key, value],
  }], false);
}

export async function getSettingsByPrefix(prefix: string): Promise<Array<{ key: string; value: string }>> {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: `SELECT key, value FROM app_setting WHERE key LIKE ?`, args: [`${prefix}%`] }],
    true
  );
  return getRows<{ key: string; value: string }>(result[0]);
}
