// BSRS-5 簡式健康量表（Brief Symptom Rating Scale）
// 5+1 題初篩，第 6 題為自殺意念附加題
export const BSRS5_OPTIONS = [
  { value: 0, label: '完全沒有' },
  { value: 1, label: '輕微' },
  { value: 2, label: '中等程度' },
  { value: 3, label: '厲害' },
  { value: 4, label: '非常厲害' }
] as const;

export const BSRS5_QUESTIONS = [
  '睡眠困難，譬如難以入睡、易醒或早醒',
  '感覺緊張不安',
  '覺得容易苦惱或動怒',
  '感覺憂鬱、心情低落',
  '覺得比不上別人',
  '有自殺的想法'
] as const;

export type Bsrs5Answers = number[];

export function scoreBsrs5(answers: Bsrs5Answers): number {
  if (answers.length !== 6) throw new Error('BSRS-5 需要 6 題作答');
  return answers.reduce((sum, v) => sum + v, 0);
}

// 第 6 題（index 5）> 0 → 自殺意念，不得進入聊天
export function isItem6Risk(answers: Bsrs5Answers): boolean {
  return answers.length === 6 && answers[5] > 0;
}

// 是否可進入聊天：總分 ≤ 9 且第 6 題 = 0
export function canProceed(answers: Bsrs5Answers): boolean {
  return scoreBsrs5(answers) <= 9 && !isItem6Risk(answers);
}
