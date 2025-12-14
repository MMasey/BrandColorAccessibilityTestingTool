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

    it('starts with normal text size', () => {
      expect(colorStore.getTextSize()).toBe('normal');
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

  describe('setTextSize', () => {
    it('changes text size', () => {
      colorStore.setTextSize('large');

      expect(colorStore.getTextSize()).toBe('large');
    });

    it('emits text-size-changed event', () => {
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.setTextSize('large');

      expect(listener).toHaveBeenCalledWith({
        type: 'text-size-changed',
        textSize: 'large',
      });
    });

    it('does not emit if value unchanged', () => {
      const listener = vi.fn();
      colorStore.subscribe(listener);

      colorStore.setTextSize('normal'); // Already normal

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('toggleTextSize', () => {
    it('toggles from normal to large', () => {
      const result = colorStore.toggleTextSize();

      expect(result).toBe('large');
      expect(colorStore.getTextSize()).toBe('large');
    });

    it('toggles from large to normal', () => {
      colorStore.setTextSize('large');
      const result = colorStore.toggleTextSize();

      expect(result).toBe('normal');
      expect(colorStore.getTextSize()).toBe('normal');
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
      colorStore.setTextSize('large');
      colorStore.setAlgorithm('apca');

      colorStore.reset();

      expect(colorStore.getColors()).toHaveLength(0);
      expect(colorStore.getTextSize()).toBe('normal');
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
      colorStore.setTextSize('large');
      colorStore.setAlgorithm('apca');

      const state = colorStore.getState();

      expect(state.colors).toHaveLength(1);
      expect(state.textSize).toBe('large');
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
});
