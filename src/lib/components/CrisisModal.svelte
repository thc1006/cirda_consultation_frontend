<script lang="ts">
  // Non-blocking 危機分流 modal：顯示後使用者可選擇繼續或結束實驗
  // 觸發來源：PHQ-9 第 9 題 > 0 或聊天中偵測到高風險關鍵字
  type Props = {
    open: boolean;
    source: 'phq9_item9' | 'chat_keyword';
    onContinue?: () => void;
    onExit?: () => void;
  };
  let { open = $bindable(false), source, onContinue, onExit }: Props = $props();

  function handleContinue() {
    open = false;
    onContinue?.();
  }
  function handleExit() {
    open = false;
    onExit?.();
  }
</script>

{#if open}
  <div
    class="backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="crisis-title"
    data-testid="crisis-modal"
  >
    <div class="card">
      <h2 id="crisis-title">我們注意到你可能正經歷辛苦的時刻</h2>
      <p>
        本工具不是醫療診斷工具。若你現在有強烈不適或危險的感受，請考慮尋求專業協助。
      </p>
      <ul>
        <li><a href="tel:1925">衛福部安心專線 1925（24h 免付費）</a></li>
        <li><a href="tel:1995">生命線 1995</a></li>
        <li><a href="tel:1980">張老師 1980</a></li>
        <li>
          陽明校區 健康心理中心
          <a href="tel:+886-2-2826-7000,62026">02-2826-7000 #62026</a>
        </li>
        <li>
          交大校區 健康心理中心
          <a href="tel:+886-3-5712121,51303">03-5712121 #51303</a>
        </li>
        <li>
          陽明校區 校安中心
          <a href="tel:+886-2-2826-1100">02-2826-1100（24h）</a>
        </li>
        <li>
          交大校區 校安中心
          <a href="tel:+886-3-5712121,31999">03-5712121 #31999（24h）</a>
        </li>
      </ul>

      <p class="hint">
        觸發來源：{source === 'phq9_item9' ? '量表第 9 題回應' : '對話中關鍵字'}
      </p>

      <div class="actions">
        <button
          type="button"
          class="btn btn-primary"
          data-testid="crisis-continue"
          onclick={handleContinue}
        >
          我了解，繼續進行
        </button>
        <button
          type="button"
          class="btn btn-ghost"
          data-testid="crisis-exit"
          onclick={handleExit}
        >
          結束本次活動
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: grid;
    place-items: center;
    z-index: 90;
    padding: 1rem;
  }
  .card {
    background: var(--surface);
    color: var(--fg);
    border-radius: 18px;
    padding: 1.75rem;
    max-width: 480px;
    width: 100%;
    border: 2px solid var(--border);
  }
  h2 {
    margin: 0 0 0.75rem;
    font-size: 1.2rem;
  }
  ul {
    margin: 0.75rem 0;
    padding-left: 1.2rem;
    line-height: 1.7;
  }
  a {
    color: var(--accent);
    font-weight: 600;
  }
  .hint {
    font-size: 0.8rem;
    color: var(--fg-muted);
    margin-top: 0.75rem;
  }
  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.25rem;
    flex-wrap: wrap;
  }
  .btn {
    min-height: 44px;
    padding: 0.6rem 1.1rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    border: 2px solid transparent;
  }
  .btn-primary {
    background: var(--accent);
    color: var(--accent-fg);
  }
  .btn-ghost {
    background: transparent;
    color: var(--fg);
    border-color: var(--border);
  }
</style>
