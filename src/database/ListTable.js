// 列表表CRUD操作
import { getDatabase } from './Database';

export async function createList(name, icon = '📋', sortOrder = 0) {
  const db = getDatabase();
  const now = Date.now();
  await db.execAsync([{
    sql: 'INSERT INTO task_list (name, icon, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    args: [name, icon, sortOrder, now, now],
  }], false);
  const result = await db.execAsync([{ sql: 'SELECT last_insert_rowid() as id', args: [] }], true);
  return result[0].rows[0]?.id;
}

export async function getAllLists() {
  const db = getDatabase();
  const result = await db.execAsync([{ sql: 'SELECT * FROM task_list ORDER BY sort_order ASC' }], true);
  return result[0].rows;
}

export async function updateList(listId, updates) {
  const db = getDatabase();
  const now = Date.now();
  const fields = Object.keys(updates).map((k) => `${k} = ?`);
  fields.push('updated_at = ?');
  const values = [...Object.values(updates), now, listId];
  await db.execAsync([{ sql: `UPDATE task_list SET ${fields.join(', ')} WHERE id = ?`, args: values }], false);
}

export async function deleteList(listId) {
  const db = getDatabase();
  // 将该列表下的任务移到默认列表
  await db.execAsync([{ sql: 'UPDATE task SET list_id = 1 WHERE list_id = ?', args: [listId] }], false);
  await db.execAsync([{ sql: 'DELETE FROM task_list WHERE id = ?', args: [listId] }], false);
}
