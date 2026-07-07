# Accessibility Fixes — Florian Beijers Review (16 Mar 2026)

Findings from a live user testing session with Florian Beijers (blind accessibility consultant, screen reader user).

---

## Bundle A — Quick Accessibility Fixes

Small, targeted fixes. Each is 1–10 lines. Can ship as one PR.

---

### A1 · `<aside>` landmark → `<section>`

**File**: `src/components/app-shell.ts` — line 251

**Finding**: The colour palette sidebar uses `<aside aria-label="Colour palette controls">`.
`<aside>` maps to the `complementary` landmark role, which screen reader users associate
with footer-like supplementary content. The palette and filters are primary interactive
controls — they are not supplementary.

**Fix**: Change `<aside class="sidebar">` to `<section class="sidebar">`.
Keep `aria-label="Colour palette controls"` so the region is still named.

---

### A2 · Eager live region / error in colour input

**File**: `src/components/color-input.ts` — lines 317–321, 374, 439–442

**Finding**: The `hasInput` flag is set to `true` on every `input` event, so the
`role="alert"` error paragraph fires after the very first keystroke. Florian heard
"alert" announced immediately as he began typing, before he had finished entering a
valid colour.

Additionally, `role="alert"` is dynamically added/removed from the DOM. Screen readers
can announce the alert element before its text content is injected, producing an empty
announcement.

**Fix** (two-part):
1. Only set `hasInput = true` on blur or after a short debounce (~600 ms), not on every
   keystroke.
2. Always render the error container in the DOM but conditionally populate its text.
   Use `role="status"` + `aria-live="polite"` rather than `role="alert"` (avoids the
   race between element injection and text injection). An empty but present live region
   is the standard pattern.

---

### A3 · Colour palette list has no accessible label

**File**: `src/components/color-palette.ts` — line 579

**Finding**: `<ul class="colors-list">` has no aria-label. Screen reader users cannot
identify it as the colour palette list when navigating by landmarks or list elements.

**Fix**: Add `aria-label="Colour palette"` to the `<ul>`.

---

### A4 · Edit label button accessible name and `title` attribute

**File**: `src/components/color-swatch.ts` — lines 594–601, 607–614

**Finding**: There are two states for the editable label area:

1. **Label exists** (e.g. "White") — rendered as:
   ```html
   <button title="Click to edit label">White</button>
   ```
   Screen reader announces: "White, button". No indication the button triggers editing.
   `title` is not reliably announced on interactive elements by screen readers — it is
   not a substitute for a proper accessible name.

2. **No label** — rendered as:
   ```html
   <button title="Click to add label">Add label</button>
   ```
   Screen reader announces: "Add label, button". This is already fine — the button text
   communicates the action. The `title` here is redundant.

The button→input morph when editing begins is a standard inline editing pattern and does
not need changing. The `<input aria-label="Edit color label">` that replaces the button
is correctly labelled.

**Fix — semantics first, ARIA only where text alone is insufficient:**

- **Label exists**: Add `aria-label="Edit label: ${label}"` to the button. This gives
  screen reader users the action *and* the value ("Edit label: White, button") while the
  visual display stays as just "White". `aria-label` is appropriate here because the
  visible text alone ("White") does not describe the button's purpose.
  Remove the `title` attribute — redundant once `aria-label` is set.

- **No label**: The button text "Add label" already communicates the action semantically.
  No `aria-label` needed. Remove the `title` attribute.

---

### A5 · Remove "use arrow keys to scroll" from contrast grid

**File**: `src/components/contrast-grid.ts` — line 448

**Finding**: The grid wrapper's `aria-label` reads:
`"Contrast grid. Use arrow keys to scroll when focused."`

The instruction is aimed at sighted keyboard users. Screen reader users navigate tables
with dedicated table-navigation keys (not arrow scroll), so the instruction adds noise.
Florian flagged it as "spammy".

**Fix**: Change `aria-label` to `"Contrast results"` (drop the scroll instruction).
The keyboard scroll handler can remain — just remove it from the label.

---

### A6 · Filtered cells break table row length

**File**: `src/components/contrast-grid.ts` — lines 511–516

**Finding**: When a cell is filtered, the cell wrapper gets `role="presentation"` and
`aria-hidden="true"`. This removes the cell from the accessibility tree, making filtered
rows appear to have fewer columns than headers. Florian saw rows with 2 columns when
headers announced 3+, disrupting spatial orientation.

**Fix**: Do not change `role` or `aria-hidden` on filtered cell wrappers.
The content inside is already visually hidden by `visibility: hidden` on child elements
(via the `filtered` attribute on `<contrast-cell>`). Keep the cell in the accessibility
tree as an empty `role="cell"`. Remove the conditional `aria-hidden` and `role` swap.

---

### A7 · Cell level description — AAA implies AA

**File**: `src/components/contrast-cell.ts` — `getAriaLabel()`, line 232

**Finding**: The grid's `aria-label` per cell says e.g. `"Contrast ratio 21:1. Passes AAA"`.
Florian noticed this doesn't explicitly tell screen reader users that AAA also satisfies
AA and AA Large text. With only one cell read at a time, the implication is non-obvious.

**Fix**: Expand `getAriaLabel()` to list satisfied levels:
- AAA → `"…Passes AAA, AA, and large text (AA18)"`
- AA → `"…Passes AA and large text (AA18)"`
- AA18 → `"…Passes large text only (AA18)"`
- DNP → `"…Does not pass any WCAG level"`

---

## Bundle B — Contrast Grid Table Refactor

Larger structural change. Should be its own PR.

---

### B1 · Convert div+ARIA roles to native `<table>`

**File**: `src/components/contrast-grid.ts` — lines 454–533

**Finding**: The grid uses divs with `role="table"`, `role="row"`, `role="columnheader"`,
`role="rowheader"`, and `role="cell"`. ARIA role semantics work, but native HTML table
elements provide more reliable and consistent behaviour across browsers and screen readers.

Specific issues observed:
- Row headers were inconsistently announced depending on which filters were active
- The ARIA approach is more fragile — a single attribute error silently breaks navigation
- `display: contents` on `.grid-row` (needed for CSS grid) is a known cause of
  accessibility issues in some browsers/AT combinations

**Fix**: Replace the div grid with a native `<table>`. CSS grid layout can be replicated
on the table element using `display: grid` if needed, or use `table-layout: fixed` with
explicit widths.

Key changes:
- `<div role="table">` → `<table>`
- `<div role="row">` → `<tr>`
- `<div role="columnheader">` → `<th scope="col">`
- `<div role="rowheader">` → `<th scope="row">`
- `<div role="cell">` → `<td>`
- Replace `.grid-row { display: contents }` with standard `<tr>` layout
- Move the axis-label into a `<caption>` element inside the table

**Note on CSS**: The current CSS grid layout drives sticky headers. When converting to a
native table, use `position: sticky` on `<th>` elements (widely supported) rather than
relying on CSS grid. Thorough visual regression testing needed after this change.

---

## Feature C — List View

New feature. Needs its own spec before implementation.
→ See `spec/107-list-view/`

**Summary of request**: Florian proposed a toggle between the current intersection table
and a simpler list view. The list view would group colour combinations by compliance level
(AAA, AA, large text only, Fail) under headings, making the data accessible to users who
find intersection tables cognitively demanding. The toggle should sit near the existing
grid filters.

---

## Bundle C — `title` Attribute Audit

`title` is sometimes used as an accessibility aid, but browsers only expose it as a mouse
hover tooltip — keyboard users and screen reader users do not reliably receive it.
The rule is simple: never rely on `title` for accessible names or descriptions.

---

### C1 · Remove `title` from interactive elements in `color-swatch`

**File**: `src/components/color-swatch.ts` — lines 598, 607

Both `title="Click to edit label"` and `title="Click to add label"` are on buttons that
are being fixed by A4. Once `aria-label` is in place on the "label exists" button, and
the "Add label" button text is already semantic, both `title` attributes can be removed
entirely. They add no value and can cause confusion (sighted keyboard users may see a
stale tooltip).

---

### C2 · `title` on column and row header cells in contrast grid

**File**: `src/components/contrast-grid.ts` — lines 478, 496

Column and row headers use `title="${this.getColorLabel(color)}"` for tooltip display of
potentially truncated colour names. These headers already have
`aria-label="Background: ${label}"` / `aria-label="Foreground: ${label}"` which fully
cover screen reader needs.

The `title` here is acceptable as a **visual tooltip only** (for sighted users hovering
over truncated labels). It is not relied upon for accessibility, so it can stay.
If the table is refactored to native `<th>` elements (Bundle B), carry the `title` across
unchanged.

---

### C3 · `title` on WCAG badge in contrast cell

**File**: `src/components/contrast-cell.ts` — line 268

`title="${getBadgeTitle(this.result.level)}"` adds a hover tooltip to the badge (e.g.
"Enhanced contrast (7:1 minimum)"). The badge's accessibility is handled by the cell's
`aria-label` (updated in A7). The `title` here is a sighted-user convenience only —
acceptable to keep as-is.

---

## Nice-to-Haves (Low Priority)

These were raised as observations, not blockers.

### NH1 · Named regions for each colour's controls

**File**: `src/components/color-palette.ts` — lines 580–601

When tabbing through a long palette, screen reader users lose track of which colour's
controls they are on. Wrapping each `<li>` in a named group (e.g., `aria-label="White"`)
would provide context on entry.

**Consideration**: This is NVDA/JAWS phrasing overhead. Evaluate user impact before
implementing. Not a WCAG violation.

---

### NH2 · Theme switcher — structure is correct, label wording minor

**File**: `src/components/theme-switcher.ts`

**Clarification on Florian's comment**: The `<fieldset>` + `<legend>` pattern is the
correct, semantic HTML for grouping radio buttons — it is exactly what WCAG recommends.
No ARIA is needed on top of it. Florian was uncertain in the moment, but there is no
violation here.

The radio inputs are wrapped in `<label>` elements (also correct — implicit label
association). The structure is sound.

**Only genuine improvement**: The "High" option label could be "High Contrast" for
clarity. One word change, no accessibility obligation.

**Principle**: native HTML semantics first. A `<fieldset>`/`<legend>` radio group needs
no `role="group"`, `aria-labelledby`, or any other ARIA layer — adding them would be
redundant at best and confusing at worst.

---

## Source

Session recording and notes: `Brand-Colour-Accessibility-Tool-Testing-eb90ec4f-bf29.md`
