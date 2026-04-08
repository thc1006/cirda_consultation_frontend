import { test, expect } from './fixtures';

test('七套主題切換並寫入 data-theme', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByTestId('theme-switcher')).toBeVisible();

  const themes = [
    'light-default',
    'light-protan-deutan',
    'light-tritan',
    'dark-default',
    'dark-protan-deutan',
    'dark-tritan',
    'increase-contrast'
  ];
  for (const t of themes) {
    await page.getByTestId(`theme-opt-${t}`).click();
    const v = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(v).toBe(t);
  }
});
