# 研究筆記 02：前/後測量表選型與危機分流

> 紀錄日期：2026-04-08
> 來源：主 context WebSearch 驗證 + sub-agent #2 整理。

## 1. PHQ-9 中文／台灣本土切點（已修正常見誤解）

**重要**：英文原版 Kroenke 2001 的 5/10/15/20 嚴重度標籤**不應直接套用**到華語族群。Liu 2011 對台灣初級照護病人驗證後 + Wang/Zhang 2014 中國一般人口驗證 + 2022 系統綜述顯示，華語版最佳切點落在 **6–11**，多數研究取 **≥10** 為主要切點。

**本專案決策**（已依 2026-04-08 覆驗 agent 建議調整）：
- 顯示總分（0–27）與「請參考此分數作為自我覺察起點，並非診斷」免責訊息。
- 嚴重度分級可作為**啟發式參考**呈現給受試者（0–4 極輕微 / 5–9 輕度 / 10–14 中度 / 15–19 中重度 / 20–27 重度），但 ADR 與研究分析以**連續分數**為主，**不**將 ≥10 作為實驗納入/排除的硬切。
- 第 9 題（自傷意念）≥1 即啟動危機分流（見 §3）。

**權威來源**（主 context WebSearch 已驗證）：
- Liu SI et al. 2011 台灣 PHQ-9 驗證：https://pubmed.ncbi.nlm.nih.gov/21111406/
- Chinese PHQ-9/PHQ-2 系統綜述 2022：https://pmc.ncbi.nlm.nih.gov/articles/PMC9448521/
- 中國一般人口 PHQ-9 信效度 2014：https://pubmed.ncbi.nlm.nih.gov/25023953/
- 中國大學生 PHQ-9 網路施測效度：https://pmc.ncbi.nlm.nih.gov/articles/PMC5580087/
- BMC Psychiatry 精神科病人 PHQ-9 2020：https://link.springer.com/article/10.1186/s12888-020-02885-6
- PHQ Screeners 官方下載：https://www.phqscreeners.com/

## 2. 後測組合方案

採 **「重複測 PHQ-9 + WHO-5 + CUQ + WAI-SR + SUDS」**：
- **重複 PHQ-9**：與前測同題對照，作為主結果。
- **WHO-5（5 題）**：正向措詞、對短期介入敏感、世界衛生組織授權。
- **CUQ（Chatbot Usability Questionnaire, 16 題）**：心理支持類 chatbot 研究最常用。
- **WAI-SR（治療同盟短版, 12 題）**：Woebot/Wysa 已在 chatbot 場景驗證可改寫。
- **SUDS（0–10 滑桿）**：對話前後各測一次，與期中報告 ablation study 呼應。

前測 ≈4 分鐘；後測 ≈10 分鐘。

## 3. 第 9 題（自傷意念）危機分流（**non-blocking 學術倫理版**）

依覆驗 agent 引用 *Trials 2024* 與 PHQ-9 Item 9 + C-SSRS 文獻，學術 IRB 友善作法為「不阻擋實驗、但持續關懷與紀錄」：

- **第 9 題 > 0**：立即觸發 **non-blocking 安全分流 modal**，顯示衛福部安心專線 1925、生命線 1995、張老師 1980（均 `tel:` 一鍵撥號）+ 陽交大諮商中心 + 校安中心，附「本工具非醫療診斷」明示。受試者**可選擇繼續或結束**，不強制中斷。
- **同時**：將 risk_flag 寫入 `event_log`（事件 `crisis_trigger`，附 source = `phq9_item9` / `chat_keyword`、score、ts），由後端 webhook 通知研究團隊。
- **聊天中**出現高風險關鍵字（想死/自殺/活不下去 等）：LLM 切換至安全回應模板（同理 + 求助資源），UI 再次顯示專線 modal；同樣 non-blocking。
- **持續顯示（WCAG 3.2.6 Consistent Help）**：所有頁面右下角常駐「立即求助」懸浮按鈕，點擊展開五組電話。

## 3.5 台灣現行專線（已驗證 2026-04 仍有效）

- 衛福部 1925 安心專線：24h 免付費 — https://www.mohw.gov.tw/cp-16-19209-1.html
- Taipei Times 報導 1925 改號公告：https://www.taipeitimes.com/News/taiwan/archives/2019/07/03/2003718042
- 陽明校區 健康心理中心：(02)2826-7000 #62026 — https://mhcc.nycu.edu.tw/
- 交大校區 健康心理中心：(03)5712121 #51303 — https://counsel.sa.nctu.edu.tw/
- 陽明校區 校安中心 24h：(02)2826-1100
- 交大校區 校安中心 24h：(03)5712121 #31999、0972-705-557 — https://csrc.web.nycu.edu.tw/
- 生命線 1995：24h — https://zh.wikipedia.org/zh-tw/自殺防治專線_(臺灣)
- 張老師 1980：週一至六 09:00–21:00、週日 09:00–17:00
- 陽明交通大學諮商中心：https://counseling.nycu.edu.tw/

## 4. 量表 UI/UX

- One question per page (OQPP)：行動裝置完成率最佳，符合 WCAG 2.5.8。
- 鍵盤：1/2/3/4 數字鍵直接作答 + Tab 導航 + ←/→ 切題。
- 進度：顯示「第 X 題／共 Y 題」而非百分比。
- 防誤觸：選項按鈕 ≥48×48 px。
- 中斷續答：localStorage 加密存暫存，重新開啟顯示「從上次處繼續」。

## 修訂紀錄
- 2026-04-08 初版。
- 2026-04-08 r2：覆驗 sub-agent 引用 *Trials 2024*、Liu 2011、PMC9448521 系統綜述後修正：
  1. PHQ-9 切點不採硬切；嚴重度分級僅作啟發式呈現，研究分析以連續分數為主。
  2. 第 9 題分流改為 **non-blocking**，不阻擋實驗但寫入 risk_flag 並通知研究團隊。
  3. 補上 PHQ-9 Item 9 + C-SSRS 證據鏈：https://pubmed.ncbi.nlm.nih.gov/29477096/、https://trialsjournal.biomedcentral.com/articles/10.1186/s13063-024-08276-6
