import { Page, Locator } from '@playwright/test';

export class BankHapoalimLoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly personalAreaButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // Selectors for Bank Hapoalim login page - multiple possible selectors
        // Username input - covers various possible attribute names and Hebrew placeholders
        this.usernameInput = page.locator(
            'input[id="username"], input[name="username"], input[placeholder*="שם משתמש"], ' +
            'input[placeholder*="user"], input[formcontrolname="userName"], input[formcontrolname="username"], ' +
            'input[id*="user"], input[name*="user"], .username-input, #username, input[data-testid="username"]'
        );
        
        // Password input - covers various possible attribute names and Hebrew placeholders
        this.passwordInput = page.locator(
            'input[id="password"], input[name="password"], input[placeholder*="סיסמ"], ' +
            'input[placeholder*="pass"], input[formcontrolname="password"], input[type="password"], ' +
            'input[id*="pass"], input[name*="pass"], .password-input, #password, input[data-testid="password"]'
        );
        
        // Login button - covers various possible button selectors
        this.loginButton = page.locator(
            'button[type="submit"], button:has-text("כניסה"), .login-button, ' +
            'input[type="submit"], button[id="login"], button[name="login"], ' +
            'button:has-text("התחבר"), .btn-login, button[data-testid="login"], ' +
            'button:has-text("Enter"), button:has-text("Login")'
        );
        
        // Personal area button
        this.personalAreaButton = page.locator(
            'a:has-text("אזור אישי"), button:has-text("אזור אישי"), .personal-area-link, ' +
            'a:has-text("אזור האישי"), button:has-text("אזור האישי")'
        );
    }

    async goto() {
        await this.page.goto('https://login.bankhapoalim.co.il/');
    }

    async login(username: string, password: string) {
        await this.usernameInput.waitFor({ state: 'visible' });
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async goToPersonalArea() {
        await this.personalAreaButton.click();
    }
}