<script lang="ts">
  import type { ChatMessage } from '$lib/stores/chatStream.svelte';
  type Props = { messages: ChatMessage[]; streaming: boolean };
  let { messages, streaming }: Props = $props();
</script>

<div
  class="log"
  role="log"
  aria-live="polite"
  aria-relevant="additions"
  aria-atomic="false"
  aria-label="對話紀錄"
  data-testid="message-list"
>
  {#each messages as m (m.id)}
    <div class="row {m.role}" data-testid="msg-bubble-{m.id}">
      {#if m.role === 'assistant'}
        <img class="avatar" src="/img/logo.png" alt="" width="36" height="36" />
      {/if}
      <div class="bubble">
        {#if m.content}
          {m.content}
        {:else if streaming && m.role === 'assistant'}
          <span class="dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
          <span class="sr-only">諮心好友正在輸入中</span>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .log {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
  }
  .row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
  }
  .row.user {
    justify-content: flex-end;
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--surface);
    box-shadow: 0 0 0 1px var(--border);
    flex-shrink: 0;
    align-self: flex-start;
  }
  .bubble {
    max-width: 80%;
    padding: 0.75rem 1rem;
    border-radius: 18px;
    line-height: 1.55;
    background: var(--surface);
    color: var(--fg);
    border: 1px solid var(--border);
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .row.user .bubble {
    background: var(--accent);
    color: var(--accent-fg);
    border-color: transparent;
  }
  .dots {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }
  .dots span {
    width: 6px;
    height: 6px;
    background: var(--fg-muted);
    border-radius: 50%;
    animation: bounce 1.2s infinite ease-in-out;
  }
  .dots span:nth-child(2) {
    animation-delay: 0.15s;
  }
  .dots span:nth-child(3) {
    animation-delay: 0.3s;
  }
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0.6);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
</style>
