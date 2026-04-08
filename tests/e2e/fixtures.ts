// 共用 Playwright fixture：
// 預設把 window.puter 設為 undefined，強制走後備 /api/chat 路徑
// 這樣 E2E 不需要連 Puter.js 的雲端授權，測試才能在 CI / 沙箱跑
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // 攔截 puter.js 的網路請求，回 204 空白，讓 window.puter 永遠 undefined
    // 這樣聊天會走後備 /api/chat 路徑，不會試圖打雲端 LLM 而 hang
    await page.route(/js\.puter\.com/, (route) => route.fulfill({ status: 204, body: '' }));
    await use(page);
  }
});

export { expect };
