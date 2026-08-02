// 循环规则表CRUD操作（legacy API异步版本）
// 负责：循环规则的增删改查

import { getDatabase } from './Database';

/**
 * 创建一条循环规则
 * @param {Object} rule - 循环规则对象
 * @returns {Promise<number>} 新规则ID
 */
export async function createRecurrenceRule(rule) {
  const db = getDatabase();
  const now = Date.now();

  // days_of_week是数组，存入数据库前转为JSON字符串
  const daysOfWeekJson = rule.days_of_week
    ? JSON.stringify(rule.days_of_week)
    : null;

  const result = await db.execAsync(
    [{
      sql: `INSERT INTO recurrence_rule (type, interval, days_of_week, day_of_month, month_of_year, end_date, is_paused, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        rule.type,
        rule.interval || 1,
        daysOfWeekJson,
        rule.day_of_month || null,
        rule.month_of_year || null,
        rule.end_date || null,
        rule.is_paused ? 1 : 0,
        now,
      ],
    }],
    false
  );

  return result[0].insertId;
}

/**
 * 根据ID查询循环规则
 * @param {number} ruleId - 规则ID
 * @returns {Promise<Object|null>} 规则对象（days_of_week自动从JSON转回数组）
 */
export async function getRecurrenceRuleById(ruleId) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: 'SELECT * FROM recurrence_rule WHERE id = ?', args: [ruleId] }],
    true
  );

  const rows = result[0].rows;
  if (rows.length === 0) return null;

  const rule = rows[0];
  return {
    ...rule,
    days_of_week: rule.days_of_week ? JSON.parse(rule.days_of_week) : null,
    is_paused: rule.is_paused === 1,
  };
}

/**
 * 更新循环规则
 * @param {number} ruleId - 规则ID
 * @param {Object} updates - 需要更新的字段
 */
export async function updateRecurrenceRule(ruleId, updates) {
  const db = getDatabase();

  const fields = [];
  const args = [];

  Object.keys(updates).forEach((key) => {
    if (key === 'id' || key === 'created_at') return;
    fields.push(`${key} = ?`);

    if (key === 'days_of_week') {
      args.push(updates[key] ? JSON.stringify(updates[key]) : null);
    } else if (key === 'is_paused') {
      args.push(updates[key] ? 1 : 0);
    } else {
      args.push(updates[key]);
    }
  });

  if (fields.length === 0) return;

  args.push(ruleId);

  await db.execAsync(
    [{ sql: `UPDATE recurrence_rule SET ${fields.join(', ')} WHERE id = ?`, args }],
    false
  );
}

/**
 * 暂停循环规则
 * @param {number} ruleId - 规则ID
 */
export async function pauseRecurrenceRule(ruleId) {
  await updateRecurrenceRule(ruleId, { is_paused: true });
}

/**
 * 恢复循环规则
 * @param {number} ruleId - 规则ID
 */
export async function resumeRecurrenceRule(ruleId) {
  await updateRecurrenceRule(ruleId, { is_paused: false });
}

/**
 * 删除循环规则
 * @param {number} ruleId - 规则ID
 */
export async function deleteRecurrenceRule(ruleId) {
  const db = getDatabase();
  await db.execAsync(
    [{ sql: 'DELETE FROM recurrence_rule WHERE id = ?', args: [ruleId] }],
    false
  );
}

/**
 * 查询所有已暂停的循环规则
 * @returns {Promise<Array<Object>>}
 */
export async function getPausedRules() {
  const db = getDatabase();
  const result = await db.execAsync(
    [{ sql: 'SELECT * FROM recurrence_rule WHERE is_paused = 1', args: [] }],
    true
  );

  return result[0].rows.map((rule) => ({
    ...rule,
    days_of_week: rule.days_of_week ? JSON.parse(rule.days_of_week) : null,
    is_paused: true,
  }));
}
