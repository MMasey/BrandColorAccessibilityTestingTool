# Phase 1: Core Contrast Checker - Tasks

## Status: ✅ 100% Complete

---

## 1. Project Setup ✓

- [x] 1.1 Initialize Vite project with TypeScript template
- [x] 1.2 Install and configure Lit for web components
- [x] 1.3 Set up project structure (src/components, src/utils, src/styles)
- [x] 1.4 Configure TypeScript for strict mode and Lit decorators
- [x] 1.5 Set up CSS custom properties for theming

## 2. Color Utilities ✓

- [x] 2.1 Create color parser module (hex, RGB, HSL)
- [x] 2.2 Create color converter utilities
- [x] 2.3 Implement relative luminance calculator
- [x] 2.4 Implement WCAG 2.2 contrast ratio calculator
- [x] 2.5 Create WCAG compliance evaluator

## 3. State Management ✓

- [x] 3.1 Create color palette store
- [x] 3.2 Implement add/remove/update color operations
- [x] 3.3 Create text size toggle state
- [x] 3.4 Implement reactive updates

## 4. UI Components ✓

- [x] 4.1 Create `<color-input>` component
- [x] 4.2 Create `<color-swatch>` component
- [x] 4.3 Create `<color-palette>` component
- [x] 4.4 Create `<contrast-cell>` component
- [x] 4.5 Create `<contrast-grid>` component
- [x] 4.6 Create `<text-size-toggle>` component
- [x] 4.7 Create `<app-shell>` component

## 5. Accessibility & Theming ✓

- [x] 5.1 Implement theme switcher (light/dark/high-contrast)
- [x] 5.2 Add user-configurable font size adjustment
- [x] 5.3 Ensure 44x44px touch targets
- [x] 5.4 Add visible focus states
- [x] 5.5 Implement ARIA labels and live regions
- [x] 5.6 Add prefers-reduced-motion support
- [x] 5.7 Ensure proper heading hierarchy

## 6. Responsive Layout ✓

- [x] 6.1 Mobile-first layout for color palette input
- [x] 6.2 Responsive contrast grid (scroll on small screens)
- [x] 6.3 Tablet breakpoint optimizations
- [x] 6.4 Desktop breakpoint with optimal grid display

## 7. Validation ✓

- [x] 7.1 Verify color parsing for all formats
- [x] 7.2 Verify contrast ratios match WebAIM
- [x] 7.3 Verify WCAG badges display correctly
- [x] 7.4 Run accessibility audit (axe-core)
- [x] 7.5 Test keyboard navigation
- [x] 7.6 Test screen reader announcements

## 8. UI/UX Refinements ✓

- [x] 8.1 Update diagonal cells to show "—" instead of "1:1 FAIL"
- [x] 8.2 Move display preferences earlier in DOM
- [x] 8.3 Fix theme switcher overflow
- [x] 8.4 Add equal width to theme buttons
- [x] 8.5 Add tooltip for "AA 18+" badge
- [x] 8.6 Improve grid visual hierarchy

## 9. Progressive Enhancement ✓

- [x] 9.1 URL state management (colors, labels, theme, text size)
- [x] 9.2 Initialize from URL on page load
- [x] 9.3 Update URL on state change (History API)
- [x] 9.4 Static HTML fallback in index.html
- [x] 9.5 Add `<noscript>` block
- [x] 9.6 prefers-color-scheme CSS default
- [x] 9.7 Print stylesheet for contrast grid
- [x] 9.8 Test shareable URLs

## 10. Grid Filtering ✓

- [x] 10.1 Add filter controls to grid header
- [x] 10.2 Implement "Hide failed" filter
- [x] 10.3 Implement "Show only AAA" filter
- [x] 10.4 Maintain grid structure when filtering
- [x] 10.5 Add filter state to URL parameters

## 11. Grid UX Enhancements ✓

- [x] 11.1 Grid cell size control (S/M/L)
- [x] 11.2 Filter state persistence in color store
- [x] 11.3 Simplified filter UI

## 12. Code Quality ✓

- [x] 12.1 Centralize WCAG badge colors in utils/wcag-config.ts
- [x] 12.2 Create shared CSS utilities in styles/shared.ts
- [x] 12.3 Remove dead CSS
- [x] 12.4 Remove unused type imports

## 13. Testing ✓

- [x] 13.1 Unit tests for color parsing
- [x] 13.2 Unit tests for contrast calculations
- [x] 13.3 E2E tests for user interactions
- [x] 13.4 Visual review test framework
- [x] 13.5 Design validation tests

## 14. Documentation ✓

- [x] 14.1 Create README.md
- [x] 14.2 Document installation and setup
- [x] 14.3 Add feature list
- [x] 14.4 Include accessibility statement
- [x] 14.5 Add CONTRIBUTING.md
- [x] 14.6 Set up GitHub Pages deployment
- [x] 14.7 Add MIT license
- [x] 14.8 Create CHANGELOG.md

## 15. Lighthouse 100/100 ✅

- [x] 15.1 Performance: 97-100/100 ✅
- [x] 15.2 Accessibility: 100/100 ✅
- [x] 15.3 Best Practices: 100/100 ✅ (96→100)
- [x] 15.4 SEO: 100/100 ✅ (91→100)

## 16. Post-Launch Accessibility Fixes (Florian Beijers Review, 16 Mar 2026) ⏳

Issues found during a live screen reader testing session. Full details in
`spec/001-core-contrast-checker/ACCESSIBILITY-FIXES.md`.

### Bundle A — Quick Fixes (ship as one PR)

- [x] A1 `app-shell.ts` line 251 — change `<aside class="sidebar">` to `<section class="sidebar">` (`complementary` landmark is wrong for primary controls)
- [x] A2 `color-input.ts` lines 317–321, 374, 439–442 — debounce `hasInput` to blur/600 ms; always render error container in DOM; replace `role="alert"` with `role="status"` + `aria-live="polite"`
- [x] A3 `color-palette.ts` line 579 — add `aria-label="Colour palette"` to `<ul class="colors-list">`
- [x] A4 `color-swatch.ts` lines 594–601 — add `aria-label="Edit label: ${label}"` to edit button when label exists; remove both `title` attributes (C1 handled here)
- [x] A5 `contrast-grid.ts` line 448 — drop scroll instruction from grid wrapper `aria-label`; named `"Contrast results grid, scrollable"` (distinct from the parent `<section aria-label="Contrast results">` to avoid duplicate region landmarks)
- [x] A6 `contrast-grid.ts` lines 511–516 — remove `role="presentation"` / `aria-hidden` swap on filtered cells; keep cells in accessibility tree as empty `role="cell"`
- [x] A7 `contrast-cell.ts` line 232 — expand `getAriaLabel()` to list all satisfied levels (AAA → "Passes AAA, AA, and large text (AA18)"; AA → "Passes AA and large text (AA18)"; AA18 → "Passes large text only (AA18)"; DNP → "Does not pass any WCAG level")

### Bundle B — Contrast Grid Table Refactor (separate PR)

- [x] B1 `contrast-grid.ts` — convert `div`+ARIA roles to native `<table>` / `<tr>` / `<th scope="col|row">` / `<td>`; move axis label into `<caption>`; replace `display: contents` rows with standard `<tr>` layout; use `position: sticky` on `<th>` for sticky headers. Also: shared `getLevelAnnouncement()` util so the A7 wording is announced on the `<td>` labels (previously masked); diagonal cells announce "Same colour"; caption is a plain-language sentence explaining rows/columns (replaces arrow shorthand); corner cell is a visual-only "↓ Foreground / → Background" hint in an AT-empty `<td>` (replaces "FG \ BG")

### Bundle C — `title` Attribute Audit

- [x] C1 Handled by A4 above (edit label buttons in `color-swatch.ts`)
- [x] C2 `contrast-grid.ts` — `title` on column/row headers is visual-only tooltip; acceptable, no change needed
- [x] C3 `contrast-cell.ts` — `title` on WCAG badge is visual-only tooltip; acceptable, no change needed

---

## Phase 1 Complete! 🎉

All tasks completed. The tool is now:
- ✅ Fully functional with all planned features
- ✅ 100/100 on Lighthouse (Performance, Accessibility, Best Practices, SEO)
- ✅ Deployed to GitHub Pages
- ✅ Open source with MIT license

Next: Any feature from [100-105](../PROJECT.md#feature-roadmap) can be implemented independently
