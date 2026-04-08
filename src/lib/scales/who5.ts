// WHO-5 Well-Being Index 繁中版（World Health Organization 授權免費使用）
// 計分：原始分 0–25，乘 4 得 0–100；數值越高代表幸福感越好
export const WHO5_OPTIONS = [
  { value: 0, label: '從未' },
  { value: 1, label: '偶爾' },
  { value: 2, label: '不到一半時間' },
  { value: 3, label: '超過一半時間' },
  { value: 4, label: '大部分時間' },
  { value: 5, label: '所有時間' }
] as const;

export const WHO5_QUESTIONS = [
  '過去兩週，我感到愉快且心情好',
  '過去兩週，我感到平靜且放鬆',
  '過去兩週，我感到充滿活力',
  '過去兩週，我醒來時感到神清氣爽',
  '過去兩週，我的日常生活充滿令我感興趣的事'
] as const;

export function scoreWho5(answers: number[]): number {
  if (answers.length !== 5) throw new Error('WHO-5 需要 5 題作答');
  return answers.reduce((s, v) => s + v, 0) * 4;
}
