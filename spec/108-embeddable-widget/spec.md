# Embeddable Widget

# Goal

Any third-party page can embed the full contrast checker (colour inputs + contrast grid)
by adding one `<script>` tag and one `<contrast-checker>` element, configured through HTML
attributes and scoped CSS custom properties, with no build step and no impact on the host
page's global styles, `<html>` attributes, or URL.

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
  - Colour input controls (reuse `color-input` / `color-palette`)
  - The contrast grid (reuse `contrast-grid`) with the current standard/level/filters
  - An optional "Powered by Brand Colour Accessibility Tool" attribution link
- Attribute changes reflow the widget reactively (observed attributes).
- Multiple `<contrast-checker>` elements can coexist on one page with independent state.

# Constraints

- **No new runtime dependencies** — Lit + existing utils only; bundle stays small.
- **Instance-scoped state**: the singleton `colorStore` (`src/state/color-store.ts:496`)
  cannot be shared across widget instances. Provide a per-instance store (factory already
  exists as `createColorStore()`), or a documented single-instance limitation for v1.
- **No global theme mutation**: `themeStore` writes `data-theme` to `document.documentElement`
  (`src/state/theme-store.ts:45-55`). The widget must apply theme to its **own host element /
  shadow root**, never to `<html>` — it must not recolour the host page.
- **No URL sync**: the widget must not read or write `window.location` (the main app's
  `url-sync.ts` behaviour is disabled/absent in the embed build).
- **Style isolation**: all styles ship inside the shadow root; the widget must not leak CSS
  into the host page and should be resilient to host page CSS. Theme tokens come from
  `src/styles/themes/*.css`, inlined into the component rather than loaded as global CSS.
- **Container-based responsiveness**: the widget must lay out based on the size of the slot
  it is embedded in, not the browser viewport. Convert the viewport width breakpoints in
  `app-shell.ts` (`@media (max-width: 767px)`, `(min-width: 768px)`, `(min-width: 1024px)`)
  to container queries (`@container`) against a `container-type: inline-size` context on the
  widget root. **Do not** convert preference/environment queries — `forced-colors: active`,
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
    `colorStore` singleton) and passes it down to child components.
  - Seeds the store from the parsed `colors` attribute on first render and on change.
  - Renders `color-input` / `color-palette` and `contrast-grid` inside its shadow root.
  - Applies the selected theme to its host/shadow root scope only.
  - Renders an attribution link unless `attribution="hide"`.
- Refactor state ownership so components accept an injected store instead of importing the
  singleton directly, OR provide the store via Lit context so the same components work in
  both the main app and the embed. (Decide during `/spkl:tasks`; context is preferred.)
- Establish a `container-type: inline-size` context on the widget root and migrate the
  layout width breakpoints in `app-shell.ts` from `@media` to `@container` queries, leaving
  preference/environment `@media` queries unchanged.
- Add a Vite library build config (separate config or a mode flag) that outputs
  `dist/widget.js` (single file, Lit inlined, self-registering).
- Add an npm build script (e.g. `build:widget`) and a `files` / `exports` entry so the
  package publishes `dist/widget.js` for jsDelivr/unpkg.
- Provide a demo/host HTML page (`examples/embed.html`) that loads the built widget from the
  local `dist/` and exercises every attribute — used for manual and E2E verification.
- Document the embed usage (script tag, attributes, CSS vars, CDN URLs) in a README section
  or `docs/`.

# Dependencies

- `src/state/color-store.ts` — `createColorStore()` factory; must support N instances.
- `src/state/theme-store.ts` — theme application must become scope-aware (host element, not
  `<html>`) for the embed path.
- `src/state/url-sync.ts` / `url-state.ts` — must be excluded from / disabled in the embed.
- `src/components/color-input.ts`, `color-palette.ts`, `contrast-grid.ts` — reused inside
  the widget; need to consume an injected store rather than the singleton.
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
- Documented jsDelivr/unpkg URLs resolve to the published `dist/widget.js` after release.
