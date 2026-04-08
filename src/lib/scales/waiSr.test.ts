import { describe, it, expect } from 'vitest';
import { scoreWaiSr, WAI_QUESTIONS } from './waiSr';

describe('WAI-SR', () => {
  it('剛好 12 題', () => {
    expect(WAI_QUESTIONS.length).toBe(12);
  });
  it('三分量表 bond/goal/task 各 4 題', () => {
    const bond = WAI_QUESTIONS.filter((q) => q.subscale === 'bond').length;
    const goal = WAI_QUESTIONS.filter((q) => q.subscale === 'goal').length;
    const task = WAI_QUESTIONS.filter((q) => q.subscale === 'task').length;
    expect(bond).toBe(4);
    expect(goal).toBe(4);
    expect(task).toBe(4);
  });
  it('全 5 → 三分量表都是 5 → total 5', () => {
    const r = scoreWaiSr(Array(12).fill(5));
    expect(r.bond).toBe(5);
    expect(r.goal).toBe(5);
    expect(r.task).toBe(5);
    expect(r.total).toBe(5);
  });
  it('題數錯丟錯', () => {
    expect(() => scoreWaiSr([1])).toThrow();
  });
});
