# Brand Color Accessibility Testing Tool

A web-based tool for testing brand color combinations against WCAG accessibility contrast requirements.

## Tech Stack

- **Framework**: Lit 3.x (Web Components)
- **Language**: TypeScript 5.6
- **Build**: Vite 7.x
- **Testing**: Vitest (unit), Playwright (E2E), axe-core (accessibility)
- **Styling**: CSS custom properties (design tokens), no CSS framework

## Architecture

```
src/
  components/     # Lit web components (app-shell, color-palette, contrast-grid, etc.)
  state/          # State management (color-store, theme-store, url-state)
  utils/          # Pure functions (contrast calculations, color parsing)
  styles/         # Global CSS and shared component styles
```

### Key Patterns

- **Web Components**: All UI is built with Lit custom elements
- **State Management**: Singleton stores with subscription pattern (no external library)
- **URL State**: Colors and filters sync to URL for shareability
- **Progressive Enhancement**: Works without JavaScript for basic display

## Roadmap & Specifications

See [spec/PROJECT.md](spec/PROJECT.md) for the full roadmap.

### Phases (001-005)
| Phase | Name | Status |
|-------|------|--------|
| 1 | Core Contrast Checker | In Progress |
| 2 | APCA & Exports | Planned |
| 3 | Visual Exports | Planned |
| 4 | AI Color Generation | Planned |
| 5 | AI Mockups (Paid) | Planned |

### Feature Specs (100+)
Standalone features use 100+ numbering to avoid collision with phases.

| ID | Name | Status |
|----|------|--------|
| 100 | Theme Contrast Testing | Planned |

All specs follow the SPECKL format with `README.md` + `spec.md`.

## Design Values

1. **Accessibility First**: The tool tests accessibility, so it must be fully accessible itself
2. **WCAG Compliance**: All themes meet WCAG 2.1 AA minimum, high-contrast meets AAA
3. **Semantic HTML**: Proper landmarks, headings, and ARIA where needed
4. **Keyboard Navigation**: Full keyboard support for all interactions
5. **Touch-Friendly**: Minimum 44px touch targets

## Explicit Non-Goals

- **Not a design system**: This is a single-purpose tool, not a component library
- **Not a color picker**: Users enter colors, we don't provide a picker UI
- **No user accounts**: No authentication, no saved palettes on server
- **No backend**: Fully client-side, no API calls
- **No color suggestions**: We test colors, we don't recommend them

## Key Constraints

### Performance
- Fast startup (no heavy dependencies)
- Instant contrast calculations (pure functions, no async)
- Responsive at all viewport sizes

### Accessibility Compliance
- WCAG 2.1 Level AA for light/dark themes
- WCAG 2.1 Level AAA for high-contrast theme
- Supports `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`
- Windows High Contrast Mode support (`forced-colors`)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support

## Theme System

Three themes via `data-theme` attribute on `<html>`:
- `light` (default)
- `dark`
- `high-contrast`

Plus `system` mode that respects OS preferences.

CSS variables defined in `src/styles/global.css`.

## Testing Strategy

| Type | Tool | Location | Command |
|------|------|----------|---------|
| Unit | Vitest | `src/**/*.test.ts` | `npm test` |
| E2E | Playwright | `e2e/*.spec.ts` | `npm run test:e2e` |
| Accessibility | axe-core | via Playwright | included in E2E |
| Visual | Screenshots | `docs/visual-history/` | `npm run capture-milestone` |
| Performance | Lighthouse | `docs/performance-history/` | `npm run lighthouse` |

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run unit tests (watch)
npm run test:run     # Run unit tests (once)
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run E2E tests with UI
```

## Code Style

- Prefer pure functions in `utils/`
- Components should be small and focused
- State changes flow through stores, not direct DOM manipulation
- CSS custom properties for all colors/spacing (no magic values)
- Test coverage for utility functions
