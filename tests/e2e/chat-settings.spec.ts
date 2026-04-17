import { test, expect } from './fixtures';

// 輔助：從首頁一路填 BSRS-5 + SUDS 進到聊天頁
async function enterChat(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByTestId('raw-id-input').fill('settings-test-' + Date.now());
  await page.getByTestId('consent-check').check();
  await page.getByTestId('start-btn').click();
  for (let i = 0; i < 6; i++) {
    await page.getByTestId(`bsrs5-q${i}-opt0`).first().click();
    if (i < 5) await page.getByTestId('bsrs5-next').click();
  }
  await page.getByTestId('bsrs5-submit').click();
  await page.getByTestId('suds-pre-next').click();
  await expect(page.getByTestId('chat-input')).toBeEnabled();
}

test('聊天頁內齒輪抽屜切換主題後訊息仍保留', async ({ page }) => {
  await enterChat(page);

  // 送出一則訊息
  await page.getByTestId('chat-input').fill('今天壓力好大');
  await page.getByTestId('chat-send-btn').click();
  await expect(page.locator('[data-testid^="msg-bubble-"]')).toHaveCount(2, { timeout: 10_000 });

  // 打開齒輪抽屜
  await page.getByTestId('chat-settings-btn').click();
  await expect(page.getByTestId('chat-settings-drawer')).toBeVisible();

  // 收起抽屜
  await page.getByText('收起').click();
  await expect(page.getByTestId('chat-settings-drawer')).not.toBeVisible();

  // 訊息仍在
  await expect(page.locator('[data-testid^="msg-bubble-"]')).toHaveCount(2);
});
