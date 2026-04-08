// 資料存取層：對外只暴露 repo 函式，加密與時戳統一在這裡處理
import { getDb } from './db';
import { encrypt, decrypt } from './crypto';

export function upsertParticipant(pseudoId: string) {
  const db = getDb();
  db.prepare(
    'INSERT OR IGNORE INTO participants (pseudo_id, created_at) VALUES (?, ?)'
  ).run(pseudoId, Date.now());
}

export function saveScaleResponse(args: {
  pseudoId: string;
  scale: string;
  phase: 'pre' | 'post';
  payload: unknown;
  score: number | null;
}) {
  const db = getDb();
  db.prepare(
    'INSERT INTO scale_responses (pseudo_id, scale, phase, payload_enc, score, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    args.pseudoId,
    args.scale,
    args.phase,
    encrypt(JSON.stringify(args.payload)),
    args.score,
    Date.now()
  );
}

export function createSession(id: string, pseudoId: string, mod: string) {
  getDb()
    .prepare('INSERT INTO sessions (id, pseudo_id, module, started_at) VALUES (?, ?, ?, ?)')
    .run(id, pseudoId, mod, Date.now());
}

export function appendMessage(args: {
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  latencyMs?: number;
}) {
  getDb()
    .prepare(
      'INSERT INTO messages (session_id, role, content_enc, content_len, latency_ms, ts) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(args.sessionId, args.role, encrypt(args.content), args.content.length, args.latencyMs ?? null, Date.now());
}

export function logEvent(eventType: string, payload: Record<string, unknown>) {
  getDb()
    .prepare('INSERT INTO event_log (pseudo_id, session_id, event_type, payload, ts) VALUES (?, ?, ?, ?, ?)')
    .run(payload.pseudoId ?? null, payload.sessionId ?? null, eventType, JSON.stringify(payload), Date.now());
}

export type ExportRow = {
  session_id: string;
  pseudo_id: string;
  role: string;
  content: string;
  ts: number;
  latency_ms: number | null;
};

export function exportConversations(): ExportRow[] {
  const rows = getDb()
    .prepare(
      `SELECT m.session_id, s.pseudo_id, m.role, m.content_enc, m.ts, m.latency_ms
       FROM messages m JOIN sessions s ON s.id = m.session_id
       ORDER BY m.ts ASC`
    )
    .all() as Array<{
    session_id: string;
    pseudo_id: string;
    role: string;
    content_enc: string;
    ts: number;
    latency_ms: number | null;
  }>;
  return rows.map((r) => ({
    session_id: r.session_id,
    pseudo_id: r.pseudo_id,
    role: r.role,
    content: decrypt(r.content_enc),
    ts: r.ts,
    latency_ms: r.latency_ms
  }));
}
