import { describe, it, expect } from 'vitest';
import { scoreCuq, CUQ_QUESTIONS } from './cuq';

describe('CUQ', () => {
  it('剛好 16 題', () => {
    expect(CUQ_QUESTIONS.length).toBe(16);
  });
  it('全 5（正反向都選同意）→ CUQ = 50（中性）', () => {
    expect(scoreCuq(Array(16).fill(5))).toBeCloseTo(50, 0);
  });
  it('全 1（正反向都選不同意）→ CUQ = 50（中性）', () => {
    expect(scoreCuq(Array(16).fill(1))).toBeCloseTo(50, 0);
  });
  it('正向題全 5、反向題全 1 → CUQ = 100（最佳）', () => {
    const ans = Array(16)
      .fill(0)
      .map((_, i) => (i % 2 === 0 ? 5 : 1));
    expect(scoreCuq(ans)).toBeCloseTo(100, 0);
  });
  it('正向題全 1、反向題全 5 → CUQ = 0（最差）', () => {
    const ans = Array(16)
      .fill(0)
      .map((_, i) => (i % 2 === 0 ? 1 : 5));
    expect(scoreCuq(ans)).toBeCloseTo(0, 0);
  });
  it('題數錯丟錯', () => {
    expect(() => scoreCuq([1, 2, 3])).toThrow();
  });
});
