import { test, expect } from '@playwright/test';

test('בדיקת API - קבלת משתמש מ-JSONPlaceholder', async ({ request }) => {
  // שליחת בקשת GET לקבלת משתמש מסוים
  const response = await request.get('https://jsonplaceholder.typicode.com/users/1');

  // בדיקה שקיבלנו סטטוס 200 (OK)
  expect(response.status()).toBe(200);

  // חילוץ גוף התשובה
  const body = await response.json();

  // בדיקה שהנתונים שחזרו תואמים למה שציפינו
  expect(body.id).toBe(1);
  expect(body.email).toBe('Sincere@april.biz');

  console.log('הטסט עבר! קיבלנו את המשתמש:', body.email);
});