// 数据库初始化与连接管理（使用legacy API）
// 负责：打开数据库、创建表结构、提供数据库连接实例、处理schema迁移

import { openDatabase } from 'expo-sqlite/legacy';

const DATABASE_NAME = 'yuitodo.db';
const CURRENT_DB_VERSION = 4;

let databaseInstance = null;
let initPromise = null;

/**
 * 初始化数据库（异步，确保表创建完成后返回）
 */
export function initDatabase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    databaseInstance = openDatabase(DATABASE_NAME);
    await initializeTables(databaseInstance);
    await migrateSchema(databaseInstance);
    return databaseInstance;
  })();

  return initPromise;
}

/**
 * 获取数据库连接实例（必须先调用 initDatabase）
 */
export function getDatabase() {
  if (!databaseInstance) {
    throw new Error('数据库未初始化，请先调用 initDatabase()');
  }
  return databaseInstance;
}

/**
 * 异步初始化数据库表结构
 */
async function initializeTables(db) {
  const statements = [
    'PRAGMA foreign_keys = ON;',
    `CREATE TABLE IF NOT EXISTS recurrence_rule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      interval INTEGER DEFAULT 1,
      days_of_week TEXT,
      day_of_month INTEGER,
      month_of_year INTEGER,
      end_date INTEGER,
      is_paused INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS task (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      note TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      start_time INTEGER,
      end_time INTEGER,
      deadline INTEGER,
      start_date INTEGER,
      color TEXT DEFAULT '#3B82F6',
      recurrence_id INTEGER,
      is_starred INTEGER DEFAULT 0,
      group_id INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (recurrence_id) REFERENCES recurrence_rule(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS task_group (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '📋',
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS app_setting (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS completion_record (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      completed_at INTEGER NOT NULL,
      scheduled_date INTEGER NOT NULL,
      FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS task_step (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE
    )`,
    'CREATE INDEX IF NOT EXISTS idx_task_status ON task(status)',
    'CREATE INDEX IF NOT EXISTS idx_task_start_date ON task(start_date)',
    'CREATE INDEX IF NOT EXISTS idx_completion_date ON completion_record(scheduled_date)',
    'CREATE INDEX IF NOT EXISTS idx_step_task_id ON task_step(task_id)',
  ];

  for (const sql of statements) {
    await db.execAsync([{ sql, args: [] }], false);
  }
}

/**
 * 异步执行数据库schema迁移
 */
async function migrateSchema(db) {
  try {
    const result = await db.execAsync(
      [{ sql: "SELECT value FROM app_setting WHERE key='db_version'", args: [] }],
      true
    );

    let currentVersion = 0;
    if (result[0].rows.length > 0) {
      currentVersion = parseInt(result[0].rows[0].value, 10) || 0;
    }

    if (currentVersion >= CURRENT_DB_VERSION) return;

    if (currentVersion < 2) {
      try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN start_date INTEGER', args: [] }], false); } catch (e) {}
      try { await db.execAsync([{ sql: "ALTER TABLE task ADD COLUMN color TEXT DEFAULT '#3B82F6'", args: [] }], false); } catch (e) {}
      try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN is_starred INTEGER DEFAULT 0', args: [] }], false); } catch (e) {}
      try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN group_id INTEGER DEFAULT 0', args: [] }], false); } catch (e) {}
      try { await db.execAsync([{ sql: 'UPDATE task SET start_date = start_time WHERE start_date IS NULL', args: [] }], false); } catch (e) {}
    }

    if (currentVersion < 4) {
      try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN reminder_time TEXT', args: [] }], false); } catch (e) {}
    }

    await db.execAsync(
      [{ sql: "INSERT OR REPLACE INTO app_setting (key, value) VALUES ('db_version', ?)", args: [String(CURRENT_DB_VERSION)] }],
      false
    );
  } catch (error) {
    console.error('数据库迁移失败:', error);
  }
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase() {
  if (databaseInstance) {
    await databaseInstance.closeAsync();
    databaseInstance = null;
    initPromise = null;
  }
}
