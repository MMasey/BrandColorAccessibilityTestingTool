/**
 * Tests for color sorting utilities
 */

import { describe, it, expect } from 'vitest';
import type { Color } from './color-types';
import {
  sortByLuminance,
  sortByContrastScore,
  sortByPassRate,
  sortByHue,
  sortAlphabetically,
  sortColors,
  getSortCriteriaLabel,
} from './color-sorting';

// Test color palette
const testColors: Color[] = [
  {
    hex: '#FFFFFF',
    rgb: { r: 255, g: 255, b: 255 },
    hsl: { h: 0, s: 0, l: 100 },
    label: 'White',
  },
  {
    hex: '#000000',
    rgb: { r: 0, g: 0, b: 0 },
    hsl: { h: 0, s: 0, l: 0 },
    label: 'Black',
  },
  {
    hex: '#FF0000',
    rgb: { r: 255, g: 0, b: 0 },
    hsl: { h: 0, s: 100, l: 50 },
    label: 'Red',
  },
  {
    hex: '#00FF00',
    rgb: { r: 0, g: 255, b: 0 },
    hsl: { h: 120, s: 100, l: 50 },
    label: 'Green',
  },
  {
    hex: '#0000FF',
    rgb: { r: 0, g: 0, b: 255 },
    hsl: { h: 240, s: 100, l: 50 },
    label: 'Blue',
  },
];

describe('color-sorting', () => {
  describe('sortByLuminance', () => {
    it('sorts colors from lightest to darkest (ascending)', () => {
      const sorted = sortByLuminance(testColors, 'ascending');

      // White should be first (lightest), Black should be last (darkest)
      expect(sorted[0].hex).toBe('#FFFFFF');
      expect(sorted[sorted.length - 1].hex).toBe('#000000');
    });

    it('sorts colors from darkest to lightest (descending)', () => {
      const sorted = sortByLuminance(testColors, 'descending');

      // Black should be first (darkest), White should be last (lightest)
      expect(sorted[0].hex).toBe('#000000');
      expect(sorted[sorted.length - 1].hex).toBe('#FFFFFF');
    });

    it('handles empty array', () => {
      const sorted = sortByLuminance([], 'ascending');
      expect(sorted).toEqual([]);
    });

    it('handles single color', () => {
      const sorted = sortByLuminance([testColors[0]], 'ascending');
      expect(sorted).toEqual([testColors[0]]);
    });
  });

  describe('sortByHue', () => {
    it('sorts colors by hue in ROYGBIV order (ascending)', () => {
      const sorted = sortByHue(testColors, 'ascending');

      // Red (0°) should come before Green (120°) and Blue (240°)
      const redIndex = sorted.findIndex(c => c.hex === '#FF0000');
      const greenIndex = sorted.findIndex(c => c.hex === '#00FF00');
      const blueIndex = sorted.findIndex(c => c.hex === '#0000FF');

      expect(redIndex).toBeLessThan(greenIndex);
      expect(greenIndex).toBeLessThan(blueIndex);
    });

    it('sorts achromatic colors (white/black) to end when ascending', () => {
      const sorted = sortByHue(testColors, 'ascending');

      // Achromatic colors (saturation = 0) should be at the end
      const whiteIndex = sorted.findIndex(c => c.hex === '#FFFFFF');
      const blackIndex = sorted.findIndex(c => c.hex === '#000000');
      const redIndex = sorted.findIndex(c => c.hex === '#FF0000');

      expect(whiteIndex).toBeGreaterThan(redIndex);
      expect(blackIndex).toBeGreaterThan(redIndex);
    });
  });

  describe('sortAlphabetically', () => {
    it('sorts colors alphabetically by label (ascending)', () => {
      const sorted = sortAlphabetically(testColors, 'ascending');

      // Black should come before White alphabetically
      const blackIndex = sorted.findIndex(c => c.label === 'Black');
      const whiteIndex = sorted.findIndex(c => c.label === 'White');

      expect(blackIndex).toBeLessThan(whiteIndex);
    });

    it('sorts colors alphabetically by label (descending)', () => {
      const sorted = sortAlphabetically(testColors, 'descending');

      // White should come before Black in descending order
      const blackIndex = sorted.findIndex(c => c.label === 'Black');
      const whiteIndex = sorted.findIndex(c => c.label === 'White');

      expect(whiteIndex).toBeLessThan(blackIndex);
    });

    it('uses hex value for colors without labels', () => {
      const colorsWithoutLabels: Color[] = [
        {
          hex: '#CCCCCC',
          rgb: { r: 204, g: 204, b: 204 },
          hsl: { h: 0, s: 0, l: 80 },
        },
        {
          hex: '#AAAAAA',
          rgb: { r: 170, g: 170, b: 170 },
          hsl: { h: 0, s: 0, l: 67 },
        },
      ];

      const sorted = sortAlphabetically(colorsWithoutLabels, 'ascending');

      // #AAAAAA should come before #CCCCCC
      expect(sorted[0].hex).toBe('#AAAAAA');
      expect(sorted[1].hex).toBe('#CCCCCC');
    });
  });

  describe('sortByContrastScore', () => {
    it('calculates average contrast correctly', () => {
      // White and Black have the highest contrast (21:1) against each other
      // So both should have high average contrast scores
      const sorted = sortByContrastScore(testColors, 'descending');

      // White or Black should be first (highest average contrast)
      const firstColor = sorted[0].hex;
      expect(firstColor === '#FFFFFF' || firstColor === '#000000').toBe(true);
    });

    it('handles palette with single color', () => {
      const sorted = sortByContrastScore([testColors[0]], 'ascending');
      expect(sorted).toEqual([testColors[0]]);
    });
  });

  describe('sortByPassRate', () => {
    it('calculates WCAG pass rate correctly', () => {
      // White and Black should have high pass rates (they contrast well with most colors)
      const sorted = sortByPassRate(testColors, 'descending');

      // White or Black should be first (highest pass rate)
      const firstColor = sorted[0].hex;
      expect(firstColor === '#FFFFFF' || firstColor === '#000000').toBe(true);
    });

    it('returns 0% pass rate for single color', () => {
      const sorted = sortByPassRate([testColors[0]], 'ascending');
      expect(sorted).toEqual([testColors[0]]);
    });
  });

  describe('sortColors', () => {
    it('dispatches to correct algorithm based on criteria', () => {
      const byLuminance = sortColors(testColors, 'luminance', 'ascending');
      const byHue = sortColors(testColors, 'hue', 'ascending');
      const byAlpha = sortColors(testColors, 'alphabetical', 'ascending');

      // Results should differ based on criteria
      expect(byLuminance[0].hex).not.toBe(byHue[0].hex);
      expect(byAlpha[0].hex).not.toBe(byLuminance[0].hex);
    });

    it('returns original order for manual criteria', () => {
      const sorted = sortColors(testColors, 'manual', 'ascending');
      expect(sorted).toEqual(testColors);
    });

    it('does not mutate original array', () => {
      const original = [...testColors];
      sortColors(testColors, 'luminance', 'ascending');
      expect(testColors).toEqual(original);
    });
  });

  describe('getSortCriteriaLabel', () => {
    it('returns correct labels for each criteria', () => {
      expect(getSortCriteriaLabel('luminance', 'ascending')).toContain('Luminance');
      expect(getSortCriteriaLabel('contrast', 'ascending')).toContain('Contrast Score');
      expect(getSortCriteriaLabel('pass-rate', 'ascending')).toContain('Pass Rate');
      expect(getSortCriteriaLabel('hue', 'ascending')).toContain('Hue');
      expect(getSortCriteriaLabel('alphabetical', 'ascending')).toContain('Alphabetical');
      expect(getSortCriteriaLabel('manual', 'ascending')).toBe('Manual Order');
    });

    it('includes direction indicators', () => {
      expect(getSortCriteriaLabel('luminance', 'ascending')).toContain('↑');
      expect(getSortCriteriaLabel('luminance', 'descending')).toContain('↓');
    });
  });
});
