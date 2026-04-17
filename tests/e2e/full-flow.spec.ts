import { test, expect } from './fixtures';

test('完整流程：同意 → BSRS-5 → SUDS-pre → 聊天 → 後測 → 匯出有資料', async ({
  page,
  request
}) => {
  await page.goto('/');
  await page.getByTestId('raw-id-input').fill('full-flow-' + Date.now());
  await page.getByTestId('consent-check').check();
  await page.getByTestId('start-btn').click();

  // BSRS-5 全部 0
  await expect(page).toHaveURL(/\/scales\/bsrs5/);
  for (let i = 0; i < 6; i++) {
    await page.getByTestId(`bsrs5-q${i}-opt0`).first().click();
    if (i < 5) await page.getByTestId('bsrs5-next').click();
  }
  await page.getByTestId('bsrs5-submit').click();

  // SUDS pre
  await expect(page).toHaveURL(/\/scales\/suds-pre/);
  await page.getByTestId('suds-pre-next').click();

  // chat
  await expect(page).toHaveURL(/\/chat/);
  await expect(page.getByTestId('chat-input')).toBeEnabled();
  await page.getByTestId('chat-input').fill('我這禮拜報告寫不完很焦慮');
  await page.getByTestId('chat-send-btn').click();
  await expect(page.locator('[data-testid^="msg-bubble-"]')).toHaveCount(2, { timeout: 10_000 });

  // 等 chatStream 整個 send() 跑完
  await expect(page.getByTestId('chat-form')).toHaveAttribute('data-chat-status', 'idle', {
    timeout: 15_000
  });

  await page.getByTestId('end-chat-btn').click();

  // posttest：使用 ScaleQuestion 共用元件
  await expect(page).toHaveURL(/\/scales\/posttest/);

  // PHQ-9 重測：全選 0
  for (let i = 0; i < 9; i++) {
    await page.locator(`[data-testid="post-phq9-q${i}-opt0"] input`).check();
  }
  await page.getByTestId('post-next-btn').click();

  // WHO-5：全選 0
  for (let i = 0; i < 5; i++) {
    await page.locator(`[data-testid="post-who5-q${i}-opt0"] input`).check();
  }
  await page.getByTestId('post-next-btn').click();

  // CUQ：全選 1（最低分）
  for (let i = 0; i < 16; i++) {
    await page.locator(`[data-testid="post-cuq-q${i}-opt1"] input`).check();
  }
  await page.getByTestId('post-next-btn').click();

  // WAI-SR：全選 1
  for (let i = 0; i < 12; i++) {
    await page.locator(`[data-testid="post-wai-q${i}-opt1"] input`).check();
  }
  await page.getByTestId('post-next-btn').click();

  // SUDS post
  await expect(page.getByTestId('suds-slider')).toBeVisible();
  await page.getByTestId('post-next-btn').click();

  // done
  await expect(page.getByText(/感謝你完成所有量表/)).toBeVisible();

  // 匯出 JSONL 應有對話資料
  const r = await request.get('/api/export?format=jsonl');
  expect(r.status()).toBe(200);
  const text = await r.text();
  expect(text.length).toBeGreaterThan(0);
  const lines = text.trim().split('\n').filter(Boolean);
  expect(lines.length).toBeGreaterThanOrEqual(2);
});
