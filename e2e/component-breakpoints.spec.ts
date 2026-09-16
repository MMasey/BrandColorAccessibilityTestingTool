import { test, expect, type Page } from '@playwright/test';

/**
 * Feature 108: Embeddable Widget - container-query breakpoints
 *
 * The shared results components lay out against their query container rather
 * than the viewport, so the same styles work in the main app (container:
 * bca-app-shell) and inside the embeddable widget.
 */

async function addColors(page: Page, colors: string[]): Promise<void> {
  const colorInput = page.locator('bca-color-palette').locator('bca-color-input');
  const textInput = colorInput.locator('input[type="text"]').first();
  const addButton = page.locator('bca-color-palette bca-color-input .add-btn');

  for (const color of colors) {
    await textInput.fill(color);
    await addButton.click();
  }
  await page.waitForTimeout(300);
}

/**
 * Container queries measure the container, which excludes a classic scrollbar
 * where media queries would include it, so widen the viewport by any scrollbar
 * to give the container the exact width under test.
 */
async function setContainerWidth(page: Page, width: number): Promise<void> {
  const shell = page.locator('bca-app-shell');
  await page.setViewportSize({ width, height: 900 });
  const scrollbar = width - (await shell.evaluate((el) => el.clientWidth));
  if (scrollbar > 0) {
    await page.setViewportSize({ width: width + scrollbar, height: 900 });
  }
  await expect.poll(() => shell.evaluate((el) => el.clientWidth)).toBe(width);
}

function gridColumnCount(page: Page, selector: string): Promise<number> {
  return page
    .locator(selector)
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
}

test.describe('Component breakpoints', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('bca-app-shell') !== undefined);
    await addColors(page, ['#1a1a1a', '#ffffff']);
  });

  test('contrast grid legend is compact at 640px and below', async ({ page }) => {
    const legend = page.locator('bca-contrast-grid .legend');

    await setContainerWidth(page, 641);
    await expect(legend).toHaveCSS('padding-top', '16px');

    await setContainerWidth(page, 640);
    await expect(legend).toHaveCSS('padding-top', '8px');
  });

  test('sort select narrows at 640px and below', async ({ page }) => {
    const select = page.locator('bca-sort-controls .sort-select');

    await setContainerWidth(page, 641);
    await expect(select).toHaveCSS('min-width', '180px');

    await setContainerWidth(page, 640);
    await expect(select).toHaveCSS('min-width', '140px');
  });

  test('grid filter buttons stack at 360px and below', async ({ page }) => {
    const filterButtons = 'bca-grid-filters .filter-buttons';

    await setContainerWidth(page, 361);
    await expect.poll(() => gridColumnCount(page, filterButtons)).toBe(2);

    await setContainerWidth(page, 360);
    await expect.poll(() => gridColumnCount(page, filterButtons)).toBe(1);
  });

  test('breakpoints follow the container rather than the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('bca-app-shell').evaluate((el) => {
      el.style.width = '600px';
    });

    await expect(page.locator('bca-contrast-grid .legend')).toHaveCSS('padding-top', '8px');
    await expect(page.locator('bca-sort-controls .sort-select')).toHaveCSS('min-width', '140px');
  });
});
