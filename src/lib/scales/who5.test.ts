import { describe, it, expect } from 'vitest';
import { scoreWho5, WHO5_QUESTIONS } from './who5';

describe('WHO-5', () => {
  it('剛好 5 題', () => {
    expect(WHO5_QUESTIONS.length).toBe(5);
  });
  it('總分 = 原始分 * 4，最大 100', () => {
    expect(scoreWho5([5, 5, 5, 5, 5])).toBe(100);
    expect(scoreWho5([0, 0, 0, 0, 0])).toBe(0);
    expect(scoreWho5([3, 3, 3, 3, 3])).toBe(60);
  });
  it('題數錯丟錯', () => {
    expect(() => scoreWho5([1, 2])).toThrow();
  });
});
