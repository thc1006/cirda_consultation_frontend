import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { saveScaleResponse } from '$lib/server/repo';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  if (!body?.pseudoId || !body?.scale || !body?.phase) {
    return json({ error: 'missing fields' }, { status: 400 });
  }
  saveScaleResponse({
    pseudoId: body.pseudoId,
    scale: body.scale,
    phase: body.phase,
    payload: body.payload,
    score: typeof body.score === 'number' ? body.score : null
  });
  return json({ ok: true });
};
