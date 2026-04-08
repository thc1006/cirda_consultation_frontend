import { describe, it, expect } from 'vitest';
import { detectRisk } from './riskKeywords';

describe('detectRisk', () => {
  it('偵測到高風險語句要回 high', () => {
    expect(detectRisk('我有時候會想死')).toBe('high');
    expect(detectRisk('最近一直想消失')).toBe('high');
  });
  it('偵測到柔性關懷詞要回 soft', () => {
    expect(detectRisk('好厭世喔')).toBe('soft');
    expect(detectRisk('壓力山大')).toBe('soft');
  });
  it('一般句子回 none', () => {
    expect(detectRisk('今天天氣不錯')).toBe('none');
  });
  it('高風險優先於柔性', () => {
    expect(detectRisk('我厭世到想死')).toBe('high');
  });
});
