import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Feature 107: Contrast Results List View
 *
 * The list view presents the contrast results as semantic lists grouped by
 * WCAG level - an alternative to the intersection table for screen reader
 * users and anyone who finds two-dimensional tables hard to navigate.
 */

async function addColors(page: Page, colors: string[]): Promise<void> {
  const colorInput = page.locator('color-palette').locator('color-input');
  const textInput = colorInput.locator('input[type="text"]').first();
  const addButton = page.locator('color-palette color-input .add-btn');

  for (const color of colors) {
    await textInput.fill(color);
    await addButton.click();
  }
  await page.waitForTimeout(300);
}

function listOption(page: Page) {
  return page.locator('results-view-toggle').locator('label', { hasText: 'List' });
}

function tableOption(page: Page) {
  return page.locator('results-view-toggle').locator('label', { hasText: 'Table' });
}

test.describe('Results View Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('toggle is visible with Table active by default', async ({ page }) => {
    const toggle = page.locator('results-view-toggle');
    await expect(toggle).toBeVisible();

    const tableRadio = tableOption(page).locator('input[type="radio"]');
    await expect(tableRadio).toBeChecked();
  });

  test('section heading reads "Contrast Results"', async ({ page }) => {
    const heading = page.locator('app-shell').locator('h2.grid-title');
    await expect(heading).toHaveText('Contrast Results');
  });

  test('shows a hint that list view is easier with a screen reader', async ({ page }) => {
    const hint = page.locator('results-view-toggle').locator('.view-hint');
    await expect(hint).toContainText('screen reader');
  });

  test('switches from table to list view and back', async ({ page }) => {
    await addColors(page, ['#000000', '#ffffff']);

    // Table view by default
    await expect(page.locator('contrast-grid')).toBeVisible();
    await expect(page.locator('contrast-list')).toHaveCount(0);

    // Switch to list view
    await listOption(page).click();
    await expect(page.locator('contrast-list')).toBeVisible();
    await expect(page.locator('contrast-grid')).toHaveCount(0);

    // Switch back to table view
    await tableOption(page).click();
    await expect(page.locator('contrast-grid')).toBeVisible();
    await expect(page.locator('contrast-list')).toHaveCount(0);
  });

  test('toggle is keyboard operable', async ({ page }) => {
    await addColors(page, ['#000000', '#ffffff']);

    const listRadio = listOption(page).locator('input[type="radio"]');
    await listRadio.focus();
    await page.keyboard.press('Space');

    await expect(listRadio).toBeChecked();
    await expect(page.locator('contrast-list')).toBeVisible();
  });
});

test.describe('Contrast List View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  });

  test('groups pairs under WCAG level headings without a table', async ({ page }) => {
    // Black/white (AAA) plus mid gray (mixed levels)
    await addColors(page, ['#000000', '#ffffff', '#767676']);
    await listOption(page).click();

    const list = page.locator('contrast-list');
    const headings = list.locator('h3');
    await expect(headings.first()).toBeVisible();

    // AAA group must exist (black/white)
    await expect(list.locator('h3', { hasText: 'passes AAA' })).toHaveCount(1);

    // Entries read as sentences ("Black and White, contrast 21 to 1");
    // each unordered pair appears exactly once (contrast is symmetric)
    const firstEntry = list.locator('li').first();
    await expect(firstEntry).toContainText(' and ');
    await expect(firstEntry).toContainText('contrast');
    await expect(firstEntry).toContainText('to 1');
    await expect(list.locator('li')).toHaveCount(3); // 3 colours = 3 pairs

    // No table anywhere in the list view
    await expect(list.locator('table')).toHaveCount(0);
  });

  test('omits empty level groups', async ({ page }) => {
    // Black and white only: every pair is AAA (21:1)
    await addColors(page, ['#000000', '#ffffff']);
    await listOption(page).click();

    const list = page.locator('contrast-list');
    await expect(list.locator('h3')).toHaveCount(1);
    await expect(list.locator('h3').first()).toContainText('passes AAA');
  });

  test('respects the WCAG filter toggles', async ({ page }) => {
    await addColors(page, ['#000000', '#ffffff']);
    await listOption(page).click();

    const list = page.locator('contrast-list');
    await expect(list.locator('h3', { hasText: 'passes AAA' })).toHaveCount(1);

    // Turn the AAA filter off - the AAA group disappears
    const aaaButton = page.locator('grid-filters').locator('button:has-text("AAA")');
    await aaaButton.click();
    await expect(list.locator('h3', { hasText: 'passes AAA' })).toHaveCount(0);

    // Turn it back on - the group returns
    await aaaButton.click();
    await expect(list.locator('h3', { hasText: 'passes AAA' })).toHaveCount(1);
  });

  test('shows the empty state message with fewer than 2 colours', async ({ page }) => {
    await listOption(page).click();

    const list = page.locator('contrast-list');
    await expect(list.locator('.empty-state')).toBeVisible();

    await addColors(page, ['#000000']);
    await expect(list.locator('.empty-state')).toContainText('at least 2 colors');
  });

  test('list content is selectable plain text', async ({ page }) => {
    await addColors(page, ['#000000', '#ffffff']);
    await listOption(page).click();

    // innerText mirrors what a browser copy operation produces
    // (read from .list-wrapper - the shadow host itself has no light DOM text)
    const text = await page.locator('contrast-list').locator('.list-wrapper').innerText();
    expect(text).toContain('passes AAA');
    expect(text).toMatch(/#000000 and #FFFFFF, contrast 21 to 1/i);
    // The visual "Aa" sample is CSS-generated and must NOT appear in copied text
    expect(text).not.toContain('Aa');
  });

  test('has no accessibility violations (axe-core)', async ({ page }) => {
    await addColors(page, ['#000000', '#ffffff', '#767676', '#cccccc']);
    await listOption(page).click();
    await page.waitForTimeout(300);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations (list view):', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('List View URL Persistence', () => {
  test('?view=list loads the page directly in list view', async ({ page }) => {
    await page.goto('/?colors=000000,FFFFFF&view=list');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
    await page.waitForTimeout(500);

    await expect(page.locator('contrast-list')).toBeVisible();
    await expect(page.locator('contrast-grid')).toHaveCount(0);

    const listRadio = page.locator('results-view-toggle')
      .locator('label', { hasText: 'List' })
      .locator('input[type="radio"]');
    await expect(listRadio).toBeChecked();
  });

  test('switching views updates the URL and table removes the param', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
    await addColors(page, ['#000000', '#ffffff']);

    // Switch to list - URL gains view=list
    await listOption(page).click();
    await page.waitForTimeout(300);
    expect(page.url()).toContain('view=list');

    // Switch back to table - param removed entirely (no ?view=table noise)
    await tableOption(page).click();
    await page.waitForTimeout(300);
    expect(page.url()).not.toContain('view=');
  });

  test('existing params still work combined with view=list', async ({ page }) => {
    await page.goto('/?colors=000000,FFFFFF&labels=Black,White&theme=dark&view=list');
    await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
    await page.waitForTimeout(500);

    // Colours loaded
    await expect(page.locator('color-swatch')).toHaveCount(2);

    // Theme applied
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // List view active, using the colour labels from the URL
    const list = page.locator('contrast-list');
    await expect(list).toBeVisible();
    await expect(list.locator('li').first()).toContainText('Black and White');
  });
});
