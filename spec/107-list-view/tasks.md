# Feature 107: Contrast Results List View - Implementation Tasks

## Status: ✅ Complete

---

## 1. State Management

- [x] 1.1 Add `ResultsView` type (`'table' | 'list'`) to `src/state/color-store.ts`
- [x] 1.2 Add `resultsView` field to `ColorStoreState` with default `'table'`
- [x] 1.3 Add `setResultsView(view: ResultsView)` method to `ColorStore`
- [x] 1.4 Emit `results-view-changed` event from `setResultsView`
- [x] 1.5 Add unit tests for `setResultsView` and state transitions

## 2. URL State

- [x] 2.1 Add `PARAM_VIEW` constant to `src/state/url-state.ts`
- [x] 2.2 Extend `URLState` interface with optional `view?: ResultsView` field
- [x] 2.3 Update `parseURLState` to read `view` param
- [x] 2.4 Update `serializeURLState` to write `view=list`; omit param entirely when `'table'` (keep URLs clean)
- [x] 2.5 Update `ColorStoreController` to sync `view` param alongside existing params (via `url-sync.ts` listeners)

## 3. `contrast-list` Component

- [x] 3.1 Create `src/components/contrast-list.ts`
- [x] 3.2 Accept contrast matrix and colour array as properties (reads from `ColorStoreController`, matching `contrast-grid`; grouping extracted to pure util `src/utils/contrast-pairs.ts`)
- [x] 3.3 Render four grouped sections: AAA, AA, Large Text Only (AA18), Fail. Headings reworded to plain language after design review ("Excellent: passes AAA", "Good: passes AA", "Large text only: passes AA 18+", "Do not use: fails WCAG"), each with a one-line usage description
- [x] 3.4 Each non-empty group: `<h3>` heading + `<ul>` of pair entries
- [x] 3.5 Entry format. The spec's "[Fg] → [Bg] — [ratio]" was replaced after design review with "[Colour] and [Colour], contrast [N] to 1", because the arrow glyph, em dash, and ":1" notation are all unreliable or ambiguous when spoken by screen readers. WCAG contrast is symmetric, so each unordered pair is listed once instead of in both directions (12 entries become 6 for four colours). Each entry has two aria-hidden "Aa" samples (one per direction) in the real pair colours, CSS-generated so they never appear in copied text
- [x] 3.6 Omit groups with no matching pairs entirely (no empty headings)
- [x] 3.7 Apply active WCAG filter state (`ColorStore.gridFilters`) to show/hide groups
- [x] 3.8 Empty state (fewer than 2 colours): show same message as contrast grid

## 4. `results-view-toggle` Component

- [x] 4.1 Create `src/components/results-view-toggle.ts`
- [x] 4.2 Render "Table / List" segmented control
- [x] 4.3 Follow `theme-switcher.ts` pattern: `<fieldset>` + `<legend>` + radio inputs (chosen over `aria-pressed` buttons — the two views are mutually exclusive, which is radio semantics)
- [x] 4.4 Active button state announced to screen readers (checked radio)
- [x] 4.5 Minimum 44px touch targets on both buttons
- [x] 4.6 Dispatch view change to `ColorStore.setResultsView()` on change

## 5. App Shell Integration

- [x] 5.1 Import and register `contrast-list` and `results-view-toggle` in `app-shell.ts`
- [x] 5.2 Subscribe to `resultsView` from `ColorStore` (via `ColorStoreController`)
- [x] 5.3 Conditionally render `<contrast-list>` (list) or `<contrast-grid>` (table)
- [x] 5.4 Rename `<h2>` section heading from "Contrast Grid" to "Contrast Results"
- [x] 5.5 Position `<results-view-toggle>` between the filter controls and the grid/list content (in the results header row)

## 6. Accessibility

- [x] 6.1 Verify heading hierarchy: h1 → h2 "Contrast Results" → h3 group headings — no skipped levels
- [x] 6.2 Ensure list entries are selectable and copy-paste as plain text from browser
- [x] 6.3 Verify keyboard navigation through list entries works without a mouse
- [x] 6.4 Verify toggle keyboard accessible (Tab to focus, Space/Enter to activate)
- [x] 6.5 Run axe-core scan on list view — zero violations required (E2E test, all 5 browser projects)

## 7. URL Persistence Testing

- [x] 7.1 `?view=list` in URL loads page directly in list view
- [x] 7.2 Switching back to table removes `view` from URL (no `?view=table` noise)
- [x] 7.3 Existing params (colours, labels, theme, filters) still work when combined with `view=list`

## 8. Testing

- [x] 8.1 Unit tests for list grouping logic (correct pairs in each level bucket) — `src/utils/contrast-pairs.test.ts`
- [x] 8.2 Unit tests for empty-group omission
- [x] 8.3 E2E: toggle from table to list view and back — `e2e/list-view.spec.ts`
- [x] 8.4 E2E: list groups respect active WCAG filter toggles
- [x] 8.5 E2E: `?view=list` URL param restores list view on load
- [x] 8.6 E2E: axe-core scan of list view
- [x] 8.7 E2E: list content can be copy-pasted as plain text

## 9. Documentation

- [x] 9.1 Update CHANGELOG for feature 107
