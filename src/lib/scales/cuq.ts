// Chatbot Usability Questionnaire (CUQ, Holmes 2019) 繁中翻譯版
// 16 題，1（非常不同意）~ 5（非常同意），偶數題反向計分
// Holmes 2019 公式：CUQ = ((Σ正向題 − 8) + (40 − Σ反向題)) × 100 / 64
// 8 = 正向題數（每題最小 1 分）；40 = 反向題數 × 5（最大）；64 = 兩段 range 之和
export const CUQ_OPTIONS = [
  { value: 1, label: '非常不同意' },
  { value: 2, label: '不同意' },
  { value: 3, label: '中立' },
  { value: 4, label: '同意' },
  { value: 5, label: '非常同意' }
] as const;

export const CUQ_QUESTIONS: { text: string; positive: boolean }[] = [
  { text: '聊天機器人的個性令人愉快', positive: true },
  { text: '聊天機器人感覺機械化', positive: false },
  { text: '聊天機器人和善、友好', positive: true },
  { text: '聊天機器人感覺像和真人對話', positive: false }, // 反向（因為 chatbot 不應假裝真人）
  { text: '聊天機器人解釋它的能力', positive: true },
  { text: '聊天機器人提供無關的資訊', positive: false },
  { text: '聊天機器人很容易使用', positive: true },
  { text: '聊天機器人很複雜', positive: false },
  { text: '聊天機器人易於導覽', positive: true },
  { text: '需要重新表達才能讓機器人理解', positive: false },
  { text: '聊天機器人能理解我的訊息', positive: true },
  { text: '聊天機器人未能辨識我的輸入', positive: false },
  { text: '聊天機器人的回應有用、相關且資訊豐富', positive: true },
  { text: '聊天機器人的回應不太相關', positive: false },
  { text: '聊天機器人能應付任何錯誤', positive: true },
  { text: '聊天機器人似乎無法處理錯誤', positive: false }
];

export function scoreCuq(answers: number[]): number {
  if (answers.length !== 16) throw new Error('CUQ 需要 16 題作答');
  let pos = 0,
    neg = 0;
  CUQ_QUESTIONS.forEach((q, i) => {
    if (q.positive) pos += answers[i];
    else neg += answers[i];
  });
  return ((pos - 8 + (40 - neg)) * 100) / 64;
}
