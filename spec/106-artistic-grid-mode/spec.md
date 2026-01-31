# Artistic Grid Mode

# Goal

Enable users to create artistic 2D color patterns and shareable art URLs by decoupling foreground/background palettes, removing accessibility labels in "art mode", and optionally blending cell colors.

# Inputs

**URL Parameters (new)**:
- `fg=HEX,HEX,...` - Foreground colors (row colors), comma-separated hex without `#`
- `bg=HEX,HEX,...` - Background colors (column colors), comma-separated hex without `#`
- `art=true|false` - Enable art mode (default: `false`)
- `blend=true|false` - Enable color blending in cells (default: `false`)

**Backward Compatibility**:
- If `fg` and `bg` are absent, fall back to existing `colors` param for both axes (current behavior)
- If only `fg` is present, use `fg` for both axes
- If only `bg` is present, use `bg` for both axes

**UI Controls (future - not in MVP)**:
- Toggle button for art mode
- Toggle button for blend mode
- May be added in future refinement

# Outputs

**Grid Display**:
- Asymmetric grid when `fg` and `bg` differ (e.g., 5 rows × 8 columns)
- Art mode: Grid with no text labels, no WCAG badges, no headers (pure color cells)
- Blend mode: Each cell shows blended color (50/50 mix of FG and BG) instead of FG-on-BG contrast

**Shareable URL**:
- Example: `?fg=FF0000,00FF00&bg=000000,FFFFFF,808080&art=true&blend=false`
- Generates 2×3 grid with artistic intent

**ARIA/Accessibility**:
- Art mode still maintains `role="table"` structure for screen readers
- Cell labels remain in `aria-label` attributes even when visually hidden
- Complies with WCAG 2.2 AA (tool must remain accessible even in art mode)

# Constraints

**Tech Stack**:
- Lit 3.x components
- TypeScript 5.6
- URL state via existing `url-state.ts` patterns
- No new dependencies for color blending (use pure functions)

**Performance**:
- Color blending must be instant (pure function, no async)
- Grid rendering must handle up to 50×50 cells (2,500 total) without lag

**Accessibility**:
- Art mode removes *visual* labels only, not semantic structure
- Must maintain keyboard navigation in art mode
- Color blending must still calculate contrast for `aria-label` values

**Browser Support**:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support (per existing project constraints)

**Backward Compatibility**:
- Existing `?colors=...` URLs continue to work unchanged
- Components must handle both old (single palette) and new (dual palette) modes

# Requirements

## 1. URL State Extensions

**Extend URLState interface** in `src/state/url-state.ts`:
- Add `fgColors?: string[]` (foreground palette)
- Add `bgColors?: string[]` (background palette)
- Add `artMode: boolean` (default `false`)
- Add `blendMode: boolean` (default `false`)

**Update parseURLState function**:
- Parse `fg` param into `fgColors` array
- Parse `bg` param into `bgColors` array
- Parse `art` param as boolean
- Parse `blend` param as boolean
- Implement fallback logic (see Inputs section)

**Update serializeURLState function**:
- Serialize `fgColors` as `fg` param (if present and different from `colors`)
- Serialize `bgColors` as `bg` param (if present and different from `colors`)
- Serialize `artMode` as `art` param (only if `true`)
- Serialize `blendMode` as `blend` param (only if `true`)

## 2. Color Store Extensions

**Extend ColorStoreState interface** in `src/state/color-store.ts`:
- Add `fgColors?: Color[]` (optional foreground palette)
- Add `bgColors?: Color[]` (optional background palette)
- Add `artMode: boolean` (default `false`)
- Add `blendMode: boolean` (default `false`)

**Add new methods to colorStore**:
- `setForegroundColors(colors: Color[]): void`
- `setBackgroundColors(colors: Color[]): void`
- `getForegroundColors(): readonly Color[]` (returns `fgColors ?? colors`)
- `getBackgroundColors(): readonly Color[]` (returns `bgColors ?? colors`)
- `setArtMode(enabled: boolean): void`
- `setBlendMode(enabled: boolean): void`

**Add new event types**:
- `{ type: 'art-mode-changed'; enabled: boolean }`
- `{ type: 'blend-mode-changed'; enabled: boolean }`

## 3. Color Blending Utility

**Create `src/utils/color-blending.ts`**:
- Function `blendColors(fg: string, bg: string, ratio?: number): string`
  - Accepts hex colors (e.g., `#FF0000`, `#0000FF`)
  - Default `ratio` is `0.5` (50/50 mix)
  - Converts to RGB, blends each channel, returns hex
  - Example: `blendColors('#FF0000', '#0000FF')` → `#7F007F` (purple)
- Pure function, no side effects
- Add unit tests in `color-blending.test.ts`

## 4. Contrast Grid Updates

**Update `src/components/contrast-grid.ts`**:
- Read `fgColors` and `bgColors` from store (via controller)
- If both are set, generate asymmetric matrix (rows = fgColors, cols = bgColors)
- If only one palette exists, use existing symmetric behavior

**Art Mode Rendering**:
- When `artMode === true`:
  - Hide all text content (labels, contrast ratios, WCAG badges)
  - Hide column/row headers (color names and dots)
  - Hide legend
  - Keep `role="table"` and `aria-label` attributes for accessibility
  - Apply CSS class `art-mode` for styling (e.g., remove borders, increase cell size)

**Blend Mode Rendering**:
- When `blendMode === true`:
  - Each cell shows solid blended color (via `blendColors()`)
  - No text or badges visible in cell
  - `aria-label` still describes the blend (e.g., "Red blended with Blue")
  - Cell background is the blended color

**CSS for Art Mode**:
- `.art-mode .grid-wrapper` - Remove borders, max-height constraint
- `.art-mode .header-cell` - Display none
- `.art-mode .legend` - Display none
- `.art-mode contrast-cell` - Full size, no text rendering

## 5. Contrast Cell Updates

**Update `src/components/contrast-cell.ts`** (if needed):
- Accept new prop `blend-mode: boolean`
- When `blend-mode` is true:
  - Calculate blended color from `fg-color` and `bg-color` props
  - Render cell with solid blended background
  - Hide all text content
  - Keep `aria-label` with blend description

# Dependencies

**Must read/understand before implementing**:
- [src/state/url-state.ts](../../src/state/url-state.ts) - URL serialization patterns
- [src/state/color-store.ts](../../src/state/color-store.ts) - Store structure and pub/sub
- [src/components/contrast-grid.ts](../../src/components/contrast-grid.ts) - Grid rendering logic
- [src/components/contrast-cell.ts](../../src/components/contrast-cell.ts) - Cell rendering
- [src/utils/color-converter.ts](../../src/utils/color-converter.ts) - Hex/RGB conversion patterns

**Existing patterns to follow**:
- Color parsing: Use `createColor()` from `color-converter.ts`
- URL params: Follow naming convention (lowercase, no dashes)
- Store events: Follow existing pub/sub pattern
- Component props: Use Lit `@property` decorators with kebab-case attrs

# Out of Scope

**Not in this feature**:
- UI controls for toggling art/blend modes (users set via URL only in MVP)
- Color picker for selecting FG/BG colors (users manually type hex in URL)
- Saving/loading art patterns to local storage or database
- Animation or transitions when toggling modes
- Export to image file (covered in feature 103: Visual Exports)
- Color blending algorithms beyond simple 50/50 RGB mix (future enhancement)
- Pattern templates or presets (future enhancement)

**Why excluded**:
- UI controls add complexity; URL-only keeps MVP focused
- Export functionality already scoped to separate feature
- Advanced blending (LAB, LCH) can be added later if needed

# Done

**Users can**:
- Create asymmetric grids by setting different `fg` and `bg` colors in URL
- Share artistic grid URLs with friends (e.g., `?fg=FF0000,00FF00&bg=000000,FFFFFF&art=true`)
- Toggle art mode via `?art=true` to see grid without accessibility labels
- Toggle blend mode via `?blend=true` to see blended colors instead of contrast tests
- View grids where rows and columns use different color sets (e.g., 7 foreground × 12 background = 84 cells)
- Use existing `?colors=...` URLs unchanged (backward compatible)

**Observable outcomes**:
- URL with `?fg=...&bg=...` loads asymmetric grid with specified row/column colors
- URL with `?art=true` shows grid with no visible text (but screen reader announces cells)
- URL with `?blend=true` shows grid where each cell is a solid blended color
- URL without `fg`/`bg` params continues to work as before (symmetric grid)
- Grid remains keyboard-navigable in all modes
- Grid remains screen-reader accessible in all modes
