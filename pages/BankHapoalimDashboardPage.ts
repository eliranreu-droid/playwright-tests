import { Page, Locator } from '@playwright/test';

export class BankHapoalimDashboardPage {
    readonly page: Page;
    readonly depositsAndSavingsButton: Locator;
    readonly checkingAccountButton: Locator;
    readonly transferButton: Locator;
    readonly transferAmountInput: Locator;
    readonly transferToAccountInput: Locator;
    readonly transferConfirmButton: Locator;
    readonly accountBalance: Locator;
    readonly priAccountOption: Locator;

    constructor(page: Page) {
        this.page = page;
        // Selectors for Bank Hapoalim dashboard
        this.depositsAndSavingsButton = page.locator('a:has-text("פקדונות וחסכונות"), button:has-text("פקדונות וחסכונות"), .deposits-link');
        this.checkingAccountButton = page.locator('a:has-text("עובר ושוב"), button:has-text("עובר ושוב"), .checking-account-link');
        this.transferButton = page.locator('button:has-text("העברה"), .transfer-button, [data-action="transfer"]');
        this.transferAmountInput = page.locator('[id="amount"], [name="amount"], [placeholder*="סכום"], .amount-input');
        this.transferToAccountInput = page.locator('[id="toAccount"], [name="toAccount"], [placeholder*="חשבון יעד"], .to-account-input');
        this.transferConfirmButton = page.locator('button:has-text("אישור"), button:has-text("העבר"), .confirm-transfer-button');
        this.accountBalance = page.locator('.balance, [data-testid="balance"], .account-balance, span:has-text("ש"ח")');
        this.priAccountOption = page.locator('text="פרי", .pri-account-option, [data-account="pri"]');
    }

    async goToDepositsAndSavings() {
        await this.depositsAndSavingsButton.click();
    }

    async goToCheckingAccount() {
        await this.checkingAccountButton.click();
    }

    async initiateTransfer() {
        await this.transferButton.click();
    }

    async fillTransferDetails(amount: string, toAccount: string) {
        await this.transferAmountInput.fill(amount);
        await this.transferToAccountInput.fill(toAccount);
    }

    async confirmTransfer() {
        await this.transferConfirmButton.click();
    }

    async getAccountBalance(): Promise<number> {
        const balanceText = await this.accountBalance.textContent();
        // Extract number from text (remove "ש"ח", commas, spaces)
        const numericValue = balanceText?.replace(/[^\d.]/g, '') || '0';
        return parseFloat(numericValue);
    }

    async selectPriAccount() {
        await this.priAccountOption.click();
    }

    async transferToPri(amount: string = '1') {
        await this.initiateTransfer();
        await this.selectPriAccount();
        await this.fillTransferDetails(amount, 'פרי');
        await this.confirmTransfer();
    }
}