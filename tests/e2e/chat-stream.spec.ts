import { test, expect } from './fixtures';

test('聊天串流：送出訊息後可看到 assistant 回覆出現', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('raw-id-input').fill('chat-tester');
  await page.getByTestId('consent-check').check();
  await page.getByTestId('start-btn').click();

  // 用 0 跳過 PHQ-9
  for (let i = 0; i < 9; i++) {
    await page.getByTestId(`phq9-q${i}-opt0`).first().click();
    if (i < 8) await page.getByTestId('phq9-next').click();
  }
  await page.getByTestId('phq9-submit').click();
  await page.getByTestId('suds-pre-next').click();

  await expect(page.getByTestId('chat-input')).toBeEnabled();
  await page.getByTestId('chat-input').fill('我最近報告壓力很大');
  await page.getByTestId('chat-send-btn').click();

  // 至少 2 則訊息（user + assistant）
  await expect(page.locator('[data-testid^="msg-bubble-"]')).toHaveCount(2, { timeout: 8000 });
  // assistant bubble 應有非空文字
  const bubbles = await page.locator('[data-testid^="msg-bubble-"]').all();
  await expect(bubbles[1]).not.toBeEmpty();
});
