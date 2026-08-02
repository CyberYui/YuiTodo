// 任务步骤表CRUD操作（Sorted风格步骤功能）
// 负责：管理任务的子步骤/子任务
// 每个任务可以有多个步骤，步骤按顺序完成
//
// 步骤状态：pending(待完成)、completed(已完成)
// 当一个任务的所有步骤都完成时，任务自动标记为已完成

import { getDatabase } from './Database';

/**
 * 创建步骤
 * @param {number} taskId - 所属任务ID
 * @param {string} title - 步骤标题
 * @param {number} sortOrder - 排序序号
 * @returns {Promise<number>} 新步骤ID
 */
export async function createStep(taskId, title, sortOrder = 0) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{
      sql: `INSERT INTO task_step (task_id, title, sort_order, status)
            VALUES (?, ?, ?, 'pending')`,
      args: [taskId, title, sortOrder],
    }],
    false
  );
  return result[0].insertId;
}

/**
 * 批量创建步骤（用于创建任务时一次性添加多个步骤）
 * @param {number} taskId - 所属任务ID
 * @param {Array<string>} titles - 步骤标题数组
 * @returns {Promise<Array<number>>} 新步骤ID数组
 */
export async function createSteps(taskId, titles) {
  const ids = [];
  for (let i = 0; i < titles.length; i++) {
    const id = await createStep(taskId, titles[i], i);
    ids.push(id);
  }
  return ids;
}

/**
 * 获取任务的所有步骤（按排序序号）
 * @param {number} taskId - 任务ID
 * @returns {Promise<Array<Object>>} 步骤数组
 */
export async function getStepsByTaskId(taskId) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{
      sql: `SELECT * FROM task_step
            WHERE task_id = ?
            ORDER BY sort_order ASC, id ASC`,
      args: [taskId],
    }],
    true
  );
  return result[0].rows.map((step) => ({
    ...step,
    status: step.status === 'completed' ? 'completed' : 'pending',
  }));
}

/**
 * 完成一个步骤
 * @param {number} stepId - 步骤ID
 */
export async function completeStep(stepId) {
  const db = getDatabase();
  await db.execAsync(
    [{
      sql: `UPDATE task_step SET status = 'completed' WHERE id = ?`,
      args: [stepId],
    }],
    false
  );
}

/**
 * 撤销一个步骤（从已完成改为待完成）
 * @param {number} stepId - 步骤ID
 */
export async function undoStep(stepId) {
  const db = getDatabase();
  await db.execAsync(
    [{
      sql: `UPDATE task_step SET status = 'pending' WHERE id = ?`,
      args: [stepId],
    }],
    false
  );
}

/**
 * 获取任务中下一个待完成的步骤
 * @param {number} taskId - 任务ID
 * @returns {Promise<Object|null>} 下一个待完成步骤，没有则返回null
 */
export async function getNextPendingStep(taskId) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{
      sql: `SELECT * FROM task_step
            WHERE task_id = ? AND status = 'pending'
            ORDER BY sort_order ASC, id ASC
            LIMIT 1`,
      args: [taskId],
    }],
    true
  );
  return result[0].rows.length > 0 ? result[0].rows[0] : null;
}

/**
 * 检查任务的所有步骤是否都已完成
 * @param {number} taskId - 任务ID
 * @returns {Promise<boolean>}
 */
export async function areAllStepsCompleted(taskId) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{
      sql: `SELECT COUNT(*) as total,
                   SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM task_step
            WHERE task_id = ?`,
      args: [taskId],
    }],
    true
  );
  const row = result[0].rows[0];
  return row.total > 0 && row.total === row.completed;
}

/**
 * 获取任务的步骤统计
 * @param {number} taskId - 任务ID
 * @returns * @returns {Promise<{total: number, completed: number}>}
 */
export async function getStepStats(taskId) {
  const db = getDatabase();
  const result = await db.execAsync(
    [{
      sql: `SELECT COUNT(*) as total,
                   SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM task_step
            WHERE task_id = ?`,
      args: [taskId],
    }],
    true
  );
  const row = result[0].rows[0];
  return { total: row.total || 0, completed: row.completed || 0 };
}

/**
 * 删除一个步骤
 * @param {number} stepId - 步骤ID
 */
export async function deleteStep(stepId) {
  const db = getDatabase();
  await db.execAsync(
    [{ sql: 'DELETE FROM task_step WHERE id = ?', args: [stepId] }],
    false
  );
}

/**
 * 删除任务的所有步骤（任务删除时级联调用）
 * @param {number} taskId - 任务ID
 */
export async function deleteStepsByTask(taskId) {
  const db = getDatabase();
  await db.execAsync(
    [{ sql: 'DELETE FROM task_step WHERE task_id = ?', args: [taskId] }],
    false
  );
}

/**
 * 更新步骤标题
 * @param {number} stepId - 步骤ID
 * @param {string} title - 新标题
 */
export async function updateStepTitle(stepId, title) {
  const db = getDatabase();
  await db.execAsync(
    [{ sql: 'UPDATE task_step SET title = ? WHERE id = ?', args: [title, stepId] }],
    false
  );
}
