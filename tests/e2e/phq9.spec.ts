import { test, expect } from './fixtures';

test('完整 PHQ-9 前測流程：可一路填到最後一題並送出', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('raw-id-input').fill('s12345');
  await page.getByTestId('consent-check').check();
  await page.getByTestId('start-btn').click();

  await expect(page).toHaveURL(/\/scales\/phq9/);
  await expect(page.getByTestId('phq9-card')).toBeVisible();

  // 全部選 0
  for (let i = 0; i < 9; i++) {
    await page.getByTestId(`phq9-q${i}-opt0`).first().click();
    if (i < 8) await page.getByTestId('phq9-next').click();
  }
  await expect(page.getByTestId('phq9-total')).toContainText('0');
  await page.getByTestId('phq9-submit').click();
  await expect(page).toHaveURL(/\/scales\/suds-pre/);
});
