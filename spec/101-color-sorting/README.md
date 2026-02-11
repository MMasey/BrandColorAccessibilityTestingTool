# Colour Palette Sorting & Reordering

## Description

Allow users to sort their colour palette by luminance and manually reorder colours to organise their palette logically.

### Requirements

- **Automatic sorting** by luminance (lightest to darkest)
- **Manual drag-and-drop reordering** with keyboard alternatives (WCAG 2.2 Level AA compliance)
- **Rich visual feedback** during sorting and reordering operations
- **Accessible announcements** for screen reader users
- **Smart focus management** that never focuses disabled buttons
- **Auto-sort new colours** when in sorted mode
- **Reset to original order** functionality

### Key Sorting Options

1. **Luminance** - Lightest to darkest based on relative luminance (reversible)
2. **Manual** - Custom order via drag-and-drop or keyboard move buttons

### Manual Reordering Methods

Users can reorder colours using any of these methods:

1. **Mouse/Touch Drag**: Grab the drag handle (⋮⋮) and drag to new position
2. **Keyboard Buttons**: Use move up (▲) and move down (▼) arrow buttons
3. **Keyboard Drag**: Focus drag handle and use keyboard to drag (future enhancement — deferred)

### Visual Feedback

**During Mouse/Touch Drag:**
- Dragged card: 30% opacity, dashed border, subtle scale/rotate
- Drop target: Blue indicator line (positioned in gap) with pulse animation
- Custom drag ghost that matches actual card appearance
- All animations respect `prefers-reduced-motion`

**During Keyboard Arrow Moves:**
- 250ms transform-based animation preview
- Cards visually swap positions before DOM update
- Provides smooth feedback matching drag-and-drop
- All animations respect `prefers-reduced-motion`

**Drag Ghost Details:**
- Reads computed styles from actual DOM elements
- Matches card layout exactly (colour preview + hex + label)
- Applies lift effect (scale 1.05, rotate 2deg, enhanced shadow)
- Centred on cursor for natural feel

### WCAG 2.2 Compliance

- **2.5.7 Dragging Movements (AA)**: Keyboard move buttons provide single-pointer alternative to drag-and-drop
- **2.5.8 Target Size (Minimum) (AA)**: All interactive elements are 44x44px (exceeds 24x24px requirement)
- **2.4.3 Focus Order (A)**: Smart focus management - always focuses enabled buttons after move
- **4.1.3 Status Messages (AA)**: Screen reader announcements for all sort/reorder actions + boundary announcements

### Implementation

**Completed:**
- ✅ `src/utils/color-sorting.ts` - Luminance sorting algorithm
- ✅ `src/state/color-store.ts` - Sort/reorder state management
- ✅ `src/state/url-sync.ts` - URL persistence of sort criteria and direction
- ✅ `src/components/color-palette.ts` - Drag-drop orchestration and focus management
- ✅ `src/components/color-swatch.ts` - Drag-drop handlers and custom drag ghost
- ✅ `src/components/sort-controls.ts` - Sort UI (criteria + direction + reset)

**Future Work:**
- ⏳ `e2e/color-sorting.spec.ts` - E2E tests for sorting and reordering
- ⏳ Additional sort criteria (contrast score, WCAG pass rate, hue, alphabetical)
- ⏳ Keyboard drag via drag handle (WCAG 2.5.7 already met by keyboard move buttons)

### Context

Users currently have no way to reorder colours after adding them, making it difficult to organise palettes logically. Luminance sorting helps users quickly identify their lightest and darkest colours. Manual reordering allows custom organisation for presentations or workflows.

### Known Limitations

- **HTML5 drag-and-drop used instead of custom implementation**: Provides better native support for touch, screen readers, and cross-browser compatibility. Custom drag ghost compensates for browser default appearance.
- **Transform-based preview only for keyboard moves**: Mouse drag uses native HTML5 events. Transform preview (250ms) only shown for keyboard arrow button moves to avoid hitbox issues.
