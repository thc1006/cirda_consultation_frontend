<script lang="ts">
  // 前測 PHQ-9：one question per page，數字鍵 1~4 快速作答，第 9 題 > 0 觸發 non-blocking 危機 modal
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { PHQ9_QUESTIONS, PHQ9_OPTIONS, scorePhq9, severityHint, isItem9Risk } from '$lib/scales/phq9';
  import CrisisModal from '$lib/components/CrisisModal.svelte';

  let idx = $state(0);
  let answers = $state<number[]>(Array(9).fill(-1));
  let showCrisis = $state(false);
  let pseudoId = $state<string | null>(null);

  onMount(() => {
    pseudoId = sessionStorage.getItem('cirda.pseudoId');
    if (!pseudoId) {
      goto('/');
      return;
    }
    // 還原暫存
    const saved = localStorage.getItem('cirda.phq9');
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        if (Array.isArray(obj.answers)) answers = obj.answers;
        if (typeof obj.idx === 'number') idx = obj.idx;
      } catch {}
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function onKey(e: KeyboardEvent) {
    if (e.key >= '1' && e.key <= '4') {
      pick(parseInt(e.key, 10) - 1);
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      idx--;
    } else if (e.key === 'ArrowRight' && answers[idx] !== -1 && idx < 8) {
      idx++;
    }
  }

  function pick(v: number) {
    answers[idx] = v;
    persist();
    if (idx === 8 && isItem9Risk(answers)) {
      showCrisis = true;
      // non-blocking：仍然允許進入下一步，並寫入 risk_flag
      void fetch('/api/risk-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudoId, source: 'phq9_item9', score: answers[8] })
      });
    }
  }

  function persist() {
    localStorage.setItem('cirda.phq9', JSON.stringify({ answers, idx }));
  }

  async function finish() {
    const score = scorePhq9(answers);
    await fetch('/api/scale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudoId, scale: 'PHQ-9', phase: 'pre', payload: answers, score })
    });
    sessionStorage.setItem('cirda.phq9.score', String(score));
    localStorage.removeItem('cirda.phq9');
    goto('/scales/suds-pre');
  }

  let allAnswered = $derived(answers.every((v) => v !== -1));
  let total = $derived(allAnswered ? scorePhq9(answers) : 0);
</script>

<svelte:head>
  <title>前測量表 PHQ-9</title>
</svelte:head>

<section class="wrap">
  <header>
    <h1>前測量表</h1>
    <p>請依過去兩週的整體感受作答。每題只有一個答案。</p>
    <div class="progress" aria-label="作答進度">
      第 <strong>{idx + 1}</strong> 題 / 共 <strong>9</strong> 題
    </div>
  </header>

  <fieldset class="card" data-testid="phq9-card">
    <legend>過去兩週，你有多常被以下問題困擾？</legend>
    <p class="qtext" data-testid="phq9-question">{PHQ9_QUESTIONS[idx]}</p>

    <div role="radiogroup" aria-labelledby="phq9-question" class="opts">
      {#each PHQ9_OPTIONS as opt}
        <label class="opt" data-testid="phq9-q{idx}-opt{opt.value}">
          <input
            type="radio"
            name="q{idx}"
            value={opt.value}
            checked={answers[idx] === opt.value}
            onchange={() => pick(opt.value)}
          />
          <span class="key">{opt.value + 1}</span>
          <span>{opt.label}</span>
        </label>
      {/each}
    </div>

    <p class="hint">小提示：你可以用鍵盤的 1~4 鍵直接選擇。</p>

    <div class="nav">
      <button
        type="button"
        class="ghost"
        disabled={idx === 0}
        onclick={() => idx--}
        data-testid="phq9-prev"
      >
        上一題
      </button>
      {#if idx < 8}
        <button
          type="button"
          class="primary"
          disabled={answers[idx] === -1}
          onclick={() => idx++}
          data-testid="phq9-next"
        >
          下一題
        </button>
      {:else}
        <button
          type="button"
          class="primary"
          disabled={!allAnswered}
          onclick={finish}
          data-testid="phq9-submit"
        >
          完成前測
        </button>
      {/if}
    </div>
  </fieldset>

  {#if allAnswered}
    <p class="total" data-testid="phq9-total">
      目前總分：{total} 分（{severityHint(total)}，僅供自我覺察參考，非診斷）
    </p>
  {/if}
</section>

<CrisisModal bind:open={showCrisis} source="phq9_item9" />

<style>
  .wrap {
    max-width: 720px;
    margin: 0 auto;
    padding: 2rem 1.25rem 4rem;
  }
  h1 {
    margin: 0 0 0.5rem;
  }
  .progress {
    margin-top: 0.75rem;
    color: var(--fg-muted);
    font-size: 0.95rem;
  }
  .card {
    margin-top: 1.5rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
  }
  legend {
    font-weight: 700;
    padding: 0 0.5rem;
  }
  .qtext {
    font-size: 1.2rem;
    line-height: 1.6;
    margin: 0.75rem 0 1.25rem;
  }
  .opts {
    display: grid;
    gap: 0.6rem;
  }
  .opt {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0.85rem 1rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    min-height: 48px;
  }
  .opt:hover {
    background: var(--bg);
  }
  .opt input {
    width: 20px;
    height: 20px;
    accent-color: var(--accent);
  }
  .key {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.05rem 0.5rem;
    font-weight: 700;
    font-size: 0.8rem;
    color: var(--fg-muted);
  }
  .hint {
    font-size: 0.8rem;
    color: var(--fg-muted);
    margin-top: 0.75rem;
  }
  .nav {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }
  .primary,
  .ghost {
    min-height: 44px;
    padding: 0.6rem 1.1rem;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    border: 2px solid transparent;
    flex: 1;
  }
  .primary {
    background: var(--accent);
    color: var(--accent-fg);
  }
  .primary:disabled {
    opacity: 0.5;
  }
  .ghost {
    background: transparent;
    color: var(--fg);
    border-color: var(--border);
  }
  .total {
    margin-top: 1rem;
    text-align: center;
    color: var(--fg-muted);
  }
</style>
