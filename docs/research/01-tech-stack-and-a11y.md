# 研究筆記 01：前端技術棧、串流 UX、WCAG 2.2、Playwright a11y

> 紀錄日期：2026-04-08
> 來源：主 context 親自 WebSearch 驗證 + sub-agent 整理（已標註）。
> 本筆記是 ADR-0001 的上游證據，後續若有覆驗結果與此衝突會在文末「修訂紀錄」追加。

## 1. 技術棧候選比較

| 項目 | SvelteKit 5 (Runes) | Next.js 15 | Nuxt 4 | Remix / RR v7 |
|---|---|---|---|---|
| 串流 | `+server.ts` 原生 ReadableStream/SSE，`adapter-node` 完整支援 | RSC + Route Handler | h3/Nitro | loader/action |
| Bundle | 最小 (~15KB runtime) | 較大（React + RSC 心智負擔） | 中 | 中 |
| a11y 預設 | 編譯期 a11y 警告 | 需 eslint-plugin-jsx-a11y | 手動 | 同 React |
| Playwright | 官方範本 | 官方範本 | 官方範本 | 官方範本 |
| k8s | adapter-node + Dockerfile | standalone | node preset | node server |

**結論**：對「聊天串流 + a11y + 小團隊 demo + k8s」綜合評估採 **SvelteKit 5 + adapter-node + Vite 6**。
- 串流 SSE 在 SvelteKit + adapter-node 已被多個社群案例驗證可行（見來源）。
- Svelte 編譯期 a11y 警告比 React 生態的 lint 規則更早攔截錯誤。
- 與 open-webui 同為 Svelte 系生態，未來抽元件成本低。

**權威來源**（主 context WebSearch 已驗證）：
- SvelteKit Node Server 文件：https://svelte.dev/docs/kit/adapter-node
- SvelteKit Streaming 公告：https://svelte.dev/blog/streaming-snapshots-sveltekit
- SvelteKit SSE issue 討論：https://github.com/sveltejs/kit/issues/887
- sveltekit-sse 套件：https://github.com/razshare/sveltekit-sse
- Building Real-time SvelteKit Apps with SSE：https://sveltetalk.com/posts/building-real-time-sveltekit-apps-with-server-sent-events

## 2. WCAG 2.2 AA 新增準則（必須符合）

- **2.4.11 Focus Not Obscured (Minimum)**：鍵盤焦點元件至少要部分可見，不能被 sticky header / footer 完全遮住。
- **2.5.8 Target Size (Minimum)**：互動目標 ≥24×24 px（對應 PHQ-9 選項按鈕）。本專案統一用 ≥44 px 直接超過。
- **3.3.8 Accessible Authentication**：本專案目前不做密碼登入，僅用受試者代號，不受影響。
- **聊天訊息流**：採 `role="log" aria-live="polite" aria-relevant="additions"`，串流期間僅在訊息「完成」時推一次更新，避免逐 token 唸出。
- **量表**：每題 `<fieldset><legend>` + `radiogroup`，方向鍵切換，數字鍵 1–4 快速作答。
- **`prefers-reduced-motion`**：關閉 typing 動畫、改靜態 dot。

**權威來源**（主 context WebSearch 已驗證）：
- WCAG 2.2 全文：https://www.w3.org/TR/WCAG22/
- 2.4.11 Focus Not Obscured：https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum
- W3C What's New in 2.2：https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- Deque WCAG 2.2 Resources：https://dequeuniversity.com/resources/wcag-2.2/
- Vispero New Success Criteria in WCAG22：https://vispero.com/resources/new-success-criteria-in-wcag22/

## 3. 色盲友善主題系統

- 七套 token set：light-default / light-protan-deutan / light-tritan / dark-default / dark-protan-deutan / dark-tritan / increase-contrast。
- 統一 semantic token：`--fg`, `--bg`, `--surface`, `--accent`, `--success`, `--danger`, `--warn`, `--info`, `--focus-ring`。
- 不單獨用紅綠承載語意，輔以 icon + 文字。
- 以 OKLCH 產色，保證跨主題感知亮度一致。
- 切換用 `[data-theme="..."]` + CSS Custom Properties，無需重新 hydrate。

參考：GitHub Primer Primitives、Atlassian Design Color、NN/g Color Blindness 文章（待覆驗 sub-agent 補真實 URL）。

## 4. 串流 LLM 回應 UX

- 顯示順序：使用者送出 → 即時 echo（樂觀渲染）→ <400ms 顯示 skeleton →>400ms 顯示 typing dot → 收到 first token → token-by-token 渲染（rAF batch）→ 完成。
- 必備：`AbortController` 取消、retry、inline error banner（不清空已渲染文字）。
- 量測欄位（送 logger）：`latency_user_think_ms`, `latency_first_token_ms`, `latency_stream_ms`, `tokens_per_sec`。

## 5. Playwright + a11y 自動化

- locator 優先序：`getByRole` > `getByLabel` > `data-testid`。
- 命名慣例：`data-testid="phq9-q{n}-opt{v}"`, `chat-input`, `chat-send-btn`, `msg-bubble-{id}`, `theme-switch-{name}`。
- 每個關鍵頁面跑 `@axe-core/playwright` 的 `AxeBuilder().withTags(['wcag22aa'])`，失敗即斷言。
- E2E 場景：smoke / phq9 / chat-stream / theme-switch / export / a11y。

## 修訂紀錄
- 2026-04-08 初版。等待背景 sub-agent (id ad3fd21f30a7fc02a) 帶回真實 URL 覆驗後再追補。
