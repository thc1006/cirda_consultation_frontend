// 建立一筆新對話 session 並回傳 sessionId
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createSession } from '$lib/server/repo';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const pseudoId = String(body?.pseudoId ?? '').trim();
  const moduleName = String(body?.module ?? 'cbt');
  if (!pseudoId) return json({ error: 'pseudoId required' }, { status: 400 });
  const sessionId = crypto.randomUUID();
  createSession(sessionId, pseudoId, moduleName);
  return json({ sessionId });
};
