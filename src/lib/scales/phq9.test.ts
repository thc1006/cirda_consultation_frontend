import { describe, it, expect } from 'vitest';
import { scorePhq9, severityHint, isItem9Risk, PHQ9_QUESTIONS } from './phq9';

describe('PHQ-9', () => {
  it('題目剛好 9 題', () => {
    expect(PHQ9_QUESTIONS.length).toBe(9);
  });
  it('總分為各題加總', () => {
    expect(scorePhq9([0, 1, 2, 3, 0, 1, 2, 3, 0])).toBe(12);
  });
  it('題數錯時要丟錯', () => {
    expect(() => scorePhq9([0, 1])).toThrow();
  });
  it('啟發式分級邊界', () => {
    expect(severityHint(0)).toBe('極輕微');
    expect(severityHint(4)).toBe('極輕微');
    expect(severityHint(5)).toBe('輕度');
    expect(severityHint(10)).toBe('中度');
    expect(severityHint(15)).toBe('中重度');
    expect(severityHint(20)).toBe('重度');
  });
  it('第 9 題 > 0 為風險', () => {
    expect(isItem9Risk([0, 0, 0, 0, 0, 0, 0, 0, 1])).toBe(true);
    expect(isItem9Risk([3, 3, 3, 3, 3, 3, 3, 3, 0])).toBe(false);
  });
});
