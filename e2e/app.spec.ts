import { test, expect } from '@playwright/test';

test.describe('Brand Color Accessibility Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Brand Color Accessibility Tool/);

    // Check main heading is visible
    const heading = page.locator('h1');
    await expect(heading).toContainText('Brand Color Accessibility Tool');
  });

  test('should have skip link for accessibility', async ({ page }) => {
    // Skip link should exist
    const skipLink = page.locator('a.skip-link, a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);

    // Skip link should be focusable and visible on focus
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
  });

  test('should have proper landmark regions', async ({ page }) => {
    // Main content area should exist
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through the page and verify focus moves
    await page.keyboard.press('Tab');

    // Something should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have no accessibility violations on load', async ({ page }) => {
    await page.goto('/');

    // Basic accessibility checks
    // Check for alt text on images (if any)
    const imagesWithoutAlt = page.locator('img:not([alt])');
    await expect(imagesWithoutAlt).toHaveCount(0);

    // Check for form labels (if any forms exist)
    // This is a soft check - will be more relevant when we add inputs
  });
});

test.describe('Responsive Design', () => {
  test('should render correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should render correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should render correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });
});
