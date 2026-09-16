# Embeddable Widget

# Goal

Any third-party page can embed the full contrast checker (colour inputs + contrast results
as grid or list) by adding one `<script>` tag and one `<contrast-checker>` element,
configured through HTML attributes and scoped CSS custom properties, with no build step and
no impact on the host page's global styles, `<html>` attributes, or URL.

# Inputs

- Host-supplied HTML attributes on `<contrast-checker>`:
  - `colors` — comma-separated palette (hex or CSS named colours); parsed with the existing
    colour parser in `src/utils/`
  - `standard` — `wcag` (default) | `apca`
  - `level` — `AA` (default) | `AAA`
  - `theme` — `light` (default) | `dark` | `high-contrast` | `system`
  - `attribution` — `show` (default) | `hide`
- Host-supplied CSS custom properties set on the element (e.g. `--cc-accent`) for branding
- No URL parameters are read or written by the widget (unlike the main app)

# Outputs

- A single self-registering custom element `<contrast-checker>` bundled into one file
  (`dist/widget.js`), loadable via CDN script tag or self-hosted.
- The element renders, inside its own shadow root:
  - Colour input controls (reuse `bca-color-input` / `bca-color-palette`)
  - The contrast results (reuse `bca-contrast-grid` and Feature 107's `bca-contrast-list` +
    `bca-results-view-toggle` — the list view is the screen-reader-preferred presentation and
    shares the same store field, so including it costs almost nothing)
  - An optional "Powered by Brand Colour Accessibility Tool" attribution link
- Attribute changes reflow the widget reactively (observed attributes).
- Multiple `<contrast-checker>` elements can coexist on one page with independent state.

# Constraints

- **No new runtime dependencies except `@lit/context`** — the store is provided to
  descendant components via Lit context; `@lit/context` is the official Lit-family package
  (~1KB) and is the one sanctioned addition. Otherwise Lit + existing utils only; bundle
  stays small.
- **Instance-scoped state**: the singleton `colorStore` (`src/state/color-store.ts`)
  cannot be shared across widget instances. The `createColorStore()` factory exists
  (`src/state/color-store.ts:49`) but is module-private — it must be exported. The deeper
  refactor is `ColorStoreController` (`src/state/color-store-controller.ts`): every getter
  and method calls the module-level singleton directly. It must hold a store reference
  (constructor parameter defaulting to the singleton, so the main app is untouched) and
  widget descendants receive their per-instance store via Lit context.
- **No global theme mutation — including at import time**: `themeStore` writes `data-theme`
  to `document.documentElement`, and its singleton constructor does so **on module load**
  (`src/state/theme-store.ts` — the constructor reads localStorage and calls `applyTheme()`).
  The `src/state/index.ts` barrel re-exports it, so every component import currently drags
  the side effect into any bundle. Theme application must become an explicit `initTheme()`
  that only `src/main.ts` calls; the widget applies theme to its **own host element /
  shadow root**, never to `<html>` — it must not recolour the host page.
- **No tag-name collisions**: the app originally self-registered 12 custom elements with generic names
  (`color-input`, `color-palette`, `contrast-grid`, `contrast-cell`, `contrast-list`,
  `color-swatch`, `app-shell`, `brand-guidance`, `grid-filters`, `theme-switcher`,
  `sort-controls`, `results-view-toggle`). A duplicate `customElements.define` on a host
  page throws and kills the widget. Internal tags are renamed with a `bca-` prefix
  (main app included — no fork), registration goes through a guard that warns instead of
  throwing, and only the public `<contrast-checker>` stays unprefixed. Known limitation: the
  guard keeps the first definition of each tag, so when two builds share a page (e.g. the
  main app and `widget.js`) the widget's internal elements come from whichever loaded first.
  They still receive the widget's store because the context key is a `Symbol.for` registry
  symbol, but differing versions are not isolated — that would need scoped custom element
  registries, which are out of scope for v1.
- **No URL sync**: the widget must not read or write `window.location` (the main app's
  `url-sync.ts` behaviour is disabled/absent in the embed build).
- **Style isolation**: all styles ship inside the shadow root; the widget must not leak CSS
  into the host page and should be resilient to host page CSS. Theme tokens come from
  `src/styles/themes/*.css` — but those files are document-scoped
  (`:root[data-theme="dark"]`, and dark also under `@media (prefers-color-scheme: dark)`),
  which is inert inside a shadow root. The widget build imports the **same** CSS files as
  strings (Vite `?inline`) and applies a small, unit-tested selector rewrite to
  `:host([theme="..."])` — tokens stay single-source, no forked palette.
- **Container-based responsiveness**: the widget must lay out based on the size of the slot
  it is embedded in, not the browser viewport. Convert the viewport width breakpoints to
  container queries (`@container`) against a `container-type: inline-size` context on the
  widget root. This is wider than app-shell: `app-shell.ts` (`@media (max-width: 767px)`,
  `(min-width: 768px)`, `(min-width: 1024px)`) **plus** `contrast-grid.ts` (640px ×3),
  `grid-filters.ts` (360px), and `sort-controls.ts` (640px ×3) — otherwise a widget in a
  320px sidebar on a desktop viewport gets desktop styling inside the grid. **Do not** convert preference/environment queries — `forced-colors: active`,
  `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast` must remain `@media`
  (no container equivalent, and they are required accessibility signals). The main app reuses
  the same components, so its responsiveness must remain visually identical (the app-shell
  becomes the query container) — no separate stylesheet fork.
- **Separate build target**: a dedicated Vite library build (`build.lib`) with a single
  entry (`src/embed/widget.ts`) producing one IIFE/UMD file that self-registers the element;
  Lit bundled in (not externalised) so no host setup is required.
- **WCAG 2.2 AA** for the widget itself; must pass axe-core with zero violations when
  embedded in a host page.
- **Backwards compatible**: the main app build (`src/main.ts`) and existing components are
  unchanged in behaviour; refactors to decouple state must not regress the main app.

# Requirements

- Create `src/embed/widget.ts` — the embed entry point that imports and defines
  `<contrast-checker>`.
- Create `contrast-checker` Lit component (`src/embed/contrast-checker.ts`) that:
  - Declares observed attributes: `colors`, `standard`, `level`, `theme`, `attribution`.
  - Instantiates a **per-instance** color store via `createColorStore()` (not the shared
    `colorStore` singleton) and provides it to child components via Lit context.
  - Seeds the store from the parsed `colors` attribute on first render and on change.
  - Renders `bca-color-input` / `bca-color-palette`, the grid/list results with
    `bca-results-view-toggle`, inside its shadow root.
  - Applies the selected theme to its host/shadow root scope only.
  - Renders an attribution link unless `attribution="hide"`.
- **Prep refactor (behaviour-neutral for the main app):**
  - Export `createColorStore()` from `src/state/color-store.ts`.
  - Refactor `ColorStoreController` to operate on an injected store (constructor parameter
    defaulting to the singleton) and consume a context-provided store when one is present
    (`@lit/context`).
  - Remove the theme-store import side effect: theme loading/application moves into an
    explicit `initTheme()` that `src/main.ts` calls; importing any state module no longer
    touches `document`.
  - Rename the 12 internal custom-element tags with the `bca-` prefix and route
    registration through a define-guard that warns on duplicates instead of throwing.
- Establish a `container-type: inline-size` context on the widget root and migrate the
  layout width breakpoints in `app-shell.ts`, `contrast-grid.ts`, `grid-filters.ts`, and
  `sort-controls.ts` from `@media` to `@container` queries, leaving preference/environment
  `@media` queries unchanged.
- Build-time theme-token transform: import `src/styles/themes/*.css` via `?inline` and
  rewrite `:root[data-theme=...]` (and the dark-scheme media wrapper) to
  `:host([theme=...])` selectors with a unit-tested helper.
- Add a Vite library build config (separate config or a mode flag) that outputs
  `dist/widget.js` (single file, Lit inlined, self-registering).
- Add an npm build script (e.g. `build:widget`) and a `files` / `exports` entry so the
  package publishes `dist/widget.js` for jsDelivr/unpkg. Note `package.json` is currently
  `"private": true` with the repo-internal name `brand-color-accessibility-tool`; npm
  publishing needs a public package name decision (the planned `brand-contrast-checker` —
  availability UNVERIFIED) and a publish step in the release flow. **v1 does not require
  npm**: the deploy workflow can ship `widget.js` to the existing GitHub Pages site and
  that URL is embeddable immediately; jsDelivr/unpkg follow once published.
- Provide a demo/host HTML page (`examples/embed.html`) that loads the built widget from the
  local `dist/` and exercises every attribute — used for manual and E2E verification.
- Document the embed usage (script tag, attributes, CSS vars, CDN URLs) in a README section
  or `docs/`.

# Dependencies

- `src/state/color-store.ts` — `createColorStore()` factory (currently module-private; must
  be exported and support N instances).
- `src/state/color-store-controller.ts` — currently singleton-bound in every accessor; the
  central injection point.
- `src/state/theme-store.ts` — theme application must become scope-aware (host element, not
  `<html>`) and lose its import-time side effect (the barrel `src/state/index.ts`
  re-exports it into every component import).
- `src/state/url-sync.ts` / `url-state.ts` — already side-effect-free; the embed simply
  never calls `initializeFromURL()`.
- `src/components/color-input.ts`, `color-palette.ts`, `contrast-grid.ts`,
  `contrast-list.ts`, `results-view-toggle.ts`, `grid-filters.ts`, `sort-controls.ts` —
  reused inside the widget; need to consume the context-provided store rather than the
  singleton.
- `src/utils/` — colour parsing and `generateContrastMatrix()` (unchanged, pure).
- `vite.config.ts` — extend with a library build target.
- `package.json` — build script, `exports`, `files`, package name for CDN.

# Out of Scope

- APCA calculation itself if not yet implemented — the `standard="apca"` option depends on
  Feature 102; if 102 is not done, `apca` may be accepted but fall back to WCAG with a note.
- Server-side rendering / no-JS fallback for the embed (the widget is JS-only).
- A hosted configuration/embed-code generator UI (could be a later feature).
- Paid licensing enforcement — `attribution="hide"` is exposed but gating/monetisation is
  not built here.
- Theme switcher UI *inside* the widget (theme is host-controlled via attribute for v1).
- Changing the main app's behaviour or appearance.

# Done

- `npm run build:widget` produces a single self-registering `dist/widget.js`.
- Loading that file via a plain `<script>` tag on a page with
  `<contrast-checker colors="#003366,#FFFFFF"></contrast-checker>` renders the full checker
  with those two colours seeded — with no other setup.
- Changing `standard`, `level`, and `theme` attributes updates the widget live.
- `theme="dark"` themes only the widget; the host page's `<html>` and styles are untouched.
- Merely loading `widget.js` on a page whose `<html>` carries its own `data-theme`
  attribute leaves that attribute intact (the import-time mutation is gone).
- Loading `widget.js` on a page that already defines an element named `color-input` (or any
  other previously-generic tag) neither throws nor breaks the widget.
- The grid/list toggle works inside the widget and the list view passes the same
  screen-reader conventions as the main app.
- Two `<contrast-checker>` elements on the same page hold independent colour palettes.
- A `<contrast-checker>` placed in a narrow container (e.g. a 320px sidebar) on a wide
  viewport renders its compact layout; the same widget in a wide container renders the full
  layout — layout responds to the container, not the browser window.
- The main app's responsive behaviour at 767/1024px is visually unchanged after the
  media-to-container-query migration.
- The widget does not modify `window.location` or the host page's `<html>` attributes.
- `attribution="hide"` removes the "Powered by" link; default shows it.
- Host CSS custom properties applied to the element restyle the widget without leaking.
- axe-core reports zero violations for a page embedding the widget.
- The demo page `examples/embed.html` exercises all attributes and is covered by an E2E test.
- A documented public URL resolves to the built `dist/widget.js` — GitHub Pages for the
  pre-npm phase; jsDelivr/unpkg once the package is published.
