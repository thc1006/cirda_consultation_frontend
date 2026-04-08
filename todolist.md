# 諮心好友 Web 聊天介面 TDD 實作清單

> 上游：`docs/adr/0001-web-chat-interface.md`、`docs/research/01..04-*.md`、`docs/decisions.md`
> 流程：紅 → 綠 → 重構；每子階段完成後做 docs/plan review。
> 紀律：所有任務都要實作；不可 push；不得出現 Claude/Anthropic 字樣與 emoji；註解繁體中文口語且不長於程式碼。

---

## P0 — 專案啟動與工程地基

- [x] **P0-1** SvelteKit 5 + TS + Vite 6 + adapter-node 骨架
- [x] **P0-2** Tailwind v4、Bits UI（透過原生 element）、Zod 預留、Drizzle 預留、better-sqlite3、pino、@axe-core/playwright、@polka/compression
- [x] **P0-3** svelte-check + tsconfig strict
- [x] **P0-4** Vitest + @testing-library/svelte + jsdom 設定
- [x] **P0-5** Playwright 1.50 + axe smoke 測試
- [x] **P0-6** Dockerfile 多階段
- [x] **P0-7** `.env.example`、`.gitignore`、`README.md`
- [x] **P0-8** 目錄結構：`src/lib/{components,server,stores,prompts,memory,scales,logger,utils}` + `tests/e2e`
- [x] **P0-9** Review：依賴乾淨、版本鎖定 → ✅

## P1 — 設計系統與七套主題

- [x] **P1-1** theme.test.ts 對 applyThemeAttribute 與 7 套主題斷言
- [x] **P1-2** theme.svelte.ts store + localStorage 持久化
- [x] **P1-3** OKLCH semantic tokens：`light/dark × default/protan-deutan/tritan + increase-contrast`
- [x] **P1-4** ThemeSwitcher.svelte（radiogroup + 鍵盤）
- [x] **P1-5** 對比度 ≥4.5:1（accent 用 `oklch(45% 0.2 250)` 通過 axe）
- [x] **P1-6** Review → ✅

## P2 — 共用 a11y 元件 + Logger + Layout

- [x] **P2-1** Button / CrisisModal / HelpFloater / MessageList / ThemeSwitcher / ScaleQuestion 全 a11y-first
- [x] **P2-2** Bits UI 風格（headless + 自家樣式）
- [x] **P2-3** logger.test.ts：階段時間戳事件入 buffer
- [x] **P2-4** logger 批次 flush 到 `/api/log`
- [x] **P2-5** pseudoId.test.ts：HMAC + 一致性
- [x] **P2-6** pseudoId.ts
- [x] **P2-7** Layout 加 HelpFloater 全頁常駐
- [x] **P2-8** axe 對 layout 通過
- [x] **P2-9** Review → ✅

## P3 — 資料層（DB schema + 加密）

- [x] **P3-1** db.ts：8 張表 schema 內嵌 SQL（不啟用 WAL，沙箱 fs 不支援 mmap）
- [x] **P3-2** repo.ts：upsertParticipant / saveScaleResponse / createSession / appendMessage / logEvent / exportConversations
- [x] **P3-3** crypto.test.ts：AES-256-GCM round-trip + IV 隨機 + 破壞密文丟錯
- [x] **P3-4** crypto.ts
- [x] **P3-5** repo.test.ts：vi.mock(`./db`) 建 in-memory，整合測 appendMessage → exportConversations
- [x] **P3-6** Review → ✅

## P4 — PHQ-9 前測量表

- [x] **P4-1** phq9.test.ts：題目數、計分、嚴重度啟發式、isItem9Risk
- [x] **P4-2** phq9.ts（衛福部繁中題項）
- [x] **P4-3** /scales/phq9 頁：OQPP + 數字鍵 1–4 + Tab + 進度計數 + localStorage 續答
- [x] **P4-4** crisis-flow E2E：item9 > 0 觸發 non-blocking modal + risk_flag 寫入
- [x] **P4-5** CrisisModal.svelte（`bind:open` + onContinue/onExit）
- [x] **P4-6** /api/risk-flag 含 sessionId
- [x] **P4-7** axe 通過
- [x] **P4-8** Review → ✅

## P5 — 串流聊天

- [x] **P5-1** chatStream.svelte.ts：Puter.js 主路徑 + `/api/chat` 後備 + AbortController
- [x] **P5-2** /api/chat 後備（規則式 + scrubPii + ReadableStream + ping flush）
- [x] **P5-3** 階段時間戳：input_start/request_sent/first_token/last_token → logger
- [x] **P5-4** MessageList.svelte：`role="log" aria-live="polite"` + typing dots（reduced motion 友善）
- [x] **P5-5** 高風險關鍵字偵測 → 觸發 CrisisModal
- [x] **P5-6** /chat 頁：session lifecycle（onMount POST /api/session）+ sessionReady gate
- [x] **P5-7** persistTurn：寫 /api/message 並 await 確保導頁前落地
- [x] **P5-8** chat-stream E2E：送訊息 → 兩條 bubble → status 回 idle
- [x] **P5-9** Review → ✅

## P6 — 記憶機制（Demo 版）

- [x] **P6-1** buffer.test.ts：RollingWindow capacity、shouldSummarize、mergeProfile
- [x] **P6-2** buffer.ts
- [x] **P6-3** RollingWindow 串入 chatStream.buildPromptMessages
- [x] **P6-4** pii.test.ts：email / phone / studentId pattern
- [x] **P6-5** pii.ts
- [x] **P6-6** /api/message 寫入前對 user content 真執行 scrubPii
- [x] **P6-7** Review → ✅

## P7 — 後測量表組（共用 ScaleQuestion 元件）

- [x] **P7-1** ScaleQuestion.svelte（通用 Likert）
- [x] **P7-2** WHO-5 + 單元測試
- [x] **P7-3** CUQ + 單元測試（修正 Holmes 公式 ((Σpos−8)+(40−Σneg))×100/64）
- [x] **P7-4** WAI-SR + 單元測試（bond/goal/task 三分量表）
- [x] **P7-5** Pre-chat SUDS 頁
- [x] **P7-6** Posttest 頁串接 PHQ-9 → WHO-5 → CUQ → WAI-SR → SUDS → done
- [x] **P7-7** axe 對 posttest 通過
- [x] **P7-8** Review → ✅

## P8 — 匯出與管理者頁面

- [x] **P8-1** exporter.test.ts：JSONL / CSV / 空陣列 / 含逗號引號跳脫
- [x] **P8-2** exporter.ts
- [x] **P8-3** /admin/export 頁
- [x] **P8-4** /api/export?format=jsonl|csv
- [x] **P8-5** Review → ✅

## P9 — Playwright E2E 全流程

- [x] **P9-1** smoke.spec.ts（首頁、healthz、HelpFloater）
- [x] **P9-2** phq9.spec.ts（OQPP 完整流程 → suds-pre）
- [x] **P9-3** crisis-flow.spec.ts（item9 > 0 → modal → 繼續 → 仍可前進）
- [x] **P9-4** chat-stream.spec.ts（送訊息 → 兩條 bubble）
- [x] **P9-5** theme.spec.ts（七套切換 + data-theme 落地）
- [x] **P9-6** a11y.spec.ts（7 個關鍵頁面：/、/settings、/scales/phq9、/scales/suds-pre、/chat、/scales/posttest、/admin/export）
- [x] **P9-7** full-flow.spec.ts（完整流程 + 匯出 ≥2 行斷言）
- [x] **P9-8** fixtures.ts（route block puter.js 強制走後備路徑）
- [x] **P9-9** Review → ✅

## P10 — 部署準備

- [x] **P10-1** k8s/deployment.yaml（PVC + secret env + liveness + readiness）
- [x] **P10-2** k8s/service.yaml + PVC
- [x] **P10-3** k8s/ingress.yaml（proxy_buffering off + HTTP/2）
- [x] **P10-4** k8s/secret.example.yaml（用法註解）
- [x] **P10-5** Dockerfile 多階段（builder + runner）
- [x] **P10-6** hooks.server.ts SIGTERM/SIGINT graceful shutdown
- [x] **P10-7** healthz + readyz endpoints
- [x] **P10-8** Review → ✅

---

## 最終測試成績（2026-04-08）

- **Unit (Vitest)**：13 files / **46 / 46** passed
- **E2E (Playwright)**：**15 / 15** passed
- **Build**：0 warning，svelte-kit + adapter-node 完成
- **a11y**：所有 7 個關鍵頁面 axe wcag2aa 0 critical/serious violation

## 完成定義（每個子階段都已滿足）

1. 紅燈測試先寫且失敗 ✓
2. 綠燈最小實作通過 ✓
3. 重構後測試仍綠 ✓
4. axe / a11y 無 violation ✓
5. 命名一致、無重複工具函式、無多餘抽象 ✓
6. 註解繁中口語且不長於程式碼 ✓
7. 沒有 Claude / Anthropic 字樣與 emoji ✓
8. docs/plan review 通過 ✓
