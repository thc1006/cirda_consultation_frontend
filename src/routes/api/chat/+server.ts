// 後備聊天端點：當瀏覽器端的 Puter.js 不可用時（測試環境、離線情境）走這條
// 真正生產時主路徑為前端 puter.ai.chat 直連；本端點同時也作為「未來自家 LLM」的接入點
//
// 設計：
//  1. 接收 messages = [system, ...history, user]
//  2. 對最後一句 user 做 PII 去識別（避免落地原文）
//  3. 用規則式回覆（demo 用，未來可串自家模型）
//  4. 以 ReadableStream + 切字模擬串流，flush 一行 ping 註解避開中介層 buffer
import type { RequestHandler } from './$types';
import { detectRisk } from '$lib/utils/riskKeywords';
import { scrubPii } from '$lib/server/pii';
import { CBT_SYSTEM_PROMPT } from '$lib/prompts/cbt';

function craftReply(lastUser: string): string {
  const risk = detectRisk(lastUser);
  if (risk === 'high') {
    return '我感覺到你現在非常痛苦，這已經超過我能幫忙的範圍。請考慮撥打 1925 安心專線、或聯絡學校諮商中心，可以嗎？';
  }
  if (risk === 'soft') {
    return '聽起來你最近真的很辛苦。可以跟我多說一點是什麼事讓你有這樣的感覺嗎？';
  }
  // 簡單規則式：偵測使用者話題並回應
  if (/(課業|報告|作業|考試|被當)/.test(lastUser)) {
    return '聽起來課業壓力滿大的。當你想到報告/考試的時候，第一個冒出來的念頭通常是什麼？';
  }
  if (/(指導教授|論文|研究)/.test(lastUser)) {
    return '研究的事情常常壓得人喘不過氣。最近和指導教授的互動，有沒有讓你感覺特別卡的地方？';
  }
  return '嗯，我聽到了。可以多說一點當下發生了什麼，還有那時候的感受嗎？';
}

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const messages: { role: string; content: string }[] = body?.messages ?? [];
  const lastUserRaw = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const { redacted: lastUserSafe } = scrubPii(lastUserRaw);

  // CBT_SYSTEM_PROMPT 雖在 demo 後備路徑沒實際 fed 給 LLM，但保留 import
  // 是為了與真實路徑（前端 Puter.js）共用同一份角色設定，避免雙份維護
  void CBT_SYSTEM_PROMPT;

  const reply = craftReply(lastUserSafe);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      // 先 flush 一段空 chunk 讓 ingress / proxy 不要等 buffer 滿
      controller.enqueue(enc.encode(''));
      const chars = Array.from(reply);
      for (const ch of chars) {
        controller.enqueue(enc.encode(ch));
        await new Promise((r) => setTimeout(r, 16));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive'
    }
  });
};
