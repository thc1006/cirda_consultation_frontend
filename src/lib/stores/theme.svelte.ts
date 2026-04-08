// 主題切換 store：支援七套主題，切換以 [data-theme] attribute + localStorage 持久化
// 使用 Svelte 5 的 $state rune
import { browser } from '$app/environment';

export const THEMES = [
  'light-default',
  'light-protan-deutan',
  'light-tritan',
  'dark-default',
  'dark-protan-deutan',
  'dark-tritan',
  'increase-contrast'
] as const;

export type ThemeName = (typeof THEMES)[number];

const STORAGE_KEY = 'cirda.theme';

function readInitial(): ThemeName {
  if (!browser) return 'light-default';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && (THEMES as readonly string[]).includes(saved)) return saved as ThemeName;
  // 跟隨系統偏好
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark-default';
  return 'light-default';
}

class ThemeStore {
  current = $state<ThemeName>('light-default');

  init() {
    if (!browser) return;
    this.current = readInitial();
    this.apply(this.current);
  }

  set(name: ThemeName) {
    this.current = name;
    this.apply(name);
    if (browser) localStorage.setItem(STORAGE_KEY, name);
  }

  private apply(name: ThemeName) {
    if (!browser) return;
    document.documentElement.setAttribute('data-theme', name);
  }
}

export const themeStore = new ThemeStore();

// 純函式版本：方便單元測試（不需 DOM）
export function applyThemeAttribute(el: { setAttribute(k: string, v: string): void }, name: ThemeName) {
  el.setAttribute('data-theme', name);
}
