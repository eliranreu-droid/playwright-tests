import { Page, Locator } from '@playwright/test';

export class ProductsPage {
    readonly page: Page;
    readonly pageTitle: Locator;
    readonly cartBadge: Locator; // לוקייטור למספר שעל העגלה

    constructor(page: Page) {
        this.page = page;
        this.pageTitle = page.locator('.title');
        this.cartBadge = page.locator('.shopping_cart_badge');
    }

    async addProductToCart(productName: string) {
        const productLocator = this.page.locator('.inventory_item', { hasText: productName });
        await productLocator.locator('button').click();
    }

    // פונקציה שמחזירה את הטקסט (המספר) שמופיע על העגלה
    async getCartCount() {
        return await this.cartBadge.textContent();
    }
}