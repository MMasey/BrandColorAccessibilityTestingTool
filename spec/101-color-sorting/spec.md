# Color Palette Sorting & Reordering

# Goal
Enable users to sort and manually reorder their color palette to organize colors logically, identify most/least accessible combinations, and prepare palettes for presentations or exports.

# Inputs
- Existing color palette from color store
- Sort criteria selection (luminance, contrast, WCAG pass rate, hue, alphabetical)
- User interaction (drag-and-drop, keyboard, buttons)

# Outputs
- Reordered color palette in desired sequence
- Visual feedback during sorting/reordering
- Screen reader announcements for accessibility
- Persisted order in URL state

# Constraints
- WCAG 2.2 Level AA compliance for all interactions
- 2.5.7 Dragging Movements: Must provide single-pointer alternative to drag-and-drop
- 2.5.8 Target Size: Minimum 24x24px touch targets (already meet 44x44px)
- Reordering must update contrast grid immediately
- Sort order must be reversible (ascending/descending)

# Requirements
- Implement sorting algorithms for each criteria
- Add sort dropdown UI to color palette header
- Implement drag-and-drop with visual feedback
- Provide keyboard-only reordering (arrow keys, move up/down buttons)
- Add screen reader live region announcements
- Show visual indicator when palette is sorted vs manual order
- Persist sort order in URL state
- Add "Reset to original order" option

# Dependencies
- Phase 1 complete (color palette component exists)
- `src/state/color-store.ts` - Extend with sort/reorder methods
- `src/state/url-state.ts` - Add color order to URL parameters
- `src/utils/contrast.ts` - Calculate pass rates for sorting

# Out of Scope
- Saving custom sort preferences (no user accounts)
- Sorting by color name/brand (no semantic color data)
- Multi-select for batch reordering
- Undo/redo history (single reset is sufficient)

# Done
- User can sort palette by 5+ criteria (luminance, contrast, pass rate, hue, alphabetical)
- User can manually reorder via drag-and-drop OR keyboard
- Drag-and-drop has accessible alternative per WCAG 2.2 2.5.7
- Screen reader announces sort/reorder actions
- Sort order persists in URL for shareability
- Reset button restores original order
- All interactive elements meet 44x44px touch target minimum
