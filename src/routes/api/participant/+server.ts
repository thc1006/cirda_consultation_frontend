import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { makePseudoId } from '$lib/server/pseudoId';
import { upsertParticipant } from '$lib/server/repo';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const rawId = String(body?.rawId ?? '').trim();
  if (!rawId) return json({ error: 'rawId required' }, { status: 400 });
  const pseudoId = makePseudoId(rawId);
  upsertParticipant(pseudoId);
  return json({ pseudoId });
};
