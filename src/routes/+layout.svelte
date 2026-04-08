<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import HelpFloater from '$lib/components/HelpFloater.svelte';
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();

  onMount(() => {
    themeStore.init();
  });
</script>

<a href="#main" class="skip-link">跳到主要內容</a>

<header class="topbar" role="banner">
  <a href="/" class="brand" aria-label="諮心好友 首頁">
    <img src="/img/logo.png" alt="" class="brand-logo" width="36" height="36" />
    <span>諮心好友</span>
  </a>
  <nav aria-label="主要導覽">
    <a href="/settings">設定</a>
  </nav>
</header>

<main id="main">
  {@render children()}
</main>

<HelpFloater />

<style>
  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1.25rem;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-weight: 800;
    font-size: 1.15rem;
    color: var(--fg);
    text-decoration: none;
  }
  .brand-logo {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg);
    object-fit: contain;
    /* 在暗色主題下加一圈淡邊，避免融進背景 */
    box-shadow: 0 0 0 1px var(--border);
  }
  nav a {
    color: var(--fg);
    text-decoration: none;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
  }
  nav a:hover {
    background: var(--bg);
  }
  main {
    min-height: calc(100vh - 60px);
  }
</style>
