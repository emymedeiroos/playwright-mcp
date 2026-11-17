const { test, expect } = require('@playwright/test');

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.goto('https://automationexercise.com');
    await expect(page).toHaveTitle(/Automation Exercise/);
  });
});
