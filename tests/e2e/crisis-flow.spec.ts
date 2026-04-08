import { test, expect } from './fixtures';

test('PHQ-9 第 9 題 > 0 觸發 non-blocking 危機 modal 並可繼續', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('raw-id-input').fill('crisis-tester');
  await page.getByTestId('consent-check').check();
  await page.getByTestId('start-btn').click();

  // 前 8 題全部選 0
  for (let i = 0; i < 8; i++) {
    await page.getByTestId(`phq9-q${i}-opt0`).first().click();
    await page.getByTestId('phq9-next').click();
  }
  // 第 9 題選 1（>0）
  await page.getByTestId('phq9-q8-opt1').first().click();

  // 危機 modal 應出現
  await expect(page.getByTestId('crisis-modal')).toBeVisible();
  await expect(page.getByRole('link', { name: /1925/ }).first()).toBeVisible();

  // 點繼續仍可送出
  await page.getByTestId('crisis-continue').click();
  await page.getByTestId('phq9-submit').click();
  await expect(page).toHaveURL(/\/scales\/suds-pre/);
});
