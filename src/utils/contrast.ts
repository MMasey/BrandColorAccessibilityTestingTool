/**
 * WCAG 2.1 Contrast calculation utilities
 *
 * Implements the contrast ratio formula from WCAG 2.1:
 * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */

import type { RGB, WCAGLevel, TextSize, ContrastResult, Color } from './color-types';

/**
 * WCAG 2.1 Contrast thresholds
 */
export const WCAG_THRESHOLDS = {
  // Normal text (< 18pt or < 14pt bold)
  normal: {
    AA: 4.5,
    AAA: 7,
  },
  // Large text (>= 18pt or >= 14pt bold)
  large: {
    AA: 3,
    AAA: 4.5,
  },
  // UI components and graphical objects
  ui: {
    AA: 3,
  },
} as const;

/**
 * Convert a single sRGB channel to linear RGB
 * Applies gamma correction per WCAG specification
 *
 * @param channel - sRGB value (0-255)
 * @returns Linear RGB value (0-1)
 */
function srgbToLinear(channel: number): number {
  const normalized = channel / 255;

  // Apply gamma correction
  // The threshold 0.03928 is from the WCAG spec (some sources use 0.04045)
  if (normalized <= 0.03928) {
    return normalized / 12.92;
  }
  return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance of a color
 * Per WCAG 2.1 specification
 *
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * Where R, G, B are linear RGB values
 *
 * @param rgb - RGB color
 * @returns Relative luminance (0-1)
 */
export function getRelativeLuminance(rgb: RGB): number {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Per WCAG 2.1 specification
 *
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 * Where L1 is the lighter color's luminance
 *
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: RGB, color2: RGB): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Format contrast ratio as string (e.g., "4.5:1")
 */
export function formatContrastRatio(ratio: number): string {
  // Round to 2 decimal places, but show as clean as possible
  const rounded = Math.round(ratio * 100) / 100;

  // If it's a whole number or .5, show fewer decimals
  if (rounded === Math.floor(rounded)) {
    return `${rounded}:1`;
  }
  if (rounded * 10 === Math.floor(rounded * 10)) {
    return `${rounded.toFixed(1)}:1`;
  }
  return `${rounded.toFixed(2)}:1`;
}

/**
 * Determine WCAG compliance level based on contrast ratio and text size
 */
export function getWCAGLevel(ratio: number, textSize: TextSize): WCAGLevel {
  const thresholds = WCAG_THRESHOLDS[textSize];

  if (ratio >= thresholds.AAA) {
    return 'AAA';
  }
  if (ratio >= thresholds.AA) {
    return 'AA';
  }
  if (textSize === 'normal' && ratio >= WCAG_THRESHOLDS.large.AA) {
    // Passes AA for large text only
    return 'AA18';
  }

  return 'DNP'; // Does Not Pass
}

/**
 * Check if contrast ratio meets specific WCAG level
 */
export function meetsWCAGLevel(
  ratio: number,
  level: 'AA' | 'AAA',
  textSize: TextSize
): boolean {
  const threshold = WCAG_THRESHOLDS[textSize][level];
  return ratio >= threshold;
}

/**
 * Get full contrast result between two colors
 */
export function getContrastResult(
  foreground: RGB,
  background: RGB,
  textSize: TextSize = 'normal'
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio,
    ratioString: formatContrastRatio(ratio),
    level: getWCAGLevel(ratio, textSize),
    meetsAA: meetsWCAGLevel(ratio, 'AA', textSize),
    meetsAAA: meetsWCAGLevel(ratio, 'AAA', textSize),
  };
}

/**
 * Get contrast result using Color objects
 */
export function getColorContrastResult(
  foreground: Color,
  background: Color,
  textSize: TextSize = 'normal'
): ContrastResult {
  return getContrastResult(foreground.rgb, background.rgb, textSize);
}

/**
 * Generate a contrast matrix for an array of colors
 * Returns a 2D array where result[i][j] is the contrast between colors[i] (fg) and colors[j] (bg)
 */
export function generateContrastMatrix(
  colors: Color[],
  textSize: TextSize = 'normal'
): ContrastResult[][] {
  return colors.map((foreground) =>
    colors.map((background) =>
      getColorContrastResult(foreground, background, textSize)
    )
  );
}

/**
 * Get human-readable description of WCAG level
 */
export function getWCAGLevelDescription(level: WCAGLevel): string {
  switch (level) {
    case 'AAA':
      return 'Enhanced contrast (AAA)';
    case 'AA':
      return 'Minimum contrast (AA)';
    case 'AA18':
      return 'Large text only (AA)';
    case 'DNP':
      return 'Does not pass';
  }
}
