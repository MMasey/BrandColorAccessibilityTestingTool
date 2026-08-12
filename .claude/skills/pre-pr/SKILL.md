---
name: pre-pr
description: Full local verification gate before opening a PR — typecheck, unit tests, E2E (with axe checks), and quality artifacts for UI changes. Run this BEFORE gh pr create, never after.
---

# Pre-PR Verification

Every PR must be verified green locally **before** it is opened — not after.
Run all gates, report results plainly (including failures), and only proceed to
a PR when everything passes.

## Gates (run in this order)

1. **Typecheck**: `npx tsc --noEmit`
2. **Unit tests**: `npm run test:run`
3. **E2E + accessibility**: `npm run test:e2e`
   - Playwright starts the dev server itself (`webServer` in
     playwright.config.ts) — do not start `npm run dev` manually first.
   - The suite includes `@axe-core/playwright` scans; an axe violation is a
     hard failure, never a rule to suppress.
4. **Production build** (if config, deps, or build-affecting code changed):
   `npm run build`

## For UI changes only

Per [CONTRIBUTING.md](../../../CONTRIBUTING.md#pull-request-requirements):

- Capture a visual milestone: `npm run capture-milestone -- "feature-name"`
- Run a Lighthouse audit after `npm run build`:
  `npm run lighthouse -- "feature-name"` — accessibility must stay 100,
  performance ≥ 90, and compare against the previous entry in
  `docs/performance-history/` for regressions.

## Final checks

- `git status` — no stray artifacts (`.playwright-mcp/`, temp specs, reports)
- PR targets `develop` (feature/bugfix) — only `release/*` and `hotfix/*`
  PRs target `main`
- Commits follow the repo convention (see the `commit` skill)

## Reporting

State each gate's result with its actual output summary (e.g. test counts).
If anything is red: stop, report the failure verbatim, and fix or ask — do not
open the PR, and do not describe the work as done.
