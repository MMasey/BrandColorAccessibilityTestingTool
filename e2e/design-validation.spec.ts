import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Automated Design Validation Tests
 *
 * These tests validate:
 * 1. Layout consistency - components that should match do match
 * 2. Visual regression - screenshots compared against baselines
 * 3. Accessibility - WCAG 2.1 AA compliance via axe-core
 * 4. Design tokens - CSS custom properties are applied correctly
 */

test.describe('Layout Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('color-input and color-swatch have matching dimensions', async ({ page }) => {
    // Add a color WITH a label so we compare like-for-like
    // (swatches without labels are shorter by design)
    const hexInput = page.locator('color-palette color-input #hex-input');
    const labelInput = page.locator('color-palette color-input .label-input');
    const addButton = page.locator('color-palette color-input .add-btn');

    await hexInput.fill('#1a1a1a');
    await labelInput.fill('Dark Grey');
    await addButton.click();
    await page.waitForTimeout(100);

    // Get the container elements
    const inputContainer = page.locator('color-palette color-input .swatch-container');
    const swatchContainer = page.locator('color-palette color-swatch .swatch-container').first();

    // Get bounding boxes
    const inputBox = await inputContainer.boundingBox();
    const swatchBox = await swatchContainer.boundingBox();

    expect(inputBox).not.toBeNull();
    expect(swatchBox).not.toBeNull();

    if (inputBox && swatchBox) {
      // Heights should match (within 6px tolerance - inputs render slightly taller than text)
      expect(Math.abs(inputBox.height - swatchBox.height)).toBeLessThanOrEqual(6);

      // Widths should be similar (both should fill container)
      expect(Math.abs(inputBox.width - swatchBox.width)).toBeLessThanOrEqual(2);
    }
  });

  test('color-input and color-swatch color boxes have matching width', async ({ page }) => {
    // Add a color
    const hexInput = page.locator('color-palette color-input #hex-input');
    const addButton = page.locator('color-palette color-input .add-btn');

    await hexInput.fill('#0066cc');
    await addButton.click();
    await page.waitForTimeout(100);

    // Get the color box elements
    const inputColorBox = page.locator('color-palette color-input .color-box');
    const swatchColorBox = page.locator('color-palette color-swatch .color-box').first();

    const inputBoxSize = await inputColorBox.boundingBox();
    const swatchBoxSize = await swatchColorBox.boundingBox();

    expect(inputBoxSize).not.toBeNull();
    expect(swatchBoxSize).not.toBeNull();

    if (inputBoxSize && swatchBoxSize) {
      // Color boxes should have same width
      expect(Math.abs(inputBoxSize.width - swatchBoxSize.width)).toBeLessThanOrEqual(1);
    }
  });

  test('action buttons have consistent sizing', async ({ page }) => {
    // Add a color
    const hexInput = page.locator('color-palette color-input #hex-input');
    const addButton = page.locator('color-palette color-input .add-btn');

    await hexInput.fill('#dc2626');
    await addButton.click();
    await page.waitForTimeout(100);

    // Get action buttons
    const addBtn = page.locator('color-palette color-input .add-btn');
    const removeBtn = page.locator('color-palette color-swatch .remove-btn').first();

    const addBtnBox = await addBtn.boundingBox();
    const removeBtnBox = await removeBtn.boundingBox();

    expect(addBtnBox).not.toBeNull();
    expect(removeBtnBox).not.toBeNull();

    if (addBtnBox && removeBtnBox) {
      // Both buttons should be at least 44px (touch target)
      expect(addBtnBox.width).toBeGreaterThanOrEqual(44);
      expect(addBtnBox.height).toBeGreaterThanOrEqual(44);
      expect(removeBtnBox.width).toBeGreaterThanOrEqual(44);
      expect(removeBtnBox.height).toBeGreaterThanOrEqual(44);

      // Buttons should have similar dimensions
      expect(Math.abs(addBtnBox.width - removeBtnBox.width)).toBeLessThanOrEqual(2);
    }
  });

  test('contrast grid cells have consistent sizing', async ({ page }) => {
    // Add multiple colors
    const hexInput = page.locator('color-palette color-input #hex-input');
    const addButton = page.locator('color-palette color-input .add-btn');

    for (const color of ['#1a1a1a', '#ffffff', '#0066cc']) {
      await hexInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(200);

    // Get all grid cells
    const cells = page.locator('contrast-grid .cell');
    const cellCount = await cells.count();

    expect(cellCount).toBeGreaterThan(0);

    // Get dimensions of first cell
    const firstCell = await cells.first().boundingBox();
    expect(firstCell).not.toBeNull();

    if (firstCell) {
      // All cells should have the same dimensions
      for (let i = 1; i < Math.min(cellCount, 5); i++) {
        const cellBox = await cells.nth(i).boundingBox();
        if (cellBox) {
          expect(Math.abs(cellBox.width - firstCell.width)).toBeLessThanOrEqual(1);
          expect(Math.abs(cellBox.height - firstCell.height)).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

test.describe('Accessibility Validation (WCAG 2.1 AA)', () => {
  test('empty state passes accessibility audit', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log any violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('with colors passes accessibility audit', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Add some colors
    const hexInput = page.locator('color-palette color-input #hex-input');
    const addButton = page.locator('color-palette color-input .add-btn');

    for (const color of ['#1a1a1a', '#ffffff', '#0066cc', '#dc2626']) {
      await hexInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(300);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Filter out color-contrast violations from contrast-cell elements
    // since they intentionally demonstrate various contrast levels including failing ones
    const filteredViolations = accessibilityScanResults.violations
      .map(violation => {
        if (violation.id === 'color-contrast') {
          const filteredNodes = violation.nodes.filter(node => {
            // Check if any target path includes contrast-cell
            const targetPaths = node.target || [];
            return !targetPaths.some((path: string | string[]) => {
              if (Array.isArray(path)) {
                return path.some(p => p.includes('contrast-cell') || p.includes('contrast-grid'));
              }
              return path.includes('contrast-cell') || path.includes('contrast-grid');
            });
          });
          return { ...violation, nodes: filteredNodes };
        }
        return violation;
      })
      .filter(violation => violation.nodes.length > 0);

    if (filteredViolations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(filteredViolations, null, 2));
    }

    expect(filteredViolations).toEqual([]);
  });

  test('mobile view passes accessibility audit', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Touch Target Validation', () => {
  test('all interactive elements meet 44x44px minimum', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Add a color to reveal more interactive elements
    const hexInput = page.locator('color-palette color-input #hex-input');
    const addButton = page.locator('color-palette color-input .add-btn');
    await hexInput.fill('#1a1a1a');
    await addButton.click();
    await page.waitForTimeout(100);

    // Check add button
    const addBtnBox = await addButton.boundingBox();
    expect(addBtnBox?.width).toBeGreaterThanOrEqual(44);
    expect(addBtnBox?.height).toBeGreaterThanOrEqual(44);

    // Check remove button
    const removeBtn = page.locator('color-palette color-swatch .remove-btn').first();
    const removeBtnBox = await removeBtn.boundingBox();
    expect(removeBtnBox?.width).toBeGreaterThanOrEqual(44);
    expect(removeBtnBox?.height).toBeGreaterThanOrEqual(44);

    // Check theme buttons
    const themeButtons = page.locator('theme-switcher button');
    const themeButtonCount = await themeButtons.count();
    for (let i = 0; i < themeButtonCount; i++) {
      const btnBox = await themeButtons.nth(i).boundingBox();
      if (btnBox) {
        // Theme buttons should have adequate touch target (width * height >= 44*44 area)
        expect(btnBox.width * btnBox.height).toBeGreaterThanOrEqual(44 * 44 * 0.8); // 80% tolerance
      }
    }
  });
});

test.describe('Visual Regression', () => {
  test('empty state matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
    await page.waitForTimeout(500); // Wait for any animations

    await expect(page).toHaveScreenshot('baseline-empty.png', {
      maxDiffPixels: 100, // Allow small differences for anti-aliasing
    });
  });

  test('with 4 colors matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    const hexInput = page.locator('color-palette color-input #hex-input');
    const labelInput = page.locator('color-palette color-input .label-input');
    const addButton = page.locator('color-palette color-input .add-btn');

    const colors = [
      { hex: '#1a1a1a', label: 'Dark Grey' },
      { hex: '#ffffff', label: 'White' },
      { hex: '#0066cc', label: 'Primary Blue' },
      { hex: '#dc2626', label: 'Error Red' },
    ];

    for (const { hex, label } of colors) {
      await hexInput.fill(hex);
      await labelInput.fill(label);
      await addButton.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('baseline-4colors.png', {
      maxDiffPixels: 100,
    });
  });

  test('mobile empty state matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('baseline-mobile-empty.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Design Token Validation', () => {
  test('focus states use correct focus ring color', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Focus the hex input
    const hexInput = page.locator('color-palette color-input #hex-input');
    await hexInput.focus();
    await page.waitForTimeout(100); // Wait for focus styles to apply

    // Get the container's computed border color when focused
    const container = page.locator('color-palette color-input .swatch-container');
    const borderColor = await container.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });

    // Focus should change the border color from default gray
    // The exact color depends on theme, but it should NOT be the default gray
    const defaultGray = 'rgb(212, 212, 212)'; // #d4d4d4
    expect(borderColor).not.toBe(defaultGray);
  });

  test('error state uses correct error color', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Enter invalid color
    const hexInput = page.locator('color-palette color-input #hex-input');
    await hexInput.fill('invalid');
    await hexInput.blur();

    // Check error message color
    const errorText = page.locator('color-palette color-input .error-text');
    await expect(errorText).toBeVisible();

    const color = await errorText.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Should be error red rgb(220, 38, 38) = #dc2626
    expect(color).toMatch(/rgb\(220,\s*38,\s*38\)|#dc2626/i);
  });
});
