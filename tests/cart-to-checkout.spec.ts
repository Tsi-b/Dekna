import { test, expect } from '@playwright/test';

test('cart -> proceed to checkout opens checkout modal', async ({ page }) => {
  await page.goto('/');

  // Click the first visible "Add to Cart" button from a product card.
  await page.getByTestId('product-add-to-cart').first().click();

  // Cart modal should open (route-driven /cart).
  await expect(page.getByTestId('cart-modal')).toBeVisible();

  // Proceed to checkout.
  await page.getByTestId('cart-proceed-checkout').click();

  // Checkout modal should open.
  await expect(page.getByTestId('checkout-modal')).toBeVisible();
});
