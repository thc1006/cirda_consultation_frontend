// PHQ-9 衛福部繁中題項
// 注意：嚴重度分級僅作啟發式呈現，研究分析以連續分數為主，不做硬切（見 ADR-0001 §3.6）
export const PHQ9_OPTIONS = [
  { value: 0, label: '完全沒有' },
  { value: 1, label: '幾天' },
  { value: 2, label: '一半以上的天數' },
  { value: 3, label: '幾乎每天' }
] as const;

export const PHQ9_QUESTIONS = [
  '做事時提不起勁或沒有興趣',
  '感到心情低落、沮喪或絕望',
  '入睡困難、睡不安穩或睡眠過多',
  '感覺疲倦或沒有活力',
  '食慾不佳或吃太多',
  '覺得自己很糟，或覺得自己很失敗，或讓自己或家人失望',
  '對事物專注有困難，例如閱讀報紙或看電視時',
  '別人是否注意到你動作或說話速度緩慢，或正好相反，變得比平常更躁動',
  '有不如死掉或用某種方式傷害自己的念頭'
] as const;

export type Phq9Answers = number[]; // 長度 9

export function scorePhq9(answers: Phq9Answers): number {
  if (answers.length !== 9) throw new Error('PHQ-9 需要 9 題作答');
  return answers.reduce((sum, v) => sum + v, 0);
}

// 啟發式分級（僅供受試者參考，非診斷）
export function severityHint(total: number): string {
  if (total <= 4) return '極輕微';
  if (total <= 9) return '輕度';
  if (total <= 14) return '中度';
  if (total <= 19) return '中重度';
  return '重度';
}

// 第 9 題（index 8）> 0 → 觸發 non-blocking 危機分流
export function isItem9Risk(answers: Phq9Answers): boolean {
  return answers.length === 9 && answers[8] > 0;
}
