# Bank Hapoalim Automated Tests

This document describes the automated test scripts for Bank Hapoalim using Playwright.

## Test Scenarios

### Scenario 1: Transfer 1 Shekel to Pri Account
**File:** `tests/bankhapoalim-transfer.spec.ts`

**Steps:**
1. Navigate to Bank Hapoalim login page
2. Login with credentials:
   - Username: `vo85561`
   - Password: `noadordi2468`
3. Enter personal area
4. Click on "פקדונות וחסכונות" (Deposits and Savings)
5. Transfer 1 shekel to "פרי" (Pri) account
6. Verify transfer was successful

### Scenario 2: Check Account Balance
**File:** `tests/bankhapoalim-balance-check.spec.ts`

**Steps:**
1. Navigate to Bank Hapoalim login page
2. Login with credentials:
   - Username: `vo85561`
   - Password: `noadordi2468`
3. Enter personal area
4. Click on "עובר ושוב" (Checking Account)
5. Get account balance
6. Verify balance is between 100 and 1000 shekels:
   - **PASS** if balance > 100 AND balance < 1000
   - **FAIL** if balance ≤ 100 OR balance ≥ 1000

## Page Objects

### BankHapoalimLoginPage
**File:** `pages/BankHapoalimLoginPage.ts`

Handles login functionality:
- `goto()` - Navigate to login page
- `login(username, password)` - Login with credentials
- `goToPersonalArea()` - Navigate to personal area

### BankHapoalimDashboardPage
**File:** `pages/BankHapoalimDashboardPage.ts`

Handles dashboard operations:
- `goToDepositsAndSavings()` - Navigate to deposits and savings
- `goToCheckingAccount()` - Navigate to checking account
- `transferToPri(amount)` - Transfer money to Pri account
- `getAccountBalance()` - Get current account balance

## Running the Tests

### Run all Bank Hapoalim tests:
```bash
npx playwright test bankhapoalim
```

### Run specific test file:
```bash
# Run transfer test
npx playwright test tests/bankhapoalim-transfer.spec.ts

# Run balance check test
npx playwright test tests/bankhapoalim-balance-check.spec.ts
```

### Run with UI mode (for debugging):
```bash
npx playwright test --ui
```

### Run with headed browser (visible browser):
```bash
npx playwright test --project=chromium --headed
```

## Important Notes

1. **Selectors**: The selectors used in the page objects are generic and may need adjustment based on the actual Bank Hapoalim website structure. Common selector patterns used:
   - Text-based: `button:has-text("פקדונות וחסכונות")`
   - ID/Name: `[id="username"]`, `[name="password"]`
   - CSS classes: `.balance`, `.transfer-button`

2. **Wait Times**: The tests include basic waits, but you may need to add explicit waits for specific elements depending on the website's loading times.

3. **Credentials**: The tests use the provided credentials. Ensure they are valid and the account has sufficient funds for transfers.

4. **Error Handling**: Tests will fail if:
   - Login fails
   - Elements are not found
   - Transfer fails
   - Balance is not within the expected range (100-1000 shekels)

## Troubleshooting

If tests fail, check:
1. Internet connection
2. Bank Hapoalim website availability
3. Login credentials validity
4. Account balance and permissions
5. Selector accuracy (inspect the actual website elements)

## Maintenance

The selectors may need to be updated if the Bank Hapoalim website changes its UI. Always inspect the actual elements and update the page objects accordingly.