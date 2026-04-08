<script lang="ts">
  // 通用 Likert 題組元件：給後測各量表共用，避免每個量表重寫一遍
  // 設計重點：每個 option 都帶 data-testid="{prefix}-q{index}-opt{value}"，方便 E2E 直接定位
  type Option = { value: number; label: string };
  type Props = {
    prefix: string;
    index: number;
    legend: string;
    options: readonly Option[];
    value: number;
    onpick: (v: number) => void;
  };
  let { prefix, index, legend, options, value, onpick }: Props = $props();
</script>

<fieldset class="q" data-testid="{prefix}-q{index}">
  <legend>{index + 1}. {legend}</legend>
  <div class="opts" role="radiogroup">
    {#each options as o}
      <label class="opt" data-testid="{prefix}-q{index}-opt{o.value}">
        <input
          type="radio"
          name="{prefix}-{index}"
          value={o.value}
          checked={value === o.value}
          onchange={() => onpick(o.value)}
        />
        <span>{o.label}</span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  .q {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin: 0.75rem 0;
  }
  legend {
    font-weight: 600;
    padding: 0 0.5rem;
  }
  .opts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1rem;
    margin-top: 0.5rem;
  }
  .opt {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 40px;
    cursor: pointer;
  }
  input[type='radio'] {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
  }
</style>
