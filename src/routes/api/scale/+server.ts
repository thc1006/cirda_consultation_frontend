import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { saveScaleResponse } from '$lib/server/repo';

const ALLOWED_SCALES = new Set(['PHQ-9', 'WHO-5', 'CUQ', 'WAI-SR', 'SUDS']);
const ALLOWED_PHASES = new Set(['pre', 'post']);

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const pseudoId = String(body?.pseudoId ?? '').trim();
  const scale = String(body?.scale ?? '').trim();
  const phase = String(body?.phase ?? '').trim();

  if (!pseudoId) return json({ error: 'pseudoId required' }, { status: 400 });
  if (!ALLOWED_SCALES.has(scale)) return json({ error: 'invalid scale' }, { status: 400 });
  if (!ALLOWED_PHASES.has(phase)) return json({ error: 'invalid phase' }, { status: 400 });

  saveScaleResponse({
    pseudoId,
    scale,
    phase: phase as 'pre' | 'post',
    payload: body.payload,
    score: typeof body.score === 'number' ? body.score : null
  });
  return json({ ok: true });
};
