---
applyTo: "**/*.test.ts"
---

# Vitest Unit Test Instructions

When writing or modifying unit tests, follow these guidelines:

## Test File Placement and Naming

- Place test files next to the source file being tested
- Use the naming convention: `*.test.ts` (e.g., `color-parser.test.ts` for `color-parser.ts`)
- Each source file should have a corresponding test file in the same directory

## Test Structure

- Use `describe()` blocks to group related tests
- Use descriptive test names with `it()` or `test()` that explain the expected behavior
- Follow the "Given-When-Then" or "Arrange-Act-Assert" pattern

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { parseColor } from './color-parser';

describe('parseColor', () => {
  it('should parse hex colors with hash', () => {
    const result = parseColor('#ff0000');
    expect(result).toEqual({ r: 255, g: 0, b: 0 });
  });
});
```

## Testing Pure Functions

- Most utilities in `src/utils/` are pure functions
- Test all edge cases and boundary conditions
- Test error handling for invalid inputs
- Include tests for empty strings, null, undefined, extreme values

## Testing Lit Components

- Use Vitest for unit testing component logic
- Test component properties, state changes, and event emissions
- Mock dependencies when needed
- For DOM interactions, consider E2E tests instead

Example:
```typescript
import { fixture, html } from '@open-wc/testing';
import './my-component';

it('should update when property changes', async () => {
  const el = await fixture(html`<my-component></my-component>`);
  el.value = 'new value';
  await el.updateComplete;
  expect(el.shadowRoot?.querySelector('div')?.textContent).toBe('new value');
});
```

## Coverage Goals

- Aim for high coverage of utility functions (90%+ for `src/utils/`)
- Focus on testing business logic and algorithms
- Color conversion functions should have comprehensive test coverage
- Contrast calculation functions must be thoroughly tested

## Assertions

- Use Vitest's `expect()` API
- Prefer specific matchers: `toBe()`, `toEqual()`, `toContain()`, `toThrow()`
- For floating point comparisons, use `toBeCloseTo()`
- Test both positive and negative cases

## Test Organization

- Group tests by functionality using `describe()` blocks
- Keep tests focused and atomic (one assertion per test when possible)
- Avoid test interdependencies
- Use `beforeEach()` for common setup, not for creating test state dependencies

## Commands

- Run tests in watch mode: `npm test`
- Run tests once: `npm run test:run`
- Run with coverage: `npm run test:coverage`

## What NOT to Test

- Don't test framework internals (Lit, Vite)
- Don't test third-party libraries
- Don't duplicate E2E tests - use unit tests for logic, E2E for user interactions
- Avoid testing implementation details - test behavior instead

## Key Testing Principles

- **Fast**: Unit tests should run quickly
- **Isolated**: Each test should be independent
- **Repeatable**: Tests should produce same results every time
- **Deterministic**: No randomness or time-based logic in tests
