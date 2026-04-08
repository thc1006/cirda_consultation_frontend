// 串流聊天 store：
// 主路徑＝瀏覽器直接呼叫 Puter.js (puter.ai.chat, google/gemini-3-flash-preview)
// 備援路徑＝伺服器 /api/chat（給 E2E 與 Puter.js 失敗時用）
//
// 重要：訊息更新一律走 immutable map-by-id，不直接 mutate 物件
// 原因：Svelte 5 的 $state 對外部 mutation 不會通知，必須建立新物件引用
import { browser } from '$app/environment';
import { logger } from '$lib/logger';
import { RollingWindow, type Turn } from '$lib/memory/buffer';
import { CBT_SYSTEM_PROMPT } from '$lib/prompts/cbt';

export type ChatStatus = 'idle' | 'submitting' | 'streaming' | 'error';
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
  source?: 'puter' | 'fallback';
  latencyUserThinkMs?: number;
  latencyFirstTokenMs?: number;
  latencyTotalMs?: number;
};

// 兼容 Puter.js 多種回傳形狀（依 developer.puter.com 文件 + 實測）
type PuterResult = unknown;

declare global {
  interface Window {
    puter?: {
      ai: {
        chat(
          prompt: string,
          opts?: { model?: string; stream?: boolean; temperature?: number }
        ): Promise<unknown>;
      };
    };
  }
}

// 把 system + 歷史 + 當前 user 串成單一 string prompt
// 原因：Puter.js 官方文件 puter.ai.chat 第一個參數只支援 string，
// 傳 messages array 會直接拿不到回應
function flattenPromptToString(messages: { role: string; content: string }[]): string {
  const parts: string[] = [];
  for (const m of messages) {
    if (m.role === 'system') parts.push(`【角色設定】\n${m.content}`);
    else if (m.role === 'user') parts.push(`使用者：${m.content}`);
    else if (m.role === 'assistant') parts.push(`諮心好友：${m.content}`);
  }
  parts.push('諮心好友：');
  return parts.join('\n\n');
}

class ChatStreamStore {
  status = $state<ChatStatus>('idle');
  messages = $state<ChatMessage[]>([]);
  errorText = $state<string | null>(null);
  sessionId = $state<string | null>(null);
  pseudoId = $state<string | null>(null);
  // 顯示在 UI 上的小狀態文字（哪一條路徑、是否在 fallback）
  statusHint = $state<string | null>(null);
  private controller: AbortController | null = null;
  private window = new RollingWindow(10);
  private lastAssistantDoneAt = 0;

  reset() {
    this.status = 'idle';
    this.messages = [];
    this.errorText = null;
    this.statusHint = null;
    this.window = new RollingWindow(10);
    this.lastAssistantDoneAt = 0;
  }

  setSession(sessionId: string, pseudoId: string) {
    this.sessionId = sessionId;
    this.pseudoId = pseudoId;
  }

  abort() {
    this.controller?.abort();
    this.controller = null;
    if (this.status === 'streaming' || this.status === 'submitting') {
      this.status = 'idle';
    }
  }

  // 用 immutable 方式替換指定 id 的 assistant 訊息
  // 這是 Svelte 5 reactivity 的正確姿勢：建立新物件引用，proxy 才會通知
  private updateAssistant(id: string, patch: Partial<ChatMessage>) {
    this.messages = this.messages.map((m) => (m.id === id ? { ...m, ...patch } : m));
  }

  private buildPromptMessages(userText: string) {
    const recent: Turn[] = this.window.snapshot();
    return [
      { role: 'system', content: CBT_SYSTEM_PROMPT },
      ...recent.map((t) => ({ role: t.role, content: t.content })),
      { role: 'user', content: userText }
    ];
  }

  // 廣域抽取文字：覆蓋 Puter.js / OpenAI / Gemini 多種可能形狀
  private extractText(c: PuterResult): string {
    if (c == null) return '';
    if (typeof c === 'string') return c;
    if (typeof c !== 'object') return String(c);
    const o = c as Record<string, unknown>;
    // Puter.js 官方文件：response.message.content
    const m = o.message as Record<string, unknown> | undefined;
    if (m && typeof m.content === 'string') return m.content;
    // 巢狀：response.result.message.content
    const r = o.result as Record<string, unknown> | undefined;
    if (r) {
      const rm = r.message as Record<string, unknown> | undefined;
      if (rm && typeof rm.content === 'string') return rm.content;
      if (typeof r.text === 'string') return r.text;
      if (typeof r.content === 'string') return r.content;
    }
    // OpenAI 相容：choices[0].message.content
    const choices = o.choices as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(choices) && choices[0]) {
      const cm = choices[0].message as Record<string, unknown> | undefined;
      if (cm && typeof cm.content === 'string') return cm.content;
    }
    // 直接 .text / .content
    if (typeof o.text === 'string') return o.text;
    if (typeof o.content === 'string') return o.content;
    return '';
  }

  async send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const tSent = performance.now();
    const userThink = this.lastAssistantDoneAt > 0 ? Math.round(tSent - this.lastAssistantDoneAt) : 0;

    const userMsgId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    const now = Date.now();

    // 同時 push user + 空 assistant；後續一律以 id 替換
    this.messages = [
      ...this.messages,
      { id: userMsgId, role: 'user', content: trimmed, ts: now, latencyUserThinkMs: userThink },
      { id: assistantId, role: 'assistant', content: '', ts: now }
    ];

    this.status = 'submitting';
    this.errorText = null;
    this.statusHint = null;
    logger.event('request_sent', { messageId: assistantId, userThink });

    this.controller = new AbortController();
    const promptMessages = this.buildPromptMessages(trimmed);

    const usePuter = browser && typeof window.puter?.ai?.chat === 'function';
    let firstTokenSeen = false;

    const markFirstToken = () => {
      if (firstTokenSeen) return;
      firstTokenSeen = true;
      logger.event('first_token', {
        messageId: assistantId,
        latencyMs: Math.round(performance.now() - tSent)
      });
    };

    let finalText = '';
    let finalSource: 'puter' | 'fallback' = 'fallback';

    try {
      this.status = 'streaming';

      // 用 URL ?noputer=1 可強制走後備
      const forceBackup =
        browser && new URL(window.location.href).searchParams.has('noputer');

      if (usePuter && !forceBackup) {
        this.statusHint = '正在連線 Puter.js …';
        const puterText = await this.tryPuter(promptMessages);
        if (puterText) {
          finalText = puterText;
          finalSource = 'puter';
          this.statusHint = null;
        }
      }

      if (!finalText) {
        // Puter 失敗或沒回東西 → 走後備
        this.statusHint = usePuter
          ? '主路徑無回應，已切換為備援模式'
          : '使用備援模式';
        finalText = await this.tryBackup(promptMessages);
        finalSource = 'fallback';
      }

      if (!finalText) {
        throw new Error('LLM 與備援都沒回應，請稍後重試');
      }

      // 打字機效果：把完整文字一段一段塗到 bubble，提供串流體感
      markFirstToken();
      const step = 3;
      for (let i = 0; i < finalText.length; i += step) {
        if (this.controller?.signal.aborted) break;
        this.updateAssistant(assistantId, {
          content: finalText.slice(0, i + step),
          source: finalSource
        });
        await new Promise((r) => setTimeout(r, 10));
      }
      // 最後一次保證完整字串就位
      this.updateAssistant(assistantId, { content: finalText, source: finalSource });

      const totalMs = Math.round(performance.now() - tSent);
      this.updateAssistant(assistantId, { latencyTotalMs: totalMs });
      this.lastAssistantDoneAt = performance.now();
      logger.event('last_token', {
        messageId: assistantId,
        latencyMs: totalMs,
        contentLen: finalText.length,
        source: finalSource
      });

      // 更新滾動視窗
      this.window.push({ role: 'user', content: trimmed });
      this.window.push({ role: 'assistant', content: finalText });

      // 持久化（PII scrub 在後端做）
      if (this.sessionId) {
        await this.persistTurn(trimmed, finalText, userThink, totalMs);
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      this.errorText = (err as Error).message;
      logger.event('error', { messageId: assistantId, message: this.errorText });
      // 把錯誤直接寫進 bubble，使用者才看得到
      this.updateAssistant(assistantId, {
        content: `（系統錯誤：${this.errorText}，請稍後再試）`
      });
    } finally {
      this.controller = null;
      this.status = this.errorText ? 'error' : 'idle';
      // statusHint 留著最後一次的訊息一秒讓使用者看到，再清掉
      setTimeout(() => (this.statusHint = null), 1500);
    }
  }

  // Puter.js 主路徑：純 HTTPS 呼叫 + 12 秒 timeout
  // 注意：Puter.js 第一參數要 string，不是 messages array；先把對話攤平成單一段
  private async tryPuter(
    promptMessages: { role: string; content: string }[]
  ): Promise<string> {
    const PUTER_TIMEOUT = 12_000;
    const promptString = flattenPromptToString(promptMessages);
    try {
      const result = await Promise.race<unknown>([
        window.puter!.ai.chat(promptString, {
          model: 'google/gemini-3-flash-preview',
          temperature: 0.6
        }),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error('puter timeout 12s')), PUTER_TIMEOUT)
        )
      ]);
      try {
        console.log('[chatStream] puter raw result =', result);
      } catch {
        /* ignore */
      }
      const text = this.extractText(result);
      if (!text) {
        console.warn('[chatStream] puter result has no extractable text', result);
      }
      return text;
    } catch (err) {
      console.warn('[chatStream] puter error:', (err as Error).message);
      return '';
    }
  }

  // 後備路徑：自家 /api/chat（規則式但保證有回應）
  private async tryBackup(
    promptMessages: { role: string; content: string }[]
  ): Promise<string> {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: promptMessages }),
        signal: this.controller?.signal
      });
      if (!res.ok) {
        console.warn('[chatStream] backup HTTP', res.status);
        return '';
      }
      // 後端是 chunked text/plain，直接讀完
      return await res.text();
    } catch (err) {
      console.warn('[chatStream] backup error:', (err as Error).message);
      return '';
    }
  }

  private async persistTurn(
    userContent: string,
    assistantContent: string,
    userThinkMs: number,
    totalMs: number
  ) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          sessionId: this.sessionId,
          turns: [
            { role: 'user', content: userContent, latencyMs: userThinkMs },
            { role: 'assistant', content: assistantContent, latencyMs: totalMs }
          ]
        })
      });
    } catch (err) {
      console.warn('[chatStream] persist error:', (err as Error).message);
    } finally {
      clearTimeout(timer);
    }
  }
}

export const chatStream = new ChatStreamStore();
