<script lang="ts">
  // 全頁面常駐求助按鈕（WCAG 3.2.6 Consistent Help）
  // 點擊展開五組電話與校內資源
  let open = $state(false);

  const lines = [
    { name: '衛福部安心專線 1925', tel: '1925', note: '24 小時免付費' },
    { name: '生命線 1995', tel: '1995', note: '24 小時' },
    { name: '張老師 1980', tel: '1980', note: '週一至日皆有時段' },
    { name: '陽交大諮商中心', tel: '', note: '日間預約' },
    { name: '校安中心', tel: '', note: '24 小時' }
  ];
</script>

<div class="floater">
  <button
    type="button"
    class="trigger"
    aria-haspopup="dialog"
    aria-expanded={open}
    aria-label="展開立即求助資源"
    data-testid="help-floater-trigger"
    onclick={() => (open = !open)}
  >
    立即求助
  </button>

  {#if open}
    <div
      class="panel"
      role="dialog"
      aria-label="求助資源列表"
      data-testid="help-floater-panel"
    >
      <h2>需要支援嗎？</h2>
      <p class="note">本工具非醫療診斷。若有立即危險請撥打下列專線。</p>
      <ul>
        {#each lines as line}
          <li>
            <strong>{line.name}</strong>
            {#if line.tel}
              <a href="tel:{line.tel}">撥打 {line.tel}</a>
            {/if}
            <span class="muted">{line.note}</span>
          </li>
        {/each}
      </ul>
      <button type="button" class="close" onclick={() => (open = false)}>關閉</button>
    </div>
  {/if}
</div>

<style>
  .floater {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 80;
  }
  .trigger {
    background: var(--danger);
    color: var(--accent-fg);
    border: none;
    border-radius: 999px;
    padding: 0.75rem 1.25rem;
    font-weight: 700;
    min-height: 48px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  .panel {
    position: absolute;
    right: 0;
    bottom: 64px;
    background: var(--surface);
    color: var(--fg);
    border: 2px solid var(--border);
    border-radius: 16px;
    padding: 1.25rem;
    width: min(320px, 90vw);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  .panel h2 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
  }
  .note {
    font-size: 0.85rem;
    color: var(--fg-muted);
    margin-bottom: 0.75rem;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.6rem;
  }
  li {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  a {
    color: var(--accent);
    font-weight: 600;
  }
  .muted {
    font-size: 0.75rem;
    color: var(--fg-muted);
  }
  .close {
    margin-top: 1rem;
    background: transparent;
    color: var(--fg);
    border: 1px solid var(--border);
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    cursor: pointer;
  }
</style>
