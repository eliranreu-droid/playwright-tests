import { test, expect } from '@playwright/test';

test('בדיקה ויזואלית - דף הלוגין', async ({ page }) => {
  // 1. כניסה לאתר
  await page.goto('https://www.saucedemo.com/');
  
  // 2. שינוי מכוון כדי ליצור הבדל מהתמונה המקורית
  await page.locator('[data-test="username"]').fill('כישלון מכוון');

  // 3. צילום והשוואה
  await expect(page).toHaveScreenshot('login-page.png');
});
