import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

// 針對所有關鍵頁面做 a11y 掃描
// 對 bsrs5 / chat / posttest 需要先 seed sessionStorage 才看得到內容
async function seedSession(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    sessionStorage.setItem('cirda.pseudoId', 'a11y-tester-' + Date.now());
  });
}

async function scan(page: import('@playwright/test').Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
  if (blocking.length > 0) {
    console.log(`a11y violations on ${label}:`, JSON.stringify(blocking, null, 2));
  }
  expect(blocking, `a11y violations on ${label}`).toEqual([]);
}

test('a11y / 首頁', async ({ page }) => {
  await page.goto('/');
  await scan(page, '/');
});

test('a11y /settings', async ({ page }) => {
  await page.goto('/settings');
  await scan(page, '/settings');
});

test('a11y /scales/bsrs5', async ({ page }) => {
  await seedSession(page);
  await page.goto('/scales/bsrs5');
  await scan(page, '/scales/bsrs5');
});

test('a11y /scales/suds-pre', async ({ page }) => {
  await seedSession(page);
  await page.goto('/scales/suds-pre');
  await scan(page, '/scales/suds-pre');
});

test('a11y /chat', async ({ page }) => {
  await seedSession(page);
  await page.goto('/chat');
  await scan(page, '/chat');
});

test('a11y /scales/posttest', async ({ page }) => {
  await seedSession(page);
  await page.goto('/scales/posttest');
  await scan(page, '/scales/posttest');
});

test('a11y /admin/export', async ({ page }) => {
  await page.goto('/admin/export');
  await scan(page, '/admin/export');
});
