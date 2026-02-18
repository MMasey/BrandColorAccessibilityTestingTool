# Changelog

All notable changes to the Brand Color Accessibility Testing Tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/MMasey/BrandColorAccessibilityTestingTool/releases/tag/v0.1.0
