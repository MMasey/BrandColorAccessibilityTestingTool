import { test } from '@playwright/test';

/**
 * Visual Review Test Suite
 *
 * Captures screenshots across device sizes with different color states
 * for senior designer review.
 *
 * Device Sizes:
 * - Desktop: 1440x900, 1920x1080
 * - Tablet: 768x1024, 1024x768
 * - Mobile: 375x667 (iPhone SE), 390x844 (iPhone 12), 414x896 (iPhone 11)
 *
 * Color States:
 * - Empty (no colours)
 * - Minimal (2 colours)
 * - Small (3 colours)
 * - Ideal (4 colours)
 * - Stress (10+ colours with long labels)
 *
 * Input format: "#hex, Label" or just "#hex" (comma-separated)
 */

/** Helper to add colors - color-input now has integrated Add button */
async function addColors(page: any, colors: string[]) {
  const hexInput = page.locator('color-palette color-input #hex-input');
  const labelInput = page.locator('color-palette color-input .label-input');
  const addButton = page.locator('color-palette color-input .add-btn');

  for (const color of colors) {
    // Parse "color, label" format
    const commaIndex = color.indexOf(',');
    let colorValue: string;
    let labelValue: string;

    if (commaIndex !== -1) {
      colorValue = color.slice(0, commaIndex).trim();
      labelValue = color.slice(commaIndex + 1).trim();
    } else {
      colorValue = color.trim();
      labelValue = '';
    }

    await hexInput.fill(colorValue);
    if (labelValue) {
      await labelInput.fill(labelValue);
    }
    await addButton.click();
    await page.waitForTimeout(50);
  }

  await page.waitForTimeout(300);
}

test.describe('Visual Review - Desktop (1440x900)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('Empty state - no colours', async ({ page }) => {
    await page.screenshot({
      path: 'e2e/visual-review/desktop-1440-empty.png',
      fullPage: true,
    });
  });

  test('Minimal state - 2 colours', async ({ page }) => {
    await addColors(page, ['#1a1a1a, Dark', '#ffffff, Light']);
    await page.screenshot({
      path: 'e2e/visual-review/desktop-1440-2colors.png',
      fullPage: true,
    });
  });

  test('Small palette - 3 colours', async ({ page }) => {
    await addColors(page, ['#1a1a1a, Dark Grey', '#ffffff, White', '#0066cc, Primary Blue']);
    await page.screenshot({
      path: 'e2e/visual-review/desktop-1440-3colors.png',
      fullPage: true,
    });
  });

  test('Ideal state - 4 colours', async ({ page }) => {
    await addColors(page, [
      '#1a1a1a, Dark Grey',
      '#ffffff, White',
      '#0066cc, Primary Blue',
      '#dc2626, Error Red',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/desktop-1440-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 12 colours with long labels', async ({ page }) => {
    await addColors(page, [
      '#000000, Extra Dark Charcoal Black',
      '#1a1a1a, Very Dark Grey Background',
      '#333333, Medium Dark Grey Text',
      '#666666, Standard Grey Secondary',
      '#999999, Light Grey Tertiary Color',
      '#cccccc, Very Light Grey Border',
      '#ffffff, Pure White Background',
      '#0066cc, Primary Interactive Blue',
      '#003d7a, Dark Primary Blue Hover',
      '#dc2626, Critical Error Red Alert',
      '#15803d, Success Green Confirmation',
      '#f59e0b, Warning Amber Notification',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/desktop-1440-stress.png',
      fullPage: true,
    });
  });
});

test.describe('Visual Review - Desktop Large (1920x1080)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('Ideal state - 4 colours', async ({ page }) => {
    await addColors(page, [
      '#1a1a1a, Dark Grey',
      '#ffffff, White',
      '#0066cc, Primary Blue',
      '#dc2626, Error Red',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/desktop-1920-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 12 colours', async ({ page }) => {
    await addColors(page, [
      '#000000, Extra Dark Charcoal Black',
      '#1a1a1a, Very Dark Grey Background',
      '#333333, Medium Dark Grey Text',
      '#666666, Standard Grey Secondary',
      '#999999, Light Grey Tertiary Color',
      '#cccccc, Very Light Grey Border',
      '#ffffff, Pure White Background',
      '#0066cc, Primary Interactive Blue',
      '#003d7a, Dark Primary Blue Hover',
      '#dc2626, Critical Error Red Alert',
      '#15803d, Success Green Confirmation',
      '#f59e0b, Warning Amber Notification',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/desktop-1920-stress.png',
      fullPage: true,
    });
  });
});

test.describe('Visual Review - Tablet Portrait (768x1024)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('Empty state', async ({ page }) => {
    await page.screenshot({
      path: 'e2e/visual-review/tablet-768-empty.png',
      fullPage: true,
    });
  });

  test('Minimal state - 2 colours', async ({ page }) => {
    await addColors(page, ['#1a1a1a, Dark', '#ffffff, Light']);
    await page.screenshot({
      path: 'e2e/visual-review/tablet-768-2colors.png',
      fullPage: true,
    });
  });

  test('Ideal state - 4 colours', async ({ page }) => {
    await addColors(page, [
      '#1a1a1a, Dark Grey',
      '#ffffff, White',
      '#0066cc, Primary Blue',
      '#dc2626, Error Red',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/tablet-768-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 10 colours', async ({ page }) => {
    await addColors(page, [
      '#000000, Extra Dark Charcoal Black',
      '#1a1a1a, Very Dark Grey Background',
      '#333333, Medium Dark Grey Text',
      '#666666, Standard Grey Secondary',
      '#999999, Light Grey Tertiary',
      '#cccccc, Very Light Grey Border',
      '#ffffff, Pure White Background',
      '#0066cc, Primary Interactive Blue',
      '#dc2626, Critical Error Red Alert',
      '#15803d, Success Green Confirm',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/tablet-768-stress.png',
      fullPage: true,
    });
  });
});

test.describe('Visual Review - Tablet Landscape (1024x768)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('Ideal state - 4 colours', async ({ page }) => {
    await addColors(page, [
      '#1a1a1a, Dark Grey',
      '#ffffff, White',
      '#0066cc, Primary Blue',
      '#dc2626, Error Red',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/tablet-1024-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 10 colours', async ({ page }) => {
    await addColors(page, [
      '#000000, Extra Dark Charcoal Black',
      '#1a1a1a, Very Dark Grey Background',
      '#333333, Medium Dark Grey Text',
      '#666666, Standard Grey Secondary',
      '#999999, Light Grey Tertiary',
      '#cccccc, Very Light Grey Border',
      '#ffffff, Pure White Background',
      '#0066cc, Primary Interactive Blue',
      '#dc2626, Critical Error Red Alert',
      '#15803d, Success Green Confirm',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/tablet-1024-stress.png',
      fullPage: true,
    });
  });
});

test.describe('Visual Review - Mobile iPhone SE (375x667)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('Empty state', async ({ page }) => {
    await page.screenshot({
      path: 'e2e/visual-review/mobile-375-empty.png',
      fullPage: true,
    });
  });

  test('Ideal state - 4 colours', async ({ page }) => {
    // Mobile: shorter labels work better
    await addColors(page, ['#1a1a1a', '#ffffff', '#0066cc', '#dc2626']);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-375-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 8 colours', async ({ page }) => {
    await addColors(page, [
      '#000000', '#1a1a1a', '#333333', '#666666',
      '#999999', '#cccccc', '#ffffff', '#0066cc',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-375-stress.png',
      fullPage: true,
    });
  });
});

test.describe('Visual Review - Mobile iPhone 12 (390x844)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('Empty state', async ({ page }) => {
    await page.screenshot({
      path: 'e2e/visual-review/mobile-390-empty.png',
      fullPage: true,
    });
  });

  test('Ideal state - 4 colours', async ({ page }) => {
    await addColors(page, ['#1a1a1a', '#ffffff', '#0066cc', '#dc2626']);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-390-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 8 colours', async ({ page }) => {
    await addColors(page, [
      '#000000', '#1a1a1a', '#333333', '#666666',
      '#999999', '#cccccc', '#ffffff', '#0066cc',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-390-stress.png',
      fullPage: true,
    });
  });
});

test.describe('Visual Review - Mobile iPhone 11 Pro Max (414x896)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 414, height: 896 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('Ideal state - 4 colours', async ({ page }) => {
    await addColors(page, ['#1a1a1a', '#ffffff', '#0066cc', '#dc2626']);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-414-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 8 colours', async ({ page }) => {
    await addColors(page, [
      '#000000', '#1a1a1a', '#333333', '#666666',
      '#999999', '#cccccc', '#ffffff', '#0066cc',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-414-stress.png',
      fullPage: true,
    });
  });
});

test.describe('Visual Review - Grid Overflow & Scrolling', () => {
  test('Desktop - horizontal grid scroll with 15 colours', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    await addColors(page, [
      '#000000', '#1a1a1a', '#333333', '#4a4a4a', '#666666',
      '#808080', '#999999', '#b3b3b3', '#cccccc', '#e0e0e0',
      '#f5f5f5', '#ffffff', '#0066cc', '#dc2626', '#15803d',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/desktop-grid-overflow.png',
      fullPage: true,
    });
  });

  test('Mobile - horizontal grid scroll with 8 colours', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    await addColors(page, [
      '#000000', '#333333', '#666666', '#999999',
      '#cccccc', '#ffffff', '#0066cc', '#dc2626',
    ]);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-grid-overflow.png',
      fullPage: true,
    });
  });
});
