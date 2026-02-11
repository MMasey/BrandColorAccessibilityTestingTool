/**
 * Color Store Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { colorStore } from './color-store';

describe('colorStore', () => {
  beforeEach(() => {
    // Reset store before each test
    colorStore.reset();
  });

  describe('initial state', () => {
    it('starts with empty colors array', () => {
      expect(colorStore.getColors()).toEqual([]);
    });

    it('starts with wcag algorithm', () => {
      expect(colorStore.getAlgorithm()).toBe('wcag');
    });
  });

  describe('addColor', () => {
    it('adds a valid hex color', () => {
      const color = colorStore.addColor('#FF5500');

      expect(color).not.toBeNull();
      expect(color?.hex).toBe('#FF5500');
      expect(colorStore.getColors()).toHaveLength(1);
    });

    it('adds a color with label', () => {
      const color = colorStore.addColor('#FF5500', 'Orange');

      expect(color?.label).toBe('Orange');
    });

    it('adds short hex format', () => {
      const color = colorStore.addColor('#F50');

      expect(color).not.toBeNull();
      expect(color?.hex).toBe('#FF5500');
    });

    it('adds RGB format', () => {
      const color = colorStore.addColor('rgb(255, 85, 0)');

      expect(color).not.toBeNull();
      expect(color?.hex).toBe('#FF5500');
    });

    it('adds HSL format', () => {
      const color = colorStore.addColor('hsl(0, 100%, 50%)');

      expect(color).not.toBeNull();
      expect(color?.hex).toBe('#FF0000');
    });

    it('returns null for invalid color', () => {
      const color = colorStore.addColor('not-a-color');

      expect(color).toBeNull();
      expect(colorStore.getColors()).toHaveLength(0);
    });

    it('emits colors-changed event', () => {
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.addColor('#FF5500');

      expect(listener).toHaveBeenCalledWith({
        type: 'colors-changed',
        colors: expect.any(Array),
      });
    });
  });

  describe('addColors', () => {
    it('adds multiple colors at once', () => {
      const colors = colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);

      expect(colors).toHaveLength(3);
      expect(colorStore.getColors()).toHaveLength(3);
    });

    it('adds colors with labels using tuples', () => {
      const colors = colorStore.addColors([
        ['#FF0000', 'Red'],
        ['#00FF00', 'Green'],
      ]);

      expect(colors[0]?.label).toBe('Red');
      expect(colors[1]?.label).toBe('Green');
    });

    it('skips invalid colors', () => {
      const colors = colorStore.addColors(['#FF0000', 'invalid', '#0000FF']);

      expect(colors).toHaveLength(2);
      expect(colorStore.getColors()).toHaveLength(2);
    });

    it('emits single event for batch add', () => {
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeColor', () => {
    beforeEach(() => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
    });

    it('removes color by index', () => {
      const result = colorStore.removeColor(1);

      expect(result).toBe(true);
      expect(colorStore.getColors()).toHaveLength(2);
      expect(colorStore.getColors()[1]?.hex).toBe('#0000FF');
    });

    it('returns false for invalid index', () => {
      expect(colorStore.removeColor(-1)).toBe(false);
      expect(colorStore.removeColor(10)).toBe(false);
      expect(colorStore.getColors()).toHaveLength(3);
    });

    it('emits colors-changed event', () => {
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.removeColor(0);

      expect(listener).toHaveBeenCalledWith({
        type: 'colors-changed',
        colors: expect.any(Array),
      });
    });
  });

  describe('removeColorByHex', () => {
    beforeEach(() => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
    });

    it('removes color by hex value', () => {
      const result = colorStore.removeColorByHex('#00FF00');

      expect(result).toBe(true);
      expect(colorStore.getColors()).toHaveLength(2);
    });

    it('handles hex without #', () => {
      const result = colorStore.removeColorByHex('00FF00');

      expect(result).toBe(true);
      expect(colorStore.getColors()).toHaveLength(2);
    });

    it('handles lowercase hex', () => {
      const result = colorStore.removeColorByHex('#00ff00');

      expect(result).toBe(true);
    });

    it('returns false for non-existent color', () => {
      const result = colorStore.removeColorByHex('#FFFFFF');

      expect(result).toBe(false);
      expect(colorStore.getColors()).toHaveLength(3);
    });
  });

  describe('updateColor', () => {
    beforeEach(() => {
      colorStore.addColors([
        ['#FF0000', 'Red'],
        ['#00FF00', 'Green'],
      ]);
    });

    it('updates color at index', () => {
      const result = colorStore.updateColor(0, '#0000FF', 'Blue');

      expect(result).not.toBeNull();
      expect(result?.hex).toBe('#0000FF');
      expect(result?.label).toBe('Blue');
      expect(colorStore.getColors()[0]?.hex).toBe('#0000FF');
    });

    it('returns null for invalid index', () => {
      expect(colorStore.updateColor(-1, '#0000FF')).toBeNull();
      expect(colorStore.updateColor(10, '#0000FF')).toBeNull();
    });

    it('returns null for invalid color', () => {
      expect(colorStore.updateColor(0, 'invalid')).toBeNull();
      // Original color should remain
      expect(colorStore.getColors()[0]?.hex).toBe('#FF0000');
    });
  });

  describe('updateColorLabel', () => {
    beforeEach(() => {
      colorStore.addColor('#FF0000', 'Red');
    });

    it('updates label only', () => {
      const result = colorStore.updateColorLabel(0, 'Primary Red');

      expect(result).toBe(true);
      expect(colorStore.getColors()[0]?.label).toBe('Primary Red');
      expect(colorStore.getColors()[0]?.hex).toBe('#FF0000');
    });

    it('returns false for invalid index', () => {
      expect(colorStore.updateColorLabel(-1, 'Test')).toBe(false);
      expect(colorStore.updateColorLabel(10, 'Test')).toBe(false);
    });
  });

  describe('moveColor', () => {
    beforeEach(() => {
      colorStore.addColors([
        ['#FF0000', 'Red'],
        ['#00FF00', 'Green'],
        ['#0000FF', 'Blue'],
      ]);
    });

    it('moves color to new position', () => {
      colorStore.moveColor(0, 2);

      const colors = colorStore.getColors();
      expect(colors[0]?.label).toBe('Green');
      expect(colors[1]?.label).toBe('Blue');
      expect(colors[2]?.label).toBe('Red');
    });

    it('returns false for invalid indices', () => {
      expect(colorStore.moveColor(-1, 1)).toBe(false);
      expect(colorStore.moveColor(0, 10)).toBe(false);
    });
  });

  describe('clearColors', () => {
    it('removes all colors', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      colorStore.clearColors();

      expect(colorStore.getColors()).toHaveLength(0);
    });

    it('emits colors-changed event', () => {
      colorStore.addColor('#FF0000');
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.clearColors();

      expect(listener).toHaveBeenCalledWith({
        type: 'colors-changed',
        colors: [],
      });
    });
  });

  describe('setAlgorithm', () => {
    it('changes algorithm', () => {
      colorStore.setAlgorithm('apca');

      expect(colorStore.getAlgorithm()).toBe('apca');
    });

    it('emits algorithm-changed event', () => {
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.setAlgorithm('both');

      expect(listener).toHaveBeenCalledWith({
        type: 'algorithm-changed',
        algorithm: 'both',
      });
    });

    it('does not emit if value unchanged', () => {
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.setAlgorithm('wcag'); // Already wcag

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      colorStore.addColors(['#FF0000', '#00FF00']);
      colorStore.setAlgorithm('apca');

      colorStore.reset();

      expect(colorStore.getColors()).toHaveLength(0);
      expect(colorStore.getAlgorithm()).toBe('wcag');
    });

    it('emits state-reset event', () => {
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.reset();

      expect(listener).toHaveBeenCalledWith({ type: 'state-reset' });
    });
  });

  describe('subscribe', () => {
    it('returns unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = colorStore.subscribe(listener);

      colorStore.addColor('#FF0000');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      colorStore.addColor('#00FF00');
      expect(listener).toHaveBeenCalledTimes(1); // Not called again
    });

    it('supports multiple subscribers', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      colorStore.subscribe(listener1);
      colorStore.subscribe(listener2);

      colorStore.addColor('#FF0000');

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('getState', () => {
    it('returns snapshot of current state', () => {
      colorStore.addColor('#FF0000', 'Red');
      colorStore.setAlgorithm('apca');

      const state = colorStore.getState();

      expect(state.colors).toHaveLength(1);
      expect(state.selectedAlgorithm).toBe('apca');
    });

    it('returns a copy, not reference', () => {
      colorStore.addColor('#FF0000');
      const state = colorStore.getState();

      // Modifying returned state shouldn't affect store
      (state.colors as any[]).push({ hex: '#00FF00' });

      expect(colorStore.getColors()).toHaveLength(1);
    });
  });

  describe('sortColorsPalette', () => {
    it('sorts colors by luminance ascending', () => {
      colorStore.addColors(['#000000', '#FFFFFF', '#808080']);
      colorStore.sortColorsPalette('luminance', 'ascending');

      const colors = colorStore.getColors();
      expect(colors[0]?.hex).toBe('#FFFFFF'); // Lightest first
      expect(colors[2]?.hex).toBe('#000000'); // Darkest last
    });

    it('sorts colors by luminance descending', () => {
      colorStore.addColors(['#000000', '#FFFFFF', '#808080']);
      colorStore.sortColorsPalette('luminance', 'descending');

      const colors = colorStore.getColors();
      expect(colors[0]?.hex).toBe('#000000'); // Darkest first
      expect(colors[2]?.hex).toBe('#FFFFFF'); // Lightest last
    });

    it('stores original order on first sort', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      const originalOrder = colorStore.getColors().map(c => c.hex);

      colorStore.sortColorsPalette('luminance', 'ascending');

      const state = colorStore.getState();
      expect(state.originalColorOrder.map(c => c.hex)).toEqual(originalOrder);
    });

    it('does not overwrite original order on subsequent sorts', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      colorStore.sortColorsPalette('luminance', 'ascending');
      const firstOriginal = colorStore.getState().originalColorOrder.map(c => c.hex);

      colorStore.sortColorsPalette('luminance', 'descending');

      const state = colorStore.getState();
      expect(state.originalColorOrder.map(c => c.hex)).toEqual(firstOriginal);
    });

    it('emits sort-changed and colors-changed events', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.sortColorsPalette('luminance', 'ascending');

      expect(listener).toHaveBeenCalledWith({
        type: 'sort-changed',
        criteria: 'luminance',
        direction: 'ascending',
      });
      expect(listener).toHaveBeenCalledWith({
        type: 'colors-changed',
        colors: expect.any(Array),
      });
    });

    it('updates sort state', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      colorStore.sortColorsPalette('luminance', 'descending');

      const sortState = colorStore.getSortState();
      expect(sortState.criteria).toBe('luminance');
      expect(sortState.direction).toBe('descending');
      expect(sortState.isSorted).toBe(true);
    });
  });

  describe('reorderColors', () => {
    it('reorders colors manually', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      const colors = colorStore.getColors();
      const newOrder = [colors[2]!, colors[0]!, colors[1]!]; // Reverse first and last

      colorStore.reorderColors(newOrder);

      const reordered = colorStore.getColors();
      expect(reordered[0]?.hex).toBe('#0000FF');
      expect(reordered[1]?.hex).toBe('#FF0000');
      expect(reordered[2]?.hex).toBe('#00FF00');
    });

    it('stores original order on first manual reorder', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      const originalOrder = colorStore.getColors().map(c => c.hex);
      const colors = colorStore.getColors();
      const newOrder = [colors[1]!, colors[0]!, colors[2]!];

      colorStore.reorderColors(newOrder);

      const state = colorStore.getState();
      expect(state.originalColorOrder.map(c => c.hex)).toEqual(originalOrder);
    });

    it('sets sort criteria to manual', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      colorStore.sortColorsPalette('luminance', 'ascending');

      const colors = colorStore.getColors();
      colorStore.reorderColors([colors[1]!, colors[0]!, colors[2]!]);

      const sortState = colorStore.getSortState();
      expect(sortState.criteria).toBe('manual');
    });

    it('warns and does nothing if length mismatch', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      const colors = colorStore.getColors();

      colorStore.reorderColors([colors[0]!, colors[1]!]); // Only 2 colors

      expect(consoleSpy).toHaveBeenCalledWith('reorderColors: newOrder length mismatch');
      expect(colorStore.getColors()).toHaveLength(3); // Unchanged
      consoleSpy.mockRestore();
    });
  });

  describe('resetToOriginalOrder', () => {
    it('restores original insertion order after sorting', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      const originalOrder = colorStore.getColors().map(c => c.hex);

      colorStore.sortColorsPalette('luminance', 'ascending');
      colorStore.resetToOriginalOrder();

      const colors = colorStore.getColors();
      expect(colors.map(c => c.hex)).toEqual(originalOrder);
    });

    it('restores original order after manual reordering', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      const originalOrder = colorStore.getColors().map(c => c.hex);
      const colors = colorStore.getColors();

      colorStore.reorderColors([colors[2]!, colors[0]!, colors[1]!]);
      colorStore.resetToOriginalOrder();

      const restoredColors = colorStore.getColors();
      expect(restoredColors.map(c => c.hex)).toEqual(originalOrder);
    });

    it('clears originalColorOrder after reset', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      colorStore.sortColorsPalette('luminance', 'ascending');

      colorStore.resetToOriginalOrder();

      const state = colorStore.getState();
      expect(state.originalColorOrder).toHaveLength(0);
    });

    it('sets sort criteria to manual', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      colorStore.sortColorsPalette('luminance', 'ascending');

      colorStore.resetToOriginalOrder();

      const sortState = colorStore.getSortState();
      expect(sortState.criteria).toBe('manual');
    });

    it('emits order-reset and colors-changed events', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      colorStore.sortColorsPalette('luminance', 'ascending');
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.resetToOriginalOrder();

      expect(listener).toHaveBeenCalledWith({ type: 'order-reset' });
      expect(listener).toHaveBeenCalledWith({
        type: 'colors-changed',
        colors: expect.any(Array),
      });
    });

    it('does nothing if no original order stored', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      const currentOrder = colorStore.getColors().map(c => c.hex);

      colorStore.resetToOriginalOrder(); // No sort happened yet

      const colors = colorStore.getColors();
      expect(colors.map(c => c.hex)).toEqual(currentOrder);
    });
  });

  describe('originalColorOrder tracking with add/remove', () => {
    it('updates originalColorOrder when adding color in sorted mode', () => {
      colorStore.addColors(['#FF0000', '#00FF00']);
      colorStore.sortColorsPalette('luminance', 'ascending');

      colorStore.addColor('#0000FF');

      const state = colorStore.getState();
      expect(state.originalColorOrder.map(c => c.hex)).toContain('#0000FF');
    });

    it('does not update originalColorOrder when adding color in manual mode', () => {
      colorStore.addColors(['#FF0000', '#00FF00']);

      colorStore.addColor('#0000FF');

      const state = colorStore.getState();
      expect(state.originalColorOrder).toHaveLength(0); // Not tracking yet
    });

    it('updates originalColorOrder when removing color in sorted mode', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      colorStore.sortColorsPalette('luminance', 'ascending');
      const originalBeforeRemove = colorStore.getState().originalColorOrder.map(c => c.hex);

      // Remove the middle color (green)
      const greenIndex = colorStore.getColors().findIndex(c => c.hex === '#00FF00');
      colorStore.removeColor(greenIndex);

      const state = colorStore.getState();
      expect(state.originalColorOrder).toHaveLength(2);
      expect(state.originalColorOrder.map(c => c.hex)).not.toContain('#00FF00');
      expect(originalBeforeRemove).toContain('#00FF00'); // Was there before
    });

    it('preserves originalColorOrder structure after add and reset', () => {
      colorStore.addColors(['#FF0000', '#00FF00']);
      colorStore.sortColorsPalette('luminance', 'ascending');
      colorStore.addColor('#0000FF');

      colorStore.resetToOriginalOrder();

      const colors = colorStore.getColors();
      expect(colors.map(c => c.hex)).toEqual(['#FF0000', '#00FF00', '#0000FF']);
    });

    it('auto-sorts newly added colors when in sorted mode', () => {
      colorStore.addColors(['#FF0000', '#0000FF']);
      colorStore.sortColorsPalette('luminance', 'ascending');
      const sortedBefore = colorStore.getColors().map(c => c.hex);

      colorStore.addColor('#00FF00'); // Green - high luminance

      const colors = colorStore.getColors();
      expect(colors).toHaveLength(3);
      // Should be sorted by luminance (ascending = lightest first)
      // Green (#00FF00) has high luminance, so should be near the top
      const greenIndex = colors.findIndex(c => c.hex === '#00FF00');
      expect(greenIndex).toBe(0); // Green should be first (lightest)
      expect(colors[2]?.hex).toBe('#0000FF'); // Blue should be last (darkest)
    });
  });

  describe('moveColor', () => {
    it('moves color from one index to another', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);

      colorStore.moveColor(0, 2); // Move first to last

      const colors = colorStore.getColors();
      expect(colors[2]?.hex).toBe('#FF0000');
    });

    it('returns false for invalid indices', () => {
      colorStore.addColors(['#FF0000', '#00FF00']);

      const result = colorStore.moveColor(0, 5); // Out of bounds

      expect(result).toBe(false);
    });

    it('emits colors-changed event', () => {
      colorStore.addColors(['#FF0000', '#00FF00', '#0000FF']);
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.moveColor(0, 1);

      expect(listener).toHaveBeenCalledWith({
        type: 'colors-changed',
        colors: expect.any(Array),
      });
    });
  });
});
