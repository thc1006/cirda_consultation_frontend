// 結構化對話紀錄匯出：JSONL（LLM 友善）+ CSV（人類友善）
// Parquet 留待正式階段；demo 不引入 parquetjs 以維持依賴輕量
import type { ExportRow } from './repo';

export function toJsonl(rows: ExportRow[]): string {
  return rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : '');
}

export function toCsv(rows: ExportRow[]): string {
  const header = ['session_id', 'pseudo_id', 'role', 'content', 'ts', 'latency_ms'];
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(header.map((k) => escape((r as Record<string, unknown>)[k])).join(','));
  }
  return lines.join('\n');
}
