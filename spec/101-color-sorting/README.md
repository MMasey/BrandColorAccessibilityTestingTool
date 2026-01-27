# Color Palette Sorting & Reordering

## Description

Allow users to sort their color palette by luminance and manually reorder colors to organize their palette logically.

### Requirements

- **Automatic sorting** by luminance (lightest to darkest)
- **Manual drag-and-drop reordering** with keyboard alternatives (WCAG 2.2 Level AA compliance)
- **Rich visual feedback** during sorting and reordering operations
- **Accessible announcements** for screen reader users
- **Smart focus management** that never focuses disabled buttons
- **Auto-sort new colors** when in sorted mode
- **Reset to original order** functionality

### Key Sorting Options

1. **Luminance** - Lightest to darkest based on relative luminance (reversible)
2. **Manual** - Custom order via drag-and-drop or keyboard move buttons

### Manual Reordering Methods

Users can reorder colors using any of these methods:

1. **Mouse/Touch Drag**: Grab the drag handle (⋮⋮) and drag to new position
2. **Keyboard Buttons**: Use move up (▲) and move down (▼) arrow buttons
3. **Keyboard Drag**: Focus drag handle and use keyboard to drag (future enhancement)

### Visual Feedback

**During Drag:**
- Dragged card: 30% opacity, dashed border, subtle scale/rotate
- Drop target: Blue indicator line with pulse animation
- Custom drag ghost that matches actual card appearance
- All animations respect `prefers-reduced-motion`

**Drag Ghost Details:**
- Reads computed styles from actual DOM elements
- Matches card layout exactly (color preview + hex + label)
- Applies lift effect (scale 1.05, rotate 2deg, enhanced shadow)
- Centered on cursor for natural feel

### WCAG 2.2 Compliance

- **2.5.7 Dragging Movements (AA)**: Three alternatives to drag-and-drop (move up/down buttons + keyboard drag)
- **2.5.8 Target Size (Minimum) (AA)**: All interactive elements are 44x44px (exceeds 24x24px requirement)
- **2.4.3 Focus Order (A)**: Smart focus management - always focuses enabled buttons after move
- **4.1.3 Status Messages (AA)**: Screen reader announcements for all sort/reorder actions

### Implementation

**Completed:**
- ✅ `src/utils/color-sorting.ts` - Luminance sorting algorithm
- ✅ `src/state/color-store.ts` - Sort/reorder state management
- ✅ `src/components/color-palette.ts` - Drag-drop orchestration and focus management
- ✅ `src/components/color-swatch.ts` - Drag-drop handlers and custom drag ghost
- ✅ `src/components/sort-controls.ts` - Sort UI (criteria + direction + reset)

**Future Work:**
- ⏳ `e2e/color-sorting.spec.ts` - E2E tests for sorting and reordering
- ⏳ URL persistence of sort order
- ⏳ Additional sort criteria (contrast score, WCAG pass rate, hue, alphabetical)

### Context

Users currently have no way to reorder colors after adding them, making it difficult to organize palettes logically. Luminance sorting helps users quickly identify their lightest and darkest colors. Manual reordering allows custom organization for presentations or workflows.

### Known Limitations

- **Transform-based preview disabled during mouse drag**: CSS transforms move elements visually but their hit zones stay in original DOM position, breaking drop detection. Currently disabled for mouse drag; reserved for future keyboard drag mode.
- **No URL persistence**: Sort order doesn't sync to URL parameters (future enhancement).
