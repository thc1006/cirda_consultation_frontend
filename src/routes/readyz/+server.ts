import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

// k8s readiness：用 BEGIN IMMEDIATE 取得寫鎖再 ROLLBACK，
// 才能真正驗證 DB 可寫（單純 SELECT 1 在唯讀 / 拿不到寫鎖時仍會回 200）
export const GET: RequestHandler = () => {
  const db = getDb();
  try {
    db.exec('BEGIN IMMEDIATE');
    db.exec('ROLLBACK');
    return new Response('ready');
  } catch {
    try {
      db.exec('ROLLBACK');
    } catch {
      /* ignore */
    }
    return new Response('not ready', { status: 503 });
  }
};
