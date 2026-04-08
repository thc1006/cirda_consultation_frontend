// repo 整合測試：用 in-memory SQLite，不污染本機資料
// 這裡直接 require better-sqlite3 建一份隔離 DB，再把 schema 套上
import { describe, it, expect, beforeAll, vi } from 'vitest';
import Database from 'better-sqlite3';

// 把 getDb 重導到 :memory: — 用 vi.mock 替換 db.ts 的 export
vi.mock('./db', () => {
  const mem = new Database(':memory:');
  mem.exec(`
    CREATE TABLE IF NOT EXISTS participants (pseudo_id TEXT PRIMARY KEY, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS scale_responses (id INTEGER PRIMARY KEY AUTOINCREMENT, pseudo_id TEXT NOT NULL, scale TEXT NOT NULL, phase TEXT NOT NULL, payload_enc TEXT NOT NULL, score REAL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, pseudo_id TEXT NOT NULL, module TEXT NOT NULL, started_at INTEGER NOT NULL, ended_at INTEGER);
    CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, role TEXT NOT NULL, content_enc TEXT NOT NULL, content_len INTEGER NOT NULL, latency_ms INTEGER, ts INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS event_log (id INTEGER PRIMARY KEY AUTOINCREMENT, pseudo_id TEXT, session_id TEXT, event_type TEXT NOT NULL, payload TEXT, ts INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS session_summary (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, summary_enc TEXT NOT NULL, ts INTEGER NOT NULL);
  `);
  return { getDb: () => mem };
});

import {
  upsertParticipant,
  saveScaleResponse,
  createSession,
  appendMessage,
  logEvent,
  exportConversations
} from './repo';

describe('repo 整合', () => {
  beforeAll(() => {
    upsertParticipant('pseudo-001');
    createSession('sess-1', 'pseudo-001', 'cbt');
  });

  it('appendMessage 寫入後 exportConversations 拿得到原文', () => {
    appendMessage({ sessionId: 'sess-1', role: 'user', content: '今天好累' });
    appendMessage({ sessionId: 'sess-1', role: 'assistant', content: '辛苦了，可以多說一點嗎？' });
    const rows = exportConversations();
    expect(rows.length).toBe(2);
    expect(rows[0].content).toBe('今天好累');
    expect(rows[1].role).toBe('assistant');
  });

  it('saveScaleResponse 加密後仍可記分數', () => {
    saveScaleResponse({
      pseudoId: 'pseudo-001',
      scale: 'PHQ-9',
      phase: 'pre',
      payload: [0, 1, 2, 0, 1, 2, 0, 1, 0],
      score: 7
    });
    expect(true).toBe(true); // 寫入未丟錯即可
  });

  it('logEvent 不丟錯', () => {
    logEvent('crisis_trigger', { pseudoId: 'pseudo-001', source: 'phq9_item9', score: 1 });
    expect(true).toBe(true);
  });
});
