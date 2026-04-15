<script lang="ts">
  import { goto } from '$app/navigation';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

  function goBack() {
    // 僅在上一頁確認為本站時才返回，否則導回首頁
    const sameOrigin =
      !!document.referrer && new URL(document.referrer).origin === location.origin;
    if (sameOrigin) {
      history.back();
    } else {
      goto('/');
    }
  }
</script>

<svelte:head>
  <title>偏好設定</title>
</svelte:head>

<section class="wrap">
  <button type="button" class="back" onclick={goBack} data-testid="settings-back">
    &#8592; 返回
  </button>
  <h1>偏好設定</h1>
  <p>調整介面主題以符合視覺需求。所有設定會記憶在你的瀏覽器中。</p>
  <ThemeSwitcher />
</section>

<style>
  .wrap {
    max-width: 720px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem;
  }
  .back {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 0.45rem 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 1rem;
    min-height: 44px;
  }
  .back:hover {
    background: var(--bg);
  }
</style>
