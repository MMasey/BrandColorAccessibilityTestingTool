# Color Palette Sorting & Reordering

## Description

Allow users to sort and reorder their color palette by various criteria to quickly identify most/least accessible combinations and organize colors logically.

### Requirements

- **Automatic sorting** by multiple criteria (luminance, contrast score, WCAG pass rate, hue, alphabetically)
- **Manual drag-and-drop reordering** with keyboard alternatives (WCAG 2.2 Level AA compliance)
- **Visual feedback** during sorting and reordering operations
- **Accessible announcements** for screen reader users
- **Reset to original order** functionality

### Key Sorting Options

1. **Luminance** - Lightest to darkest based on relative luminance
2. **Contrast Score** - Highest average contrast ratio across all palette combinations
3. **WCAG Pass Rate** - Colors that pass the most combinations first
4. **Hue** - Color wheel order (ROYGBIV)
5. **Alphabetical** - By label name
6. **Manual** - Custom order via drag-and-drop or keyboard

### WCAG 2.2 Compliance

- **2.5.7 Dragging Movements (AA)**: Single-pointer alternative for drag-and-drop (move up/down buttons + keyboard)
- **2.5.8 Target Size (Minimum) (AA)**: 24x24px minimum touch targets (already meet with 44x44px)
- **2.4.3 Focus Order (A)**: Logical focus order during reordering
- **4.1.3 Status Messages (AA)**: Announce sort/reorder changes to screen readers

### Proposed Implementation

- `src/utils/color-sorting.ts` - Pure functions for sorting algorithms
- `src/components/color-palette.ts` - Update with sort UI and drag-drop
- `src/components/sort-dropdown.ts` - Sort criteria selector component
- `e2e/color-sorting.spec.ts` - E2E tests for sorting and reordering

### Context

Users currently have no way to reorder colors after adding them, making it difficult to organize palettes logically. Adding automatic sorting helps users quickly identify their most versatile (high pass rate) or problematic (low pass rate) colors. Manual reordering allows custom organization for presentations or workflows.
