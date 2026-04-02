import { test, expect } from '@playwright/test';

test('בדיקת טעינת דף הבית של מאקו', async ({ page }) => {
  // 1. כניסה לאתר עם המתנה רק לתוכן הבסיסי (מונע Timeout בגלל פרסומות)
  await page.goto('https://www.mako.co.il/', { 
    waitUntil: 'domcontentloaded' 
  });

  // 2. וידוא שהכותרת של הדף מכילה את המילה mako
  await expect(page).toHaveTitle(/mako/);

  // 3. המתנה ללוגו או לאלמנט מרכזי כדי לוודא שהדף מוכן לעבודה
  const header = page.locator('#desktop-page-header');
  await expect(header).toBeVisible({ timeout: 15000 });

  console.log('האתר נטען בהצלחה ללא המתנה לפרסומות כבדות!');
});