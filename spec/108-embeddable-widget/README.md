# Feature 108: Embeddable Widget

## Origin

Requested by Mike (1 Jul 2026). The core contrast checker is useful beyond our own site —
brand and design teams want to show live WCAG compliance for their palette directly on
their own pages (style guides, brand portals, documentation), without rebuilding the tool.

## Request

Provide a distributable build of the contrast checker as a **single self-registering web
component** that a third party can add to any page with one script tag and one custom
element — no build step, no framework required.

```html
<script src="https://cdn.jsdelivr.net/npm/brand-contrast-checker@1/dist/widget.js"></script>

<contrast-checker
  colors="#003366,#FFFFFF,#F5A623"
  standard="wcag"
  level="AA"
  theme="light"
></contrast-checker>
```

The embedded widget renders the **full checker** — colour inputs plus the contrast grid —
so a host page's visitors can both view the seeded palette's compliance and try their own
colours.

## Distribution

- Published to **npm**, served free via **jsDelivr** (primary documented URL) and unpkg.
- Also downloadable as a single `dist/widget.js` file for self-hosting.
- Versioned with a pinned major (`@1`) so embeds don't break on release.

## Configuration (host-facing)

| Attribute | Purpose |
|-----------|---------|
| `colors` | Comma-separated palette to seed the widget (hex / named colours) |
| `standard` | `wcag` (default) or `apca` |
| `level` | `AA` (default) or `AAA` |
| `theme` | `light` \| `dark` \| `high-contrast` \| `system` |
| CSS custom properties | Host overrides for brand colours (scoped to the widget) |
| `attribution` | `show` (default) or `hide` — "Powered by" link; a candidate free-vs-paid lever |

## Why this is non-trivial

The main app assumes it *owns the page*: the colour store is a singleton, the theme store
writes `data-theme` to `<html>`, and state syncs to the page URL. An embed can do none of
those — it must be fully instance-scoped and must not touch the host page's `<html>` or URL.
That decoupling is the heart of this feature. See `spec.md` Constraints.
