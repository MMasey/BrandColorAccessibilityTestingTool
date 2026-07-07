# Changelog

All notable changes to the Brand Color Accessibility Testing Tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-07-07

Accessibility release: fixes from the Florian Beijers screen reader review (16 March 2026), Bundles A and B1.

### Changed
- Grid header cells redesigned: a full-width colour chip sits flush with the top of the cell (square-cornered, tab-like) above a left-aligned label, giving colour names the full cell width so they wrap less and read more easily

### Fixed
- Contrast grid now uses a native `<table>` (`<caption>`, `<thead>`, `<th scope>`, `<td>`) instead of div+ARIA roles, giving more reliable screen reader table navigation (Florian Beijers review, Bundle B1)
- Grid axis labelling is plain language: the table caption reads "Each row is a foreground (text) colour; each column is a background colour" (replacing the arrow shorthand), and the cryptic "FG \ BG" corner cell is now a visual-only "↓ Foreground / → Background" orientation hint, empty for assistive tech
- WCAG level announcements heard on grid cells now list all satisfied levels (e.g. "Passes AAA, AA, and large text (AA18)") — the A7 wording previously only existed inside `contrast-cell` and was masked by the grid's own cell labels
- Same-colour diagonal cells now announce "Same colour" instead of a misleading contrast result
- Each grid cell is announced exactly once: the `<td>` label is the single announcement source, and the inner visual component is hidden from assistive tech (its old labels sat on generic divs, where `aria-label` is prohibited and unreliably exposed)
- Colour palette sidebar is a `<section>` instead of an `<aside>`, since its controls are primary content, not complementary (Bundle A1)
- Colour input errors use an always-present polite `role="status"` live region (toggled by class, announced on blur or after a pause) instead of an eager `role="alert"` injected mid-keystroke (Bundle A2)
- Colour list now has an accessible name ("Colour palette") for screen reader list navigation (Bundle A3)
- Label edit button announces its action ("Edit label: …") instead of just the colour name, and unreliable `title` tooltips were removed (Bundle A4)
- Grid scroll region label simplified to "Contrast results" — scroll instructions were noise for screen reader users (Bundle A5); the label is also differentiated from the results heading to avoid duplicate landmark names
- Filtered grid cells stay in the accessibility tree as empty cells, so screen reader row/column counts remain correct (Bundle A6); they no longer carry an empty `aria-label` attribute, which could override the cell's natural name in some screen readers
- Colour input debounce timer is cleared on disconnect, preventing callbacks on detached elements
- CI: quality artifacts (visual milestones, Lighthouse reports) are only captured on release PRs — the bot commit previously pushed to every PR left a required check stuck pending and blocked merges

### Documentation
- Remaining WCAG 2.1 references updated to WCAG 2.2 in theme CSS headers, E2E suite descriptions, and specs
- New specs: Feature 107 (Contrast Results List View, promoted to next up), Feature 108 (Embeddable Widget); Feature 102 extended with contrast algorithm choice
- MCP servers for development (`wcag`, `playwright`, Deque `axe`) configured in `.mcp.json`, with keys supplied via environment variables only and a secret-free `.env.example`; the axe Docker container now receives `AXE_API_KEY` via a pass-through `-e` flag
- Contributor guidance (`.github/copilot-instructions.md`) updated from WCAG 2.1 to 2.2, completing the docs sweep

## [0.3.3] - 2026-03-15

### Fixed
- Production deploy workflow now requires unit and E2E tests to pass before building or deploying (#30)
- `build` and `deploy` jobs are guarded with `github.ref == 'refs/heads/main'` so `workflow_dispatch` from a non-main branch runs tests only and never deploys
- Playwright browsers are now cached (keyed by OS + `package-lock.json`) to reduce CI time on subsequent deploys
- Removed redundant `npm run build` from the test gate (Playwright uses `npm run dev` via the `webServer` config)

## [0.3.2] - 2026-03-15

### Fixed
- Lighthouse capture script now runs 3× and reports the median run by TBT, eliminating false performance regressions caused by shared CI runner noise (#28)
- Validates `LIGHTHOUSE_RUNS` env var and exits with a clear error for invalid values

## [0.3.1] - 2026-03-15

### Fixed
- Footer now correctly references both WCAG 2.2 SC 1.4.3 (AA) and SC 1.4.6 (AAA) with separate links (#26)
- Updated all WCAG 2.1 references in contrast utility to WCAG 2.2 (algorithm unchanged)

### Documentation
- Added *Contrast Algorithm* section to README explaining the relative luminance formula, rationale for WCAG over APCA, and an expanded threshold table mapping badge levels to their Success Criteria

## [0.3.0] - 2026-02-18

### Fixed
- Up/down arrow buttons now correctly move the right card after drag-and-drop reordering (#22)
- Correct WCAG 2.5.8 touch target documentation; reorder buttons now use design tokens (#21)

## [0.2.1] - 2026-02-14

### Fixed
- Reorder button height reduced to meet WCAG 2.5.8 AA minimum touch target (44×24px with 4px gap)
- Stacked 44px buttons were inflating colour cards to ~90px; card height is now unaffected

## [0.2.0] - 2026-02-11

### Added
- Feature #101: Colour palette sorting and drag-drop reordering
  - Five sorting algorithms: Luminance, Contrast Score, WCAG Pass Rate, Hue, Alphabetical
  - Bidirectional sorting (ascending/descending)
  - Native HTML5 drag-and-drop with keyboard-accessible reordering (WCAG 2.5.7 compliant)
  - Up/down arrow buttons as keyboard alternative to drag-and-drop
  - Sort order persisted to URL for shareable links
- Restructured spec roadmap: phases 2-5 are now independent features 102-105

## [0.1.0] - 2026-01-21

### Added
- Core contrast checker functionality
- Colour input supporting hex, RGB, and HSL formats
- Contrast grid showing all colour pair combinations
- WCAG AA/AAA compliance badges
- Theme switcher (Light/Dark/High Contrast/System)
- Grid filtering by compliance level
- Grid cell size controls (S/M/L)
- URL state synchronisation for shareable links
- Print stylesheet for contrast grid
- Full keyboard navigation support
- Screen reader optimisations
- Windows High Contrast Mode support
- Comprehensive test suite (unit + E2E)
- Visual milestone capture system
- Lighthouse performance monitoring
- GitHub Actions CI/CD pipeline with GitHub Pages deployment

### Accessibility
- Lighthouse Accessibility score: 100/100
- WCAG 2.2 Level AA compliance
- Proper focus states with outline rings
- ARIA labels and live regions
- Minimum 44px touch targets
- Respects `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`

### Performance
- Lighthouse Performance score: 97-100/100
- First Contentful Paint: 1.1s
- Largest Contentful Paint: 1.2s
- Total Blocking Time: 40ms
- Cumulative Layout Shift: 0.039

[Unreleased]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.3.3...v0.4.0
[0.3.3]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/releases/tag/v0.1.0
