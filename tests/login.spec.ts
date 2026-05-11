import { test, expect } from '@playwright/test';
import { TheInternetLoginPage } from '../pages/TheInternetLoginPage';

test.describe('בדיקות התחברות - The Internet', () => {
  let loginPage: TheInternetLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new TheInternetLoginPage(page);
  });

  test('בדיקת התחברות מוצלחת', async () => {
    // 1. ניווט לדף ההתחברות
    await loginPage.goto();

    // 2. הזנת פרטי התחברות תקינים
    await loginPage.login('tomsmith', 'SuperSecretPassword!');

    // 3. בדיקה שההתחברות הצליחה (מופיעה הודעת הצלחה)
    await loginPage.isSuccessMessageVisible();
    const successMessage = await loginPage.getSuccessMessage();
    expect(successMessage).toContain('You logged into a secure area!');

    // 4. בדיקה שאפשר להתנתק
    await loginPage.logout();
  });

  test('בדיקת התחברות עם סיסמה שגויה', async () => {
    // 1. ניווט לדף ההתחברות
    await loginPage.goto();

    // 2. הזנת שם משתמש נכון וסיסמה שגויה
    await loginPage.login('tomsmith', 'WrongPassword');

    // 3. בדיקה שההתחברות נכשלה (מופיעה הודעת שגיאה)
    await loginPage.isErrorMessageVisible();
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Your password is invalid!');
  });

  test('בדיקת התחברות עם שם משתמש שגוי', async () => {
    // 1. ניווט לדף ההתחברות
    await loginPage.goto();

    // 2. הזנת שם משתמש שגוי וסיסמה נכונה
    await loginPage.login('wronguser', 'SuperSecretPassword!');

    // 3. בדיקה שההתחברות נכשלה (מופיעה הודעת שגיאה)
    await loginPage.isErrorMessageVisible();
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Your username is invalid!');
  });
});