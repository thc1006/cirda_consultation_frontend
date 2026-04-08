// 伺服器端 hooks：
//  - handle：給每個 request 補上 trace 用 header
//  - 監聽 process.on('SIGTERM') 做 graceful shutdown，呼應 ADR §3.11
//    當 k8s rolling update 觸發 SIGTERM，先關閉 better-sqlite3，避免寫到一半被斷
import type { Handle } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

let shuttingDown = false;

export const handle: Handle = async ({ event, resolve }) => {
  if (shuttingDown) {
    return new Response('系統維護中，請稍候重試', { status: 503 });
  }
  // 確保 DB 在第一次 request 就建立 schema（lazy init）
  getDb();
  const response = await resolve(event);
  return response;
};

function gracefulShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[hooks] 收到 ${signal}，開始 graceful shutdown`);
  try {
    const db = getDb();
    db.close();
    console.log('[hooks] DB 已關閉');
  } catch (err) {
    console.error('[hooks] 關 DB 出錯', err);
  }
  // 給進行中的串流連線一點時間完成
  setTimeout(() => process.exit(0), 1500);
}

if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
