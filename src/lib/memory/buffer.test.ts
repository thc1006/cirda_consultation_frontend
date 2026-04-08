import { describe, it, expect } from 'vitest';
import { RollingWindow, mergeProfile } from './buffer';

describe('RollingWindow', () => {
  it('保留最近 N*2 條訊息', () => {
    const w = new RollingWindow(2);
    for (let i = 0; i < 10; i++) {
      w.push({ role: 'user', content: `u${i}` });
      w.push({ role: 'assistant', content: `a${i}` });
    }
    const snap = w.snapshot();
    expect(snap.length).toBe(4);
    expect(snap.at(-1)?.content).toBe('a9');
  });
  it('達到容量時 shouldSummarize 為 true', () => {
    const w = new RollingWindow(1);
    w.push({ role: 'user', content: 'u' });
    w.push({ role: 'assistant', content: 'a' });
    expect(w.shouldSummarize()).toBe(true);
  });
});

describe('mergeProfile', () => {
  it('壓力源去重合併', () => {
    const merged = mergeProfile(
      { pseudoId: 'x', stressors: ['課業'], triedStrategies: ['散步'] },
      { stressors: ['課業', '經濟'], triedStrategies: ['散步', '聽音樂'] }
    );
    expect(merged.stressors.sort()).toEqual(['經濟', '課業']);
    expect(merged.triedStrategies.length).toBe(2);
  });
});
