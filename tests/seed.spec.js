const { test, expect } = require('@playwright/test');

test.describe('Test group', () => {
  test('seed - automation exercise is available', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/);
  });
});
