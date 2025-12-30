# Architectural Decisions

This document records key architectural decisions made during development.

---

## ADR-001: Lit Web Components

**Decision**: Use Lit as the component framework.

**Context**: Needed a lightweight way to build interactive UI components without heavy framework overhead.

**Alternatives Considered**:
- React: Too heavy for a single-page tool, adds unnecessary complexity
- Vue: Similar concerns to React
- Vanilla JS: More boilerplate, harder to maintain reactivity

**Rationale**:
- Lightweight (~5kb gzipped)
- Native Web Components (future-proof)
- Shadow DOM for style encapsulation
- Simple reactive model with decorators
- No build-time transformation required

---

## ADR-002: Pub/Sub State Management

**Decision**: Use a simple pub/sub pattern for state management instead of Redux or Context.

**Context**: Need reactive state updates across components without prop drilling.

**Alternatives Considered**:
- Redux: Overkill for this application size
- React Context: Would require React
- MobX: Additional dependency not needed

**Rationale**:
- Application state is simple (colors array, filters, theme)
- Pub/sub is ~50 lines of code
- Easy to understand and debug
- No external dependencies
- Integrates well with Lit's reactive controllers

---

## ADR-003: Progressive Enhancement

**Decision**: Build with progressive enhancement - meaningful content before JavaScript loads.

**Context**: Accessibility tool should demonstrate accessibility best practices.

**Implementation**:
1. **URL State**: Colors encoded in URL parameters for shareability
2. **CSS-first theming**: `prefers-color-scheme` works without JS
3. **Semantic HTML**: Forms and tables work without JS styling
4. **Noscript fallback**: Helpful message for users without JS

**Rationale**:
- Embodies the accessibility-first philosophy
- Shareable URLs work immediately
- Resilient to JS failures

---

## ADR-004: Shadow DOM + CSS Custom Properties

**Decision**: Use Shadow DOM for style encapsulation with CSS custom properties for theming.

**Context**: Components need isolated styles but must support global theming.

**Implementation**:
- Each component has encapsulated styles in Shadow DOM
- Global theme tokens defined as CSS custom properties in `:root`
- Components reference `var(--token-name)` for themeable values

**Rationale**:
- Style isolation prevents conflicts
- Custom properties cross Shadow DOM boundary
- Single source of truth for theme values
- Easy to add new themes

---

## ADR-005: Vitest + Playwright Testing Strategy

**Decision**: Use Vitest for unit tests and Playwright for E2E tests.

**Context**: Need comprehensive testing for color calculations and UI interactions.

**Testing Layers**:
1. **Unit tests (Vitest)**: Color parsing, contrast calculations, store logic
2. **E2E tests (Playwright)**: User flows, accessibility audits, keyboard navigation
3. **Visual review**: Screenshot capture for design review (not committed)

**Rationale**:
- Vitest is fast and native ESM
- Playwright provides real browser testing
- axe-core integration for accessibility audits
- Visual review helps catch design regressions

---

## ADR-006: URL State Encoding

**Decision**: Encode color palette in URL parameters for shareability.

**Format**:
```
?colors=FF5733,3498DB&labels=Orange,Blue&text=normal&theme=dark
```

**Context**: Users need to share color palettes without accounts or backend storage.

**Rationale**:
- No backend required
- Works with browser bookmarks
- History API for clean navigation
- Progressive enhancement (can parse URL server-side in future)

**Trade-offs**:
- URL length limit (~2000 chars) constrains palette size
- Special characters in labels need encoding

---

## ADR-007: Grid Filtering Over Sorting

**Decision**: Implemented filtering before sorting features.

**Context**: Original spec included both filtering (show/hide by compliance) and sorting (reorder by accessibility score).

**Implemented**:
- Filter by AAA, AA, AA 18pt+, Failed
- Maintains grid structure with dimmed cells

**Deferred**:
- Accessibility score calculation
- Sort by most/least accessible
- Sort state in URL

**Rationale**:
- Filtering provides immediate value
- Sorting requires more complex UI
- Can add sorting in Phase 1.1 or Phase 2

---

## ADR-008: Deferred Visual Color Picker

**Decision**: Defer visual color picker integration (Alwan library).

**Context**: Original spec included native `<input type="color">` and Alwan picker.

**Current State**:
- Text input only (hex, RGB, HSL)
- Sufficient for core functionality

**Rationale**:
- Text input covers primary use case
- Color picker adds complexity and bundle size
- Can add as enhancement later
- Focus on core contrast checking first
