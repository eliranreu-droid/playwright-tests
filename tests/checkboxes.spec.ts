import { test, expect } from '@playwright/test';
import { CheckboxesPage } from '../pages/CheckboxesPage';

test.describe('בדיקות תיבות סימון - The Internet', () => {
  let checkboxesPage: CheckboxesPage;

  test.beforeEach(async ({ page }) => {
    checkboxesPage = new CheckboxesPage(page);
  });

  test('בדיקת סימון תיבה ראשונה', async () => {
    // 1. ניווט לדף ה-Checkboxes
    await checkboxesPage.goto();

    // 2. בדיקה שהתיבה הראשונה לא מסומנת בהתחלה
    expect(await checkboxesPage.isCheckbox1Checked()).toBe(false);

    // 3. סימון התיבה הראשונה
    await checkboxesPage.checkCheckbox1();

    // 4. בדיקה שהתיבה הראשונה מסומנת
    expect(await checkboxesPage.isCheckbox1Checked()).toBe(true);
  });

  test('בדיקת ביטול סימון תיבה שנייה', async () => {
    // 1. ניווט לדף ה-Checkboxes
    await checkboxesPage.goto();

    // 2. סימון התיבה השנייה (היא מסומנת כברירת מחדל)
    expect(await checkboxesPage.isCheckbox2Checked()).toBe(true);

    // 3. ביטול סימון התיבה השנייה
    await checkboxesPage.uncheckCheckbox2();

    // 4. בדיקה שהתיבה השנייה לא מסומנת
    expect(await checkboxesPage.isCheckbox2Checked()).toBe(false);
  });

  test('בדיקת סימון מספר תיבות בו זמנית', async () => {
    // 1. ניווט לדף ה-Checkboxes
    await checkboxesPage.goto();

    // 2. סימון שתי התיבות
    await checkboxesPage.checkCheckbox1();
    await checkboxesPage.checkCheckbox2();

    // 3. בדיקה ששתי התיבות מסומנות
    expect(await checkboxesPage.isCheckbox1Checked()).toBe(true);
    expect(await checkboxesPage.isCheckbox2Checked()).toBe(true);

    // 4. ביטול סימון התיבה הראשונה
    await checkboxesPage.uncheckCheckbox1();

    // 5. בדיקה שרק התיבה השנייה מסומנת
    expect(await checkboxesPage.isCheckbox1Checked()).toBe(false);
    expect(await checkboxesPage.isCheckbox2Checked()).toBe(true);
  });
});