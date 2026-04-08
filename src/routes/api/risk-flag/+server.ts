import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { logEvent } from '$lib/server/repo';
import { scrubPii } from '$lib/server/pii';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  // 即使是 risk_flag 也要先過 PII，避免敏感原文落地
  const safeText = body?.text ? scrubPii(String(body.text)).redacted : null;
  logEvent('crisis_trigger', {
    pseudoId: body?.pseudoId ?? null,
    sessionId: body?.sessionId ?? null,
    source: body?.source ?? 'unknown',
    score: body?.score ?? null,
    text: safeText
  });
  return json({ ok: true });
};
