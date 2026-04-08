// 中文 PII 去識別化：在寫入長期記憶 / log 前先過濾
// 目前只用正則處理：學號、email、台灣手機。未來可換 Presidio。
//
// 注意：每個 pattern 用兩個 regex —— 一個無 g flag 給 test()，一個有 g 給 replace()
// 原因：全域 regex 的 lastIndex 會在 test() 後被污染，導致下次 test 漏判
const PATTERNS: {
  name: string;
  test: RegExp;
  replace: RegExp;
  to: string;
}[] = [
  { name: 'email', test: /[\w.+-]+@[\w-]+\.[\w.-]+/, replace: /[\w.+-]+@[\w-]+\.[\w.-]+/g, to: '[EMAIL]' },
  { name: 'phone', test: /09\d{2}[-\s]?\d{3}[-\s]?\d{3}/, replace: /09\d{2}[-\s]?\d{3}[-\s]?\d{3}/g, to: '[PHONE]' },
  { name: 'studentId', test: /\b\d{7,9}\b/, replace: /\b\d{7,9}\b/g, to: '[STUDENT_ID]' }
];

export function scrubPii(text: string): { redacted: string; hits: string[] } {
  let out = text;
  const hits: string[] = [];
  for (const p of PATTERNS) {
    if (p.test.test(out)) hits.push(p.name);
    out = out.replace(p.replace, p.to);
  }
  return { redacted: out, hits };
}
