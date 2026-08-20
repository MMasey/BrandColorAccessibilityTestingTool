---
name: a11y-audit
description: Structured accessibility audit of the running app — axe scans, keyboard pass, screen-reader text review, themes, and forced-colors. Use after changing any component markup/ARIA/focus behaviour, or when the user asks for an accessibility check or audit.
---

# Accessibility Audit

Interactive audit checklist for this tool. The tool tests accessibility, so it
must itself be exemplary — the bar is WCAG 2.2 AA (AAA for the high-contrast
theme) and a Lighthouse accessibility score of 100.

## Preconditions

- Confirm the MCP servers you need are actually connected (list available
  tools). `playwright` is required; `axe` (Deque) is preferred for scans but
  needs Docker + credentials — if it is not connected, say so and fall back to
  `@axe-core/playwright` via the E2E suite. If a server drops mid-audit,
  STOP and tell the user; do not silently improvise a workaround.
- App running at `http://127.0.0.1:5173` (`npm run dev`).

## Checklist (run per affected view/state)

1. **Automated scan** — axe scan of the view in each state it can be in
   (empty palette, populated palette, grid view, list view, dialogs open).
   Zero violations; fix root causes, never suppress rules.
2. **Themes** — repeat key checks in all three themes (`data-theme` on
   `<html>`: `light`, `dark`, `high-contrast`) plus `forced-colors` emulation
   (Windows High Contrast Mode) and `prefers-reduced-motion`.
3. **Keyboard pass** — tab order matches visual order; skip link works; grid
   arrow-key/Home/End navigation intact; no traps; every drag-and-drop
   operation has a keyboard alternative (WCAG 2.5.7); visible focus indicator
   on every stop.
4. **Screen-reader-facing text** — apply this repo's SR text conventions:
   - No symbol glyphs (`→`, `▲`, `✓`) in accessible names, announcements, or
     visually-hidden text — purely decorative glyphs go in CSS `content` so
     screen readers skip them.
   - Plain, outcome-first wording (state the result before the mechanism).
   - Named view toggles (e.g. grid/list) are radio groups — not
     `role="switch"`, which is for on/off of a single function.
   - One announcement source per concept (e.g. the grid `td` is the single
     announcement source per cell — don't add duplicate labels inside it).
5. **Touch targets** — interactive elements ≥ 44×44px.
6. **Live regions** — dynamic updates (added colours, filter changes)
   announced exactly once; no announcement spam on re-render.

## Referencing criteria

When citing a WCAG success criterion, verify the number and level with the
`wcag` MCP server rather than from memory.

## Closing the loop

- Any defect found and fixed here gets encoded as an `@axe-core/playwright`
  or Playwright assertion in `e2e/` so CI catches the regression.
- Both this interactive pass and the E2E suite must be clean before a PR
  (see the `pre-pr` skill).
- Report findings as: view/state, defect, WCAG SC + level, fix applied,
  how it was verified.
