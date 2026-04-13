import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.locator('body').click();
  await page.locator('body').click();
  await page.goto('https://www.saucedemo.com/');  await page.locator('body').click();
});