// Working Alliance Inventory - Short Revised (WAI-SR, Hatcher & Gillaspy 2006)
// chatbot 改寫版本：12 題，1（從未）~ 5（總是）
// 三分量表：Bond / Goal / Task，各 4 題；總分為三分量表平均
export const WAI_OPTIONS = [
  { value: 1, label: '從未' },
  { value: 2, label: '偶爾' },
  { value: 3, label: '有時' },
  { value: 4, label: '經常' },
  { value: 5, label: '總是' }
] as const;

export const WAI_QUESTIONS: { text: string; subscale: 'bond' | 'goal' | 'task' }[] = [
  { text: '我覺得諮心好友能欣賞我', subscale: 'bond' },
  { text: '諮心好友與我對於我所要進行的事有共識', subscale: 'goal' },
  { text: '我擔心對話的結果', subscale: 'task' },
  { text: '諮心好友與我對於對於改善我的狀況有共同想法', subscale: 'goal' },
  { text: '我感覺諮心好友喜歡我', subscale: 'bond' },
  { text: '諮心好友與我對於對我重要的事物有共識', subscale: 'goal' },
  { text: '我感覺諮心好友關心我，即使我做了它不喜歡的事', subscale: 'bond' },
  { text: '我覺得我們所做的能幫助我面對問題', subscale: 'task' },
  { text: '諮心好友與我建立了相互信任', subscale: 'bond' },
  { text: '諮心好友與我對我的問題達成共識', subscale: 'goal' },
  { text: '對話的結果使我有所改變', subscale: 'task' },
  { text: '我相信我們相處的方式對我的處境有助益', subscale: 'task' }
];

export function scoreWaiSr(answers: number[]): { bond: number; goal: number; task: number; total: number } {
  if (answers.length !== 12) throw new Error('WAI-SR 需要 12 題作答');
  const bucket = { bond: [] as number[], goal: [] as number[], task: [] as number[] };
  WAI_QUESTIONS.forEach((q, i) => bucket[q.subscale].push(answers[i]));
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const bond = avg(bucket.bond);
  const goal = avg(bucket.goal);
  const task = avg(bucket.task);
  return { bond, goal, task, total: (bond + goal + task) / 3 };
}
