---
applyTo: "e2e/**/*.spec.ts"
---

# Playwright E2E Test Instructions

When writing or modifying Playwright end-to-end tests, follow these guidelines:

## Test Structure and Naming

- Use descriptive test names that clearly describe the user behavior being tested
- Follow the naming convention: `*.spec.ts` for all E2E test files
- Place all E2E tests in the `e2e/` directory
- Group related tests using `test.describe()` blocks

## Locator Best Practices

- **Prefer semantic locators** in this order:
  1. `getByRole()` - Most accessible and robust
  2. `getByLabel()` - For form elements
  3. `getByText()` - For visible text content
  4. `getByTestId()` - Only when semantic locators aren't suitable
- **Avoid** CSS selectors and XPath unless absolutely necessary

## Accessibility Testing

- **REQUIRED**: Include accessibility checks using `@axe-core/playwright`
- Run accessibility scans on all major page states
- Example:
  ```typescript
  import { test, expect } from '@playwright/test';
  import AxeBuilder from '@axe-core/playwright';

  test('should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
  ```

## Assertions

- Use Playwright's built-in `expect()` with specific matchers
- Prefer matchers like `toBeVisible()`, `toHaveText()`, `toHaveValue()` over generic checks
- Use `toEqual([])` for checking empty arrays (e.g., accessibility violations)

## Waiting and Timing

- **Rely on auto-wait**: Playwright automatically waits for elements to be actionable
- **Avoid** `page.waitForTimeout()` - use `page.waitForLoadState()` or locator assertions instead
- Wait for network if needed: `await page.waitForLoadState('networkidle')`

## Test Independence

- Each test must be independent and not rely on other tests
- Use `test.beforeEach()` for common setup
- Clean up state in `test.afterEach()` if necessary
- Do not assume test execution order

## Cross-Browser Testing

- The project is configured to test on Chromium, Firefox, and WebKit
- Write tests that work across all browsers
- Avoid browser-specific workarounds unless absolutely necessary

## Component Testing

- Test web components using shadow DOM queries when needed
- Example: `await page.locator('contrast-grid').locator('div.cell')`

## Configuration

- Test configuration is in `playwright.config.ts`
- Base URL is set to `http://localhost:5173` for dev server
- Tests run headless by default in CI, headed in `--ui` mode
- Screenshots are captured on failure automatically

## Commands

- Run all E2E tests: `npm run test:e2e`
- Run with UI mode: `npm run test:e2e:ui`
- CI-only (Chromium): `npm run test:e2e:ci`

## Key Patterns in This Project

- The app uses Lit web components with shadow DOM
- Color values sync to URL parameters
- Theme switching is done via `data-theme` attribute on `<html>`
- Focus management is critical for keyboard accessibility
