import { Page, Locator } from '@playwright/test';

export class CartPage {
    readonly page: Page;
    readonly cartIcon: Locator;
    readonly checkoutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // לוקייטור לאייקון של העגלה (כדי לעבור אליה מדף המוצרים)
        this.cartIcon = page.locator('.shopping_cart_link');
        // לוקייטור לכפתור ה-Checkout בתוך העגלה
        this.checkoutButton = page.locator('[data-test="checkout"]');
    }

    async goToCart() {
        await this.cartIcon.click();
    }

    async clickCheckout() {
        await this.checkoutButton.click();
    }
}