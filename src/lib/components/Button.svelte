<script lang="ts">
  import type { Snippet } from 'svelte';
  type Props = {
    children: Snippet;
    variant?: 'primary' | 'ghost' | 'danger';
    type?: 'button' | 'submit';
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    'data-testid'?: string;
    'aria-label'?: string;
  };
  let {
    children,
    variant = 'primary',
    type = 'button',
    disabled = false,
    onclick,
    'data-testid': testid,
    'aria-label': ariaLabel
  }: Props = $props();
</script>

<button
  {type}
  {disabled}
  data-testid={testid}
  aria-label={ariaLabel}
  class="btn btn-{variant}"
  onclick={onclick}
>
  {@render children()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    min-width: 44px;
    padding: 0.6rem 1.25rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.1s ease, background-color 0.15s ease;
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .btn-primary {
    background: var(--accent);
    color: var(--accent-fg);
  }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  .btn-ghost {
    background: transparent;
    color: var(--fg);
    border-color: var(--border);
  }
  .btn-ghost:hover:not(:disabled) {
    background: var(--surface);
  }
  .btn-danger {
    background: var(--danger);
    color: var(--accent-fg);
  }
</style>
