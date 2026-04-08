// 接收一輪聊天（user + assistant）寫入 messages 表
// 寫入前對 user content 做 PII 去識別
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { appendMessage } from '$lib/server/repo';
import { scrubPii } from '$lib/server/pii';

type Turn = { role: 'user' | 'assistant'; content: string; latencyMs?: number | null };

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const sessionId = String(body?.sessionId ?? '').trim();
  const turns: Turn[] = Array.isArray(body?.turns) ? body.turns : [];
  if (!sessionId || turns.length === 0) {
    return json({ error: 'missing fields' }, { status: 400 });
  }

  for (const t of turns) {
    const cleaned = t.role === 'user' ? scrubPii(t.content).redacted : t.content;
    appendMessage({
      sessionId,
      role: t.role,
      content: cleaned,
      latencyMs: t.latencyMs ?? undefined
    });
  }
  return json({ ok: true, count: turns.length });
};
