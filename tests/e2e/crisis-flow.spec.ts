import { test, expect } from './fixtures';

test('BSRS-5 第 6 題 > 0 觸發 blocking 危機 modal 且無法繼續', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('raw-id-input').fill('crisis-tester');
  await page.getByTestId('consent-check').check();
  await page.getByTestId('start-btn').click();

  // 前 5 題全部選 0
  for (let i = 0; i < 5; i++) {
    await page.getByTestId(`bsrs5-q${i}-opt0`).first().click();
    await page.getByTestId('bsrs5-next').click();
  }
  // 第 6 題選 1（> 0）
  await page.getByTestId('bsrs5-q5-opt1').first().click();

  // blocking 危機 modal 應出現
  await expect(page.getByTestId('crisis-modal')).toBeVisible();
  await expect(page.getByRole('link', { name: /1925/ }).first()).toBeVisible();

  // blocking 模式下不應有「繼續」按鈕
  await expect(page.getByTestId('crisis-continue')).not.toBeVisible();

  // 只有「返回首頁」按鈕
  await expect(page.getByTestId('crisis-exit')).toBeVisible();
  await page.getByTestId('crisis-exit').click();
  await expect(page).toHaveURL('/');
});
