import { describe, it, expect } from 'vitest';
import { scrubPii } from './pii';

describe('scrubPii', () => {
  it('過濾 email', () => {
    const r = scrubPii('我的信箱是 abc@nycu.edu.tw 請寄信');
    expect(r.redacted).toContain('[EMAIL]');
    expect(r.hits).toContain('email');
  });
  it('過濾手機', () => {
    const r = scrubPii('打0912345678 找我');
    expect(r.redacted).toContain('[PHONE]');
  });
  it('過濾學號', () => {
    const r = scrubPii('我學號是 110511234');
    expect(r.redacted).toContain('[STUDENT_ID]');
  });
  it('沒命中時 hits 為空', () => {
    expect(scrubPii('今天好累').hits.length).toBe(0);
  });
  it('連續呼叫不會因 regex lastIndex 污染漏判', () => {
    // 同一個 instance 連跑五次，全部要正確命中 email
    for (let i = 0; i < 5; i++) {
      const r = scrubPii(`我的信箱是 a${i}@example.com`);
      expect(r.hits).toContain('email');
      expect(r.redacted).toContain('[EMAIL]');
    }
  });
});
