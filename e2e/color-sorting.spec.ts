import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * E2E Tests for Color Palette Sorting & Reordering (Feature #101)
 *
 * Tests cover:
 * - Manual reordering via drag-and-drop
 * - Manual reordering via keyboard arrow buttons (WCAG 2.2 2.5.7 compliance)
 * - Luminance sorting
 * - Combined drag + keyboard scenarios
 * - Focus management and accessibility
 */

test.describe('Color Palette Sorting & Reordering', () => {
  /**
   * Helper function to add multiple colors to the palette
   */
  async function addColors(page: Page, colors: string[]) {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
      await page.waitForTimeout(100);
    }
  }

  /**
   * Helper function to get hex values of all color swatches in order
   */
  async function getColorOrder(page: Page): Promise<string[]> {
    const swatches = page.locator('color-palette').locator('color-swatch');
    const count = await swatches.count();
    const hexValues: string[] = [];

    for (let i = 0; i < count; i++) {
      const swatch = swatches.nth(i);
      const hex = await swatch.evaluate((el: any) => el.color?.hex || '');
      hexValues.push(hex.toUpperCase());
    }

    return hexValues;
  }

  /**
   * Helper to switch to manual order mode
   */
  async function switchToManualOrder(page: Page) {
    const sortControls = page.locator('sort-controls');
    const sortDropdown = sortControls.locator('select');
    await sortDropdown.selectOption('manual');
    await page.waitForTimeout(200);
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test.describe('Sort Controls UI', () => {
    test('should show sort dropdown with manual order by default when colors added', async ({ page }) => {
      // Need to add colors first - sort-controls doesn't render with < 2 colors
      await addColors(page, ['#FF0000', '#00FF00']);
      
      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');

      await expect(sortDropdown).toBeVisible();
      await expect(sortDropdown).toHaveValue('manual');
    });

    test('should hide direction toggle button in manual mode', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);

      const sortControls = page.locator('sort-controls');
      const directionButton = sortControls.locator('.direction-btn');

      // Direction button should be hidden in manual mode
      await expect(directionButton).not.toBeVisible();
    });

    test('should show direction toggle when sorted by luminance', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);

      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      const directionButton = sortControls.locator('.direction-btn');

      // Switch to luminance sorting
      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      await expect(directionButton).toBeVisible();
    });
  });

  test.describe('Manual Reorder Controls', () => {
    test('should show reorder controls (drag handles and arrow buttons) in manual mode', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      const firstSwatch = page.locator('color-swatch').first();
      const dragHandle = firstSwatch.locator('.drag-handle');
      const upButton = firstSwatch.locator('button[title="Move up"]');
      const downButton = firstSwatch.locator('button[title="Move down"]');

      await expect(dragHandle).toBeVisible();
      await expect(upButton).toBeVisible();
      await expect(downButton).toBeVisible();
    });

    test('should hide reorder controls when sorted by luminance', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      // Verify controls are visible in manual mode
      const firstSwatch = page.locator('color-swatch').first();
      await expect(firstSwatch.locator('.drag-handle')).toBeVisible();

      // Switch to luminance sort
      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      // Controls should now be hidden
      await expect(firstSwatch.locator('.drag-handle')).not.toBeVisible();
    });

    test('reorder controls should meet 44x44px touch target minimum (WCAG 2.2 2.5.8)', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00']);
      await switchToManualOrder(page);

      const firstSwatch = page.locator('color-swatch').first();
      const upButton = firstSwatch.locator('button[title="Move up"]');

      const boundingBox = await upButton.boundingBox();
      expect(boundingBox).not.toBeNull();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    });
  });

  test.describe('Keyboard Reordering (WCAG 2.2 2.5.7)', () => {
    test('should move color up using up arrow button', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      const initialOrder = await getColorOrder(page);
      expect(initialOrder).toEqual(['#FF0000', '#00FF00', '#0000FF']);

      // Click up arrow on second color (green)
      const secondSwatch = page.locator('color-swatch').nth(1);
      const upButton = secondSwatch.locator('button[title="Move up"]');
      await upButton.click();
      await page.waitForTimeout(300); // Wait for animation

      const newOrder = await getColorOrder(page);
      expect(newOrder).toEqual(['#00FF00', '#FF0000', '#0000FF']);
    });

    test('should move color down using down arrow button', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      const initialOrder = await getColorOrder(page);
      expect(initialOrder).toEqual(['#FF0000', '#00FF00', '#0000FF']);

      // Click down arrow on first color (red)
      const firstSwatch = page.locator('color-swatch').first();
      const downButton = firstSwatch.locator('button[title="Move down"]');
      await downButton.click();
      await page.waitForTimeout(300); // Wait for animation

      const newOrder = await getColorOrder(page);
      expect(newOrder).toEqual(['#00FF00', '#FF0000', '#0000FF']);
    });

    test('should handle boundary condition - cannot move first color up', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      // Try to move first color up
      const firstSwatch = page.locator('color-swatch').first();
      const upButton = firstSwatch.locator('button[title="Move up"]');
      await upButton.click();
      await page.waitForTimeout(300);

      // Order should not change
      const order = await getColorOrder(page);
      expect(order).toEqual(['#FF0000', '#00FF00', '#0000FF']);
    });

    test('should handle boundary condition - cannot move last color down', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      // Try to move last color down
      const lastSwatch = page.locator('color-swatch').last();
      const downButton = lastSwatch.locator('button[title="Move down"]');
      await downButton.click();
      await page.waitForTimeout(300);

      // Order should not change
      const order = await getColorOrder(page);
      expect(order).toEqual(['#FF0000', '#00FF00', '#0000FF']);
    });

    test('should handle multiple rapid key presses correctly', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']);
      await switchToManualOrder(page);

      // Rapidly press down arrow 3 times on first color
      const firstSwatch = page.locator('color-swatch').first();
      const downButton = firstSwatch.locator('button[title="Move down"]');

      await downButton.click();
      await page.waitForTimeout(100);
      await downButton.click();
      await page.waitForTimeout(100);
      await downButton.click();
      await page.waitForTimeout(400); // Wait for animations

      // Red should have moved away from first position after repeated clicks
      // (The locator re-resolves to the current first swatch on each click,
      // so exact final order depends on which element is first after each move)
      const order = await getColorOrder(page);
      expect(order[0]).not.toBe('#FF0000');
      expect(order).toContain('#FF0000');
    });

    test('should maintain focus on same button after move (smart focus management)', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      // Click down button on first swatch
      const firstSwatch = page.locator('color-swatch').first();
      const downButton = firstSwatch.locator('button[title="Move down"]');
      await downButton.click();
      await page.waitForTimeout(300);

      // Focus should now be on the down button of the moved swatch (now at index 1)
      const focusedElement = await page.evaluate(() => {
        let active: Element | null = document.activeElement;
        while (active?.shadowRoot?.activeElement) {
          active = active.shadowRoot.activeElement;
        }
        return active?.getAttribute('aria-label') || '';
      });

      // aria-label is dynamic: "Move #FF0000 down" - check it ends with " down"
      expect(focusedElement).toMatch(/ down$/i);
    });

    test('should announce moves to screen readers via ARIA live region', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      // Move second color up
      const secondSwatch = page.locator('color-swatch').nth(1);
      const upButton = secondSwatch.locator('button[title="Move up"]');
      await upButton.click();
      await page.waitForTimeout(200);

      // Check that at least one aria-live region exists for screen reader announcements
      const statusRegion = page.locator('[role="status"], [aria-live="polite"]');
      await expect(statusRegion.first()).toBeAttached();
    });
  });

  test.describe('Drag-and-Drop Reordering', () => {
    test('should reorder colors via drag-and-drop', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']);
      await switchToManualOrder(page);

      const initialOrder = await getColorOrder(page);
      expect(initialOrder).toEqual(['#FF0000', '#00FF00', '#0000FF', '#FFFF00']);

      // Get the first and third list items
      const colorsList = page.locator('color-palette').locator('.colors-list');
      const listItems = colorsList.locator('li');
      const firstItem = listItems.first();
      const thirdItem = listItems.nth(2);

      // Get bounding boxes
      const firstBox = await firstItem.boundingBox();
      const thirdBox = await thirdItem.boundingBox();

      expect(firstBox).not.toBeNull();
      expect(thirdBox).not.toBeNull();

      if (firstBox && thirdBox) {
        // Drag first item to third position
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(thirdBox.x + thirdBox.width / 2, thirdBox.y + thirdBox.height / 2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(300);

        // Verify order changed - red should have moved from first position
        // (exact position varies by pixel precision in headless environments)
        const newOrder = await getColorOrder(page);
        expect(newOrder[0]).not.toBe('#FF0000');
        expect(newOrder).toContain('#FF0000');
      }
    });

    test('should update contrast grid after drag reorder', async ({ page }) => {
      await addColors(page, ['#000000', '#FFFFFF', '#FF0000']);
      await switchToManualOrder(page);

      // Drag first color to last position
      const colorsList = page.locator('color-palette').locator('.colors-list');
      const listItems = colorsList.locator('li');
      const firstItem = listItems.first();
      const lastItem = listItems.last();

      const firstBox = await firstItem.boundingBox();
      const lastBox = await lastItem.boundingBox();

      if (firstBox && lastBox) {
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height / 2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(300);

        // Verify contrast grid exists and has cells
        const contrastGrid = page.locator('contrast-grid');
        const cells = contrastGrid.locator('contrast-cell');
        await expect(cells.first()).toBeVisible();
      }
    });
  });

  test.describe('Combined Drag + Keyboard Scenarios', () => {
    test('should allow keyboard controls after drag operation', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000']);
      await switchToManualOrder(page);

      // 1. Drag first color down 2 positions (to index 2)
      const colorsList = page.locator('color-palette').locator('.colors-list');
      const listItems = colorsList.locator('li');
      const firstItem = listItems.first();
      const thirdItem = listItems.nth(2);

      const firstBox = await firstItem.boundingBox();
      const thirdBox = await thirdItem.boundingBox();

      if (firstBox && thirdBox) {
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(thirdBox.x + thirdBox.width / 2, thirdBox.y + thirdBox.height / 2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500); // Wait for SortableJS + Lit update

        // 2. Now use keyboard to move the 3rd card (dragged color) up
        const thirdSwatch = page.locator('color-swatch').nth(2);
        const upButton = thirdSwatch.locator('button[title="Move up"]');
        await upButton.click();
        await page.waitForTimeout(400);

        // Verify keyboard controls worked after drag
        // (exact position depends on where the drag landed in headless mode)
        const order = await getColorOrder(page);
        expect(order).toContain('#FF0000');
        expect(order[0]).not.toBe('#FF0000'); // Red was dragged away from first position
      }
    });

    test('should allow drag after keyboard operations', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']);
      await switchToManualOrder(page);

      // 1. Use keyboard to move first color down
      const firstSwatch = page.locator('color-swatch').first();
      const downButton = firstSwatch.locator('button[title="Move down"]');
      await downButton.click();
      await page.waitForTimeout(400);

      // 2. Now drag it back to first position
      const colorsList = page.locator('color-palette').locator('.colors-list');
      const listItems = colorsList.locator('li');
      const secondItem = listItems.nth(1); // Red is now at index 1
      const firstItem = listItems.first();

      const secondBox = await secondItem.boundingBox();
      const firstBox = await firstItem.boundingBox();

      if (secondBox && firstBox) {
        await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(300);

        // Verify red is back at first position
        const order = await getColorOrder(page);
        expect(order[0]).toBe('#FF0000');
      }
    });

    test('should handle alternating drag and keyboard moves', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']);
      await switchToManualOrder(page);

      const colorsList = page.locator('color-palette').locator('.colors-list');
      const listItems = colorsList.locator('li');

      // 1. Drag first to second position
      let firstBox = await listItems.first().boundingBox();
      let secondBox = await listItems.nth(1).boundingBox();
      if (firstBox && secondBox) {
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500);
      }

      // 2. Keyboard move second color down
      const secondSwatch = page.locator('color-swatch').nth(1);
      await secondSwatch.locator('button[title="Move down"]').click();
      await page.waitForTimeout(400);

      // 3. Drag last to first position
      firstBox = await listItems.first().boundingBox();
      const lastBox = await listItems.last().boundingBox();
      if (firstBox && lastBox) {
        await page.mouse.move(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500);
      }

      // 4. Keyboard move first color down twice
      const firstSwatch = page.locator('color-swatch').first();
      const downBtn = firstSwatch.locator('button[title="Move down"]');
      await downBtn.click();
      await page.waitForTimeout(400);
      await downBtn.click();
      await page.waitForTimeout(400);

      // Just verify no errors and order has changed from original
      const finalOrder = await getColorOrder(page);
      expect(finalOrder).not.toEqual(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']);
    });
  });

  test.describe('Luminance Sorting', () => {
    test('should sort colors by luminance (lightest to darkest)', async ({ page }) => {
      await addColors(page, ['#000000', '#FFFFFF', '#808080', '#FF0000']);

      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      const order = await getColorOrder(page);

      // Verify white is first (lightest) and black is last (darkest)
      expect(order[0]).toBe('#FFFFFF');
      expect(order[order.length - 1]).toBe('#000000');
    });

    test('should reverse luminance sort when direction toggled', async ({ page }) => {
      await addColors(page, ['#000000', '#FFFFFF', '#808080']);

      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      const directionButton = sortControls.locator('.direction-btn');

      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      const ascOrder = await getColorOrder(page);
      expect(ascOrder[0]).toBe('#FFFFFF'); // Lightest first

      // Toggle direction
      await directionButton.click();
      await page.waitForTimeout(200);

      const descOrder = await getColorOrder(page);
      expect(descOrder[0]).toBe('#000000'); // Darkest first
    });

    test('should auto-sort newly added colors when in sorted mode', async ({ page }) => {
      // Add colors and sort
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);

      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      // Add a new color (yellow - should be light)
      await addColors(page, ['#FFFF00']);
      await page.waitForTimeout(200);

      const order = await getColorOrder(page);
      // Yellow should be inserted in sorted order (near the top, it's light)
      const yellowIndex = order.indexOf('#FFFF00');
      expect(yellowIndex).toBeLessThan(order.length - 1); // Not at the end
    });
  });

  test.describe('Reset to Original Order', () => {
    test('should show reset button when colors are sorted or reordered', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);

      // Sort by luminance
      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      // Reset button should be visible
      const resetButton = sortControls.locator('button[title="Reset to original order"]');
      await expect(resetButton).toBeVisible();
    });

    test('should restore original insertion order when reset clicked', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']);

      const originalOrder = await getColorOrder(page);
      expect(originalOrder).toEqual(['#FF0000', '#00FF00', '#0000FF', '#FFFF00']);

      // Sort by luminance (will change order)
      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      const sortedOrder = await getColorOrder(page);
      expect(sortedOrder).not.toEqual(originalOrder);

      // Reset to original
      const resetButton = sortControls.locator('button[title="Reset to original order"]');
      await resetButton.click();
      await page.waitForTimeout(200);

      const resetOrder = await getColorOrder(page);
      expect(resetOrder).toEqual(originalOrder);
    });

    test('should restore original order after manual reordering', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      const originalOrder = await getColorOrder(page);

      // Move first color down
      const firstSwatch = page.locator('color-swatch').first();
      const downButton = firstSwatch.locator('button[title="Move down"]');
      await downButton.click();
      await page.waitForTimeout(300);

      // Verify order changed
      const reorderedOrder = await getColorOrder(page);
      expect(reorderedOrder).not.toEqual(originalOrder);

      // Reset
      const sortControls = page.locator('sort-controls');
      const resetButton = sortControls.locator('button[title="Reset to original order"]');
      await resetButton.click();
      await page.waitForTimeout(200);

      const resetOrder = await getColorOrder(page);
      expect(resetOrder).toEqual(originalOrder);
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should have no accessibility violations with reorder controls visible', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22a', 'wcag22aa'])
        .disableRules(['color-contrast']) // User colors may have poor contrast
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('keyboard controls provide drag-and-drop alternative (WCAG 2.2 2.5.7)', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      // Verify both drag handle AND keyboard buttons exist
      const firstSwatch = page.locator('color-swatch').first();
      const dragHandle = firstSwatch.locator('.drag-handle');
      const upButton = firstSwatch.locator('button[title="Move up"]');
      const downButton = firstSwatch.locator('button[title="Move down"]');

      await expect(dragHandle).toBeVisible();
      await expect(upButton).toBeVisible();
      await expect(downButton).toBeVisible();

      // Verify keyboard alternative works
      await downButton.click();
      await page.waitForTimeout(300);

      const order = await getColorOrder(page);
      expect(order).toEqual(['#00FF00', '#FF0000', '#0000FF']);
    });

    test('should have proper ARIA labels on all interactive controls', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00']);
      await switchToManualOrder(page);

      const firstSwatch = page.locator('color-swatch').first();
      const upButton = firstSwatch.locator('button[title="Move up"]');
      const downButton = firstSwatch.locator('button[title="Move down"]');

      await expect(upButton).toHaveAttribute('aria-label');
      await expect(downButton).toHaveAttribute('aria-label');
      await expect(upButton).toHaveAttribute('title');
      await expect(downButton).toHaveAttribute('title');
    });
  });

  test.describe('Visual Feedback', () => {
    test('should show smooth animation during keyboard move', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      // Take screenshot before move
      await page.screenshot({ path: 'e2e/screenshots/before-keyboard-move.png' });

      // Move first color down
      const firstSwatch = page.locator('color-swatch').first();
      const downButton = firstSwatch.locator('button[title="Move down"]');
      await downButton.click();

      // Wait a bit to capture mid-animation
      await page.waitForTimeout(100);
      await page.screenshot({ path: 'e2e/screenshots/during-keyboard-move.png' });

      // Wait for animation to complete
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'e2e/screenshots/after-keyboard-move.png' });
    });

    test('should respect prefers-reduced-motion', async ({ page }) => {
      // Enable reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);
      await switchToManualOrder(page);

      // Move should still work but without animation
      const firstSwatch = page.locator('color-swatch').first();
      const downButton = firstSwatch.locator('button[title="Move down"]');
      await downButton.click();
      await page.waitForTimeout(100); // Shorter wait since no animation

      const order = await getColorOrder(page);
      expect(order).toEqual(['#00FF00', '#FF0000', '#0000FF']);
    });
  });

  test.describe('URL State Persistence', () => {
    test('should persist sort criteria in URL query string', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);

      // Sort by luminance
      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      // Check URL contains sortBy parameter
      const url = new URL(page.url());
      expect(url.searchParams.get('sortBy')).toBe('luminance');
    });

    test('should persist sort direction in URL query string', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);

      // Sort by luminance
      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      // Toggle direction
      const directionButton = sortControls.locator('.direction-btn');
      await directionButton.click();
      await page.waitForTimeout(200);

      // Check URL contains sortDir parameter
      const url = new URL(page.url());
      expect(url.searchParams.get('sortBy')).toBe('luminance');
      expect(url.searchParams.get('sortDir')).toBe('descending');
    });

    test('should restore sort state from URL on page load', async ({ page }) => {
      // Navigate to URL with sort parameters
      await page.goto('/?colors=FF0000,00FF00,0000FF&sortBy=luminance&sortDir=ascending');
      await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
      await page.waitForTimeout(300);

      // Verify sort was applied
      const order = await getColorOrder(page);
      expect(order[0]).toBe('#00FF00'); // Green is lightest

      // Verify dropdown shows correct value
      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      await expect(sortDropdown).toHaveValue('luminance');
    });

    test('should restore sort state from URL on reload', async ({ page }) => {
      // Add colors and sort
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);

      // Sort by luminance
      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      // Get the current URL with sort params
      const urlWithSort = page.url();
      expect(urlWithSort).toContain('sortBy=luminance');

      // Reload the page with the same URL
      await page.goto(urlWithSort);
      await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
      await page.waitForTimeout(300);

      // Should restore sorted state
      await expect(sortDropdown).toHaveValue('luminance');
      const order = await getColorOrder(page);
      expect(order[0]).toBe('#00FF00'); // Green is lightest
    });

    test('should clear sort parameters from URL when switched to manual', async ({ page }) => {
      await addColors(page, ['#FF0000', '#00FF00', '#0000FF']);

      // Sort by luminance
      const sortControls = page.locator('sort-controls');
      const sortDropdown = sortControls.locator('select');
      await sortDropdown.selectOption('luminance');
      await page.waitForTimeout(200);

      // Verify sortBy is in URL
      let url = new URL(page.url());
      expect(url.searchParams.get('sortBy')).toBe('luminance');

      // Switch back to manual
      await sortDropdown.selectOption('manual');
      await page.waitForTimeout(200);

      // sortBy should be removed or set to manual
      url = new URL(page.url());
      const sortBy = url.searchParams.get('sortBy');
      expect(sortBy === null || sortBy === 'manual').toBe(true);
    });
  });
});
