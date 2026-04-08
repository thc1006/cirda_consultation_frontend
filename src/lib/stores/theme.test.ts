import { describe, it, expect } from 'vitest';
import { THEMES, applyThemeAttribute } from './theme.svelte';

describe('theme store', () => {
  it('恰好提供 7 套主題', () => {
    expect(THEMES.length).toBe(7);
  });
  it('套用會把 data-theme 寫到元素', () => {
    const captured: Record<string, string> = {};
    const fakeEl = { setAttribute: (k: string, v: string) => (captured[k] = v) };
    applyThemeAttribute(fakeEl, 'dark-tritan');
    expect(captured['data-theme']).toBe('dark-tritan');
  });
});
