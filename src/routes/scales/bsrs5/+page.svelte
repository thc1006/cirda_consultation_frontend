<script lang="ts">
  // 前測 BSRS-5：one question per page，數字鍵 1~5 快速作答
  // 總分 > 9 或第 6 題 > 0 → 阻擋進入聊天
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { BSRS5_QUESTIONS, BSRS5_OPTIONS, scoreBsrs5, isItem6Risk, canProceed } from '$lib/scales/bsrs5';
  import CrisisModal from '$lib/components/CrisisModal.svelte';

  let idx = $state(0);
  let answers = $state<number[]>(Array(6).fill(-1));
  let showCrisis = $state(false);
  let blocked = $state(false);
  let blockedReason = $state('');
  let pseudoId = $state<string | null>(null);

  onMount(() => {
    pseudoId = sessionStorage.getItem('cirda.pseudoId');
    if (!pseudoId) {
      goto('/');
      return;
    }
    // 還原暫存
    const saved = localStorage.getItem('cirda.bsrs5');
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
    if (blocked || showCrisis) return;
    if (e.key >= '1' && e.key <= '5') {
      pick(parseInt(e.key, 10) - 1);
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      idx--;
    } else if (e.key === 'ArrowRight' && answers[idx] !== -1 && idx < 5) {
      idx++;
    }
  }

  function pick(v: number) {
    answers[idx] = v;
    persist();
    // 第 6 題（idx === 5）選了 > 0 → 立刻觸發 blocking 危機 modal
    if (idx === 5 && answers[5] > 0) {
      showCrisis = true;
      // 即使被擋，仍存量表回答供研究使用（best-effort）
      void saveScale(scoreBsrs5(answers)).catch(() => {});
      void fetch('/api/risk-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudoId, source: 'bsrs5_item6', score: answers[5] })
      });
    }
  }

  function persist() {
    localStorage.setItem('cirda.bsrs5', JSON.stringify({ answers, idx }));
  }

  let saveError = $state<string | null>(null);

  async function finish() {
    saveError = null;
    const score = scoreBsrs5(answers);

    // 閘門檢查
    if (!canProceed(answers)) {
      // 先存量表結果（研究仍需蒐集，存不了也不擋 UI）
      try { await saveScale(score); } catch {}

      if (isItem6Risk(answers)) {
        showCrisis = true;
      } else {
        blocked = true;
        blockedReason = `你的初篩總分為 ${score} 分，超過本工具的適用範圍（9 分以下）。建議你尋求專業心理師協助。`;
      }
      return;
    }

    try {
      await saveScale(score);
      sessionStorage.setItem('cirda.bsrs5.score', String(score));
      localStorage.removeItem('cirda.bsrs5');
      goto('/scales/suds-pre');
    } catch (err) {
      saveError = (err as Error).message + '，請稍後再試';
    }
  }

  async function saveScale(score: number) {
    const res = await fetch('/api/scale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudoId, scale: 'BSRS-5', phase: 'pre', payload: answers, score })
    });
    if (!res.ok) throw new Error(`儲存失敗 (HTTP ${res.status})`);
  }

  function handleCrisisExit() {
    localStorage.removeItem('cirda.bsrs5');
    goto('/');
  }

  let allAnswered = $derived(answers.every((v) => v !== -1));
  let total = $derived(allAnswered ? scoreBsrs5(answers) : 0);
</script>

<svelte:head>
  <title>前測量表 BSRS-5</title>
</svelte:head>

<section class="wrap">
  {#if blocked}
    <div class="blocked-card" data-testid="bsrs5-blocked">
      <h1>感謝你的填寫</h1>
      <p>{blockedReason}</p>
      <p>以下資源可以協助你：</p>
      <ul>
        <li><a href="tel:1925">衛福部安心專線 1925（24h 免付費）</a></li>
        <li><a href="tel:1995">生命線 1995</a></li>
        <li><a href="tel:1980">張老師 1980</a></li>
        <li>陽明校區 健康心理中心 <a href="tel:+886-2-2826-7000,62026">02-2826-7000 #62026</a></li>
        <li>交大校區 健康心理中心 <a href="tel:+886-3-5712121,51303">03-5712121 #51303</a></li>
        <li>陽明校區 校安中心 <a href="tel:+886-2-2826-1100">02-2826-1100（24h）</a></li>
        <li>交大校區 校安中心 <a href="tel:+886-3-5712121,31999">03-5712121 #31999（24h）</a></li>
      </ul>
      <button type="button" class="primary" onclick={() => goto('/')} data-testid="bsrs5-blocked-home">
        返回首頁
      </button>
    </div>
  {:else}
    <header>
      <h1>前測量表</h1>
      <p>請依最近一週的整體感受作答。每題只有一個答案。</p>
      <div class="progress" aria-label="作答進度">
        第 <strong>{idx + 1}</strong> 題 / 共 <strong>6</strong> 題
      </div>
    </header>

    <fieldset class="card" data-testid="bsrs5-card">
      <legend>最近一週（包含今天），下列敘述讓你感到困擾的程度？</legend>
      <p class="qtext" data-testid="bsrs5-question">{BSRS5_QUESTIONS[idx]}</p>

      <div role="radiogroup" aria-labelledby="bsrs5-question" class="opts">
        {#each BSRS5_OPTIONS as opt}
          <label class="opt" data-testid="bsrs5-q{idx}-opt{opt.value}">
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

      <p class="hint">小提示：你可以用鍵盤的 1~5 鍵直接選擇。</p>

      <div class="nav">
        <button
          type="button"
          class="ghost"
          disabled={idx === 0}
          onclick={() => idx--}
          data-testid="bsrs5-prev"
        >
          上一題
        </button>
        {#if idx < 5}
          <button
            type="button"
            class="primary"
            disabled={answers[idx] === -1}
            onclick={() => idx++}
            data-testid="bsrs5-next"
          >
            下一題
          </button>
        {:else}
          <button
            type="button"
            class="primary"
            disabled={!allAnswered}
            onclick={finish}
            data-testid="bsrs5-submit"
          >
            完成前測
          </button>
        {/if}
      </div>
    </fieldset>

    {#if allAnswered}
      <p class="total" data-testid="bsrs5-total">
        目前總分：{total} 分
      </p>
    {/if}

    {#if saveError}
      <p class="err" role="alert" data-testid="bsrs5-save-error">{saveError}</p>
    {/if}
  {/if}
</section>

<CrisisModal
  bind:open={showCrisis}
  source="bsrs5_item6"
  blocking={true}
  onExit={handleCrisisExit}
/>

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
  .err {
    margin-top: 1rem;
    color: var(--danger);
    font-weight: 600;
    text-align: center;
  }
  .blocked-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
  }
  .blocked-card ul {
    text-align: left;
    line-height: 1.8;
    margin: 1rem 0;
  }
  .blocked-card a {
    color: var(--accent);
    font-weight: 600;
  }
</style>
