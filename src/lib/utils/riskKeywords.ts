// 高風險關鍵字：與量表 PHQ-9 第 9 題並列作為危機分流訊號
// 來源：docs/research/04-stress-and-logging.md
export const HIGH_RISK_KEYWORDS = [
  '想死',
  '自殺',
  '自傷',
  '活著沒意義',
  '想消失',
  '活不下去',
  '不想活了',
  '結束生命',
  '跳樓',
  '割腕'
] as const;

// 柔性關懷詞：偵測到時 chatbot 加強同理但不觸發危機分流
export const SOFT_CARE_KEYWORDS = [
  '厭世',
  '擺爛',
  '躺平',
  '廢物',
  '魯蛇',
  '撐不下去',
  '沒動力',
  '空白',
  '喘不過氣',
  '壓力山大',
  '睡不著',
  '沒食慾',
  '想逃',
  '社恐',
  '情緒勒索',
  '延畢',
  '被當',
  '指導教授地獄'
] as const;

export function detectRisk(text: string): 'high' | 'soft' | 'none' {
  for (const w of HIGH_RISK_KEYWORDS) if (text.includes(w)) return 'high';
  for (const w of SOFT_CARE_KEYWORDS) if (text.includes(w)) return 'soft';
  return 'none';
}
