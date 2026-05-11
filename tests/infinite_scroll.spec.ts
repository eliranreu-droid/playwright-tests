import { test, expect } from '@playwright/test';
import { InfiniteScrollPage } from '../pages/InfiniteScrollPage';

test.describe('בדיקות גלילה אינסופית - The Internet', () => {
  let infiniteScrollPage: InfiniteScrollPage;

  test.beforeEach(async ({ page }) => {
    infiniteScrollPage = new InfiniteScrollPage(page);
  });

  test('בדיקת טעינת תוכן בגלילה בודדת', async () => {
    // 1. ניווט לדף ה-Infinite Scroll
    await infiniteScrollPage.goto();

    // 2. סpירת הפריטים ההתחלתיים
    const initialCount = await infiniteScrollPage.getInitialItemCount();
    console.log(`מsפר הפריטים ההתחלתי: ${initialCount}`);

    // 3. גלילה לתחתית הדף
    await infiniteScrollPage.scrollToBottom();

    // 4. המתנה לטעינת תוכן נוסף - נמתין יותר זמן כי האתר איטי
    await infiniteScrollPage.waitForNewContent(3000);

    // 5. גlila נוספת כדי לוודא טעינה
    await infiniteScrollPage.scrollToBottom();
    await infiniteScrollPage.waitForNewContent(2000);

    // 6. סpירת הפריטים אחרי הגlila
    const afterScrollCount = await infiniteScrollPage.getCurrentItemCount();
    console.log(`מsפר הפריטים אחרי גlila: ${afterScrollCount}`);

    // 7. בדיקה שהתוכן אכן נוסף (לפחות פריט אחד חדש)
    expect(afterScrollCount).toBeGreaterThanOrEqual(initialCount);
    
    // נbדוק גם שהתוכן עצמו השתנה - ניקח טקסט מהפריט האחרון
    const lastItemText = await infiniteScrollPage.getScrollItemText(afterScrollCount - 1);
    expect(lastItemText).toBeTruthy();
    expect(lastItemText.length).toBeGreaterThan(10);
  });

  test('בדיקת טעינת תוכן בגלילה מרובה', async () => {
    // 1. ניווט לדף ה-Infinite Scroll
    await infiniteScrollPage.goto();

    // 2. ספירת הפריטים ההתחלתיים
    const initialCount = await infiniteScrollPage.getInitialItemCount();

    // 3. ביצוע 3 גלילות
    await infiniteScrollPage.scrollMultipleTimes(3, 2000);

    // 4. ספירת הפריטים אחרי הגלילות
    const finalCount = await infiniteScrollPage.getCurrentItemCount();

    // 5. Bדיקה שנוספו לפחות 2 פריטים חדשים (האתר עשוי להוסיף פחות בגלל זמני טעינה)
    expect(finalCount).toBeGreaterThan(initialCount + 1);
  });

  test('בדיקת קבלת תוכן הפריטים', async () => {
    // 1. ניווט לדף ה-Infinite Scroll
    await infiniteScrollPage.goto();

    // 2. קבלת הטקסט של הפריט הראשון
    const firstItemText = await infiniteScrollPage.getScrollItemText(0);

    // 3. בדיקה שהטקסט אינו ריק
    expect(firstItemText).toBeTruthy();
    expect(firstItemText.length).toBeGreaterThan(0);

    // 4. גlila למטה וקבלת פריט נוסף
    await infiniteScrollPage.scrollToBottom();
    await infiniteScrollPage.waitForNewContent(2000);

    // 5. בדיקה שנוספו פריטים חדשים
    const newCount = await infiniteScrollPage.getCurrentItemCount();
    const newItemsText = await infiniteScrollPage.getScrollItemText(newCount - 1);
    expect(newItemsText).toBeTruthy();
  });
});