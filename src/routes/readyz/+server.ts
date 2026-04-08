import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

// k8s readiness：確認 DB 可寫才回 200
export const GET: RequestHandler = () => {
  try {
    getDb().prepare('SELECT 1').get();
    return new Response('ready');
  } catch {
    return new Response('not ready', { status: 503 });
  }
};
