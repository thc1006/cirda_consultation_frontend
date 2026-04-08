<script lang="ts">
  import { themeStore, THEMES, type ThemeName } from '$lib/stores/theme.svelte';

  const labels: Record<ThemeName, string> = {
    'light-default': '亮色（預設）',
    'light-protan-deutan': '亮色（紅綠色盲友善）',
    'light-tritan': '亮色（藍黃色盲友善）',
    'dark-default': '暗色（預設）',
    'dark-protan-deutan': '暗色（紅綠色盲友善）',
    'dark-tritan': '暗色（藍黃色盲友善）',
    'increase-contrast': '高對比模式'
  };
</script>

<fieldset class="ts" data-testid="theme-switcher">
  <legend>外觀主題</legend>
  <div class="grid" role="radiogroup" aria-label="外觀主題">
    {#each THEMES as t}
      <label class="opt" data-testid="theme-opt-{t}">
        <input
          type="radio"
          name="theme"
          value={t}
          checked={themeStore.current === t}
          onchange={() => themeStore.set(t)}
        />
        <span>{labels[t]}</span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  .ts {
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    background: var(--surface);
  }
  legend {
    padding: 0 0.5rem;
    font-weight: 700;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .opt {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    cursor: pointer;
    min-height: 44px;
  }
  .opt:hover {
    background: var(--bg);
  }
  input[type='radio'] {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
  }
</style>
