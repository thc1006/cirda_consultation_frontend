# 研究筆記 03：LLM 對話記憶機制（本專案決策版）

> 紀錄日期：2026-04-08
> 來源：主 context WebSearch 驗證 + sub-agent #3 整理（**已修正其 Mem0 self-host 推薦的誤判**）。

## 1. 分層架構

四層：
1. **Short-term rolling window**：記憶體內最近 10 輪 user/assistant 訊息，直接塞 prompt。
2. **Mid-term running summary**：每 10 輪由 `gemini-3-flash-preview` 摘要一次，存 SQLite `session_summary`。
3. **Long-term episodic store**：壓力事件片段經 PII 去識別後，bge-m3 embedding 存 pgvector，retrieval top-k=3。
4. **Structured user profile**：JSONB 欄位（壓力源 tag、PHQ-9 基線、已嘗試策略），由 fact extractor 非同步更新。

## 2. 框架選型（**已修正 sub-agent 原建議**）

主 context 覆驗顯示，**Mem0 是 cloud-first SaaS、self-host 受限且有資料主權疑慮**，不適合學術 IRB 與台灣個資法情境。修正後：

| 框架 | self-host 完整度 | 授權 | 適用場景 |
|---|---|---|---|
| **Letta (MemGPT)** | ✅ 完整可 self-host（Docker 預設 Postgres+pgvector） | Apache-2.0 | 高自治、stateful agent、本案首選 |
| ~~Zep Community Edition~~ | ❌ **2025-04 官方宣告 EOL**，火力轉 Graphiti | — | 不採用 |
| **LangGraph store** | ✅ 完全本地（library, PostgresStore + pgvector） | MIT | 最小依賴、最快落地 |
| **Mem0 OSS** | ⚠️ self-host 文件稀疏、節奏偏 SaaS | Apache-2.0 | 次選 |
| **Graphiti（替代 Zep）** | ✅ self-host 知識圖引擎 | Apache-2.0 | 未來補強用，非主力 |

**本專案決策**：
- **Demo 階段**：採 **LangGraph 風格 store + SQLite + JSONB 欄位**自寫最小實作（依賴最少、完全本地）。
- **正式階段**：升級為 **Letta self-host + pgvector**，理由：完整 self-host、Apache-2.0、可持久化 agent state、與 IRB 資料留存政策容易對齊。

**權威來源**（主 context WebSearch 已驗證）：
- Letta vs Mem0 vs Zep vs Cognee 社群比較：https://forum.letta.com/t/agent-memory-letta-vs-mem0-vs-zep-vs-cognee/88
- Picking Between Letta, Mem0 & Zep（Medium 2025）：https://medium.com/asymptotic-spaghetti-integration/from-beta-to-battle-tested-picking-between-letta-mem0-zep-for-ai-memory-6850ca8703d1
- Survey of AI Agent Memory Frameworks：https://www.graphlit.com/blog/survey-of-ai-agent-memory-frameworks
- 5 AI Agent Memory Systems Compared 2026：https://dev.to/varun_pratapbhardwaj_b13/5-ai-agent-memory-systems-compared-mem0-zep-letta-supermemory-superlocalmemory-2026-benchmark-59p3
- Best AI Agent Memory Frameworks 2026：https://atlan.com/know/best-ai-agent-memory-frameworks-2026/
- Mem0 vs Zep vs Letta — HydraDB：https://hydradb.com/blog/mem0-vs-zep-vs-letta

## 3. 中文 embedding 與向量庫

- Embedding：**BAAI/bge-m3**（dense，8192 token，繁中表現穩定）。CPU int8 量化即可，本機 GPU 更快。
- 向量庫：**pgvector**（與對話/量表共用 Postgres，backup 與 GDPR/個資法刪除單一資料源）。

## 4. 個資與安全（學術 IRB 必備）

- 寫入長期記憶前以 **Microsoft Presidio + 自訂中文 pattern**（學號、系所、email、台灣手機）做 PII 去識別。
- DB 欄位級加密（pgcrypto），TLS in-transit。
- Retention policy：實驗結束 +180 天硬刪。
- 受試者操作介面：「匯出我的資料」、「刪除我的資料」按鈕。
- 寫入 `memory_audit_log`（who/when/why）以利稽核。

## 5. Demo 階段最小實作

```
prompt = system_prompt
       + retrieved_episodic[:3]   # pgvector top-k
       + user_profile_summary      # JSONB 摘要
       + running_summary           # 上一次摘要
       + recent_window[-10:]       # 最近 10 輪
       + current_user_message
```

## 修訂紀錄
- 2026-04-08 初版：Mem0 改判為「不建議」，正式階段改採 Letta self-host。
- 2026-04-08 r2：覆驗 sub-agent 帶回 Zep CE 已 EOL（2025-04 官方公告），整段移除 Zep CE 並補上 Graphiti 為未來補強選項。Letta 建議理由補上「Docker 預設 Postgres+pgvector」這項與本案儲存層直接吻合的關鍵點。
