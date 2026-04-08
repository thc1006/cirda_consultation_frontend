<script lang="ts">
  // 入口頁：知情同意 + 受試者代號輸入 → 進入前測 PHQ-9
  import { goto } from '$app/navigation';

  let rawId = $state('');
  let agreed = $state(false);
  let submitting = $state(false);
  let errorText = $state<string | null>(null);

  async function handleStart(e: SubmitEvent) {
    e.preventDefault();
    errorText = null;
    if (!rawId.trim()) {
      errorText = '請輸入受試者代號';
      return;
    }
    if (!agreed) {
      errorText = '請先勾選同意';
      return;
    }
    submitting = true;
    try {
      const res = await fetch('/api/participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawId })
      });
      if (!res.ok) throw new Error('註冊失敗');
      const data = await res.json();
      sessionStorage.setItem('cirda.pseudoId', data.pseudoId);
      goto('/scales/phq9');
    } catch (err) {
      errorText = (err as Error).message;
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>諮心好友 — 開始</title>
</svelte:head>

<section class="hero">
  <div class="hero-mark">
    <img
      src="/img/logo.png"
      alt="諮心好友 標誌：一隻小狐狸抱著一杯飲料"
      width="160"
      height="160"
    />
  </div>
  <h1>歡迎使用諮心好友</h1>
  <p class="lead">
    這是陽明交通大學教育研究所的研究專案，提供大學生與教職員生一個可以聊聊心情、理理思緒的空間。
  </p>
  <p class="lead">
    本工具不是醫療診斷或治療工具。若你正面臨立即的危險，請直接撥打畫面右下角的求助專線。
  </p>

  <form onsubmit={handleStart} aria-labelledby="start-title">
    <h2 id="start-title">開始之前</h2>

    <label for="raw-id">受試者代號</label>
    <input
      id="raw-id"
      type="text"
      autocomplete="off"
      bind:value={rawId}
      data-testid="raw-id-input"
      required
    />
    <p class="help">系統會以雜湊方式處理你的代號，原始值不會被儲存。</p>

    <label class="check">
      <input type="checkbox" bind:checked={agreed} data-testid="consent-check" />
      <span>
        我已閱讀並了解本工具非醫療診斷，且同意我所輸入的對話內容會被去識別化後保存供研究分析。
      </span>
    </label>

    {#if errorText}
      <p class="error" role="alert">{errorText}</p>
    {/if}

    <button
      type="submit"
      class="primary"
      disabled={submitting}
      data-testid="start-btn"
    >
      {submitting ? '建立中…' : '開始前測量表'}
    </button>
  </form>
</section>

<style>
  .hero {
    max-width: 720px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem 4rem;
    text-align: center;
  }
  .hero-mark {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }
  .hero-mark img {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: var(--surface);
    padding: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border);
  }
  h1 {
    font-size: 2rem;
    margin: 0 0 1rem;
  }
  .lead {
    text-align: left;
  }
  form {
    text-align: left;
  }
  .lead {
    font-size: 1.05rem;
    line-height: 1.75;
    color: var(--fg-muted);
    margin-bottom: 0.75rem;
  }
  form {
    margin-top: 2.5rem;
    background: var(--surface);
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid var(--border);
  }
  h2 {
    margin: 0 0 1rem;
    font-size: 1.15rem;
  }
  label {
    display: block;
    font-weight: 600;
    margin: 0.5rem 0 0.35rem;
  }
  input[type='text'] {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--fg);
    font-size: 1rem;
    min-height: 44px;
  }
  .help {
    font-size: 0.8rem;
    color: var(--fg-muted);
    margin: 0.25rem 0 0.75rem;
  }
  .check {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    font-weight: 400;
    margin: 1rem 0;
    line-height: 1.55;
  }
  .check input {
    margin-top: 0.25rem;
    width: 20px;
    height: 20px;
  }
  .primary {
    background: var(--accent);
    color: var(--accent-fg);
    border: none;
    padding: 0.85rem 1.5rem;
    border-radius: 10px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    min-height: 48px;
    width: 100%;
  }
  .primary:disabled {
    opacity: 0.6;
  }
  .error {
    color: var(--danger);
    font-weight: 600;
    margin: 0.5rem 0;
  }
</style>
