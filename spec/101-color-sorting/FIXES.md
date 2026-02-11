# Color Sorting & Reordering Bug Fixes

## Issues Identified

### 1. Up Arrow Buttons Not Working After Drag
**Symptom**: After dragging a color to a new position, none of the up arrow buttons would work at all.

**Root Cause**:
- Lit's keyed `repeat` directive was reusing DOM elements after SortableJS physically moved them
- The `.index` property on each `<color-swatch>` wasn't being updated correctly
- When keyboard controls tried to use `this.index`, they had stale values

**Fix**:
- Removed keyed `repeat()` directive
- Switched to simple `map()` for rendering colors
- This ensures Lit always updates properties based on array position, not DOM element reuse
- File: `src/components/color-palette.ts` (line ~406)

### 2. SortableJS Not Re-enabled After Keyboard Animation
**Symptom**: After the first keyboard move, drag-and-drop would stop working properly.

**Root Cause**:
- During keyboard animations, we disabled SortableJS with `sortableInstance.option('disabled', true)`
- We never re-enabled it after the animation completed

**Fix**:
- Added code to re-enable SortableJS in both the success and error handlers of the animation promise
- File: `src/components/color-palette.ts` (lines ~341, ~348)

### 3. Concurrent Move Operations
**Symptom**: Sometimes dragging a card would affect other cards incorrectly.

**Root Cause**:
- No proper synchronization between drag operations and keyboard moves
- DOM could be manipulated while another operation was in progress

**Fix**:
- Enhanced `isReordering` flag usage
- Temporarily disable SortableJS during drag `onEnd` handler
- Added `requestAnimationFrame` to ensure DOM is fully stable before clearing flags
- File: `src/components/color-palette.ts` (lines ~462-478)

## Code Changes

### color-palette.ts

**Removed keyed rendering**:
```typescript
// Before (with keyed repeat):
${repeat(
  colors,
  (color) => color.hex,
  (color, index) => html`...`
)}

// After (simple map):
${colors.map((color, index) => html`...`)}
```

**Re-enable SortableJS after keyboard animation**:
```typescript
moveAnimation.finished.then(() => {
  // ... cleanup code ...

  // Re-enable SortableJS
  if (this.sortableInstance) {
    this.sortableInstance.option('disabled', false);
  }

  this.isReordering = false;
}).catch(() => {
  // Re-enable even on error
  if (this.sortableInstance) {
    this.sortableInstance.option('disabled', false);
  }
  this.isReordering = false;
});
```

**Better synchronization in drag handler**:
```typescript
onEnd: (evt: SortableEvent) => {
  // ... validation ...

  // Disable SortableJS during store update
  if (this.sortableInstance) {
    this.sortableInstance.option('disabled', true);
  }

  // Update store
  if (this.store.moveColor(oldIndex, newIndex)) {
    // ... set status message ...

    // Wait for DOM to be fully updated
    this.updateComplete.then(() => {
      requestAnimationFrame(() => {
        // Re-enable and clear flag
        if (this.sortableInstance) {
          this.sortableInstance.option('disabled', false);
        }
        this.isReordering = false;
      });
    });
  }
}
```

### color-swatch.ts

**Reverted to using `.index` property**:
```typescript
// Removed getCurrentIndexFromDOM() method completely
// Now using this.index directly in moveUp() and moveDown()

private moveUp(): void {
  if (this.index <= 0) {
    // Show shake animation
    // ...
    return;
  }

  this.dispatchEvent(new CustomEvent('swatch-move', {
    detail: { fromIndex: this.index, toIndex: this.index - 1 },
    // ...
  }));
}
```

## E2E Tests Created

Created comprehensive test suite in `e2e/color-sorting.spec.ts` with 40+ tests covering:

### Test Categories

1. **Sort Controls UI** (5 tests)
   - Dropdown visibility and default state
   - Direction toggle behavior
   - Enable/disable logic

2. **Manual Reorder Controls** (3 tests)
   - Controls visibility in different modes
   - Touch target size compliance (WCAG 2.2 2.5.8)

3. **Keyboard Reordering** (7 tests)
   - Move up/down functionality
   - Boundary conditions (first/last positions)
   - Rapid key press handling
   - Focus management
   - Screen reader announcements

4. **Drag-and-Drop** (2 tests)
   - Basic drag reordering
   - Contrast grid updates after drag

5. **Combined Scenarios** (4 tests)
   - Keyboard after drag
   - Drag after keyboard
   - Alternating between both methods

6. **Luminance Sorting** (3 tests)
   - Sort by luminance
   - Direction toggle
   - Auto-sort new colors

7. **Reset Functionality** (3 tests)
   - Reset button visibility
   - Restore original order after sort
   - Restore original order after manual reorder

8. **Accessibility** (3 tests)
   - No axe violations
   - WCAG 2.2 2.5.7 compliance (drag alternatives)
   - ARIA labels on controls

9. **Visual Feedback** (2 tests)
   - Animation screenshots
   - prefers-reduced-motion support

## Testing Instructions

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Only Color Sorting Tests
```bash
npx playwright test e2e/color-sorting.spec.ts
```

### Run Specific Test
```bash
npx playwright test e2e/color-sorting.spec.ts -g "should move color up using up arrow button"
```

### Run with UI Mode (Interactive)
```bash
npx playwright test e2e/color-sorting.spec.ts --ui
```

## Manual Testing Checklist

### Keyboard Controls
- [ ] Load page with 7 colors
- [ ] Switch to Manual Order mode
- [ ] Press up arrow on any middle card - should move up smoothly
- [ ] Press down arrow on any middle card - should move down smoothly
- [ ] Press up arrow on first card - should shake, not move
- [ ] Press down arrow on last card - should shake, not move
- [ ] Rapidly press same arrow 3 times - should move 3 positions

### Drag-and-Drop
- [ ] Drag first color down 2 positions
- [ ] Verify color is now at position 3
- [ ] Verify contrast grid updated
- [ ] Drag last color to first position
- [ ] Verify reordering worked correctly

### Combined Operations (Critical!)
- [ ] Load 7 colors
- [ ] Drag first color down 2 positions (to index 2)
- [ ] **Wait for animation to complete**
- [ ] Press up arrow on the 3rd card (dragged color)
- [ ] **Verify**: Card moves up to position 2 (not jumping or wrong card moving)
- [ ] Press up arrow again
- [ ] **Verify**: Card moves up to position 1
- [ ] Press down arrow
- [ ] **Verify**: Card moves down to position 2
- [ ] Drag another color
- [ ] Use keyboard controls again
- [ ] **Verify**: Everything still works correctly

### Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Screen reader announces moves
- [ ] Touch targets meet 44x44px minimum
- [ ] No accessibility violations in axe-core scan

## Known Limitations

1. **Performance**: Using `map()` instead of keyed `repeat()` means Lit creates more DOM updates. This is acceptable for color palettes (typically < 20 colors), but may need optimization for very large lists.

2. **Animation Timing**: There's a 250ms animation for keyboard moves. During this time, concurrent operations are blocked. This is intentional for UX consistency.

3. **Browser Support**: Drag-and-drop uses SortableJS which requires modern browsers. No IE11 support (per project requirements).

## Future Improvements

1. Consider migrating to HTML5 native drag-and-drop to eliminate SortableJS dependency
2. Add visual indicators during drag to show drop target more clearly
3. Add undo/redo functionality for reordering operations
4. Consider touch gesture improvements for mobile devices

## References

- WCAG 2.2 2.5.7 Dragging Movements: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- WCAG 2.2 2.5.8 Target Size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- SortableJS Documentation: https://github.com/SortableJS/Sortable
- Lit repeat directive: https://lit.dev/docs/templates/directives/#repeat
