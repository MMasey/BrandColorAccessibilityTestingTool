import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Brand Color Accessibility Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for web components to be defined
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle(/Brand Color Accessibility Tool/);

    const heading = page.locator('h1');
    await expect(heading).toContainText('Brand Color Accessibility Tool');
  });

  test('should have skip link for accessibility', async ({ page }) => {
    const skipLink = page.locator('a.skip-link, a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);

    await skipLink.focus();
    await expect(skipLink).toBeFocused();
  });

  test('skip link should navigate to main content when activated', async ({ page }) => {
    // Focus and activate skip link (in light DOM, enhanced by app-shell to focus <main>)
    await page.keyboard.press('Tab'); // First tab should focus skip link
    await page.keyboard.press('Enter');

    // The <main> element inside shadow DOM should be focused and visible
    const mainContent = page.locator('app-shell').locator('main');
    await expect(mainContent).toBeInViewport();
    await expect(mainContent).toBeFocused();
  });

  test('should have proper landmark regions', async ({ page }) => {
    // Use semantic <main> element (no need for role="main" - it's implicit)
    const main = page.locator('app-shell').locator('main');
    await expect(main).toHaveCount(1);

    const header = page.locator('header');
    await expect(header).toHaveCount(1);

    const footer = page.locator('footer');
    await expect(footer).toHaveCount(1);
  });
});

test.describe('Color Palette Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('should add a color to the palette', async ({ page }) => {
    // Find the color input inside the shadow DOM
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();

    await textInput.fill('#ff5500');
    await textInput.press('Enter');

    // Verify color was added
    const colorSwatch = page.locator('color-palette').locator('color-swatch');
    await expect(colorSwatch).toHaveCount(1);
  });

  test('should show contrast grid with two colors', async ({ page }) => {
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    // Add first color
    await textInput.fill('#000000');
    await addButton.click();

    // Add second color
    await textInput.fill('#ffffff');
    await addButton.click();

    // Verify contrast grid shows cells
    const contrastGrid = page.locator('contrast-grid');
    const cells = contrastGrid.locator('contrast-cell');
    await expect(cells).toHaveCount(4); // 2x2 matrix
  });

});

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('should navigate through interactive elements with Tab', async ({ page }) => {
    const focusedElements: string[] = [];

    // Tab through the page multiple times
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return 'none';

        // Check shadow roots
        let active: Element | null = el;
        while (active?.shadowRoot?.activeElement) {
          active = active.shadowRoot.activeElement;
        }

        return active?.tagName?.toLowerCase() || 'none';
      });
      focusedElements.push(focused);
    }

    // Verify focus moved to different elements
    const uniqueElements = new Set(focusedElements);
    expect(uniqueElements.size).toBeGreaterThan(1);
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Focus the skip link directly (webkit/safari handle Tab differently)
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await skipLink.focus();

    // Verify it's focused
    await expect(skipLink).toBeFocused();

    // Screenshot for visual verification
    await page.screenshot({
      path: 'e2e/screenshots/focus-indicator.png',
      fullPage: false,
    });
  });

  test('should allow keyboard operation of theme switcher', async ({ page }) => {
    // Navigate to theme switcher (may need multiple tabs)
    for (let i = 0; i < 20; i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        let active: Element | null = el;
        while (active?.shadowRoot?.activeElement) {
          active = active.shadowRoot.activeElement;
        }
        return active?.closest('theme-switcher') !== null;
      });
      if (focused) break;
      await page.keyboard.press('Tab');
    }

    // Press Enter/Space to activate
    await page.keyboard.press('Enter');
  });

  test('contrast grid should be keyboard focusable and support arrow keys', async ({ page }) => {
    // Use small viewport to ensure grid needs scrolling
    await page.setViewportSize({ width: 400, height: 400 });

    // Add multiple colors to make grid scrollable
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    const colors = ['#000', '#333', '#666', '#999', '#ccc', '#fff', '#f00', '#0f0', '#00f', '#ff0'];
    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
    }
    await page.waitForTimeout(300);

    // Focus the grid wrapper - it should have tabindex="0"
    const gridWrapper = page.locator('contrast-grid .grid-wrapper');
    await expect(gridWrapper).toHaveAttribute('tabindex', '0');

    // Focus and verify it accepts focus
    await gridWrapper.focus();
    await expect(gridWrapper).toBeFocused();

    // Press arrow keys - should not throw errors
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');

    // Grid wrapper should still be focused after arrow keys
    await expect(gridWrapper).toBeFocused();
  });

  test('contrast grid should support Home/End keys without errors', async ({ page }) => {
    // Add colors
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    const colors = ['#000', '#333', '#666', '#999', '#ccc', '#fff'];
    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
    }
    await page.waitForTimeout(300);

    // Focus the grid wrapper
    const gridWrapper = page.locator('contrast-grid .grid-wrapper');
    await gridWrapper.focus();
    await expect(gridWrapper).toBeFocused();

    // Press Home/End keys - should not throw errors
    await page.keyboard.press('End');
    await page.keyboard.press('Home');

    // Verify Home scrolls to start (scrollLeft should be 0)
    const scrollAfterHome = await gridWrapper.evaluate((el) => el.scrollLeft);
    expect(scrollAfterHome).toBe(0);
  });
});

test.describe('Accessibility Audit (axe-core)', () => {
  test('should have no accessibility violations on empty state', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations with colors added', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Add some colors
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    await textInput.fill('#1a1a1a');
    await addButton.click();
    await textInput.fill('#ffffff');
    await addButton.click();
    await textInput.fill('#0066cc');
    await addButton.click();

    // Wait for grid to render
    await page.waitForTimeout(500);

    // The contrast-grid intentionally displays user-defined color combinations
    // that may have poor contrast - that's the whole purpose of this tool.
    // We disable color-contrast checks for this test only.
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Click dark mode button
    const darkButton = page.locator('theme-switcher').locator('button[title="Dark"]');
    await darkButton.click();

    await page.waitForTimeout(300);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations (dark mode):', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations in high contrast mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Click high contrast mode button
    const highContrastButton = page.locator('theme-switcher').locator('button[title="High"]');
    await highContrastButton.click();

    await page.waitForTimeout(300);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations (high contrast):', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Visual UX Review - Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('capture empty state - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: 'e2e/screenshots/desktop-empty-state.png',
      fullPage: true,
    });
  });

  test('capture empty state - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: 'e2e/screenshots/tablet-empty-state.png',
      fullPage: true,
    });
  });

  test('capture empty state - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: 'e2e/screenshots/mobile-empty-state.png',
      fullPage: true,
    });
  });

  test('capture with colors - desktop light mode', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Add sample brand colors
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    const colors = ['#1a1a1a', '#ffffff', '#0066cc', '#dc2626', '#15803d'];
    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/screenshots/desktop-with-colors-light.png',
      fullPage: true,
    });
  });

  test('capture with colors - desktop dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Enable dark mode
    const darkButton = page.locator('theme-switcher').locator('button[title="Dark"]');
    await darkButton.click();
    await page.waitForTimeout(300);

    // Add sample brand colors
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    const colors = ['#1a1a1a', '#ffffff', '#60a5fa', '#f87171', '#4ade80'];
    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/screenshots/desktop-with-colors-dark.png',
      fullPage: true,
    });
  });

  test('capture with colors - desktop high contrast mode', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Enable high contrast mode
    const highContrastButton = page.locator('theme-switcher').locator('button[title="High"]');
    await highContrastButton.click();
    await page.waitForTimeout(300);

    // Add sample brand colors
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    const colors = ['#000000', '#ffffff', '#ffff00', '#00ff00'];
    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/screenshots/desktop-with-colors-high-contrast.png',
      fullPage: true,
    });
  });

  test('capture with colors - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Add sample brand colors
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    const colors = ['#1a1a1a', '#ffffff', '#0066cc', '#dc2626'];
    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'e2e/screenshots/mobile-with-colors.png',
      fullPage: true,
    });
  });

});

test.describe('Responsive Design', () => {
  test('should render correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Theme switcher should be in sidebar
    const themeSwitcher = page.locator('theme-switcher');
    await expect(themeSwitcher).toBeVisible();
  });

  test('should render correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should render correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Theme switcher should be in sidebar
    const themeSwitcher = page.locator('theme-switcher');
    await expect(themeSwitcher).toBeVisible();
  });

  test('contrast grid should scroll horizontally on mobile with many colors', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Add many colors
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    const colors = ['#000', '#333', '#666', '#999', '#ccc', '#fff'];
    for (const color of colors) {
      await textInput.fill(color);
      await addButton.click();
    }

    // Grid wrapper inside shadow DOM should have overflow: auto
    const gridWrapper = page.locator('contrast-grid').locator('.grid-wrapper');
    await expect(gridWrapper).toHaveCSS('overflow', 'auto');

    await page.screenshot({
      path: 'e2e/screenshots/mobile-many-colors-scroll.png',
      fullPage: true,
    });
  });
});

test.describe('Grid Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Add test colors with known contrast ratios
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    // Black and white have high contrast (AAA)
    await textInput.fill('#000000');
    await addButton.click();
    await textInput.fill('#ffffff');
    await addButton.click();
    // Gray on white (lower contrast - likely AA or fail)
    await textInput.fill('#666666');
    await addButton.click();

    await page.waitForTimeout(500);
  });

  test('should toggle AAA filter on/off', async ({ page }) => {
    const gridFilters = page.locator('grid-filters');
    const aaaButton = gridFilters.locator('button:has-text("AAA")');

    // Initially should be pressed/active
    await expect(aaaButton).toHaveAttribute('aria-pressed', 'true');

    // Click to deactivate
    await aaaButton.click();
    await page.waitForTimeout(200);

    // Should now be unpressed
    await expect(aaaButton).toHaveAttribute('aria-pressed', 'false');

    // Click to reactivate
    await aaaButton.click();
    await page.waitForTimeout(200);

    // Should be pressed again
    await expect(aaaButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should toggle AA filter on/off', async ({ page }) => {
    const gridFilters = page.locator('grid-filters');
    // Find button that contains a label with exact text "AA"
    const aaButton = gridFilters.locator('button:has(.label:text-is("AA"))');

    // Initially should be pressed/active
    await expect(aaButton).toHaveAttribute('aria-pressed', 'true');

    // Click to deactivate
    await aaButton.click();
    await page.waitForTimeout(200);

    // Should now be unpressed
    await expect(aaButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should filter grid cells when filters are toggled', async ({ page }) => {
    const gridFilters = page.locator('grid-filters');
    const aaaButton = gridFilters.locator('button:has-text("AAA")');
    const contrastGrid = page.locator('contrast-grid');

    // Count visible cells initially
    const initialCells = contrastGrid.locator('contrast-cell');
    const initialCount = await initialCells.count();
    expect(initialCount).toBeGreaterThan(0);

    // Deactivate AAA filter
    await aaaButton.click();
    await page.waitForTimeout(200);

    // Check that some cells are now filtered (have filtered attribute)
    const filteredCells = contrastGrid.locator('contrast-cell[filtered]');
    const filteredCount = await filteredCells.count();

    // There should be at least one AAA combination that gets filtered
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should show all cells when all filters are active', async ({ page }) => {
    const gridFilters = page.locator('grid-filters');
    const contrastGrid = page.locator('contrast-grid');

    // Make sure all filters are active
    const aaaButton = gridFilters.locator('button:has-text("AAA")');
    const aaButton = gridFilters.locator('button:has(.label:text-is("AA"))');
    const aaLargeButton = gridFilters.locator('button:has-text("AA Large")');
    const failedButton = gridFilters.locator('button:has-text("Failed")');

    // Ensure all are active (they should be by default, but let's be sure)
    for (const button of [aaaButton, aaButton, aaLargeButton, failedButton]) {
      const isPressed = await button.getAttribute('aria-pressed');
      if (isPressed !== 'true') {
        await button.click();
        await page.waitForTimeout(100);
      }
    }

    // No cells should be filtered
    const filteredCells = contrastGrid.locator('contrast-cell[filtered]');
    const filteredCount = await filteredCells.count();
    expect(filteredCount).toBe(0);
  });

  test('should hide cells when only Failed filter is active', async ({ page }) => {
    const gridFilters = page.locator('grid-filters');
    const contrastGrid = page.locator('contrast-grid');

    // Deactivate AAA, AA, and AA Large
    const aaaButton = gridFilters.locator('button:has-text("AAA")');
    const aaButton = gridFilters.locator('button:has(.label:text-is("AA"))');
    const aaLargeButton = gridFilters.locator('button:has-text("AA Large")');

    await aaaButton.click();
    await page.waitForTimeout(100);
    await aaButton.click();
    await page.waitForTimeout(100);
    await aaLargeButton.click();
    await page.waitForTimeout(100);

    // Most cells should now be filtered (only failed combinations visible)
    const filteredCells = contrastGrid.locator('contrast-cell[filtered]');
    const filteredCount = await filteredCells.count();

    // With black/white/gray, most combinations pass, so filtered count should be high
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('filter buttons should have active styling when pressed', async ({ page }) => {
    const gridFilters = page.locator('grid-filters');
    const aaaButton = gridFilters.locator('button:has-text("AAA")');

    // Should have active class initially
    await expect(aaaButton).toHaveClass(/active/);

    // Click to deactivate
    await aaaButton.click();
    await page.waitForTimeout(200);

    // Should not have active class
    const className = await aaaButton.getAttribute('class');
    expect(className).not.toContain('active');

    // Click to reactivate
    await aaaButton.click();
    await page.waitForTimeout(200);

    // Should have active class again
    await expect(aaaButton).toHaveClass(/active/);
  });
});

test.describe('URL State Management (Progressive Enhancement)', () => {
  test('should load colors from URL parameters', async ({ page }) => {
    // Navigate with colors in URL
    await page.goto('/?colors=FF5733,3498DB,2ECC71&labels=Orange,Blue,Green');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Wait for colors to be loaded
    await page.waitForTimeout(500);

    // Check that color swatches are displayed
    const swatches = page.locator('color-swatch');
    await expect(swatches).toHaveCount(3);
  });

  test('should update URL when colors are added', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Add a color
    const colorInput = page.locator('color-palette').locator('color-input');
    const textInput = colorInput.locator('input[type="text"]').first();
    const addButton = page.locator('color-palette color-input .add-btn');

    await textInput.fill('#FF5733');
    await addButton.click();

    // Wait for URL to update
    await page.waitForTimeout(500);

    // Check URL contains the color
    const url = page.url();
    expect(url).toContain('colors=');
    expect(url.toUpperCase()).toContain('FF5733');
  });

  test('should load theme from URL parameters', async ({ page }) => {
    // Navigate with dark theme in URL
    await page.goto('/?theme=dark');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Wait for theme to be applied
    await page.waitForTimeout(300);

    // Check that dark theme is applied
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('shareable URL should work correctly with full state', async ({ page }) => {
    // Navigate with full state in URL
    await page.goto('/?colors=000000,FFFFFF&labels=Black,White&theme=high-contrast');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Wait for state to be applied
    await page.waitForTimeout(500);

    // Verify colors
    const swatches = page.locator('color-swatch');
    await expect(swatches).toHaveCount(2);

    // Verify theme
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'high-contrast');
  });

  test('fallback content and noscript message exist in HTML', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);

    // Verify fallback HTML elements exist (even if hidden when JS loads)
    const fallbackContent = page.locator('.fallback-content');
    await expect(fallbackContent).toHaveCount(1);

    // Verify noscript message exists for users without JS
    const noscriptMessage = page.locator('noscript');
    await expect(noscriptMessage).toHaveCount(1);
  });
});
