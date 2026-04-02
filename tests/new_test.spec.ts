import { test, expect } from '@playwright/test';

test('test with intentional failure', async ({ page }) => {
  // 1. כניסה לאתר
  await page.goto('https://demo.playwright.dev/todomvc/');

  // 2. הוספת משימה אחת: "Buy milk"
  // שים לב לתיקון: הוספתי getByPlaceholder כדי שהמחשב יזהה את הפקודה
  const todoInput = page.getByPlaceholder('What needs to be done?');
  await todoInput.fill('Buy milk');
  await todoInput.press('Enter');

  // --- כאן יצרנו את השגיאה המכוונת ---
  // אנחנו מצפים לראות "Buy milk and Chocolate" למרות שכתבנו רק "Buy milk"
  // הטסט יחכה כאן קצת, לא ימצא את השוקולד, וייכשל באדום
  await expect(page.getByTestId('todo-title')).toHaveText(['Buy milk and Chocolate']);

  // השורות הבאות לא ירוצו כי הטסט ייעצר בשגיאה למעלה
  await todoInput.fill('Finish the test');
  await todoInput.press('Enter');
});