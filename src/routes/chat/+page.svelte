<script lang="ts">
  // 主要聊天頁：
  //  - 進入時建立 session（拿 sessionId）
  //  - 串流訊息流（chatStream store 內走 Puter.js 主路徑或 /api/chat 備援）
  //  - 高風險關鍵字偵測 → non-blocking crisis modal + risk_flag
  //  - 使用者送出至少 1 輪後可結束並進入後測 SUDS
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { chatStream } from '$lib/stores/chatStream.svelte';
  import { detectRisk } from '$lib/utils/riskKeywords';
  import MessageList from '$lib/components/MessageList.svelte';
  import CrisisModal from '$lib/components/CrisisModal.svelte';

  let input = $state('');
  let showCrisis = $state(false);
  let pseudoId = $state<string | null>(null);
  let initError = $state<string | null>(null);
  let sessionReady = $state(false);

  onMount(async () => {
    pseudoId = sessionStorage.getItem('cirda.pseudoId');
    if (!pseudoId) {
      goto('/');
      return;
    }
    chatStream.reset();
    try {
      const r = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudoId, module: 'cbt' })
      });
      if (!r.ok) throw new Error('建立 session 失敗');
      const data = await r.json();
      chatStream.setSession(data.sessionId, pseudoId);
      sessionReady = true;
    } catch (err) {
      initError = (err as Error).message;
    }
  });

  onDestroy(() => {
    chatStream.abort();
  });

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  async function submit() {
    const text = input.trim();
    if (!text || chatStream.status === 'streaming' || chatStream.status === 'submitting') return;

    const risk = detectRisk(text);
    if (risk === 'high') {
      showCrisis = true;
      void fetch('/api/risk-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudoId,
          sessionId: chatStream.sessionId,
          source: 'chat_keyword',
          text
        })
      });
    }

    input = '';
    await chatStream.send(text);
  }

  function endChat() {
    goto('/scales/posttest');
  }

  // 至少完成一輪才能結束
  let userTurns = $derived(chatStream.messages.filter((m) => m.role === 'user').length);
</script>

<svelte:head>
  <title>諮心好友 — 對話</title>
</svelte:head>

<section class="chat">
  <header class="bar">
    <div>
      <h1>諮心好友</h1>
      <p class="sub">你可以慢慢說，想到什麼說什麼。沒有對錯。</p>
    </div>
    <button
      type="button"
      class="end"
      onclick={endChat}
      data-testid="end-chat-btn"
      disabled={userTurns < 1}
    >
      結束並進入後測
    </button>
  </header>

  {#if initError}
    <p class="err" role="alert">無法建立對話：{initError}</p>
  {/if}

  {#if chatStream.messages.length === 0}
    <div class="empty">
      <p>嗨，今天想聊聊什麼？學業、研究、感情、家裡的事都可以慢慢說。</p>
      <p class="hint">第一次回覆可能要等幾秒，這是模型生成回應的時間。</p>
    </div>
  {/if}

  <MessageList
    messages={chatStream.messages}
    streaming={chatStream.status === 'streaming' || chatStream.status === 'submitting'}
  />

  {#if chatStream.errorText}
    <div class="err" role="alert" data-testid="chat-error">
      連線出現問題：{chatStream.errorText}
    </div>
  {/if}

  <form
    class="composer"
    data-chat-status={chatStream.status}
    data-testid="chat-form"
    onsubmit={(e) => {
      e.preventDefault();
      submit();
    }}
  >
    <label for="chat-input" class="sr-only">輸入訊息</label>
    <textarea
      id="chat-input"
      data-testid="chat-input"
      bind:value={input}
      placeholder={sessionReady ? '輸入訊息，按 Enter 送出，Shift+Enter 換行' : '正在建立對話…'}
      rows="2"
      disabled={!sessionReady}
      onkeydown={handleKey}
    ></textarea>
    <button
      type="submit"
      class="send"
      data-testid="chat-send-btn"
      disabled={!sessionReady || !input.trim() || chatStream.status === 'streaming' || chatStream.status === 'submitting'}
    >
      送出
    </button>
  </form>
</section>

<CrisisModal bind:open={showCrisis} source="chat_keyword" />

<style>
  .chat {
    max-width: 820px;
    margin: 0 auto;
    padding: 1.25rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px);
  }
  .bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border);
  }
  h1 {
    margin: 0;
    font-size: 1.25rem;
  }
  .sub {
    margin: 0.25rem 0 0;
    color: var(--fg-muted);
    font-size: 0.85rem;
  }
  .end {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--fg);
    border-radius: 10px;
    padding: 0.55rem 0.9rem;
    cursor: pointer;
    min-height: 44px;
  }
  .end:disabled {
    opacity: 0.5;
  }
  .empty {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--fg-muted);
  }
  .hint {
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
  .err {
    background: var(--surface);
    border: 1px solid var(--danger);
    color: var(--danger);
    padding: 0.6rem 1rem;
    border-radius: 10px;
    margin: 0.5rem 1rem;
  }
  .composer {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem 0;
    border-top: 1px solid var(--border);
  }
  textarea {
    flex: 1;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
    font-size: 1rem;
    background: var(--surface);
    color: var(--fg);
    resize: none;
    min-height: 48px;
  }
  .send {
    background: var(--accent);
    color: var(--accent-fg);
    border: none;
    padding: 0 1.25rem;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    min-height: 48px;
    min-width: 80px;
  }
  .send:disabled {
    opacity: 0.5;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
</style>
