# Theme Contrast Testing

## Description

Add automated testing to validate that theme color combinations (light, dark, high-contrast) meet WCAG accessibility contrast requirements.

### Requirements

- **Unit tests** validating theme CSS color pairs meet WCAG AA/AAA thresholds
- **E2E tests** verifying rendered contrast ratios per theme mode
- **High contrast mode** should require AAA (7:1) compliance for text
- **Light/dark modes** should require AA (4.5:1 for normal text, 3:1 for large text/UI components)

### Key Color Pairs to Test

- Text colors on surface backgrounds
- Accent colors on surfaces
- Semantic colors (error, success, warning) on their backgrounds
- Focus state indicators

### Proposed Implementation

- `src/config/theme-colors.ts` - Theme color definitions extracted from CSS
- `src/config/theme-contrast-pairs.ts` - Critical color pair configurations
- `src/utils/theme-contrast.test.ts` - Unit tests for color pair validation
- `e2e/theme-contrast.spec.ts` - E2E tests for rendered contrast verification

### Context

The app is a Brand Color Accessibility Testing Tool that helps users test their brand colors. The app itself should practice what it preaches by ensuring its own theme colors meet accessibility standards. Current axe-core tests catch some contrast issues, but explicit contrast ratio validation would provide clearer failure messages and stronger guarantees.
