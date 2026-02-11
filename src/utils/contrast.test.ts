/**
 * Contrast Calculation Unit Tests
 *
 * Tests contrast ratio calculations against WebAIM reference values
 * to ensure accessibility assessments are accurate.
 *
 * Reference: https://webaim.org/resources/contrastchecker/
 */

import { describe, it, expect } from 'vitest';
import {
  getRelativeLuminance,
  getContrastRatio,
  formatContrastRatio,
  getWCAGLevel,
  meetsWCAGLevel,
  getContrastResult,
  WCAG_THRESHOLDS,
} from './contrast';
import type { RGB } from './color-types';

// Helper to create RGB from hex for cleaner tests
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex: ${hex}`);
  return {
    r: parseInt(result[1]!, 16),
    g: parseInt(result[2]!, 16),
    b: parseInt(result[3]!, 16),
  };
}

describe('getRelativeLuminance', () => {
  it('calculates luminance for pure colors', () => {
    // Black should have luminance 0
    expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);

    // White should have luminance 1
    expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);

    // Pure red
    expect(getRelativeLuminance({ r: 255, g: 0, b: 0 })).toBeCloseTo(0.2126, 4);

    // Pure green (most luminant primary)
    expect(getRelativeLuminance({ r: 0, g: 255, b: 0 })).toBeCloseTo(0.7152, 4);

    // Pure blue (least luminant primary)
    expect(getRelativeLuminance({ r: 0, g: 0, b: 255 })).toBeCloseTo(0.0722, 4);
  });

  it('calculates luminance for greys correctly', () => {
    // Mid-grey (128, 128, 128) should be around 0.2159
    const midGray = getRelativeLuminance({ r: 128, g: 128, b: 128 });
    expect(midGray).toBeGreaterThan(0.2);
    expect(midGray).toBeLessThan(0.22);
  });
});

describe('getContrastRatio', () => {
  /**
   * Reference values verified against WebAIM Contrast Checker
   * https://webaim.org/resources/contrastchecker/
   */

  it('calculates maximum contrast (black/white)', () => {
    const black: RGB = { r: 0, g: 0, b: 0 };
    const white: RGB = { r: 255, g: 255, b: 255 };

    // Maximum possible contrast is 21:1
    expect(getContrastRatio(black, white)).toBeCloseTo(21, 1);
    expect(getContrastRatio(white, black)).toBeCloseTo(21, 1);
  });

  it('calculates minimum contrast (same color)', () => {
    const red: RGB = { r: 255, g: 0, b: 0 };

    // Same color should have contrast 1:1
    expect(getContrastRatio(red, red)).toBeCloseTo(1, 5);
  });

  it('calculates expected ratios for common color pairs', () => {
    // #767676 (mid-grey) should have similar contrast against black and white
    // This is the "minimum grey" that passes AA against both
    const grayVsBlack = getContrastRatio(hexToRgb('#767676'), hexToRgb('#000000'));
    const grayVsWhite = getContrastRatio(hexToRgb('#767676'), hexToRgb('#FFFFFF'));

    // Both should be around 4.5+ (AA compliant)
    expect(grayVsBlack).toBeGreaterThan(4.5);
    expect(grayVsWhite).toBeGreaterThan(4.5);

    // They should be reasonably close to each other
    expect(Math.abs(grayVsBlack - grayVsWhite)).toBeLessThan(0.3);

    // Pure red vs white - should be around 4:1 (fails AA normal, passes AA large)
    const redVsWhite = getContrastRatio(hexToRgb('#FF0000'), hexToRgb('#FFFFFF'));
    expect(redVsWhite).toBeGreaterThan(3.5);
    expect(redVsWhite).toBeLessThan(4.5);

    // Dark green vs white - should pass AA
    const greenVsWhite = getContrastRatio(hexToRgb('#008000'), hexToRgb('#FFFFFF'));
    expect(greenVsWhite).toBeGreaterThan(4.5);
  });

  it('produces correct relative luminance ordering', () => {
    // White should have highest luminance
    // Yellow should be brighter than blue
    // Black should have lowest luminance
    const white = getRelativeLuminance(hexToRgb('#FFFFFF'));
    const yellow = getRelativeLuminance(hexToRgb('#FFFF00'));
    const blue = getRelativeLuminance(hexToRgb('#0000FF'));
    const black = getRelativeLuminance(hexToRgb('#000000'));

    expect(white).toBeGreaterThan(yellow);
    expect(yellow).toBeGreaterThan(blue);
    expect(blue).toBeGreaterThan(black);
  });

  it('is order-independent (commutative)', () => {
    const color1 = hexToRgb('#3366FF');
    const color2 = hexToRgb('#FFCC00');

    expect(getContrastRatio(color1, color2)).toBe(getContrastRatio(color2, color1));
  });
});

describe('formatContrastRatio', () => {
  it('formats whole numbers cleanly', () => {
    expect(formatContrastRatio(21)).toBe('21:1');
    expect(formatContrastRatio(7)).toBe('7:1');
    expect(formatContrastRatio(1)).toBe('1:1');
  });

  it('formats decimals appropriately', () => {
    expect(formatContrastRatio(4.5)).toBe('4.5:1');
    expect(formatContrastRatio(4.54)).toBe('4.54:1');
    expect(formatContrastRatio(4.547)).toBe('4.55:1'); // Rounds to 2 decimals
  });
});

describe('getWCAGLevel', () => {
  describe('normal text', () => {
    it('returns AAA for ratio >= 7', () => {
      expect(getWCAGLevel(7, 'normal')).toBe('AAA');
      expect(getWCAGLevel(21, 'normal')).toBe('AAA');
    });

    it('returns AA for ratio >= 4.5 but < 7', () => {
      expect(getWCAGLevel(4.5, 'normal')).toBe('AA');
      expect(getWCAGLevel(6.99, 'normal')).toBe('AA');
    });

    it('returns AA18 for ratio >= 3 but < 4.5 (large text only)', () => {
      expect(getWCAGLevel(3, 'normal')).toBe('AA18');
      expect(getWCAGLevel(4.49, 'normal')).toBe('AA18');
    });

    it('returns DNP for ratio < 3', () => {
      expect(getWCAGLevel(2.99, 'normal')).toBe('DNP');
      expect(getWCAGLevel(1, 'normal')).toBe('DNP');
    });
  });

  describe('large text', () => {
    it('returns AAA for ratio >= 4.5', () => {
      expect(getWCAGLevel(4.5, 'large')).toBe('AAA');
      expect(getWCAGLevel(21, 'large')).toBe('AAA');
    });

    it('returns AA for ratio >= 3 but < 4.5', () => {
      expect(getWCAGLevel(3, 'large')).toBe('AA');
      expect(getWCAGLevel(4.49, 'large')).toBe('AA');
    });

    it('returns DNP for ratio < 3', () => {
      expect(getWCAGLevel(2.99, 'large')).toBe('DNP');
      expect(getWCAGLevel(1, 'large')).toBe('DNP');
    });
  });
});

describe('meetsWCAGLevel', () => {
  it('correctly evaluates AA compliance', () => {
    expect(meetsWCAGLevel(4.5, 'AA', 'normal')).toBe(true);
    expect(meetsWCAGLevel(4.49, 'AA', 'normal')).toBe(false);
    expect(meetsWCAGLevel(3, 'AA', 'large')).toBe(true);
    expect(meetsWCAGLevel(2.99, 'AA', 'large')).toBe(false);
  });

  it('correctly evaluates AAA compliance', () => {
    expect(meetsWCAGLevel(7, 'AAA', 'normal')).toBe(true);
    expect(meetsWCAGLevel(6.99, 'AAA', 'normal')).toBe(false);
    expect(meetsWCAGLevel(4.5, 'AAA', 'large')).toBe(true);
    expect(meetsWCAGLevel(4.49, 'AAA', 'large')).toBe(false);
  });
});

describe('getContrastResult', () => {
  it('returns complete contrast result object', () => {
    const black: RGB = { r: 0, g: 0, b: 0 };
    const white: RGB = { r: 255, g: 255, b: 255 };

    const result = getContrastResult(black, white, 'normal');

    expect(result.ratio).toBeCloseTo(21, 1);
    expect(result.ratioString).toBe('21:1');
    expect(result.level).toBe('AAA');
    expect(result.meetsAA).toBe(true);
    expect(result.meetsAAA).toBe(true);
  });

  it('handles edge cases correctly', () => {
    // Low contrast example
    const lightGray = hexToRgb('#CCCCCC');
    const white = hexToRgb('#FFFFFF');

    const result = getContrastResult(lightGray, white, 'normal');

    expect(result.ratio).toBeLessThan(3);
    expect(result.level).toBe('DNP');
    expect(result.meetsAA).toBe(false);
    expect(result.meetsAAA).toBe(false);
  });
});

describe('WCAG_THRESHOLDS', () => {
  it('has correct threshold values', () => {
    expect(WCAG_THRESHOLDS.normal.AA).toBe(4.5);
    expect(WCAG_THRESHOLDS.normal.AAA).toBe(7);
    expect(WCAG_THRESHOLDS.large.AA).toBe(3);
    expect(WCAG_THRESHOLDS.large.AAA).toBe(4.5);
    expect(WCAG_THRESHOLDS.ui.AA).toBe(3);
  });
});
