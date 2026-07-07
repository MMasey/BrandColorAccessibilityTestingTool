# Contrast Results List View

# Goal

Users who find the intersection table hard to navigate (screen reader users, users with
cognitive differences) can switch to a list view that groups colour pairs by WCAG
compliance level.

# Inputs

- Colour palette from `ColorStore` (same source as contrast grid)
- Generated contrast matrix from `generateContrastMatrix()` in `src/utils/`
- Active WCAG filter set from `ColorStore.gridFilters` (existing filter state applies to
  both views)
- URL param `view` — values: `table` (default) | `list`

# Outputs

- Toggle control (two-button segmented control) in the grid controls area, between the
  existing grid filter checkboxes and the contrast grid / list content
- List view component that renders colour pairs grouped under four `<h3>` headings:
  AAA, AA, Large Text Only (AA18), Fail — each group is a `<ul>` of pair entries
  (`<h3>` is correct: document flow is `<h1>` app title → `<h2>` "Contrast Results"
  → `<h3>` group headings; same level as existing `grid-filters` section headings)
- Each list entry shows: foreground colour name/hex → background colour name/hex —
  ratio string (e.g. "White → Black — 21:1")
- URL param `view=list` written to URL when list view is active; removed when table
  (default) to keep URLs clean

# Constraints

- No new dependencies — use existing Lit, TypeScript, CSS custom properties
- List view uses the same `generateContrastMatrix()` util; no new calculation logic
- Existing WCAG filter toggles (AAA / AA / Fail etc.) must apply to both views
- URL state follows the pattern in `src/state/url-state.ts`: add `PARAM_VIEW` constant,
  extend `URLState` interface, update `parseURLState` / `serializeURLState`
- WCAG 2.2 AA compliance required — all interactive elements keyboard accessible,
  minimum 44px touch targets
- List view must pass axe-core scan (no violations)

# Requirements

- Add `ResultsView` type: `'table' | 'list'`
- Add `resultsView` field to `ColorStoreState` with default `'table'`
- Add `setResultsView(view: ResultsView)` method to `ColorStore`; emit
  `results-view-changed` event
- Extend `URLState` with optional `view` field; update parse/serialize functions
- Add view param to `ColorStoreController` URL sync alongside existing params
- Create `contrast-list` Lit component that accepts the contrast matrix and colour array
  and renders the grouped list structure
- Create `results-view-toggle` Lit component (or extend `grid-filters`) that renders the
  Table / List segmented toggle and dispatches view changes to the store
- In `app-shell` (or `contrast-grid` parent area), show `<contrast-list>` when
  `resultsView === 'list'` and `<contrast-grid>` when `resultsView === 'table'`
- Rename the `<h2>` section heading in `app-shell.ts` from "Contrast Grid" to
  "Contrast Results" — this heading covers both views and "Grid" is no longer accurate
  when the list view is active
- The toggle must announce its state to screen readers:
  `aria-pressed` on each button, or a `role="group"` with `aria-label="Results view"` +
  `role="radio"` pattern (match the existing `theme-switcher` pattern)
- Empty-state for list view: when no colours or fewer than 2 colours, show same message
  as contrast grid
- Empty group: if no pairs fall in a level (e.g. no failures), omit that heading/list
  entirely

# Dependencies

- `src/utils/contrast-calculations.ts` — `generateContrastMatrix()`, `ContrastResult`
- `src/state/color-store.ts` — store shape, events, `ColorStoreController`
- `src/state/url-state.ts` — URL param pattern to extend
- `src/components/grid-filters.ts` — placement reference and toggle pattern
- `src/components/contrast-grid.ts` — sibling component; rendered when view = table
- `src/components/theme-switcher.ts` — pattern for accessible segmented toggle

# Out of Scope

- Changing the table view in any way (this feature adds an alternative, not a replacement)
- Export or copy button for the list (plain-text copyability from browser selection is
  sufficient for now — see Feature 103 for visual exports)
- Per-entry colour swatches in the list view
- Sorting within list groups

# Done

- A "Table / List" toggle is visible in the grid controls section
- Clicking "List" replaces the contrast grid with a structured list grouped by AAA, AA,
  Large Text Only, and Fail headings
- Each list entry reads: "[Foreground] → [Background] — [ratio]"
- Empty groups (e.g. no failures) are not shown
- The existing AAA / AA / Fail filter toggles hide/show the corresponding group in list
  view (same as they filter columns in table view)
- Clicking "Table" restores the contrast grid
- Navigating to a URL with `?view=list` opens the page in list view
- A screen reader user can navigate the list view sequentially without encountering a
  table
- The list content can be selected and copy-pasted as plain text
- axe-core reports zero violations on the list view
