import { test, expect } from '@playwright/test';
import { BankHapoalimLoginPage } from '../pages/BankHapoalimLoginPage';
import { BankHapoalimDashboardPage } from '../pages/BankHapoalimDashboardPage';

test.describe('Bank Hapoalim Balance Check Tests', () => {
    test('Scenario 2: Login and verify checking account balance is between 100 and 1000 shekels', async ({ page }) => {
        const loginPage = new BankHapoalimLoginPage(page);
        const dashboardPage = new BankHapoalimDashboardPage(page);

        // Step 1: Navigate to login page and login
        await loginPage.goto();
        await loginPage.login('vo85561', 'noadordi2468');

        // Wait for login to complete and navigate to personal area
        await expect(page).toHaveURL(/.*bankhapoalim.*/);
        
        // Step 2: Go to personal area
        await loginPage.goToPersonalArea();

        // Step 3: Click on Checking Account (עובר ושוב)
        await dashboardPage.goToCheckingAccount();

        // Step 4: Get account balance
        const balance = await dashboardPage.getAccountBalance();
        console.log(`Current account balance: ${balance} shekels`);

        // Step 5: Verify balance is between 100 and 1000 shekels
        // Test passes if balance > 100 AND balance < 1000
        expect(balance).toBeGreaterThan(100);
        expect(balance).toBeLessThan(1000);
        
        console.log(`Test 2 passed: Balance ${balance} is between 100 and 1000 shekels`);
    });

    test('Scenario 2 Alternative: Verify balance validation with explicit pass/fail', async ({ page }) => {
        const loginPage = new BankHapoalimLoginPage(page);
        const dashboardPage = new BankHapoalimDashboardPage(page);

        // Step 1: Navigate to login page and login
        await loginPage.goto();
        await loginPage.login('vo85561', 'noadordi2468');

        // Wait for login to complete and navigate to personal area
        await expect(page).toHaveURL(/.*bankhapoalim.*/);
        
        // Step 2: Go to personal area
        await loginPage.goToPersonalArea();

        // Step 3: Click on Checking Account (עובר ושוב)
        await dashboardPage.goToCheckingAccount();

        // Step 4: Get account balance
        const balance = await dashboardPage.getAccountBalance();
        console.log(`Current account balance: ${balance} shekels`);

        // Step 5: Validate balance criteria
        // Pass if balance > 100, Fail if balance < 1000
        if (balance > 100) {
            console.log(`✓ Balance (${balance}) is greater than 100 shekels - Test PASSES`);
            // Test passes
        } else {
            console.log(`✗ Balance (${balance}) is NOT greater than 100 shekels - Test FAILS`);
            throw new Error(`Balance ${balance} is not greater than 100 shekels`);
        }

        if (balance < 1000) {
            console.log(`✓ Balance (${balance}) is less than 1000 shekels - Test PASSES`);
            // Test passes
        } else {
            console.log(`✗ Balance (${balance}) is NOT less than 1000 shekels - Test FAILS`);
            throw new Error(`Balance ${balance} is not less than 1000 shekels`);
        }
    });
});