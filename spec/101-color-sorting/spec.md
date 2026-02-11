# Color Palette Sorting & Reordering

# Goal
Enable users to sort their color palette by luminance and manually reorder colors to organize their palette logically and identify most/least accessible combinations.

# Inputs
- Existing color palette from color store
- Sort criteria selection (luminance or manual order)
- Sort direction (ascending/descending)
- User interaction (drag-and-drop, keyboard move buttons)

# Outputs
- Reordered color palette in desired sequence
- Real-time visual feedback during sorting/reordering operations
- Screen reader announcements for accessibility
- Auto-sorted new colors when in sorted mode

# Constraints
- WCAG 2.2 Level AA compliance for all interactions
- 2.5.7 Dragging Movements (AA): Must provide single-pointer alternative to drag-and-drop
- 2.5.8 Target Size (AA): Minimum 24x24px touch targets (implementation uses 44x44px)
- 2.4.3 Focus Order (A): Logical focus order during reordering, never focus disabled buttons
- 4.1.3 Status Messages (AA): Screen reader announcements for sort/reorder actions
- Reordering must update contrast grid immediately
- Sort order must be reversible (ascending/descending) for luminance
- Must respect `prefers-reduced-motion` for all animations

# Requirements

## Core Sorting
- Implement luminance sorting algorithm (lightest to darkest)
- Add sort controls UI (dropdown + direction toggle)
- Show "Manual Order" as default (insertion order)
- When sorted, show "Reset" button only (presence of button signals sorted state)
- Hide direction toggle when in manual mode (not applicable, not just disabled)
- Auto-sort newly added colours when in sorted mode

## Manual Reordering
- Auto-show reorder controls (drag handles + move buttons) when Manual Order selected
- Auto-hide reorder controls when sorted mode selected
- Provide two reordering methods:
  1. **Drag-and-drop**: Drag handle with mouse/touch
  2. **Keyboard buttons**: Move up/down arrow buttons (44x44px minimum)

## Drag-and-Drop Interaction

### Technology Choice: HTML5 Drag-and-Drop
- **Rejected `@atlaskit/pragmatic-drag-and-drop`**:
  - Evaluated for superior UX and accessibility features (4.7kb)
  - Fatal flaw: Incompatible with Web Components Shadow DOM
  - Library listens at document level, Shadow DOM event retargeting blocks it
- **Chose HTML5 native drag-and-drop**:
  - Works with Shadow DOM out of the box
  - Zero dependencies
  - Requires careful event handling (preventDefault on both dragenter and dragover)

### Implementation Details
- Custom drag ghost that matches actual card appearance:
  - Clones `.swatch-container` with full styling
  - Positions at actual grab point for natural feel
  - 90% opacity for visual feedback
- Live reordering during drag:
  - Other cards smoothly shift (translateY transforms) as you drag
  - Dragged card stays faded in place (30% opacity, dashed border)
  - No delay - order commits immediately on drop
- Visual feedback:
  - Drop target: Blue indicator line centered in gap with pulse animation
  - All animations disabled if `prefers-reduced-motion: reduce`
- Keyboard arrow moves:
  - 250ms transform-based preview before DOM update
  - Dragged card animates over others (elevated z-index)
  - Cards shift to make room
  - Shake animation at boundaries (can't move further)
  - Focus stays on same direction button

## Accessibility
- Smart focus management:
  - After move, focus stays on the same direction button (up stays on up, down stays on down)
  - Focus never moves to a different button
  - Provides predictable, consistent behavior
- Boundary feedback (buttons stay enabled):
  - Pressing move button at boundary shows shake animation
  - Screen reader announcement confirms boundary ("Cannot move up/down...")
  - No disabled buttons - consistent interaction model
  - Shake animation respects `prefers-reduced-motion`
- Screen reader announcements:
  - "Colour [label/hex] added to palette"
  - "Colours sorted: [criteria]"
  - "Sort direction changed: [direction]"
  - "[label/hex] moved to position [n]"
  - "Colours reset to original order"
  - "Cannot move up - already at beginning of list" (boundary reached)
  - "Cannot move down - already at end of list" (boundary reached)
- ARIA live regions (polite, atomic)
- All buttons have aria-label and title attributes
- Drag handle has role="img" and descriptive aria-label

## State Management
- Store original colour order on first sort/reorder
- Reset button restores original insertion order
- Clear original order after reset
- Track sort criteria and direction in state
- Re-apply sort when adding colours in sorted mode
- Sync sort criteria and direction to URL query string (`sortBy`, `sortDir` params)
- Restore sort state from URL on page load and browser back/forward navigation

# Dependencies
- Phase 1 complete (color palette component exists)
- `src/state/color-store.ts` - Extended with sort/reorder methods
- `src/utils/color-sorting.ts` - Luminance sorting algorithm
- `src/components/color-swatch.ts` - Drag-and-drop handlers
- `src/components/sort-controls.ts` - Sort UI component

# Out of Scope
- Additional sort criteria (contrast score, WCAG pass rate, hue, alphabetical)
- Saving custom sort preferences (no user accounts)
- Sorting by colour name/brand (no semantic colour data)
- Multi-select for batch reordering
- Undo/redo history (single reset is sufficient)
- Custom drag implementation (HTML5 drag-and-drop provides better native support)
- Keyboard drag via the drag handle (WCAG 2.5.7 is met by keyboard move buttons; deferred to a future ticket)

# Done
- ✅ User can sort palette by luminance (lightest ↔ darkest)
- ✅ User can toggle between ascending/descending direction
- ✅ User can manually reorder via drag-and-drop with mouse/touch
- ✅ User can manually reorder via keyboard (44x44px move up/down buttons)
- ✅ Drag-and-drop has accessible alternatives per WCAG 2.2 2.5.7
- ✅ Custom drag ghost matches actual card appearance (reads computed styles)
- ✅ Blue drop indicator line shows insertion point with pulse animation
- ✅ Smooth animation for keyboard arrow moves (250ms transform preview)
- ✅ Rich visual feedback (opacity, scale, rotation, drop indicators)
- ✅ Smart focus management (never focuses disabled buttons)
- ✅ Screen reader announces all sort/reorder actions per WCAG 2.2 4.1.3
- ✅ Screen reader announces boundary when trying to move beyond list
- ✅ Reorder controls auto-show when Manual Order selected
- ✅ New colors auto-sorted when in sorted mode
- ✅ Reset button restores original insertion order
- ✅ Sort criteria and direction persist in URL — shareable links preserve sort state
- ✅ All animations respect `prefers-reduced-motion`
- ✅ All interactive elements meet 44x44px touch target minimum per WCAG 2.2 2.5.8
