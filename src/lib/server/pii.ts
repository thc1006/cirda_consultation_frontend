// 中文 PII 去識別化：在寫入長期記憶 / log 前先過濾
// 目前只用正則處理：學號、email、台灣手機。未來可換 Presidio。
const PATTERNS: { name: string; re: RegExp; replace: string }[] = [
  { name: 'email', re: /[\w.+-]+@[\w-]+\.[\w.-]+/g, replace: '[EMAIL]' },
  { name: 'phone', re: /09\d{2}[-\s]?\d{3}[-\s]?\d{3}/g, replace: '[PHONE]' },
  { name: 'studentId', re: /\b\d{7,9}\b/g, replace: '[STUDENT_ID]' }
];

export function scrubPii(text: string): { redacted: string; hits: string[] } {
  let out = text;
  const hits: string[] = [];
  for (const p of PATTERNS) {
    if (p.re.test(out)) hits.push(p.name);
    out = out.replace(p.re, p.replace);
  }
  return { redacted: out, hits };
}
