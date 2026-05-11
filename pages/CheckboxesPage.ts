import { Page, Locator } from '@playwright/test';

export class CheckboxesPage {
  private page: Page;
  private checkbox1: Locator;
  private checkbox2: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkbox1 = page.locator('input[type="checkbox"]').first();
    this.checkbox2 = page.locator('input[type="checkbox"]').nth(1);
  }

  async goto() {
    await this.page.goto('https://the-internet.herokuapp.com/checkboxes');
  }

  async checkCheckbox1() {
    await this.checkbox1.check();
  }

  async uncheckCheckbox1() {
    await this.checkbox1.uncheck();
  }

  async checkCheckbox2() {
    await this.checkbox2.check();
  }

  async uncheckCheckbox2() {
    await this.checkbox2.uncheck();
  }

  async isCheckbox1Checked(): Promise<boolean> {
    return await this.checkbox1.isChecked();
  }

  async isCheckbox2Checked(): Promise<boolean> {
    return await this.checkbox2.isChecked();
  }
}