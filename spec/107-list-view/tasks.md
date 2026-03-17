# Feature 107: Contrast Results List View - Implementation Tasks

## Status: 🔜 Not Started

---

## 1. State Management

- [ ] 1.1 Add `ResultsView` type (`'table' | 'list'`) to `src/state/color-store.ts`
- [ ] 1.2 Add `resultsView` field to `ColorStoreState` with default `'table'`
- [ ] 1.3 Add `setResultsView(view: ResultsView)` method to `ColorStore`
- [ ] 1.4 Emit `results-view-changed` event from `setResultsView`
- [ ] 1.5 Add unit tests for `setResultsView` and state transitions

## 2. URL State

- [ ] 2.1 Add `PARAM_VIEW` constant to `src/state/url-state.ts`
- [ ] 2.2 Extend `URLState` interface with optional `view?: ResultsView` field
- [ ] 2.3 Update `parseURLState` to read `view` param
- [ ] 2.4 Update `serializeURLState` to write `view=list`; omit param entirely when `'table'` (keep URLs clean)
- [ ] 2.5 Update `ColorStoreController` to sync `view` param alongside existing params

## 3. `contrast-list` Component

- [ ] 3.1 Create `src/components/contrast-list.ts`
- [ ] 3.2 Accept contrast matrix and colour array as properties
- [ ] 3.3 Render four grouped sections: AAA, AA, Large Text Only (AA18), Fail
- [ ] 3.4 Each non-empty group: `<h3>` heading + `<ul>` of pair entries
- [ ] 3.5 Each entry format: "[Foreground name/hex] → [Background name/hex] — [ratio]"
- [ ] 3.6 Omit groups with no matching pairs entirely (no empty headings)
- [ ] 3.7 Apply active WCAG filter state (`ColorStore.gridFilters`) to show/hide groups
- [ ] 3.8 Empty state (fewer than 2 colours): show same message as contrast grid

## 4. `results-view-toggle` Component

- [ ] 4.1 Create `src/components/results-view-toggle.ts`
- [ ] 4.2 Render "Table / List" segmented control (two buttons)
- [ ] 4.3 Follow `theme-switcher.ts` pattern: `<fieldset>` + `<legend>` + `role="radio"` inputs, or `role="group"` + `aria-pressed` buttons — confirm which pattern fits best
- [ ] 4.4 Active button state announced to screen readers
- [ ] 4.5 Minimum 44px touch targets on both buttons
- [ ] 4.6 Dispatch view change to `ColorStore.setResultsView()` on click

## 5. App Shell Integration

- [ ] 5.1 Import and register `contrast-list` and `results-view-toggle` in `app-shell.ts`
- [ ] 5.2 Subscribe to `resultsView` from `ColorStore`
- [ ] 5.3 Conditionally render `<contrast-list>` (list) or `<contrast-grid>` (table)
- [ ] 5.4 Rename `<h2>` section heading from "Contrast Grid" to "Contrast Results"
- [ ] 5.5 Position `<results-view-toggle>` between the filter controls and the grid/list content

## 6. Accessibility

- [ ] 6.1 Verify heading hierarchy: h1 → h2 "Contrast Results" → h3 group headings — no skipped levels
- [ ] 6.2 Ensure list entries are selectable and copy-paste as plain text from browser
- [ ] 6.3 Verify keyboard navigation through list entries works without a mouse
- [ ] 6.4 Verify toggle keyboard accessible (Tab to focus, Space/Enter to activate)
- [ ] 6.5 Run axe-core scan on list view — zero violations required

## 7. URL Persistence Testing

- [ ] 7.1 `?view=list` in URL loads page directly in list view
- [ ] 7.2 Switching back to table removes `view` from URL (no `?view=table` noise)
- [ ] 7.3 Existing params (colours, labels, theme, filters) still work when combined with `view=list`

## 8. Testing

- [ ] 8.1 Unit tests for list grouping logic (correct pairs in each level bucket)
- [ ] 8.2 Unit tests for empty-group omission
- [ ] 8.3 E2E: toggle from table to list view and back
- [ ] 8.4 E2E: list groups respect active WCAG filter toggles
- [ ] 8.5 E2E: `?view=list` URL param restores list view on load
- [ ] 8.6 E2E: axe-core scan of list view
- [ ] 8.7 E2E: list content can be copy-pasted as plain text

## 9. Documentation

- [ ] 9.1 Update CHANGELOG for feature 107
