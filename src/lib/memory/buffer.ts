// 對話記憶分層（demo 版）：
//  - rolling window：最近 N 輪
//  - running summary：超過 N 輪後請 LLM 摘要（這裡只做純邏輯，呼叫處在 server）
//  - structured profile：純 JSON
// 詳見 ADR-0001 §3.5 與 docs/research/03-memory.md

export type Turn = { role: 'user' | 'assistant'; content: string };

export class RollingWindow {
  private turns: Turn[] = [];
  constructor(public readonly capacity: number = 10) {}

  push(t: Turn) {
    this.turns.push(t);
    if (this.turns.length > this.capacity * 2) {
      // 一次保留最近 capacity 對（user + assistant）
      this.turns = this.turns.slice(-this.capacity * 2);
    }
  }

  snapshot(): Turn[] {
    return [...this.turns];
  }

  shouldSummarize(): boolean {
    return this.turns.length >= this.capacity * 2;
  }
}

export type UserProfile = {
  pseudoId: string;
  stressors: string[];
  phq9Baseline?: number;
  triedStrategies: string[];
};

export function mergeProfile(base: UserProfile, patch: Partial<UserProfile>): UserProfile {
  return {
    pseudoId: base.pseudoId,
    stressors: Array.from(new Set([...base.stressors, ...(patch.stressors ?? [])])),
    triedStrategies: Array.from(
      new Set([...base.triedStrategies, ...(patch.triedStrategies ?? [])])
    ),
    phq9Baseline: patch.phq9Baseline ?? base.phq9Baseline
  };
}
