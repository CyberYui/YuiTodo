/**
 * Database initialization, connection management, and schema migration.
 * Uses expo-sqlite legacy API for SDK 51 compatibility.
 */

import { openDatabase, SQLiteDatabase } from 'expo-sqlite/legacy';
import { getRows } from './sqlite-types';

const DATABASE_NAME = 'yuitodo.db';
const CURRENT_DB_VERSION = 6;

let databaseInstance: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

export function initDatabase(): Promise<SQLiteDatabase> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      databaseInstance = openDatabase(DATABASE_NAME);
      await initializeTables(databaseInstance);
      await migrateSchema(databaseInstance);
      return databaseInstance;
    } catch (error) {
      console.error('Database initialization failed:', error);
      // Reset promise so next call can retry
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

export function getDatabase(): SQLiteDatabase {
  if (!databaseInstance) {
    // Attempt to initialize on first access (graceful recovery)
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return databaseInstance;
}

export function isDatabaseInitialized(): boolean {
  return databaseInstance !== null;
}

async function initializeTables(db: SQLiteDatabase): Promise<void> {
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
      list_id INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      deleted_at INTEGER,
      reminder_time TEXT,
      FOREIGN KEY (recurrence_id) REFERENCES recurrence_rule(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS task_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '📋',
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
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

async function migrateSchema(db: SQLiteDatabase): Promise<void> {
  try {
    const result = await db.execAsync(
      [{ sql: "SELECT value FROM app_setting WHERE key='db_version'", args: [] }],
      true
    );

    let currentVersion = 0;
    const versionRows = getRows<{ value: string }>(result[0]);
    if (versionRows.length > 0) {
      currentVersion = parseInt(versionRows[0].value, 10) || 0;
    }

    if (currentVersion >= CURRENT_DB_VERSION) return;

    if (currentVersion < 2) {
      try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN start_date INTEGER', args: [] }], false); } catch {}
      try { await db.execAsync([{ sql: "ALTER TABLE task ADD COLUMN color TEXT DEFAULT '#3B82F6'", args: [] }], false); } catch {}
      try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN is_starred INTEGER DEFAULT 0', args: [] }], false); } catch {}
      try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN group_id INTEGER DEFAULT 0', args: [] }], false); } catch {}
      try { await db.execAsync([{ sql: 'UPDATE task SET start_date = start_time WHERE start_date IS NULL', args: [] }], false); } catch {}
    }

    if (currentVersion < 4) {
      try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN reminder_time TEXT', args: [] }], false); } catch {}
    }

    if (currentVersion < 5) {
      try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN deleted_at INTEGER', args: [] }], false); } catch {}
    }

    if (currentVersion < 6) {
      try { await db.execAsync([{ sql: 'ALTER TABLE task ADD COLUMN list_id INTEGER DEFAULT 1', args: [] }], false); } catch {}
      try {
        await db.execAsync([{
          sql: "INSERT OR IGNORE INTO task_list (id, name, icon, sort_order, created_at, updated_at) VALUES (1, '我的任务', '📋', 0, ?, ?)",
          args: [Date.now(), Date.now()],
        }], false);
      } catch {}
    }

    await db.execAsync(
      [{ sql: "INSERT OR REPLACE INTO app_setting (key, value) VALUES ('db_version', ?)", args: [String(CURRENT_DB_VERSION)] }],
      false
    );
  } catch (error) {
    console.error('Database migration failed:', error);
  }
}

export async function closeDatabase(): Promise<void> {
  if (databaseInstance) {
    await databaseInstance.closeAsync();
    databaseInstance = null;
    initPromise = null;
  }
}
