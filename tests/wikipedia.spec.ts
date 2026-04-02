import { test, expect } from '@playwright/test';

test('wikipedia search test', async ({ page }) => {
  // 1. כניסה לאתר
  await page.goto('https://www.wikipedia.org/');

  // 2. מציאת שדה החיפוש והמתנה שהוא יהיה מוכן (יציב יותר ל-Webkit)
  const searchInput = page.getByRole('searchbox', { name: 'Search Wikipedia' });
  await searchInput.waitFor({ state: 'visible' });
  
  // 3. הקלדה ולחיצה על Enter
  // ה-fill מבטיח שהטקסט ייכנס לשדה גם אם הדפדפן קצת איטי
  await searchInput.fill('Israel');
  await searchInput.press('Enter');

  // 4. בדיקה (Assertion)
  // אנחנו מחכים שהכותרת תכיל את המילה Israel
  const heading = page.locator('#firstHeading');
  await expect(heading).toContainText('Israel', { timeout: 10000 });
});