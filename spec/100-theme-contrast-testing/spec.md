# Theme Contrast Testing

# Goal
Ensure the app's own theme colors (light, dark, high-contrast) meet WCAG contrast requirements, providing clear test failures if theme CSS is modified to non-compliant values.

# Inputs
- Theme color definitions from `src/styles/global.css`
- Theme modes: `light`, `dark`, `high-contrast`
- WCAG thresholds from `src/utils/contrast.ts`

# Outputs
- Unit test suite validating color pair contrast ratios
- E2E test suite validating rendered theme contrast
- Clear failure messages identifying non-compliant color pairs

# Constraints
- Use existing `getContrastRatio()` and `WCAG_THRESHOLDS` from `src/utils/contrast.ts`
- Unit tests run via Vitest (existing pattern in `src/utils/contrast.test.ts`)
- E2E tests run via Playwright (existing pattern in `e2e/app.spec.ts`)
- Light/dark modes: WCAG AA minimum (4.5:1 normal text, 3:1 large/UI)
- High contrast mode: WCAG AAA minimum (7:1 normal text, 4.5:1 large)

# Requirements
- Create theme color configuration extracting hex values from CSS for each theme
- Define critical color pairs to test (text on surfaces, accent on surfaces, semantic colors)
- Create unit tests validating each color pair meets threshold per theme
- Create E2E tests validating rendered computed styles match expected contrast

# Dependencies
- `src/utils/contrast.ts` - Reuse contrast calculation functions
- `src/utils/color-parser.ts` - Reuse `parseHex()` for color conversion
- `src/styles/global.css` - Source of truth for theme color values
- `src/utils/contrast.test.ts` - Pattern reference for unit test structure

# Out of Scope
- Testing user-entered brand colors (that's the app's core function, already covered)
- Automated CSS variable extraction (manual config is acceptable)
- Testing hover/focus state colors beyond focus ring
- Testing media query transitions between themes

# Done
- Unit tests fail when any theme color pair drops below required contrast ratio
- Test output identifies the specific color pair and actual vs required ratio
- All three themes (light, dark, high-contrast) have passing contrast tests
- High contrast theme tests enforce AAA compliance
