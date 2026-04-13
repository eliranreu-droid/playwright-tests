import { test, expect } from '@playwright/test';

test('בדיקת GET לאתר ONE והדפסת נתונים', async ({ request }) => {
  // 1. מבצעים בקשת GET לדף הבית של ONE
  const response = await request.get('https://www.one.co.il');

  // 2. מוודאים שהאתר עלה בהצלחה
  console.log('סטטוס תגובה:', response.status());
  expect(response.status()).toBe(200);

  // 3. מוציאים את הטקסט (HTML) שהאתר מחזיר
  const body = await response.text();

  // 4. מדפיסים חלק מהמידע כדי לראות מה הוא "פולט"
  console.log('--- דגימת נתונים מאתר ONE ---');
  // נדפיס 2000 תווים כדי שנוכל לראות כותרות
  console.log(body.substring(0, 2000));
  console.log('--- סוף דגימה ---');

  // 5. בדיקה שהמילה "ספורט" קיימת בדף
  expect(body).toContain('ספורט');
});