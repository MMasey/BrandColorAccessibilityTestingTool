# Brand Colour Accessibility Testing Tool

A web-based tool for testing brand colour combinations against WCAG accessibility contrast requirements.

## General Rules
When working with git (commits, PRs, branch operations), always confirm the plan with me before executing. Never make autonomous commits or create PRs without explicit approval.

- **Derive, don't guess.** Before drafting a commit message, run `git log --oneline -50` and check [CONTRIBUTING.md](CONTRIBUTING.md) — this repo uses Conventional Commits with scopes like `a11y`, `ci`, and feature IDs (`101`). Same principle for code style: read neighbouring files first.
- **Tests green before a PR, not after.** `npx tsc --noEmit`, `npm run test:run`, and `npm run test:e2e` must all pass locally before opening any PR (the `pre-pr` skill runs the full gate).
- **Release PRs to `main` merge with a merge commit — never squash.** The v0.3.3 squash diverged main from develop. After a release, sync main back into develop via a `chore/sync-main-vX.Y.Z` PR (the `release` skill has the full process).
- **Facts in documents must be re-derived** from the current repo state at the time of writing (counts, estimates, version numbers). Flag anything unverifiable as UNVERIFIED instead of guessing.
- For open-ended debugging, state a hypothesis before investigating, and check it against the evidence before changing anything.

## Project Context
Primary languages: TypeScript, Markdown. Project involves accessibility-focused tooling. When generating content or making edits, prioritize accessibility best practices.

## Environment
On Windows, use absolute paths for file operations outside the current repo. Always verify path resolution before creating directories or files in new locations.

- **Never use bash heredocs** (for commit messages or anything else) — on Windows they leak stray `@` characters and quoting mangles the payload. Write multi-line content (commit messages, JSON payloads, scripts) to a temp file and pass the file path: `git commit -F <file>`, `command < file.json`.
- Prefer PowerShell-native commands in the PowerShell tool and POSIX syntax in the Bash tool — don't mix.
- Assume CRLF line endings when writing hook or script files that other Windows tooling will consume.

## Tech Stack

- **Framework**: Lit 3.x (Web Components)
- **Language**: TypeScript 5.6
- **Build**: Vite 7.x
- **Testing**: Vitest (unit), Playwright (E2E), axe-core (accessibility)
- **Styling**: CSS custom properties (design tokens), no CSS framework

## Architecture

```
src/
  components/     # Lit web components (app-shell, color-palette, contrast-grid, etc.)
  state/          # State management (color-store, theme-store, url-state)
  utils/          # Pure functions (contrast calculations, color parsing)
  styles/         # Global CSS and shared component styles
```

### Key Patterns

- **Web Components**: All UI is built with Lit custom elements
- **State Management**: Singleton stores with subscription pattern (no external library)
- **URL State**: Colours and filters sync to URL for shareability
- **Progressive Enhancement**: Works without JavaScript for basic display

## Roadmap & Specifications

See [spec/PROJECT.md](spec/PROJECT.md) for the full roadmap.

### Phase 1 (Complete)
| Phase | Name | Status |
|-------|------|--------|
| 1 | Core Contrast Checker | ✅ Complete (Lighthouse 100/100) |

### Feature Roadmap (100+)
All features are independent and can be implemented in any order. Original "phases" 2-5 have been restructured as features 102-105.

| ID | Name | Status |
|----|------|--------|
| 100 | Theme Contrast Testing | Planned |
| 101 | Colour Palette Sorting & Reordering | ✅ Complete |
| 102 | APCA & Code Exports | Planned |
| 103 | Visual Exports | Planned |
| 104 | AI Colour Generation | Planned |
| 105 | AI Mockup Generation (Paid) | Planned |
| 106 | Artistic Grid Mode | Planned |
| 107 | Contrast Results List View | ✅ Complete |
| 108 | Embeddable Widget | Planned |

All specs follow the SPECKL format with `README.md` + `spec.md`.

## Design Values

1. **Accessibility First**: The tool tests accessibility, so it must be fully accessible itself
2. **WCAG Compliance**: All themes meet WCAG 2.2 AA minimum, high-contrast meets AAA
3. **Semantic HTML**: Proper landmarks, headings, and ARIA where needed
4. **Keyboard Navigation**: Full keyboard support for all interactions
5. **Touch-Friendly**: Minimum 44px touch targets

### Screen-reader-facing text conventions

- **No symbol glyphs** (`→`, `▲`, `✓`) in accessible names, live-region announcements, or visually-hidden text. Purely decorative glyphs belong in CSS `content` so screen readers skip them.
- **Plain, outcome-first wording** — state the result before the mechanism ("Colours sorted lightest first", not "Sort order → lightness ascending").
- **Named view toggles are radio groups**, not `role="switch"` — switch is for on/off of a single function, not choosing between named views (grid/list).
- **One announcement source per concept** — e.g. the contrast grid `td` is the single announcement source per cell; don't layer duplicate labels inside it.

## Explicit Non-Goals

- **Not a design system**: This is a single-purpose tool, not a component library
- **Not a colour picker**: Users enter colours, we don't provide a picker UI
- **No user accounts**: No authentication, no saved palettes on server
- **No backend**: Fully client-side, no API calls
- **No colour suggestions**: We test colours, we don't recommend them

## Key Constraints

### Performance
- Fast startup (no heavy dependencies)
- Instant contrast calculations (pure functions, no async)
- Responsive at all viewport sizes

### Accessibility Compliance
- WCAG 2.2 Level AA for light/dark themes
- WCAG 2.2 Level AAA for high-contrast theme
- Supports `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`
- Windows High Contrast Mode support (`forced-colors`)
- Keyboard alternatives for all drag-and-drop operations (2.5.7)
- 44x44px minimum touch targets (exceeds 2.5.8 requirement)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support

## Theme System

Three themes via `data-theme` attribute on `<html>`:
- `light` (default)
- `dark`
- `high-contrast`

Plus `system` mode that respects OS preferences.

CSS variables defined in `src/styles/themes/*.css` (light, dark, high-contrast).

## MCP Servers

Configured in [.mcp.json](.mcp.json) and available to Claude during development:

| Name | Package | Purpose |
|------|---------|---------|
| `wcag` | `wcag-guidelines-mcp` | Query WCAG 2.x success criteria, techniques, and understanding docs |
| `playwright` | `@playwright/mcp` | Browser automation for E2E testing and UI verification |
| `axe` | `dequesystems/axe-mcp-server` (Docker) | Deque axe accessibility scanning + guided fixes for live/rendered UI |

### MCP servers are preconditions, not conveniences

- Before starting a task that needs an MCP server (browser verification → `playwright`, accessibility scans → `axe`, WCAG citations → `wcag`), confirm the server is actually connected by checking its tools are available.
- If a required server is unavailable or **drops mid-task, STOP and say so** — do not silently fall back to improvised workarounds (raw HTTP calls, hand-rolled scripts). The one sanctioned fallback: if `axe` is unavailable, use the `@axe-core/playwright` checks in the E2E suite and say that's what happened.

### Using the `axe` MCP server during development

The `axe` server (Deque) runs accessibility scans against rendered markup and returns
actionable, standards-mapped fixes. Because this tool's whole purpose is accessibility, treat
axe as a first-class part of the dev loop, not an afterthought:

- **Scan before finishing UI work.** After changing any component's markup, ARIA, roles,
  landmarks, focus order, or live regions, run an axe scan on the affected view and resolve
  every violation before considering the task done.
- **Verify a11y fixes, don't assume them.** When implementing accessibility changes (e.g. the
  Florian Beijers bundles), confirm the fix with an axe scan rather than reasoning alone.
- **Complement, don't replace, the E2E gate.** `@axe-core/playwright` in the E2E suite is the
  automated CI gate; the axe MCP server is for interactive, in-the-loop checking and richer
  remediation guidance while developing. Both should agree before opening a PR.
- **Prefer real fixes over rule suppression.** Never silence a violation to make a scan pass;
  fix the underlying markup/semantics.

> **Requires setup.** The axe MCP server is Deque's commercial product: it runs via Docker and
> needs a Deque account. Without credentials the server simply won't start — the `wcag` and
> `playwright` servers, the app, and all tests still work.

#### Providing the key securely (never commit it)

`.mcp.json` never contains the key — it references `${AXE_API_KEY}`, which Claude Code expands
from your **environment** at launch. Keys live only in your local environment, never in git:

- Secrets belong in a gitignored `.env` (patterns `.env`, `.env.local`, `.env.*.local` are
  ignored). The tracked, secret-free [`.env.example`](.env.example) documents the variable —
  copy it to `.env` and fill in your key.
- **The key must be in the environment of the process that launches Claude Code** (MCP `${VAR}`
  expansion reads the process env, not a `.env` file automatically). Set it one of these ways:

  ```powershell
  # Windows PowerShell — current session only:
  $env:AXE_API_KEY = "your-key"
  # Windows — persist for your user (new terminals pick it up):
  setx AXE_API_KEY "your-key"
  ```
  ```bash
  # macOS/Linux — current session:
  export AXE_API_KEY="your-key"
  # or auto-load a gitignored .env with a tool like direnv / dotenvx before launching
  ```

- Provide **exactly one** of `AXE_API_KEY` or `AXE_ACCESS_TOKEN` (the server errors if both are
  set). Rotate the key via the Deque portal if it is ever exposed.
- **Never** paste a real key into `.mcp.json`, `.env.example`, commits, code, or chat.

## Project Skills

Repeatable workflows live in [.claude/skills/](.claude/skills/) — prefer them over ad-hoc reconstruction:

| Skill | Use when |
|-------|----------|
| `commit` | Committing work — derives the convention, proposes a split, commits via `git commit -F` |
| `pre-pr` | Before opening any PR — typecheck, unit, E2E, and quality artifacts for UI changes |
| `release` | Cutting a Git Flow release — version bump, CHANGELOG, never-squash merge, sync-back |
| `a11y-audit` | After markup/ARIA/focus changes — axe scans, keyboard pass, SR text review, themes |

## Testing Strategy

| Type | Tool | Location | Command |
|------|------|----------|---------|
| Unit | Vitest | `src/**/*.test.ts` | `npm test` |
| E2E | Playwright | `e2e/*.spec.ts` | `npm run test:e2e` |
| Accessibility | axe-core | via Playwright | included in E2E |
| Visual | Screenshots | `docs/visual-history/` | `npm run capture-milestone` |
| Performance | Lighthouse | `docs/performance-history/` | `npm run lighthouse` |

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run unit tests (watch)
npm run test:run     # Run unit tests (once)
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run E2E tests with UI
```

## Code Style

- Prefer pure functions in `utils/`
- Components should be small and focused
- State changes flow through stores, not direct DOM manipulation
- CSS custom properties for all colours/spacing (no magic values)
- Test coverage for utility functions
