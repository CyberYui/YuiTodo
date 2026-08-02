// 任务分组表CRUD操作
// 负责：管理任务分组（如"日常"、"工作"等）

import { getDatabase } from './Database';

/**
 * 创建分组
 * @param {string} name - 分组名称
 * @param {string} icon - 分组图标（emoji）
 * @param {number} sortOrder - 排序序号
 * @returns {Promise<number>} 新分组ID
 */
export async function createGroup(name, icon = '📋', sortOrder = 0) {
  const db = getDatabase();
  const now = Date.now();
  const result = await db.execAsync(
    [{
      sql: `INSERT INTO task_group (name, icon, sort_order, created_at) VALUES (?, ?, ?, ?)`,
      args: [name, icon, sortOrder, now],
    }],
    false
  );
  return result[0].insertId;
}

/**
 * 获取所有分组
 * @returns {Promise<Array<Object>>}
 */
export async function getAllGroups() {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: 'SELECT * FROM task_group ORDER BY sort_order ASC, id ASC', args: [] }],
    true
  );
  return result[0].rows.length ? result[0].rows : [];
}

/**
 * 根据ID获取分组
 * @param {number} groupId
 * @returns {Promise<Object|null>}
 */
export async function getGroupById(groupId) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: 'SELECT * FROM task_group WHERE id = ?', args: [groupId] }],
    true
  );
  return result[0].rows.length > 0 ? result[0].rows[0] : null;
}

/**
 * 更新分组
 * @param {number} groupId
 * @param {Object} updates
 */
export async function updateGroup(groupId, updates) {
  const db = getDatabase();
  const fields = [];
  const args = [];
  Object.keys(updates).forEach((key) => {
    if (key === 'id') return;
    fields.push(`${key} = ?`);
    args.push(updates[key]);
  });
  if (fields.length === 0) return;
  args.push(groupId);
  await db.execAsync(
    [{ sql: `UPDATE task_group SET ${fields.join(', ')} WHERE id = ?`, args }],
    false
  );
}

/**
 * 删除分组
 * @param {number} groupId
 */
export async function deleteGroup(groupId) {
  const db = getDatabase();
  await db.execAsync([{ sql: 'DELETE FROM task_group WHERE id = ?', args: [groupId] }], false);
}
