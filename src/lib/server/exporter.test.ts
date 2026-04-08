import { describe, it, expect } from 'vitest';
import { toJsonl, toCsv } from './exporter';
import type { ExportRow } from './repo';

const sample: ExportRow[] = [
  { session_id: 's1', pseudo_id: 'p1', role: 'user', content: '你好', ts: 1, latency_ms: null },
  {
    session_id: 's1',
    pseudo_id: 'p1',
    role: 'assistant',
    content: '哈囉，最近怎麼樣？',
    ts: 2,
    latency_ms: 350
  }
];

describe('exporter', () => {
  it('JSONL 每行都是合法 JSON', () => {
    const text = toJsonl(sample);
    const lines = text.trim().split('\n');
    expect(lines.length).toBe(2);
    for (const line of lines) {
      const obj = JSON.parse(line);
      expect(obj.session_id).toBe('s1');
    }
  });
  it('CSV header + 兩列資料', () => {
    const csv = toCsv(sample);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('session_id,pseudo_id,role,content,ts,latency_ms');
    expect(lines.length).toBe(3);
  });
  it('CSV 對含逗號 / 引號的內容要 escape', () => {
    const tricky: ExportRow[] = [
      { session_id: 's', pseudo_id: 'p', role: 'user', content: 'a,b"c\nd', ts: 1, latency_ms: null }
    ];
    const csv = toCsv(tricky);
    expect(csv).toContain('"a,b""c\nd"');
  });
  it('空陣列 → JSONL 空字串、CSV 只有 header', () => {
    expect(toJsonl([])).toBe('');
    expect(toCsv([])).toBe('session_id,pseudo_id,role,content,ts,latency_ms');
  });
});
