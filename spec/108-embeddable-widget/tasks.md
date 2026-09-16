# Feature 108: Embeddable Widget - Implementation Tasks

## Status: In progress

Suggested delivery: sections 1–2 as a behaviour-neutral prep PR, section 3 as its own PR
(visual baselines regenerate), sections 4–7 as the widget PR(s), section 8 alongside each.

---

## 1. State Decoupling (prep refactor — main app behaviour unchanged)

- [x] 1.1 Export `createColorStore()` from `src/state/color-store.ts`
- [x] 1.2 Refactor `ColorStoreController` to operate on an injected store instance
      (constructor parameter defaulting to the `colorStore` singleton)
- [x] 1.3 Add `@lit/context` and define a color-store context; controller consumes a
      context-provided store when present, falling back to the singleton
- [x] 1.4 Move theme loading/application out of `ThemeStoreImpl`'s constructor into an
      explicit `initTheme()` called from `src/main.ts` (importing state modules no longer
      touches `document`)
- [x] 1.5 Make theme application scope-aware: apply to a passed root (host element) or
      `document.documentElement` for the main app
- [x] 1.6 Unit tests: per-instance store isolation, controller with injected store,
      no import side effects from the state barrel

## 2. Tag Registration (prep refactor — main app behaviour unchanged)

- [x] 2.1 Add a registration guard helper that defines a custom element only if the name
      is free, warning (not throwing) on duplicates
- [x] 2.2 Rename all 12 internal custom-element tags with the `bca-` prefix (components,
      templates, styles, unit + E2E selectors)

## 3. Container-Query Migration (main app visually identical at 767/1024px)

- [ ] 3.1 Establish a `container-type: inline-size` query container on the app-shell (and
      later the widget root) so the same component styles work in both
- [ ] 3.2 Migrate layout-width `@media` breakpoints to `@container` in `app-shell.ts`
      (767/768/1024px)
- [ ] 3.3 Migrate layout-width `@media` breakpoints in `contrast-grid.ts` (640px),
      `grid-filters.ts` (360px), and `sort-controls.ts` (640px); leave
      `prefers-*`/`forced-colors` queries as `@media`

## 4. Theme Token Transform

- [ ] 4.1 Write a selector-rewrite helper that converts `:root[data-theme=...]` rules (and
      the dark `prefers-color-scheme` media wrapper) to `:host([theme=...])`, with unit
      tests over the real theme files
- [ ] 4.2 Wire `src/styles/themes/*.css` into the embed build as `?inline` imports through
      the transform (tokens stay single-source)

## 5. Widget Component

- [ ] 5.1 Create `src/embed/widget.ts` entry point that registers `<contrast-checker>`
- [ ] 5.2 Create `src/embed/contrast-checker.ts` with observed attributes `colors`,
      `standard`, `level`, `theme`, `attribution`, reacting to changes live
- [ ] 5.3 Instantiate a per-instance store via `createColorStore()`, provide it via
      context, and seed it from the parsed `colors` attribute
- [ ] 5.4 Render colour inputs/palette and the grid/list results with
      `bca-results-view-toggle` inside the shadow root
- [ ] 5.5 Apply the `theme` attribute to the widget host scope only (including `system`
      via `prefers-color-scheme`); `standard="apca"` falls back to WCAG with a note until
      Feature 102
- [ ] 5.6 Render the "Powered by" attribution link unless `attribution="hide"`
- [ ] 5.7 Expose host-branding CSS custom properties (`--cc-*`) consumed inside the
      shadow root

## 6. Build & Distribution

- [ ] 6.1 Add a Vite library build (entry `src/embed/widget.ts`) producing a single
      self-registering IIFE `dist/widget.js` with Lit bundled in
- [ ] 6.2 Add `npm run build:widget` and record the built bundle size (gzip) in the docs
- [ ] 6.3 Publish `widget.js` to the existing GitHub Pages deploy so a public embed URL
      exists pre-npm
- [ ] 6.4 Prepare `package.json` for eventual npm publish (`files`/`exports`, public name
      decision — `brand-contrast-checker` availability UNVERIFIED; publish step deferred
      until Mike opts in)

## 7. Demo & Documentation

- [ ] 7.1 Create `examples/embed.html` loading the built widget from local `dist/` and
      exercising every attribute, two instances, and a narrow (~320px) container
- [ ] 7.2 Document embed usage (script tag, attributes, CSS custom properties, hosted
      URL) in README/docs

## 8. Validation

- [ ] 8.1 Verify the main app is unregressed after each prep refactor and the query
      migration: typecheck, unit, full E2E, and visually identical at 767/1024px
- [ ] 8.2 E2E on the demo page: attributes update live, two widgets hold independent
      palettes, narrow container renders compact layout on a wide viewport
- [ ] 8.3 E2E: host page integrity — `<html>` attributes and URL untouched on load and
      use; a pre-existing `bca-color-input` definition on the host doesn't break the widget
- [ ] 8.4 axe-core scan of the embedded widget (zero violations) and keyboard/SR pass on
      the grid/list toggle inside the shadow root
