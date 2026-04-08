// 接收一輪聊天（user + assistant）寫入 messages 表
// 寫入前對 user content 做 PII 去識別
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { appendMessage } from '$lib/server/repo';
import { scrubPii } from '$lib/server/pii';

type Turn = { role: 'user' | 'assistant'; content: string; latencyMs?: number | null };
const ALLOWED_ROLES = new Set(['user', 'assistant']);

// 對未受信任的 turns JSON 做白名單驗證，避免異常 role / 非字串 content 寫進 DB
function validateTurns(raw: unknown): Turn[] | null {
  if (!Array.isArray(raw)) return null;
  const out: Turn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const r = item as Record<string, unknown>;
    if (typeof r.role !== 'string' || !ALLOWED_ROLES.has(r.role)) return null;
    if (typeof r.content !== 'string') return null;
    out.push({
      role: r.role as 'user' | 'assistant',
      content: r.content,
      latencyMs: typeof r.latencyMs === 'number' ? r.latencyMs : null
    });
  }
  return out;
}

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const sessionId = String(body?.sessionId ?? '').trim();
  if (!sessionId) return json({ error: 'sessionId required' }, { status: 400 });

  const turns = validateTurns(body?.turns);
  if (!turns || turns.length === 0) {
    return json({ error: 'invalid turns' }, { status: 400 });
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
