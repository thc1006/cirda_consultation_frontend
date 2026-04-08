// 前端 logger：批次 flush 到後端 /api/log
// 為了 SSR 友善，瀏覽器/Node 共用同一份介面
import { browser } from '$app/environment';

type Level = 'debug' | 'info' | 'warn' | 'error';
type Event = {
  ts: number;
  level: Level;
  type: string;
  payload?: Record<string, unknown>;
};

class Logger {
  private buffer: Event[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  event(type: string, payload?: Record<string, unknown>, level: Level = 'info') {
    this.buffer.push({ ts: Date.now(), level, type, payload });
    this.scheduleFlush();
  }

  // 測試用：直接拿到目前 buffer
  _drain(): Event[] {
    const out = this.buffer;
    this.buffer = [];
    return out;
  }

  private scheduleFlush() {
    if (!browser) return;
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => this.flush(), 500);
  }

  private async flush() {
    this.flushTimer = null;
    if (this.buffer.length === 0) return;
    const items = this._drain();
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
        keepalive: true
      });
    } catch {
      // log 寫不出去就吞掉，不影響使用者體驗
    }
  }
}

export const logger = new Logger();
