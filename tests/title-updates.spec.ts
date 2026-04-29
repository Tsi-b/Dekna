import { test, expect } from '@playwright/test';

/**
 * Cross-Browser Dynamic Title Tests
 * Tests that browser tab titles update correctly across all routes and navigation methods
 */

test.describe('Dynamic Title Updates - All Routes', () => {
  test('homepage has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('DEKNA - Premium Kids Goods Shop');
  });

  test('collections routes have correct titles', async ({ page }) => {
    const collections = [
      { path: '/collections/all', title: 'All Products | DEKNA' },
      { path: '/collections/toys', title: 'Toys | DEKNA' },
      { path: '/collections/books', title: 'Books | DEKNA' },
      { path: '/collections/gifts', title: 'Gifts | DEKNA' },
      { path: '/collections/clothing', title: 'Clothing | DEKNA' },
    ];

    for (const { path, title } of collections) {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
    }
  });

  test('search route has correct title', async ({ page }) => {
    // Without query
    await page.goto('/search');
    await expect(page).toHaveTitle('Search | DEKNA');

    // With query
    await page.goto('/search?q=teddy');
    await expect(page).toHaveTitle('Search: teddy | DEKNA');
  });

  test('cart route has correct title', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveTitle('Cart | DEKNA');
  });

  test('auth route has correct title', async ({ page }) => {
    await page.goto('/auth');
    await expect(page).toHaveTitle('Sign In | DEKNA');
  });

  test('dedicated pages have correct titles', async ({ page }) => {
    const pages = [
      { path: '/about-us', title: 'About Us | DEKNA' },
      { path: '/refund-policy', title: 'Refund Policy | DEKNA' },
      { path: '/terms-of-service', title: 'Terms of Service | DEKNA' },
      { path: '/privacy-policy', title: 'Privacy Policy | DEKNA' },
      { path: '/returns-refunds', title: 'Returns & Refunds | DEKNA' },
      { path: '/app-download', title: 'Download App | DEKNA' },
    ];

    for (const { path, title } of pages) {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
    }
  });

  test('404 page has correct title', async ({ page }) => {
    await page.goto('/non-existent-page');
    await expect(page).toHaveTitle('Page Not Found | DEKNA');
  });
});

test.describe('Dynamic Title Updates - Navigation Methods', () => {
  test('title updates when clicking navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('DEKNA - Premium Kids Goods Shop');

    // Click a navigation link
    await page.click('a[href="/collections/toys"]');
    await page.waitForURL('**/collections/toys');
    await expect(page).toHaveTitle('Toys | DEKNA');
  });

  test('title updates on browser back button', async ({ page }) => {
    await page.goto('/');
    await page.goto('/collections/toys');
    await expect(page).toHaveTitle('Toys | DEKNA');

    await page.goBack();
    await expect(page).toHaveTitle('DEKNA - Premium Kids Goods Shop');
  });

  test('title updates on browser forward button', async ({ page }) => {
    await page.goto('/');
    await page.goto('/collections/toys');
    await page.goBack();
    
    await page.goForward();
    await expect(page).toHaveTitle('Toys | DEKNA');
  });

  test('title correct on direct URL access', async ({ page }) => {
    await page.goto('/collections/books');
    await expect(page).toHaveTitle('Books | DEKNA');
  });

  test('title persists on page refresh', async ({ page }) => {
    await page.goto('/collections/toys');
    await expect(page).toHaveTitle('Toys | DEKNA');

    await page.reload();
    await expect(page).toHaveTitle('Toys | DEKNA');
  });

  test('title unchanged on hash link navigation', async ({ page }) => {
    await page.goto('/');
    const initialTitle = await page.title();

    // Click a hash link (if exists)
    const hashLink = page.locator('a[href^="#"]').first();
    if (await hashLink.count() > 0) {
      await hashLink.click();
      await page.waitForTimeout(500); // Wait for potential title change
      await expect(page).toHaveTitle(initialTitle);
    }
  });

  test('title updates on programmatic navigation', async ({ page }) => {
    await page.goto('/');
    
    // Trigger programmatic navigation (e.g., search submit)
    await page.fill('input[type="search"]', 'teddy');
    await page.press('input[type="search"]', 'Enter');
    
    await page.waitForURL('**/search?q=teddy');
    await expect(page).toHaveTitle('Search: teddy | DEKNA');
  });
});

test.describe('Dynamic Title Updates - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('title updates on mobile navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('DEKNA - Premium Kids Goods Shop');

    // Open mobile menu
    await page.click('[aria-label="Menu"]');
    
    // Click a category
    await page.click('text=Toys');
    await page.waitForURL('**/collections/toys');
    await expect(page).toHaveTitle('Toys | DEKNA');
  });

  test('title persists on orientation change', async ({ page }) => {
    await page.goto('/collections/toys');
    await expect(page).toHaveTitle('Toys | DEKNA');

    // Simulate orientation change
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);
    await expect(page).toHaveTitle('Toys | DEKNA');
  });
});

test.describe('Dynamic Title Updates - E-Commerce Flow', () => {
  test('title updates through checkout flow', async ({ page }) => {
    await page.goto('/');
    
    // Add to cart
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    await addToCartBtn.click();
    await page.waitForURL('**/cart');
    await expect(page).toHaveTitle('Cart | DEKNA');

    // Go to checkout
    const checkoutBtn = page.locator('button:has-text("Checkout")');
    if (await checkoutBtn.count() > 0) {
      await checkoutBtn.click();
      await page.waitForURL('**/checkout/**');
      await expect(page).toHaveTitle(/Checkout|Shipping|Payment/);
    }
  });

  test('title updates when viewing product details', async ({ page }) => {
    await page.goto('/collections/toys');
    await expect(page).toHaveTitle('Toys | DEKNA');

    // Click product (opens quick view modal)
    const productCard = page.locator('.product-card').first();
    await productCard.click();
    
    // Title should remain on collections page
    await expect(page).toHaveTitle('Toys | DEKNA');
  });
});

test.describe('Dynamic Title Updates - Search', () => {
  test('title updates with search query', async ({ page }) => {
    await page.goto('/');
    
    // Perform search
    await page.fill('input[type="search"]', 'teddy bear');
    await page.press('input[type="search"]', 'Enter');
    
    await page.waitForURL('**/search?q=teddy+bear');
    await expect(page).toHaveTitle('Search: teddy bear | DEKNA');
  });

  test('title updates when clearing search', async ({ page }) => {
    await page.goto('/search?q=teddy');
    await expect(page).toHaveTitle('Search: teddy | DEKNA');

    // Clear search
    await page.fill('input[type="search"]', '');
    await page.press('input[type="search"]', 'Enter');
    
    await page.waitForURL('**/search');
    await expect(page).toHaveTitle('Search | DEKNA');
  });
});

test.describe('Dynamic Title Updates - Account', () => {
  test('account routes have correct titles', async ({ page }) => {
    // Note: These tests assume user is signed in
    // In real tests, you'd need to handle authentication
    
    const accountRoutes = [
      { path: '/account/profile', title: 'Profile | DEKNA' },
      { path: '/account/wishlist', title: 'Wishlist | DEKNA' },
      { path: '/account/orders', title: 'Orders | DEKNA' },
      { path: '/account/addresses', title: 'Addresses | DEKNA' },
    ];

    for (const { path, title } of accountRoutes) {
      await page.goto(path);
      // Will redirect to auth if not signed in
      const currentTitle = await page.title();
      expect(currentTitle).toMatch(new RegExp(`${title}|Sign In`));
    }
  });
});

test.describe('Dynamic Title Updates - Performance', () => {
  test('title updates quickly on navigation', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await page.click('a[href="/collections/toys"]');
    await page.waitForURL('**/collections/toys');
    await expect(page).toHaveTitle('Toys | DEKNA');
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(1000); // Should update within 1 second
  });

  test('no title flicker on fast navigation', async ({ page }) => {
    await page.goto('/');
    
    // Rapidly navigate
    await page.click('a[href="/collections/toys"]');
    await page.waitForTimeout(100);
    await page.click('a[href="/collections/books"]');
    
    await page.waitForURL('**/collections/books');
    await expect(page).toHaveTitle('Books | DEKNA');
  });
});

test.describe('Dynamic Title Updates - Edge Cases', () => {
  test('title handles special characters in search', async ({ page }) => {
    await page.goto('/search?q=toy%20%26%20game');
    await expect(page).toHaveTitle('Search: toy & game | DEKNA');
  });

  test('title handles very long search queries', async ({ page }) => {
    const longQuery = 'a'.repeat(100);
    await page.goto(`/search?q=${longQuery}`);
    const title = await page.title();
    expect(title).toContain('Search:');
    expect(title).toContain('DEKNA');
  });

  test('title handles unknown collection categories', async ({ page }) => {
    await page.goto('/collections/unknown-category');
    // Should either redirect or show a valid title
    const title = await page.title();
    expect(title).toMatch(/DEKNA/);
  });

  test('title updates correctly after error', async ({ page }) => {
    // Navigate to 404
    await page.goto('/non-existent');
    await expect(page).toHaveTitle('Page Not Found | DEKNA');

    // Navigate to valid page
    await page.goto('/');
    await expect(page).toHaveTitle('DEKNA - Premium Kids Goods Shop');
  });
});
