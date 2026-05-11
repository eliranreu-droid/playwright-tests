import { Page, Locator } from '@playwright/test';

export class TheInternetLoginPage {
  private page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.logoutButton = page.locator('a[href="/logout"]');
    this.successMessage = page.locator('#flash');
    this.errorMessage = page.locator('#flash');
  }

  async goto() {
    await this.page.goto('https://the-internet.herokuapp.com/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async getSuccessMessage(): Promise<string> {
    return await this.successMessage.textContent() || '';
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    await this.successMessage.waitFor({ state: 'visible' });
    return true;
  }

  async isErrorMessageVisible(): Promise<boolean> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return true;
  }
}