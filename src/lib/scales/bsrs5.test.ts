import { describe, it, expect } from 'vitest';
import {
  scoreBsrs5,
  isItem6Risk,
  canProceed,
  BSRS5_QUESTIONS,
  BSRS5_OPTIONS
} from './bsrs5';

describe('BSRS-5', () => {
  it('題目剛好 6 題', () => {
    expect(BSRS5_QUESTIONS.length).toBe(6);
  });

  it('選項有 5 個（0~4）', () => {
    expect(BSRS5_OPTIONS.length).toBe(5);
    expect(BSRS5_OPTIONS[0].value).toBe(0);
    expect(BSRS5_OPTIONS[4].value).toBe(4);
  });

  it('總分為各題加總', () => {
    expect(scoreBsrs5([0, 1, 2, 3, 4, 0])).toBe(10);
    expect(scoreBsrs5([0, 0, 0, 0, 0, 0])).toBe(0);
    expect(scoreBsrs5([4, 4, 4, 4, 4, 4])).toBe(24);
  });

  it('題數錯時要丟錯', () => {
    expect(() => scoreBsrs5([0, 1])).toThrow('BSRS-5 需要 6 題作答');
    expect(() => scoreBsrs5([0, 1, 2, 3, 4, 0, 1])).toThrow();
  });

  it('第 6 題 > 0 為自殺意念風險', () => {
    expect(isItem6Risk([0, 0, 0, 0, 0, 1])).toBe(true);
    expect(isItem6Risk([0, 0, 0, 0, 0, 4])).toBe(true);
    expect(isItem6Risk([4, 4, 4, 4, 4, 0])).toBe(false);
  });

  it('第 6 題長度不足時回傳 false', () => {
    expect(isItem6Risk([0, 0])).toBe(false);
  });

  it('canProceed：總分 ≤ 9 且第 6 題 = 0 才通過', () => {
    // 通過：總分 9，第 6 題 0
    expect(canProceed([2, 2, 2, 2, 1, 0])).toBe(true);
    // 不通過：總分 10
    expect(canProceed([2, 2, 2, 2, 2, 0])).toBe(false);
    // 不通過：第 6 題 > 0（即使總分低）
    expect(canProceed([0, 0, 0, 0, 0, 1])).toBe(false);
    // 不通過：兩者皆超
    expect(canProceed([3, 3, 3, 3, 3, 1])).toBe(false);
  });

  it('canProceed：邊界值 總分剛好 9 且第 6 題 0', () => {
    expect(canProceed([3, 3, 3, 0, 0, 0])).toBe(true);
    expect(canProceed([4, 4, 1, 0, 0, 0])).toBe(true);
  });
});
