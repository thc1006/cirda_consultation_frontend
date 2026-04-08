import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { logEvent } from '$lib/server/repo';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const items = Array.isArray(body?.items) ? body.items : [];
  for (const it of items) {
    logEvent(`fe.${it?.type ?? 'unknown'}`, { ...(it?.payload ?? {}), level: it?.level ?? 'info' });
  }
  return json({ ok: true, count: items.length });
};
