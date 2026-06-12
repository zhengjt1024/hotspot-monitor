import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'monitor.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      category TEXT DEFAULT '',
      source_types TEXT DEFAULT 'web,twitter',
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword_id INTEGER,
      title TEXT NOT NULL,
      url TEXT,
      source TEXT NOT NULL,
      source_name TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      relevance_score REAL DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      is_fake INTEGER DEFAULT 0,
      content_hash TEXT,
      published_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER,
      keyword TEXT DEFAULT '',
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_topics_keyword ON topics(keyword_id);
    CREATE INDEX IF NOT EXISTS idx_topics_created ON topics(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
  `);
}

export default db;
