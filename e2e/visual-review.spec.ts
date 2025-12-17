import { test, expect } from '@playwright/test';

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
 * - Empty (no colors)
 * - Ideal (3-5 colors)
 * - Stress (10+ colors with long labels)
 */

test.describe('Visual Review - Desktop (1440x900)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('Empty state - no colors', async ({ page }) => {
    await page.screenshot({
      path: 'e2e/visual-review/desktop-1440-empty.png',
      fullPage: true,
    });
  });

  test('Ideal state - 4 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const labelInput = colorInput.locator('input.label-input');
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    // Add 4 well-labeled colors
    const colors = [
      { hex: '#1a1a1a', label: 'Dark Grey' },
      { hex: '#ffffff', label: 'White' },
      { hex: '#0066cc', label: 'Primary Blue' },
      { hex: '#dc2626', label: 'Error Red' },
    ];

    for (const color of colors) {
      await textInput.fill(color.hex);
      await labelInput.fill(color.label);
      await addButton.click();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/visual-review/desktop-1440-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 12 colors with long labels', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const labelInput = colorInput.locator('input.label-input');
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    // Add many colors with intentionally long labels
    const colors = [
      { hex: '#000000', label: 'Extra Dark Charcoal Black' },
      { hex: '#1a1a1a', label: 'Very Dark Grey Background' },
      { hex: '#333333', label: 'Medium Dark Grey Text' },
      { hex: '#666666', label: 'Standard Grey Secondary' },
      { hex: '#999999', label: 'Light Grey Tertiary Color' },
      { hex: '#cccccc', label: 'Very Light Grey Border' },
      { hex: '#ffffff', label: 'Pure White Background' },
      { hex: '#0066cc', label: 'Primary Interactive Blue' },
      { hex: '#003d7a', label: 'Dark Primary Blue Hover' },
      { hex: '#dc2626', label: 'Critical Error Red Alert' },
      { hex: '#15803d', label: 'Success Green Confirmation' },
      { hex: '#f59e0b', label: 'Warning Amber Notification' },
    ];

    for (const color of colors) {
      await textInput.fill(color.hex);
      await labelInput.fill(color.label);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
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

  test('Ideal state - 4 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const labelInput = colorInput.locator('input.label-input');
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = [
      { hex: '#1a1a1a', label: 'Dark Grey' },
      { hex: '#ffffff', label: 'White' },
      { hex: '#0066cc', label: 'Primary Blue' },
      { hex: '#dc2626', label: 'Error Red' },
    ];

    for (const color of colors) {
      await textInput.fill(color.hex);
      await labelInput.fill(color.label);
      await addButton.click();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/visual-review/desktop-1920-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 12 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const labelInput = colorInput.locator('input.label-input');
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = [
      { hex: '#000000', label: 'Extra Dark Charcoal Black' },
      { hex: '#1a1a1a', label: 'Very Dark Grey Background' },
      { hex: '#333333', label: 'Medium Dark Grey Text' },
      { hex: '#666666', label: 'Standard Grey Secondary' },
      { hex: '#999999', label: 'Light Grey Tertiary Color' },
      { hex: '#cccccc', label: 'Very Light Grey Border' },
      { hex: '#ffffff', label: 'Pure White Background' },
      { hex: '#0066cc', label: 'Primary Interactive Blue' },
      { hex: '#003d7a', label: 'Dark Primary Blue Hover' },
      { hex: '#dc2626', label: 'Critical Error Red Alert' },
      { hex: '#15803d', label: 'Success Green Confirmation' },
      { hex: '#f59e0b', label: 'Warning Amber Notification' },
    ];

    for (const color of colors) {
      await textInput.fill(color.hex);
      await labelInput.fill(color.label);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
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

  test('Ideal state - 4 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const labelInput = colorInput.locator('input.label-input');
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = [
      { hex: '#1a1a1a', label: 'Dark Grey' },
      { hex: '#ffffff', label: 'White' },
      { hex: '#0066cc', label: 'Primary Blue' },
      { hex: '#dc2626', label: 'Error Red' },
    ];

    for (const color of colors) {
      await textInput.fill(color.hex);
      await labelInput.fill(color.label);
      await addButton.click();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/visual-review/tablet-768-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 10 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const labelInput = colorInput.locator('input.label-input');
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = [
      { hex: '#000000', label: 'Extra Dark Charcoal Black' },
      { hex: '#1a1a1a', label: 'Very Dark Grey Background' },
      { hex: '#333333', label: 'Medium Dark Grey Text' },
      { hex: '#666666', label: 'Standard Grey Secondary' },
      { hex: '#999999', label: 'Light Grey Tertiary' },
      { hex: '#cccccc', label: 'Very Light Grey Border' },
      { hex: '#ffffff', label: 'Pure White Background' },
      { hex: '#0066cc', label: 'Primary Interactive Blue' },
      { hex: '#dc2626', label: 'Critical Error Red Alert' },
      { hex: '#15803d', label: 'Success Green Confirm' },
    ];

    for (const color of colors) {
      await textInput.fill(color.hex);
      await labelInput.fill(color.label);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
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

  test('Ideal state - 4 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const labelInput = colorInput.locator('input.label-input');
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = [
      { hex: '#1a1a1a', label: 'Dark Grey' },
      { hex: '#ffffff', label: 'White' },
      { hex: '#0066cc', label: 'Primary Blue' },
      { hex: '#dc2626', label: 'Error Red' },
    ];

    for (const color of colors) {
      await textInput.fill(color.hex);
      await labelInput.fill(color.label);
      await addButton.click();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/visual-review/tablet-1024-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 10 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const labelInput = colorInput.locator('input.label-input');
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = [
      { hex: '#000000', label: 'Extra Dark Charcoal Black' },
      { hex: '#1a1a1a', label: 'Very Dark Grey Background' },
      { hex: '#333333', label: 'Medium Dark Grey Text' },
      { hex: '#666666', label: 'Standard Grey Secondary' },
      { hex: '#999999', label: 'Light Grey Tertiary' },
      { hex: '#cccccc', label: 'Very Light Grey Border' },
      { hex: '#ffffff', label: 'Pure White Background' },
      { hex: '#0066cc', label: 'Primary Interactive Blue' },
      { hex: '#dc2626', label: 'Critical Error Red Alert' },
      { hex: '#15803d', label: 'Success Green Confirm' },
    ];

    for (const color of colors) {
      await textInput.fill(color.hex);
      await labelInput.fill(color.label);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
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

  test('Ideal state - 4 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    // Note: Label input hidden on mobile < 480px
    const colors = ['#1a1a1a', '#ffffff', '#0066cc', '#dc2626'];

    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-375-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 8 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = [
      '#000000', '#1a1a1a', '#333333', '#666666',
      '#999999', '#cccccc', '#ffffff', '#0066cc',
    ];

    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
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

  test('Ideal state - 4 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = ['#1a1a1a', '#ffffff', '#0066cc', '#dc2626'];

    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-390-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 8 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = [
      '#000000', '#1a1a1a', '#333333', '#666666',
      '#999999', '#cccccc', '#ffffff', '#0066cc',
    ];

    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
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

  test('Ideal state - 4 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = ['#1a1a1a', '#ffffff', '#0066cc', '#dc2626'];

    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-414-ideal.png',
      fullPage: true,
    });
  });

  test('Stress test - 8 colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = [
      '#000000', '#1a1a1a', '#333333', '#666666',
      '#999999', '#cccccc', '#ffffff', '#0066cc',
    ];

    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-414-stress.png',
      fullPage: true,
    });
  });
});

test.describe('Visual Review - Grid Overflow & Scrolling', () => {
  test('Desktop - horizontal grid scroll with 15 colors', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    // Add 15 colors to test grid overflow
    const colors = [
      '#000000', '#1a1a1a', '#333333', '#4a4a4a', '#666666',
      '#808080', '#999999', '#b3b3b3', '#cccccc', '#e0e0e0',
      '#f5f5f5', '#ffffff', '#0066cc', '#dc2626', '#15803d',
    ];

    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(30);
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/visual-review/desktop-grid-overflow.png',
      fullPage: true,
    });
  });

  test('Mobile - horizontal grid scroll with 8 colors', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette').locator('button:has-text("Add")');

    const colors = [
      '#000000', '#333333', '#666666', '#999999',
      '#cccccc', '#ffffff', '#0066cc', '#dc2626',
    ];

    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/visual-review/mobile-grid-overflow.png',
      fullPage: true,
    });
  });
});
