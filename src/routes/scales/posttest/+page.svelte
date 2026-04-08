<script lang="ts">
  // 後測：依序呈現 PHQ-9 重測 → WHO-5 → CUQ → WAI-SR → SUDS → 完成
  // 統一使用 ScaleQuestion 元件避免重複實作
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { PHQ9_QUESTIONS, PHQ9_OPTIONS, scorePhq9 } from '$lib/scales/phq9';
  import { WHO5_QUESTIONS, WHO5_OPTIONS, scoreWho5 } from '$lib/scales/who5';
  import { CUQ_QUESTIONS, CUQ_OPTIONS, scoreCuq } from '$lib/scales/cuq';
  import { WAI_QUESTIONS, WAI_OPTIONS, scoreWaiSr } from '$lib/scales/waiSr';
  import ScaleQuestion from '$lib/components/ScaleQuestion.svelte';

  type Stage = 'phq9' | 'who5' | 'cuq' | 'wai' | 'suds' | 'done';
  let stage = $state<Stage>('phq9');
  let pseudoId = $state<string | null>(null);

  let phq9 = $state<number[]>(Array(9).fill(-1));
  let who5 = $state<number[]>(Array(5).fill(-1));
  let cuq = $state<number[]>(Array(16).fill(-1));
  let wai = $state<number[]>(Array(12).fill(-1));
  let suds = $state(5);
  let saveError = $state<string | null>(null);

  onMount(() => {
    pseudoId = sessionStorage.getItem('cirda.pseudoId');
    if (!pseudoId) goto('/');
  });

  function setAt(arr: number[], i: number, v: number) {
    arr[i] = v;
  }

  async function save(scale: string, payload: unknown, score: number | null) {
    const res = await fetch('/api/scale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudoId, scale, phase: 'post', payload, score })
    });
    if (!res.ok) throw new Error(`儲存 ${scale} 失敗 (HTTP ${res.status})`);
  }

  async function next() {
    saveError = null;
    try {
      if (stage === 'phq9') {
        await save('PHQ-9', phq9, scorePhq9(phq9));
        stage = 'who5';
      } else if (stage === 'who5') {
        await save('WHO-5', who5, scoreWho5(who5));
        stage = 'cuq';
      } else if (stage === 'cuq') {
        await save('CUQ', cuq, scoreCuq(cuq));
        stage = 'wai';
      } else if (stage === 'wai') {
        await save('WAI-SR', wai, scoreWaiSr(wai).total);
        stage = 'suds';
      } else if (stage === 'suds') {
        await save('SUDS', { value: suds }, suds);
        stage = 'done';
      }
    } catch (err) {
      saveError = (err as Error).message + '，請稍後再試';
    }
  }

  function arrAllSet(a: number[]) {
    return a.every((v) => v !== -1);
  }

  let canNext = $derived.by(() => {
    if (stage === 'phq9') return arrAllSet(phq9);
    if (stage === 'who5') return arrAllSet(who5);
    if (stage === 'cuq') return arrAllSet(cuq);
    if (stage === 'wai') return arrAllSet(wai);
    return true;
  });
</script>

<svelte:head>
  <title>後測量表</title>
</svelte:head>

<section class="wrap">
  <h1>後測量表</h1>

  {#if stage === 'phq9'}
    <h2>PHQ-9（與前測同題對照，請依此刻感受作答）</h2>
    {#each PHQ9_QUESTIONS as q, i}
      <ScaleQuestion
        prefix="post-phq9"
        index={i}
        legend={q}
        options={PHQ9_OPTIONS}
        value={phq9[i]}
        onpick={(v) => setAt(phq9, i, v)}
      />
    {/each}
  {:else if stage === 'who5'}
    <h2>WHO-5 幸福感量表</h2>
    {#each WHO5_QUESTIONS as q, i}
      <ScaleQuestion
        prefix="post-who5"
        index={i}
        legend={q}
        options={WHO5_OPTIONS}
        value={who5[i]}
        onpick={(v) => setAt(who5, i, v)}
      />
    {/each}
  {:else if stage === 'cuq'}
    <h2>CUQ 聊天機器人使用體驗</h2>
    {#each CUQ_QUESTIONS as q, i}
      <ScaleQuestion
        prefix="post-cuq"
        index={i}
        legend={q.text}
        options={CUQ_OPTIONS}
        value={cuq[i]}
        onpick={(v) => setAt(cuq, i, v)}
      />
    {/each}
  {:else if stage === 'wai'}
    <h2>WAI-SR 工作同盟量表（chatbot 改寫版）</h2>
    {#each WAI_QUESTIONS as q, i}
      <ScaleQuestion
        prefix="post-wai"
        index={i}
        legend={q.text}
        options={WAI_OPTIONS}
        value={wai[i]}
        onpick={(v) => setAt(wai, i, v)}
      />
    {/each}
  {:else if stage === 'suds'}
    <h2>主觀痛苦指數 SUDS（0 完全平靜 ~ 10 極度痛苦）</h2>
    <input
      type="range"
      min="0"
      max="10"
      bind:value={suds}
      data-testid="suds-slider"
      aria-label="主觀痛苦指數"
    />
    <p>目前選擇：<strong>{suds}</strong></p>
  {:else}
    <h2>感謝你完成所有量表！</h2>
    <p>你的資料已安全存入研究資料庫。本次對話中所有內容皆為去識別化處理。</p>
    <a class="primary" href="/">返回首頁</a>
  {/if}

  {#if stage !== 'done'}
    <div class="nav">
      <button
        type="button"
        class="primary"
        disabled={!canNext}
        onclick={next}
        data-testid="post-next-btn"
      >
        {stage === 'suds' ? '完成後測' : '下一段'}
      </button>
    </div>
  {/if}

  {#if saveError}
    <p class="err" role="alert" data-testid="post-save-error">{saveError}</p>
  {/if}
</section>

<style>
  .wrap {
    max-width: 760px;
    margin: 0 auto;
    padding: 2rem 1.25rem 4rem;
  }
  h1 {
    margin: 0 0 0.5rem;
  }
  h2 {
    font-size: 1.1rem;
    margin: 1.5rem 0 0.75rem;
  }
  input[type='range'] {
    width: 100%;
  }
  .nav {
    margin-top: 1.5rem;
    text-align: right;
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
    text-decoration: none;
    display: inline-block;
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
</style>
