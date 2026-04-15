import { test, expect } from './fixtures';

test('完整 BSRS-5 前測流程：全部選 0 可送出並進入 SUDS', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('raw-id-input').fill('s12345');
  await page.getByTestId('consent-check').check();
  await page.getByTestId('start-btn').click();

  await expect(page).toHaveURL(/\/scales\/bsrs5/);
  await expect(page.getByTestId('bsrs5-card')).toBeVisible();

  // 全部選 0
  for (let i = 0; i < 6; i++) {
    await page.getByTestId(`bsrs5-q${i}-opt0`).first().click();
    if (i < 5) await page.getByTestId('bsrs5-next').click();
  }
  await expect(page.getByTestId('bsrs5-total')).toContainText('0');
  await page.getByTestId('bsrs5-submit').click();
  await expect(page).toHaveURL(/\/scales\/suds-pre/);
});

test('BSRS-5 總分 > 9 時阻擋進入聊天', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('raw-id-input').fill('blocked-tester');
  await page.getByTestId('consent-check').check();
  await page.getByTestId('start-btn').click();

  // 前 5 題選 2（共 10 分），第 6 題選 0 → 總分 10 > 9
  for (let i = 0; i < 5; i++) {
    await page.getByTestId(`bsrs5-q${i}-opt2`).first().click();
    if (i < 5) await page.getByTestId('bsrs5-next').click();
  }
  await page.getByTestId('bsrs5-q5-opt0').first().click();
  await page.getByTestId('bsrs5-submit').click();

  // 應顯示阻擋畫面
  await expect(page.getByTestId('bsrs5-blocked')).toBeVisible();
  await expect(page.getByText(/超過本工具的適用範圍/)).toBeVisible();
  await expect(page.getByRole('link', { name: /1925/ }).first()).toBeVisible();
});
