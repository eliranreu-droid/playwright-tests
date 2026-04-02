import { test, expect } from '@playwright/test';

test('SauceDemo End to End Purchase - Auto Close', async ({ page }) => {
  // 1. כניסה לאתר
  await page.goto('https://www.saucedemo.com/');

  // 2. התחברות
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  // 3. הוספת התיק (Backpack) לסל
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  
  // 4. כניסה לסל הקניות
  await page.locator('.shopping_cart_link').click();

  // 5. לחיצה על כפתור ה-Checkout
  await page.locator('[data-test="checkout"]').click();

  // 6. מילוי פרטי משלוח
  await page.locator('[data-test="firstName"]').fill('Israel');
  await page.locator('[data-test="lastName"]').fill('Israeli');
  await page.locator('[data-test="postalCode"]').fill('58100');
  await page.locator('[data-test="continue"]').click();

  // 7. לחיצה על Finish לסיום הרכישה
  await page.locator('[data-test="finish"]').click();

  // 8. בדיקה שהגענו לדף האישור הסופי
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');

  console.log('תהליך הרכישה הסתיים בהצלחה!');

  // פקודה לסגירת הדף בסיום
  await page.close();
});