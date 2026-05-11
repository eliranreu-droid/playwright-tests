import { test, expect } from '@playwright/test';
import { BankHapoalimLoginPage } from '../pages/BankHapoalimLoginPage';
import { BankHapoalimDashboardPage } from '../pages/BankHapoalimDashboardPage';

test.describe('Bank Hapoalim Transfer Tests', () => {
    test('Scenario 1: Login and transfer 1 shekel to Pri account via Deposits and Savings', async ({ page }) => {
        const loginPage = new BankHapoalimLoginPage(page);
        const dashboardPage = new BankHapoalimDashboardPage(page);

        // Step 1: Navigate to login page and login
        await loginPage.goto();
        await loginPage.login('vo85561', 'noadordi2468');

        // Wait for login to complete and navigate to personal area
        await expect(page).toHaveURL(/.*bankhapoalim.*/);
        
        // Step 2: Go to personal area
        await loginPage.goToPersonalArea();

        // Step 3: Click on Deposits and Savings
        await dashboardPage.goToDepositsAndSavings();

        // Step 4: Transfer 1 shekel to Pri account
        await dashboardPage.transferToPri('1');

        // Step 5: Verify transfer was successful (look for success message)
        await expect(page.locator('text="העברה בוצעה בהצלחה", .success-message, .transfer-success')).toBeVisible({ timeout: 10000 });
        
        console.log('Test 1 passed: Successfully transferred 1 shekel to Pri account');
    });
});