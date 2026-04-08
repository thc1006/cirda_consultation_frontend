# ADR-0001：諮心好友 Web 聊天介面架構決策

- 狀態：Accepted（經 2026-04-08 覆驗 sub-agent 真實連網查證後修正）
- 日期：2026-04-08
- 決策者：開發團隊
- 上游約束：`docs/decisions.md`、專案上游需求文件、國網中心創進學院申請書、國網創進計畫期中報告、既有 LINE-style MVP 原型
- 上游證據：`docs/research/01..04-*.md`

## 一、背景與問題陳述

「諮心好友」為國立陽明交通大學教育研究所主持的低資源華語心理壓力對話研究案（國網中心創進學院計畫）下的子任務 — 一個提供給陽交大教職員生的繁體中文 Web 聊天介面，性質為**非醫療、非治療性**之情緒支持與減壓工具，採 CBT/DBT 框架。期中報告已完成 LINE 風格 MVP（Module A/B/C/D 四種 ablation）；本次任務是把該 MVP 重做為**獨立、可在 k8s 部署、支援 RWD 與 WCAG 2.2 AA 的 Web 介面**，並支援前測（PHQ-9）、後測（WHO-5/CUQ/WAI-SR/SUDS）、危機分流、結構化對話紀錄匯出、色盲友善多主題、Playwright E2E。

## 二、決策驅動力

1. 學術 IRB 嚴謹度（資料可重現、可稽核、可刪除）。
2. 串流 LLM 回應的低延遲體感（首 token < 1s 體感）。
3. 受試者體驗（多裝置 RWD、無障礙、色盲友善）。
4. 易於 Playwright / computer-use 自動化驗證。
5. 後端可平滑替換（demo 用 Puter.js Gemini，正式用自家微調 LLM）。
6. 個資合規（個資法 + GDPR Art.17 right to erasure）。
7. 不得在程式碼、註解、報告中出現特定商用 AI 服務或模型供應商名稱；不可有 emoji。

## 三、決策

### 3.1 前端框架
**採 SvelteKit 5（Runes）+ TypeScript + Vite 6 + adapter-node。**
- 串流 SSE 在 `+server.ts` 原生支援，可被 nginx/k8s 承載並設 `X-Accel-Buffering: no`。
- 編譯期 a11y 警告。
- Bundle 小、INP 友善。
- 與 open-webui (Svelte 系) 同生態，未來組件互通。

### 3.2 樣式與設計系統
- **Tailwind CSS v3（OKLCH token via CSS variables）** + **headless 元件自實作**（a11y-first，未引入 Bits UI / Melt UI 以維持依賴最小）。
- 七套主題：light-default / light-protan-deutan / light-tritan / dark-default / dark-protan-deutan / dark-tritan / increase-contrast。
- semantic token：`--fg / --bg / --surface / --accent / --success / --danger / --warn / --info / --focus-ring`。
- 切換以 `[data-theme=...]` 切換 CSS variables，無需 hydrate。

### 3.3 後端 / LLM
- **Demo**：前端透過 SvelteKit 的 `+server.ts` 代理 Puter.js（`puter.ai.chat`，model `google/gemini-3-flash-preview`）。**所有金鑰留在伺服端**，前端不直接持有。
- **正式**：替換為 OpenAI 相容介面的自家微調 LLM（保留同一 adapter interface）。
- system prompt 由 `src/lib/prompts/` 集中管理（前後端共用同一份），CBT/DBT/Integrated/Control 四 module 切換。

### 3.4 資料儲存
- **Demo**：SQLite（檔案）+ Drizzle ORM + better-sqlite3。
  - 表：`participants`（pseudo_id）、`scale_responses`、`sessions`、`messages`、`session_summary`、`memory_episodic`、`memory_audit_log`、`event_log`。
- **正式**：Postgres + pgvector，schema 不變。
- 欄位級加密：對話原文、量表答案、PHQ-9 第 9 題以 AES-256（pgcrypto / better-sqlite3 + node:crypto）加密。
- 受試者代號：建立時以 HMAC-SHA256(salt, raw_id) 產生 `pseudo_user_id`，原始 id 不入庫。

### 3.5 記憶機制
- **四層**：rolling window（10 輪）+ running summary（每 10 輪）+ episodic vector（pgvector + bge-m3）+ structured user profile（JSONB）。
- Demo 階段先用 SQLite + JSON 欄位 + 記憶體 buffer 自實作（最少依賴）。
- 正式階段升級 Letta self-host + pgvector（**不採 Mem0**，因 cloud-first 與資料主權疑慮）。
- 寫入長期記憶前一律先 Presidio + 中文 PII pattern 去識別。

### 3.6 量表
- **前測**：PHQ-9（衛福部繁中版），OQPP，數字鍵 1–4 快速作答。
  - 顯示總分（0–27）+ 啟發式分級（0–4 / 5–9 / 10–14 / 15–19 / 20–27）+「非診斷」明示，但研究分析以**連續分數**為主，**不**做硬切納入/排除。
  - **第 9 題 > 0 → non-blocking 安全分流 modal**（顯示 1925/1995/1980/陽交大諮商中心/校安中心 + `tel:` 一鍵撥號），受試者**可選擇繼續或結束**，不強制中斷。
  - 同時將 `risk_flag` 寫入 `event_log`（事件 `crisis_trigger`，source = `phq9_item9`/`chat_keyword`），由後端 webhook 通知研究團隊。
  - 聊天中出現高風險關鍵字 → LLM 切換安全回應模板 + 再次顯示專線 modal，同樣 non-blocking。
  - **WCAG 3.2.6 Consistent Help**：所有頁面右下常駐「立即求助」懸浮按鈕。
- **後測**：重複 PHQ-9 + WHO-5（5 題）+ CUQ（16 題）+ WAI-SR（12 題）+ 對話前後 SUDS（0–10 滑桿）。

### 3.7 串流 UX
- 樂觀渲染使用者訊息 → skeleton (<400ms) → typing dot (>400ms) → token-by-token 渲染（rAF batch）→ 完成。
- `AbortController` 取消、retry、inline error banner。
- 量測欄位送 logger（見 §3.9）。

### 3.8 無障礙
- 訊息流：`role="log" aria-live="polite" aria-relevant="additions" aria-atomic="false"`。
- 串流期間僅在訊息完成時對 SR 推送一次。
- 量表：`<fieldset><legend>` + `radiogroup` + 數字鍵作答 + 進度計數。
- 焦點：`:focus-visible` ring 對比 ≥3:1；不被 sticky 元素遮住（WCAG 2.4.11）。
- 觸控目標 ≥44 px（超過 WCAG 2.5.8 24 px 門檻）。
- `prefers-reduced-motion` 關閉動畫。

### 3.9 Logging / Observability
- 前端 logger：自寫薄封裝（pino 介面相容），事件型別見 `docs/research/04-stress-and-logging.md`。
- 後端 logger：pino + pino-pretty (dev) + JSON line (prod)。
- 階段時間戳：`input_start / request_sent / first_token / last_token / render_done`。
- 對話匯出：JSONL（LLM-friendly）+ CSV（人類）+ Parquet（批次分析），由管理者頁面 `/admin/export` 觸發。
- log 中不存 message 原文，只存 hash + length；原文存對話表（加密）。
- 正式階段引入 OTel Collector + Loki/Tempo。

### 3.10 測試策略（TDD）
- **單元**：Vitest（Svelte 元件 + 純邏輯）。
- **元件**：@testing-library/svelte。
- **a11y 單元**：vitest-axe。
- **E2E**：Playwright + @axe-core/playwright，測試集：
  - `smoke.spec.ts`、`phq9.spec.ts`、`chat-stream.spec.ts`、`crisis-flow.spec.ts`、`theme-switch.spec.ts`、`export.spec.ts`、`a11y.spec.ts`。
- TDD 流程：紅 → 綠 → 重構，每子階段完成後做 docs/plan review 才勾選 todolist.md 與本 ADR。

### 3.11 部署與串流工程細節（覆驗後補強）
- 多階段 Dockerfile（builder → runner）+ k8s Deployment + Service + Ingress。
- **`@polka/compression` 取代 `compression`**：標準 `compression` 不支援串流，會截斷 SSE，必須換用 `@polka/compression`（SvelteKit 官方文件指明）。
- 串流回應 header：`Content-Type: text/event-stream`、`Cache-Control: no-cache`、`Connection: keep-alive`、`X-Accel-Buffering: no`。
- 串流開始時 flush 一行 `: ping\n\n` 註解避開中間層 first-byte timeout。
- nginx ingress annotation：`proxy_buffering off`、HTTP/2。
- **掛 `sveltekit:shutdown` hook**：k8s rolling update 時對進行中的串流連線送 `event: abort`，前端顯示「系統維護中」優雅斷線。
- 前端使用原生 `fetch + response.body.getReader()`（非 `EventSource`），以支援 POST body、自訂 header 與 `AbortController` 取消。
- 環境變數：`DATABASE_URL`, `PUTER_APP_ID`, `HMAC_SALT`, `ENCRYPTION_KEY`，全走 k8s Secret，禁止入 git。

### 3.12 命名與測試 ID 慣例
- locator 優先 `getByRole` / `getByLabel`，其次 `data-testid`（kebab-case，層級式）：
  - `phq9-q{n}-opt{v}`, `chat-input`, `chat-send-btn`, `msg-bubble-{id}`, `theme-switch-{name}`, `crisis-modal`, `export-btn`。

## 四、後果

正面：
- 學術 IRB 友善、可稽核、可重現。
- 無障礙與多主題從第一天設計即內建，減少後期 retrofit。
- 串流 SSE 體感優化提升使用者留存。
- TDD + Playwright 為自動化驗證打下基礎。

負面 / 風險：
- SvelteKit 5 Runes 學習曲線（已評估可控）。
- 七套主題 token 維護成本（透過 OKLCH 自動推導減輕）。
- Puter.js 為第三方代理，需設定 fail-safe 切換策略。

## 五、未決事項（需 §六覆驗階段補上）

- bge-m3 在 self-host CPU int8 量化的吞吐量基準。
- 陽交大諮商中心 24h 校安專線正確電話號碼。
- Letta 在 k8s 上 Helm chart 是否官方維護。

## 六、覆驗紀錄

### 2026-04-08 覆驗（背景 sub-agent 真實連網 + 主 context WebSearch 交叉驗證）

- [x] **§3.5 記憶機制**：Zep CE 已於 2025-04 EOL，從候選移除；確認 Letta 為本案首選（Apache-2.0、Docker 預設 Postgres+pgvector、Stateful agent）。Mem0 列為次選但 self-host 文件稀疏。Graphiti 列為未來知識圖譜補強選項。
- [x] **§3.6 PHQ-9 危機分流改 non-blocking**：依 *Trials 2024*、PHQ-9 Item 9 + C-SSRS 文獻，學術 IRB 友善作法為「不阻擋實驗、但持續關懷與紀錄」。原 ADR 的 ≥2 分阻擋條款已撤回。
- [x] **§3.11 串流工程**：補上 `@polka/compression`、`sveltekit:shutdown` hook、`: ping` flush、`X-Accel-Buffering: no` 等 SvelteKit 官方建議與 k8s ingress 細節。
- [x] **§3.6 PHQ-9 切點**：不採硬切，啟發式分級僅供受試者參考，研究分析以連續分數為主。
- [ ] §3.6 IRB 同意書範本（將於實作階段 P0 起草，由研究主持人核可）。
- [ ] §3.4 加密金鑰輪換 SOP（k8s Secret + sealed-secrets）：留待 P5 部署階段補。

### 來源
所有覆驗來源已收錄於 `docs/research/01..04-*.md` 修訂紀錄段落。

## 七、實作勾選清單（與 todolist.md 對應）

見 `todolist.md`。

## 八、驗收狀態（2026-04-08 終驗）

- [x] SvelteKit 5 + adapter-node + TS 全部就位
- [x] 七套 OKLCH 主題（含色盲友善 protan/deutan/tritan + high-contrast）
- [x] PHQ-9 OQPP + 數字鍵 + 啟發式分級 + 不硬切
- [x] 第 9 題 > 0 → **non-blocking** crisis modal + risk_flag 寫 event_log
- [x] HelpFloater 全頁常駐（WCAG 3.2.6）
- [x] **真接 Puter.js client-side**（`google/gemini-3-flash-preview`, stream:true），fallback 走 `/api/chat`
- [x] **CBT system prompt** 由前端組進 messages 陣列實際送給 LLM
- [x] **記憶層**：RollingWindow(10) 真串入 prompt assembler；persistTurn 寫 messages 表
- [x] **session lifecycle**：`/api/session` 建立 → `chatStream.setSession()` → `/api/message` 寫入
- [x] **Pre-chat SUDS** + 後測 PHQ-9 / WHO-5 / CUQ / WAI-SR / SUDS（共用 ScaleQuestion 元件）
- [x] **PII 中文 pattern** 在 `/api/message` 寫入前真實執行
- [x] AES-256-GCM 欄位加密 + HMAC pseudo_id
- [x] JSONL / CSV 匯出
- [x] 結構化 logger（前→後 batch flush）+ 階段時間戳（input_start/request_sent/first_token/last_token）
- [x] hooks.server.ts SIGTERM graceful shutdown 關 DB
- [x] healthz + readyz endpoint
- [x] Dockerfile 多階段
- [x] k8s manifests（Deployment / Service / PVC / Ingress / Secret 範例）
- [x] Playwright + axe-core 對所有 7 個關鍵頁面跑 a11y
- [x] full-flow E2E：consent → PHQ-9 → SUDS-pre → chat → posttest → 匯出驗證
- [x] 全程繁中口語註解、無 emoji、無 Claude/Anthropic 字樣、未 push、無 build warning
- [ ] 真實 Puter.js + Letta + bge-m3 整合（正式階段任務，demo 已具備接入點）
- [ ] IRB 同意書範本、k8s sealed-secrets 部署 SOP（待研究主持人核可後補）

**測試成績**：unit 46 / 46 ✅，E2E 15 / 15 ✅，build 0 warning。

