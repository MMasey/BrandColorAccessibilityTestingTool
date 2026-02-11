/**
 * Color Palette Sorting Utilities
 *
 * Provides various sorting algorithms for color palettes based on:
 * - Luminance (lightest to darkest)
 * - Contrast score (average contrast across palette)
 * - WCAG pass rate (percentage of passing combinations)
 * - Hue (color wheel order: ROYGBIV)
 * - Alphabetical (by label)
 */

import type { Color } from './color-types';
import { getRelativeLuminance, getContrastRatio, WCAG_THRESHOLDS } from './contrast';

/** Sort criteria types */
export type SortCriteria = 'luminance' | 'contrast' | 'pass-rate' | 'hue' | 'alphabetical' | 'manual';

/** Sort direction */
export type SortDirection = 'ascending' | 'descending';

/**
 * Calculate average contrast ratio for a color against all other colors in palette
 * @param color - The color to evaluate
 * @param palette - All colors in the palette
 * @returns Average contrast ratio
 */
function calculateAverageContrast(color: Color, palette: Color[]): number {
  if (palette.length <= 1) return 0;

  let totalContrast = 0;
  let comparisons = 0;

  for (const other of palette) {
    // Don't compare color with itself
    if (other === color) continue;

    totalContrast += getContrastRatio(color.rgb, other.rgb);
    comparisons++;
  }

  return comparisons > 0 ? totalContrast / comparisons : 0;
}

/**
 * Calculate WCAG AA pass rate for a color against all other colors
 * @param color - The color to evaluate
 * @param palette - All colors in the palette
 * @returns Pass rate as percentage (0-100)
 */
function calculatePassRate(color: Color, palette: Color[]): number {
  if (palette.length <= 1) return 0;

  let passed = 0;
  let comparisons = 0;

  const aaThreshold = WCAG_THRESHOLDS.normal.AA; // 4.5:1

  for (const other of palette) {
    // Don't compare color with itself
    if (other === color) continue;

    const ratio = getContrastRatio(color.rgb, other.rgb);
    if (ratio >= aaThreshold) {
      passed++;
    }
    comparisons++;
  }

  return comparisons > 0 ? (passed / comparisons) * 100 : 0;
}

/**
 * Sort colors by luminance (lightest to darkest)
 */
export function sortByLuminance(colors: Color[], direction: SortDirection = 'ascending'): Color[] {
  const sorted = [...colors].sort((a, b) => {
    const lumA = getRelativeLuminance(a.rgb);
    const lumB = getRelativeLuminance(b.rgb);
    return direction === 'ascending' ? lumB - lumA : lumA - lumB; // Lightest first when ascending
  });

  return sorted;
}

/**
 * Sort colors by average contrast score
 * Higher score = works better with more colors
 */
export function sortByContrastScore(colors: Color[], direction: SortDirection = 'ascending'): Color[] {
  const withScores = colors.map(color => ({
    color,
    score: calculateAverageContrast(color, colors),
  }));

  withScores.sort((a, b) => {
    return direction === 'ascending' ? a.score - b.score : b.score - a.score;
  });

  return withScores.map(item => item.color);
}

/**
 * Sort colors by WCAG AA pass rate
 * Higher rate = passes more combinations
 */
export function sortByPassRate(colors: Color[], direction: SortDirection = 'ascending'): Color[] {
  const withRates = colors.map(color => ({
    color,
    rate: calculatePassRate(color, colors),
  }));

  withRates.sort((a, b) => {
    return direction === 'ascending' ? a.rate - b.rate : b.rate - a.rate;
  });

  return withRates.map(item => item.color);
}

/**
 * Sort colors by hue (color wheel order: ROYGBIV)
 * Red (0°) → Orange (30°) → Yellow (60°) → Green (120°) → Blue (240°) → Purple (300°)
 */
export function sortByHue(colors: Color[], direction: SortDirection = 'ascending'): Color[] {
  const sorted = [...colors].sort((a, b) => {
    // For achromatic colors (s=0), sort by lightness
    if (a.hsl.s === 0 && b.hsl.s === 0) {
      return direction === 'ascending' ? a.hsl.l - b.hsl.l : b.hsl.l - a.hsl.l;
    }
    // Achromatic colors go to end when ascending (or start when descending)
    if (a.hsl.s === 0) return direction === 'ascending' ? 1 : -1;
    if (b.hsl.s === 0) return direction === 'ascending' ? -1 : 1;

    // Sort by hue
    return direction === 'ascending' ? a.hsl.h - b.hsl.h : b.hsl.h - a.hsl.h;
  });

  return sorted;
}

/**
 * Sort colors alphabetically by label
 * Colors without labels go to end
 */
export function sortAlphabetically(colors: Color[], direction: SortDirection = 'ascending'): Color[] {
  const sorted = [...colors].sort((a, b) => {
    const labelA = a.label?.toLowerCase() || a.hex.toLowerCase();
    const labelB = b.label?.toLowerCase() || b.hex.toLowerCase();

    // Colors with labels come before colors without labels
    if (a.label && !b.label) return -1;
    if (!a.label && b.label) return 1;

    if (direction === 'ascending') {
      return labelA.localeCompare(labelB);
    } else {
      return labelB.localeCompare(labelA);
    }
  });

  return sorted;
}

/**
 * Main sorting function that dispatches to the appropriate algorithm
 * @param colors - Array of colors to sort
 * @param criteria - Sort criteria
 * @param direction - Sort direction
 * @returns Sorted array of colors
 */
export function sortColors(
  colors: Color[],
  criteria: SortCriteria,
  direction: SortDirection = 'ascending'
): Color[] {
  if (colors.length <= 1) return [...colors];

  switch (criteria) {
    case 'luminance':
      return sortByLuminance(colors, direction);
    case 'contrast':
      return sortByContrastScore(colors, direction);
    case 'pass-rate':
      return sortByPassRate(colors, direction);
    case 'hue':
      return sortByHue(colors, direction);
    case 'alphabetical':
      return sortAlphabetically(colors, direction);
    case 'manual':
      // Manual sorting means don't sort - return original order
      return [...colors];
    default:
      return [...colors];
  }
}

/**
 * Get a human-readable description of a sort criteria
 */
export function getSortCriteriaLabel(criteria: SortCriteria, direction: SortDirection): string {
  const dirLabel = direction === 'ascending' ? '↑' : '↓';

  switch (criteria) {
    case 'luminance':
      return `${dirLabel} Luminance (${direction === 'ascending' ? 'lightest first' : 'darkest first'})`;
    case 'contrast':
      return `${dirLabel} Contrast Score (${direction === 'ascending' ? 'low to high' : 'high to low'})`;
    case 'pass-rate':
      return `${dirLabel} Pass Rate (${direction === 'ascending' ? 'low to high' : 'high to low'})`;
    case 'hue':
      return `${dirLabel} Hue (${direction === 'ascending' ? 'ROYGBIV' : 'reverse'})`;
    case 'alphabetical':
      return `${dirLabel} Alphabetical (${direction === 'ascending' ? 'A-Z' : 'Z-A'})`;
    case 'manual':
      return 'Manual Order';
    default:
      return 'Unknown';
  }
}
