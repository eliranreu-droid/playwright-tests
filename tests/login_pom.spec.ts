import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage'; // ייבוא ה-Class החדש

test('full purchase flow end-to-end', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const Productspage = new ProductsPage(page);
    const cartpage = new CartPage(page);
    const checkoutpage = new CheckoutPage(page);

    // 1. התחברות
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    // 2. הוספת מוצר
    await Productspage.addProductToCart('Sauce Labs Backpack');

    // 2. הוספת מוצר
    await Productspage.addProductToCart('Sauce Labs Bike Light');

    // בדיקת ולידציה: מוודאים שהמספר על העגלה הוא "2"
    const cartCount = await Productspage.getCartCount();
    expect(cartCount).toBe('2'); 
    
    console.log('Validation passed: Cart count is ' + cartCount);

    // 3. מעבר לעגלה ולחיצה על Checkout
    await cartpage.goToCart();
    await cartpage.clickCheckout();

    // 4. מילוי פרטים בדף ה-Checkout
    await checkoutpage.fillInformation('Israel', 'Israeli', '12345');

    // 5. סיום ההזמנה
    await checkoutpage.finishOrder();

    // 6. בדיקה סופית - האם קיבלנו הודעת תודה?
    await expect(checkoutpage.successMessage).toHaveText('Thank you for your order!');
});