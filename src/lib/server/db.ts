// 簡單 SQLite 包裝；schema 採內嵌 SQL 直接 migrate（demo 階段不引入 Drizzle migration runner）
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

let _db: Database.Database | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS participants (
  pseudo_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS scale_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pseudo_id TEXT NOT NULL,
  scale TEXT NOT NULL,
  phase TEXT NOT NULL,
  payload_enc TEXT NOT NULL,
  score REAL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  pseudo_id TEXT NOT NULL,
  module TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content_enc TEXT NOT NULL,
  content_len INTEGER NOT NULL,
  latency_ms INTEGER,
  ts INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS event_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pseudo_id TEXT,
  session_id TEXT,
  event_type TEXT NOT NULL,
  payload TEXT,
  ts INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS session_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  summary_enc TEXT NOT NULL,
  ts INTEGER NOT NULL
);
`;

export function getDb(): Database.Database {
  if (_db) return _db;
  const url = env.DATABASE_URL || 'file:./local.db';
  const path = url.replace(/^file:/, '');
  _db = new Database(path);
  _db.pragma('journal_mode = WAL');
  _db.exec(SCHEMA);
  return _db;
}
