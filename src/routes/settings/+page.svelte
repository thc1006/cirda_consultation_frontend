<script lang="ts">
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
</script>

<svelte:head>
  <title>偏好設定</title>
</svelte:head>

<section class="wrap">
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
</style>
