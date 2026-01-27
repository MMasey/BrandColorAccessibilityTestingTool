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
- When sorted, show "Sorted" indicator and "Reset" button
- Disable direction toggle when in manual mode
- Auto-sort newly added colors when in sorted mode

## Manual Reordering
- Auto-show reorder controls (drag handles + move buttons) when Manual Order selected
- Auto-hide reorder controls when sorted mode selected
- Provide three reordering methods:
  1. **Drag-and-drop**: Drag handle with mouse/touch
  2. **Keyboard buttons**: Move up/down arrow buttons (44x44px minimum)
  3. **Keyboard drag**: Drag handle focusable and draggable via keyboard

## Drag-and-Drop Interaction
- Uses HTML5 drag-and-drop API for best cross-platform support
- Custom drag ghost that matches actual card appearance:
  - Reads computed styles from actual DOM elements
  - Matches card layout (color preview + hex + label)
  - Applies lift effect (scale 1.05, rotate 2deg, enhanced shadow)
- Visual feedback during drag:
  - Dragged card: 30% opacity, dashed border, scale down, rotate
  - Drop target: Blue indicator line (positioned at -3px above card) with pulse animation
  - All animations disabled if `prefers-reduced-motion: reduce`
- Smooth animations for keyboard arrow moves:
  - 250ms transform-based preview before DOM update
  - Cards visually swap positions using translateY transforms
  - Provides feedback matching drag-and-drop behavior
  - Respects prefers-reduced-motion

## Accessibility
- Smart focus management:
  - After move, always focus an enabled button
  - At first position: focus down button (up is disabled)
  - At last position: focus up button (down is disabled)
  - Middle positions: focus button matching movement direction
- Screen reader announcements:
  - "Color [label/hex] added to palette"
  - "Colors sorted: [criteria]"
  - "Sort direction changed: [direction]"
  - "[label/hex] moved to position [n]"
  - "Colors reset to original order"
  - "Cannot move up - already at beginning of list" (boundary reached)
  - "Cannot move down - already at end of list" (boundary reached)
- ARIA live regions (polite, atomic)
- All buttons have aria-label and title attributes
- Drag handle has role="img" and descriptive aria-label
- Boundary announcements when disabled buttons are clicked (WCAG 4.1.3)

## State Management
- Store original color order on first sort/reorder
- Reset button restores original insertion order
- Clear original order after reset
- Track sort criteria and direction in state
- Re-apply sort when adding colors in sorted mode

# Dependencies
- Phase 1 complete (color palette component exists)
- `src/state/color-store.ts` - Extended with sort/reorder methods
- `src/utils/color-sorting.ts` - Luminance sorting algorithm
- `src/components/color-swatch.ts` - Drag-and-drop handlers
- `src/components/sort-controls.ts` - Sort UI component

# Out of Scope
- Additional sort criteria (contrast score, WCAG pass rate, hue, alphabetical)
- URL persistence of sort order
- Saving custom sort preferences (no user accounts)
- Sorting by color name/brand (no semantic color data)
- Multi-select for batch reordering
- Undo/redo history (single reset is sufficient)
- Custom drag implementation (HTML5 drag-and-drop provides better native support)

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
- ✅ All animations respect `prefers-reduced-motion`
- ✅ All interactive elements meet 44x44px touch target minimum per WCAG 2.2 2.5.8
