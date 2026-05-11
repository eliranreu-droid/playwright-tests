import { test, expect } from '@playwright/test';

test('API POST Test - Create Post and Verify 201', async ({ request }) => {
  // 1. שליחת הבקשה ליצירת פוסט חדש
  const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
    data: {
      title: 'פוסט חדש של עומר',
      body: 'זהו תוכן הבדיקה שלי',
      userId: 1
    }
  });

  // 2. הפיכת התגובה ל-JSON כדי שנוכל לראות את התוכן (ה-Body)
  const body = await response.json();

  // 3. הדפסת הסטטוס לטרמינל (כדי שתראה את ה-201 בעיניים)
  console.log('--- פרטי הסטטוס ---');
  console.log('Status Code:', response.status());      // ידפיס: 201
  console.log('Status Text:', response.statusText());  // ידפיס: Created

  // 4. הדפסת המידע שחזר (ה-Response Body)
  console.log('--- המידע שחזר מהשרת ---');
  console.log(body);

  // 5. בדיקת QA (Assertion) - לוודא שהסטטוס הוא אכן 201
  // אם הסטטוס יהיה משהו אחר (כמו 400 או 500), הטסט ייכשל כאן
  expect(response.status()).toBe(201);
  
  // בונוס: בדיקה שה-ID שחזר הוא 101
  expect(body.id).toBe(101);
});