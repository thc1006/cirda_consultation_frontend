<script lang="ts">
  // 對話前 SUDS：與後測 SUDS 對照，觀察單次對話介入的 state 變化
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let suds = $state(5);
  let pseudoId = $state<string | null>(null);
  let saving = $state(false);
  let saveError = $state<string | null>(null);

  onMount(() => {
    pseudoId = sessionStorage.getItem('cirda.pseudoId');
    if (!pseudoId) goto('/');
  });

  async function next() {
    saving = true;
    saveError = null;
    try {
      const res = await fetch('/api/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudoId,
          scale: 'SUDS',
          phase: 'pre',
          payload: { value: suds },
          score: suds
        })
      });
      if (!res.ok) throw new Error(`儲存失敗 (HTTP ${res.status})`);
      sessionStorage.setItem('cirda.suds.pre', String(suds));
      goto('/chat');
    } catch (err) {
      saveError = (err as Error).message + '，請稍後再試';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>對話前 — 主觀感受</title>
</svelte:head>

<section class="wrap">
  <h1>對話之前</h1>
  <p>請評估你「此刻」的整體不適或痛苦程度。0 是完全平靜，10 是極度痛苦。</p>

  <div class="card">
    <label for="suds-pre" class="sr-only">主觀痛苦指數（對話前）</label>
    <input
      id="suds-pre"
      type="range"
      min="0"
      max="10"
      step="1"
      bind:value={suds}
      data-testid="suds-pre-slider"
    />
    <div class="scale">
      <span>0</span>
      <strong data-testid="suds-pre-value">{suds}</strong>
      <span>10</span>
    </div>
  </div>

  <button
    type="button"
    class="primary"
    onclick={next}
    disabled={saving}
    data-testid="suds-pre-next"
  >
    {saving ? '送出中…' : '繼續，開始對話'}
  </button>

  {#if saveError}
    <p class="err" role="alert" data-testid="suds-pre-error">{saveError}</p>
  {/if}
</section>

<style>
  .wrap {
    max-width: 600px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem;
  }
  h1 {
    margin: 0 0 0.5rem;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    margin: 1.5rem 0;
  }
  input[type='range'] {
    width: 100%;
    height: 36px;
    accent-color: var(--accent);
  }
  .scale {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    color: var(--fg-muted);
  }
  .scale strong {
    font-size: 1.5rem;
    color: var(--fg);
  }
  .primary {
    background: var(--accent);
    color: var(--accent-fg);
    border: none;
    padding: 0.85rem 1.5rem;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    min-height: 48px;
    width: 100%;
  }
  .primary:disabled {
    opacity: 0.5;
  }
  .err {
    margin-top: 1rem;
    color: var(--danger);
    font-weight: 600;
    text-align: center;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
</style>
