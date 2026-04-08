# 研究筆記 04：陽交大壓力源、文化敏感詞、Logging Schema

> 紀錄日期：2026-04-08
> 來源：sub-agent #4 整理（URL 待背景覆驗 agent 補真實連結）。

## Part A：陽交大 / 台灣高教壓力實證

六大壓力源（與期中報告一致）：
1. 學業 / 研究進度（最大宗）
2. 未來規劃 / 生涯就業
3. 經濟問題
4. 人際 / 情感
5. 研究所 / 指導關係
6. 身心健康與情緒（睡眠、焦慮）

來源（待覆驗）：董氏基金會大學生憂鬱情緒調查、衛福部心理健康司年報、教育部學特司校安通報、張老師基金會 1980 服務統計、陽交大諮商中心年度報告。

**對 UI 的影響**：
- 量表前後可顯示六大壓力源 chip 讓使用者快速帶入對話脈絡。
- 文案強調「匿名、隨時可離開、不留真實姓名」（降低汙名顧慮）。

## 文化敏感詞彙清單（前端 highlight 用）

**柔性關懷詞**（觸發 chatbot 加強同理）：
厭世、擺爛、躺平、廢物、魯蛇、撐不下去、沒動力、空白、喘不過氣、壓力山大、睡不著、沒食慾、想逃、社恐、情緒勒索、延畢、被當、指導教授地獄

**高風險詞**（觸發危機分流，與 PHQ-9 第 9 題並列判斷）：
想死、自殺、自傷、活著沒意義、想消失、活不下去、不想活了、結束生命、跳樓、割腕

## Part B：前端 Logging Schema

### 階段時間戳
```
input_start         使用者開始打字
request_sent        前端送出請求
first_token         收到第一個 token
last_token          收到最後一個 token
render_done         畫面完成渲染
```

### Schema 欄位
```
event_id, session_id, pseudo_user_id (HMAC+salt),
trace_id, span_id, event_type, ts_iso, ts_monotonic_ms,
role (user|assistant|system),
message_id, parent_message_id,
content_redacted, content_len, content_lang,
model_name, model_version, prompt_tokens, completion_tokens,
latency_user_think_ms,    -- 上一條 assistant 完成 → 使用者送出
latency_request_ms,        -- 送出 → first_token
latency_stream_ms,         -- first_token → last_token
latency_render_ms,         -- last_token → render_done
total_latency_ms,
ua, viewport, device_type, theme, a11y_flags,
scale_name, scale_score, scale_items_json,
error_code, error_stack_hash,
app_version, build_sha
```

### 匯出格式
- 即時：JSONL（LLM-friendly + 串流追加）
- 匯出時並產出 CSV（人類/Excel）+ Parquet（批次分析）。

### 儲存位置
- Demo：SQLite（單檔，方便 backup 與刪除）
- 正式：Postgres + pgvector + Loki/Tempo（k8s self-host LGTM stack）

### PII 去識別
- 前端只送 `pseudo_user_id`（HMAC+salt），不送真實學號姓名。
- 後端寫入前用 Presidio + 中文 pattern 過濾 content。
- log 中不儲存原文 message body，只存 hash + length；原文加密存對話表。

## 修訂紀錄
- 2026-04-08 初版；URL 待覆驗 agent 補。
