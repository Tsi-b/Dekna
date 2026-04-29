# Cross-Browser / Cross-Device Testing Guide

## 📋 Overview

Comprehensive testing checklist for DEKNA e-commerce application across browsers, devices, and operating systems.

---

## 🌐 Browser Support Matrix

### Desktop Browsers

| Browser | Version | Priority | Status |
|---------|---------|----------|--------|
| Chrome | Latest 2 | **HIGH** | ✅ Primary |
| Firefox | Latest 2 | **HIGH** | ✅ Primary |
| Safari | Latest 2 | **HIGH** | ✅ Primary |
| Edge | Latest 2 | **HIGH** | ✅ Primary |
| Opera | Latest | MEDIUM | ⚠️ Secondary |
| Brave | Latest | MEDIUM | ⚠️ Secondary |

### Mobile Browsers

| Browser | Platform | Priority | Status |
|---------|----------|----------|--------|
| Safari | iOS 14+ | **HIGH** | ✅ Primary |
| Chrome | Android 10+ | **HIGH** | ✅ Primary |
| Samsung Internet | Android | MEDIUM | ⚠️ Secondary |
| Firefox Mobile | Android/iOS | MEDIUM | ⚠️ Secondary |
| Edge Mobile | Android/iOS | LOW | ⚠️ Secondary |

---

## 📱 Device Testing Matrix

### Mobile Devices

#### iOS Devices
- **iPhone 14 Pro Max** (6.7", 430x932) - HIGH
- **iPhone 14 Pro** (6.1", 393x852) - HIGH
- **iPhone 13** (6.1", 390x844) - HIGH
- **iPhone SE** (4.7", 375x667) - MEDIUM
- **iPad Pro 12.9"** (1024x1366) - MEDIUM
- **iPad Air** (820x1180) - MEDIUM

#### Android Devices
- **Samsung Galaxy S23 Ultra** (6.8", 412x915) - HIGH
- **Samsung Galaxy S22** (6.1", 360x800) - HIGH
- **Google Pixel 7 Pro** (6.7", 412x892) - HIGH
- **OnePlus 11** (6.7", 412x919) - MEDIUM
- **Samsung Galaxy Tab S8** (10.5", 800x1280) - MEDIUM

### Desktop Resolutions
- **1920x1080** (Full HD) - HIGH
- **1366x768** (HD) - HIGH
- **2560x1440** (2K) - MEDIUM
- **3840x2160** (4K) - MEDIUM
- **1280x720** (HD Ready) - MEDIUM

---

## 🧪 Testing Checklist

### 1. Layout & Responsiveness

#### Desktop (1920x1080)
- [ ] Header displays correctly
- [ ] Navigation menu fully visible
- [ ] Hero section properly sized
- [ ] Product grid shows 4 columns
- [ ] Footer layout correct
- [ ] Modals centered and sized properly
- [ ] No horizontal scrolling
- [ ] All text readable

#### Tablet (768px - 1024px)
- [ ] Header adapts to tablet size
- [ ] Navigation collapses appropriately
- [ ] Product grid shows 2-3 columns
- [ ] Touch targets minimum 44px
- [ ] Modals adapt to screen size
- [ ] Images scale properly
- [ ] No content overflow

#### Mobile (320px - 767px)
- [ ] Hamburger menu works
- [ ] Product grid shows 1-2 columns
- [ ] Forms are thumb-friendly
- [ ] Buttons are tappable (44px min)
- [ ] Text is readable (16px min)
- [ ] No horizontal scrolling
- [ ] Sticky header works
- [ ] Bottom navigation accessible

### 2. Navigation Testing

#### All Browsers
- [ ] Header navigation links work
- [ ] Category navigation works
- [ ] Search functionality works
- [ ] Breadcrumbs display correctly
- [ ] Back/forward buttons work
- [ ] Deep linking works
- [ ] Hash links scroll correctly
- [ ] 404 page displays

#### Mobile Specific
- [ ] Hamburger menu opens/closes
- [ ] Touch gestures work
- [ ] Swipe navigation works
- [ ] Pull-to-refresh disabled (if needed)
- [ ] Scroll momentum smooth

### 3. Dynamic Title Testing

#### Desktop Browsers
- [ ] Homepage: "DEKNA - Premium Kids Goods Shop"
- [ ] Collections: "Toys | DEKNA"
- [ ] Search: "Search: query | DEKNA"
- [ ] Cart: "Cart | DEKNA"
- [ ] Account: "Account | DEKNA"
- [ ] Checkout: "Checkout | DEKNA"
- [ ] About: "About Us | DEKNA"
- [ ] 404: "Page Not Found | DEKNA"

#### Navigation Methods
- [ ] Click link → title updates
- [ ] Browser back → title updates
- [ ] Browser forward → title updates
- [ ] Direct URL → correct title
- [ ] Page refresh → title persists
- [ ] Hash link → title unchanged

#### Mobile Browsers
- [ ] Titles update on navigation
- [ ] Titles show in tab switcher
- [ ] Titles persist on app switch
- [ ] Titles correct on orientation change

### 4. Forms & Input Testing

#### Desktop
- [ ] Text inputs work
- [ ] Dropdowns work
- [ ] Checkboxes/radios work
- [ ] Date pickers work
- [ ] File uploads work
- [ ] Form validation works
- [ ] Error messages display
- [ ] Success messages display
- [ ] Autofill works

#### Mobile
- [ ] Virtual keyboard appears
- [ ] Input types correct (email, tel, number)
- [ ] Autocomplete works
- [ ] Zoom disabled on focus (if needed)
- [ ] Submit on enter works
- [ ] Touch targets adequate
- [ ] Validation messages visible

### 5. E-Commerce Functionality

#### Product Browsing
- [ ] Product grid loads
- [ ] Product images load
- [ ] Lazy loading works
- [ ] Filters work
- [ ] Sorting works
- [ ] Pagination works
- [ ] Quick view modal works
- [ ] Product details display

#### Cart & Checkout
- [ ] Add to cart works
- [ ] Cart modal opens
- [ ] Quantity updates work
- [ ] Remove from cart works
- [ ] Cart persists on refresh
- [ ] Checkout flow works
- [ ] Payment integration works
- [ ] Order confirmation displays

#### Account Features
- [ ] Sign in works
- [ ] Sign up works
- [ ] Password reset works
- [ ] Profile updates work
- [ ] Order history displays
- [ ] Wishlist works
- [ ] Address management works
- [ ] Sign out works

### 6. Performance Testing

#### Desktop
- [ ] Page load < 3s
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] No layout shifts
- [ ] Smooth scrolling
- [ ] Animations smooth (60fps)
- [ ] Images optimized

#### Mobile
- [ ] Page load < 5s (3G)
- [ ] First Contentful Paint < 2.5s
- [ ] Time to Interactive < 5s
- [ ] No jank on scroll
- [ ] Touch response < 100ms
- [ ] Battery usage acceptable
- [ ] Data usage reasonable

### 7. PWA Testing

#### Installation
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] App icon displays correctly
- [ ] Splash screen shows
- [ ] App opens in standalone mode

#### Offline Functionality
- [ ] Service worker registers
- [ ] Assets cached
- [ ] Offline page displays
- [ ] Online/offline detection works
- [ ] Background sync works (if implemented)

#### Updates
- [ ] App updates automatically
- [ ] Update notification shows
- [ ] New version loads correctly

### 8. Accessibility Testing

#### Keyboard Navigation
- [ ] Tab order logical
- [ ] Focus visible
- [ ] Skip links work
- [ ] Keyboard shortcuts work
- [ ] Escape closes modals
- [ ] Enter submits forms

#### Screen Reader
- [ ] Headings structured correctly
- [ ] Alt text on images
- [ ] ARIA labels present
- [ ] Form labels associated
- [ ] Error messages announced
- [ ] Dynamic content announced

#### Visual
- [ ] Color contrast 4.5:1+
- [ ] Text resizable to 200%
- [ ] No content loss on zoom
- [ ] Focus indicators visible
- [ ] No flashing content

### 9. Dark Mode Testing

#### All Browsers
- [ ] Dark mode toggle works
- [ ] Colors invert correctly
- [ ] Text readable
- [ ] Images display correctly
- [ ] Contrast maintained
- [ ] Preference persists
- [ ] System preference detected

### 10. SEO Testing

#### Meta Tags
- [ ] Title tags unique
- [ ] Meta descriptions present
- [ ] Open Graph tags correct
- [ ] Twitter Cards configured
- [ ] Canonical URLs set
- [ ] Structured data valid

#### Crawlability
- [ ] Robots.txt accessible
- [ ] Sitemap.xml accessible
- [ ] No broken links
- [ ] Images have alt text
- [ ] Headings hierarchical

---

## 🔧 Testing Tools

### Browser DevTools
```bash
# Chrome DevTools
- Device Mode (Ctrl+Shift+M)
- Network throttling
- Lighthouse audit
- Performance profiler

# Firefox DevTools
- Responsive Design Mode (Ctrl+Shift+M)
- Accessibility inspector
- Network monitor

# Safari Web Inspector
- Responsive Design Mode
- Timeline profiler
- Storage inspector
```

### Online Testing Tools

#### Cross-Browser Testing
- **BrowserStack** - https://www.browserstack.com/
- **LambdaTest** - https://www.lambdatest.com/
- **Sauce Labs** - https://saucelabs.com/
- **CrossBrowserTesting** - https://crossbrowsertesting.com/

#### Mobile Testing
- **BrowserStack Mobile** - Real device testing
- **Appetize.io** - iOS/Android simulators
- **AWS Device Farm** - Real device cloud
- **Firebase Test Lab** - Android testing

#### Performance Testing
- **PageSpeed Insights** - https://pagespeed.web.dev/
- **GTmetrix** - https://gtmetrix.com/
- **WebPageTest** - https://www.webpagetest.org/
- **Lighthouse CI** - Automated testing

#### Accessibility Testing
- **WAVE** - https://wave.webaim.org/
- **axe DevTools** - Browser extension
- **Pa11y** - Automated testing
- **NVDA** - Screen reader (Windows)
- **JAWS** - Screen reader (Windows)
- **VoiceOver** - Screen reader (Mac/iOS)

#### SEO Testing
- **Google Search Console** - https://search.google.com/search-console
- **Schema Markup Validator** - https://validator.schema.org/
- **Rich Results Test** - https://search.google.com/test/rich-results
- **Mobile-Friendly Test** - https://search.google.com/test/mobile-friendly

---

## 🚀 Automated Testing Setup

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Sample Test Suite

```typescript
// tests/cross-browser.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Title Tests', () => {
  test('homepage title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('DEKNA - Premium Kids Goods Shop');
  });

  test('collections title', async ({ page }) => {
    await page.goto('/collections/toys');
    await expect(page).toHaveTitle('Toys | DEKNA');
  });

  test('search title', async ({ page }) => {
    await page.goto('/search?q=teddy');
    await expect(page).toHaveTitle('Search: teddy | DEKNA');
  });

  test('navigation updates title', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/collections/toys"]');
    await expect(page).toHaveTitle('Toys | DEKNA');
  });

  test('back button updates title', async ({ page }) => {
    await page.goto('/collections/toys');
    await page.goto('/collections/books');
    await page.goBack();
    await expect(page).toHaveTitle('Toys | DEKNA');
  });
});

test.describe('Responsive Layout Tests', () => {
  test('mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check hamburger menu visible
    const hamburger = page.locator('[aria-label="Menu"]');
    await expect(hamburger).toBeVisible();
    
    // Check product grid is single column
    const productGrid = page.locator('.product-grid');
    await expect(productGrid).toHaveCSS('grid-template-columns', /1fr/);
  });

  test('tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check product grid is 2-3 columns
    const productGrid = page.locator('.product-grid');
    const columns = await productGrid.evaluate(el => 
      window.getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(columns).toBeGreaterThanOrEqual(2);
    expect(columns).toBeLessThanOrEqual(3);
  });

  test('desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Check product grid is 4 columns
    const productGrid = page.locator('.product-grid');
    const columns = await productGrid.evaluate(el => 
      window.getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(columns).toBe(4);
  });
});

test.describe('E-Commerce Flow Tests', () => {
  test('add to cart flow', async ({ page }) => {
    await page.goto('/');
    
    // Add product to cart
    await page.click('.product-card:first-child button:has-text("Add to Cart")');
    
    // Verify cart modal opens
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify cart count updated
    const cartCount = page.locator('[aria-label="Cart"] .badge');
    await expect(cartCount).toHaveText('1');
  });

  test('checkout flow', async ({ page }) => {
    // Add product and go to checkout
    await page.goto('/');
    await page.click('.product-card:first-child button:has-text("Add to Cart")');
    await page.click('button:has-text("Checkout")');
    
    // Verify on checkout page
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page).toHaveTitle(/Checkout/);
  });
});
```

### Run Tests

```bash
# Install Playwright
npm run test:e2e:install

# Run all tests
npm run test:e2e

# Run specific browser
npx playwright test --project=chromium

# Run in headed mode
npx playwright test --headed

# Run with UI
npx playwright test --ui

# Generate report
npx playwright show-report
```

---

## 📊 Testing Schedule

### Pre-Release Testing
- [ ] Full manual testing on primary browsers
- [ ] Automated test suite passes
- [ ] Performance audit (Lighthouse 90+)
- [ ] Accessibility audit (WCAG AA)
- [ ] Mobile testing on real devices
- [ ] Cross-browser compatibility verified

### Weekly Testing
- [ ] Smoke tests on primary browsers
- [ ] Mobile responsiveness check
- [ ] Performance monitoring
- [ ] Broken link check

### Monthly Testing
- [ ] Full regression testing
- [ ] New browser version testing
- [ ] Device matrix testing
- [ ] SEO audit
- [ ] Security audit

---

## 🐛 Known Browser Issues & Workarounds

### Safari iOS
**Issue**: Date input not supported
```typescript
// Workaround: Use text input with pattern
<input type="text" pattern="\d{4}-\d{2}-\d{2}" />
```

**Issue**: 100vh includes address bar
```css
/* Workaround: Use dvh unit */
.full-height {
  height: 100dvh; /* Dynamic viewport height */
}
```

### Chrome Android
**Issue**: Zoom on input focus
```html
<!-- Workaround: Set font-size to 16px minimum -->
<input style="font-size: 16px;" />
```

### Firefox
**Issue**: Flexbox gap not supported in older versions
```css
/* Workaround: Use margin */
.flex-container > * + * {
  margin-left: 1rem;
}
```

### Edge
**Issue**: CSS Grid auto-fit issues
```css
/* Workaround: Use explicit columns */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
```

---

## 📝 Bug Report Template

```markdown
## Bug Report

**Browser**: Chrome 120.0.6099.109
**OS**: Windows 11
**Device**: Desktop (1920x1080)
**URL**: https://dekna.com/collections/toys

### Description
Brief description of the issue

### Steps to Reproduce
1. Go to homepage
2. Click on "Toys" category
3. Scroll to bottom
4. Observe issue

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Screenshots
[Attach screenshots]

### Console Errors
```
Error messages from console
```

### Additional Context
Any other relevant information
```

---

## ✅ Testing Sign-Off

### Desktop Browsers
- [ ] Chrome - Tested by: _____ Date: _____
- [ ] Firefox - Tested by: _____ Date: _____
- [ ] Safari - Tested by: _____ Date: _____
- [ ] Edge - Tested by: _____ Date: _____

### Mobile Devices
- [ ] iPhone (Safari) - Tested by: _____ Date: _____
- [ ] Android (Chrome) - Tested by: _____ Date: _____
- [ ] iPad - Tested by: _____ Date: _____

### Functionality
- [ ] Navigation - Tested by: _____ Date: _____
- [ ] E-Commerce - Tested by: _____ Date: _____
- [ ] Forms - Tested by: _____ Date: _____
- [ ] PWA - Tested by: _____ Date: _____

### Performance
- [ ] Lighthouse Score: _____ Date: _____
- [ ] PageSpeed Score: _____ Date: _____
- [ ] Mobile Performance: _____ Date: _____

### Accessibility
- [ ] WCAG AA Compliance - Tested by: _____ Date: _____
- [ ] Screen Reader - Tested by: _____ Date: _____
- [ ] Keyboard Navigation - Tested by: _____ Date: _____

---

## 🎯 Success Criteria

### Must Pass
- ✅ All primary browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile Safari and Chrome
- ✅ Responsive layouts (320px - 1920px)
- ✅ Core e-commerce functionality
- ✅ Dynamic title updates
- ✅ Lighthouse Performance 90+
- ✅ WCAG AA compliance

### Should Pass
- ✅ Secondary browsers (Opera, Brave)
- ✅ Tablet devices
- ✅ PWA installation
- ✅ Offline functionality
- ✅ Dark mode

### Nice to Have
- ✅ Legacy browser support
- ✅ Exotic devices
- ✅ Advanced PWA features

---

## 📚 Resources

- [Can I Use](https://caniuse.com/) - Browser compatibility
- [MDN Web Docs](https://developer.mozilla.org/) - Web standards
- [Web.dev](https://web.dev/) - Best practices
- [A11y Project](https://www.a11yproject.com/) - Accessibility
- [Playwright Docs](https://playwright.dev/) - Testing framework

---

**Last Updated**: 2026-04-28
**Version**: 1.0.0
**Status**: Ready for Testing
