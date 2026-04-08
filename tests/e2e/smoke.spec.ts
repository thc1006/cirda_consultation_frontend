import { test, expect } from './fixtures';

test('首頁可載入且顯示同意表單', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /歡迎使用諮心好友/ })).toBeVisible();
  await expect(page.getByTestId('raw-id-input')).toBeVisible();
  await expect(page.getByTestId('start-btn')).toBeVisible();
});

test('健康檢查 endpoint', async ({ request }) => {
  const r = await request.get('/healthz');
  expect(r.status()).toBe(200);
  expect(await r.text()).toBe('ok');
});

test('求助懸浮按鈕常駐', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('help-floater-trigger')).toBeVisible();
  await page.getByTestId('help-floater-trigger').click();
  await expect(page.getByTestId('help-floater-panel')).toBeVisible();
  await expect(page.getByRole('link', { name: /撥打 1925/ })).toBeVisible();
});
