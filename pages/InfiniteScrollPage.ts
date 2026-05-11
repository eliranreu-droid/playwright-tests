import { Page, Locator } from '@playwright/test';

export class InfiniteScrollPage {
  private page: Page;
  private scrollContainer: Locator;
  private scrollItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.scrollContainer = page.locator('#content');
    // The Internet herokuapp uses jscroll plugin - content is loaded into .jscroll-added divs
    this.scrollItems = page.locator('.jscroll-added');
  }

  async goto() {
    await this.page.goto('https://the-internet.herokuapp.com/infinite_scroll');
  }

  async getInitialItemCount(): Promise<number> {
    return await this.scrollItems.count();
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async waitForNewContent(timeout: number = 2000): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  async getCurrentItemCount(): Promise<number> {
    return await this.scrollItems.count();
  }

  async getScrollItemText(index: number): Promise<string> {
    return await this.scrollItems.nth(index).textContent() || '';
  }

  async scrollMultipleTimes(times: number, delay: number = 1000): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.scrollToBottom();
      await this.waitForNewContent(delay);
    }
  }
}