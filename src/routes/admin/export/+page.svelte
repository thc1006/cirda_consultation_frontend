<script lang="ts">
  // 管理者匯出頁：直接下載 JSONL / CSV
  function dl(format: 'jsonl' | 'csv') {
    window.location.href = `/api/export?format=${format}`;
  }
</script>

<svelte:head>
  <title>對話紀錄匯出</title>
</svelte:head>

<section class="wrap">
  <h1>研究資料匯出</h1>
  <p>請依研究主持人指示使用。匯出檔案不含原始姓名或學號，僅保留 pseudo_id。</p>

  <div class="actions">
    <button class="primary" onclick={() => dl('jsonl')} data-testid="export-jsonl">
      下載 JSONL
    </button>
    <button class="primary" onclick={() => dl('csv')} data-testid="export-csv">
      下載 CSV
    </button>
  </div>
</section>

<style>
  .wrap {
    max-width: 720px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem;
  }
  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
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
  }
</style>
