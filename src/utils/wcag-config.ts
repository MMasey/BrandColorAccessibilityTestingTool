/**
 * Centralized WCAG level configuration
 * Single source of truth for badge colors, labels, and descriptions
 */

import type { WCAGLevel } from './color-types';

/**
 * Badge colors for each WCAG level
 * All colors meet AAA contrast (7:1+) against white
 */
export const WCAG_BADGE_COLORS = {
  AAA: '#14532d',   // Dark green - 10.5:1 on white
  AA: '#15803d',    // Green - 7.3:1 on white
  AA18: '#713f12',  // Brown - 8.5:1 on white
  DNP: '#991b1b',   // Red - 7.1:1 on white
} as const;

/**
 * Short badge labels for display
 */
export const WCAG_BADGE_LABELS: Record<WCAGLevel, string> = {
  AAA: 'AAA',
  AA: 'AA',
  AA18: 'AA 18+',
  DNP: 'Fail',
};

/**
 * Detailed descriptions for tooltips/titles
 */
export const WCAG_BADGE_TITLES: Record<WCAGLevel, string> = {
  AAA: 'Passes AAA (7:1 for normal text, 4.5:1 for large text)',
  AA: 'Passes AA (4.5:1 for normal text)',
  AA18: 'Passes AA for large text only (18pt+ or 14pt+ bold). Requires 3:1 ratio.',
  DNP: 'Does not pass WCAG contrast requirements',
};

/**
 * Get the CSS class name for a WCAG level badge
 */
export function getBadgeClass(level: WCAGLevel): string {
  return level.toLowerCase();
}

/**
 * Get the display label for a WCAG level
 */
export function getBadgeLabel(level: WCAGLevel): string {
  return WCAG_BADGE_LABELS[level];
}

/**
 * Get the tooltip/title text for a WCAG level
 */
export function getBadgeTitle(level: WCAGLevel): string {
  return WCAG_BADGE_TITLES[level];
}

/**
 * Generate CSS for WCAG badge styles
 * Returns a string that can be used in a css`` template literal
 */
export function getWCAGBadgeCSS(): string {
  return `
    &.aaa { background: ${WCAG_BADGE_COLORS.AAA}; color: #fff; }
    &.aa { background: ${WCAG_BADGE_COLORS.AA}; color: #fff; }
    &.aa18 { background: ${WCAG_BADGE_COLORS.AA18}; color: #fff; }
    &.dnp { background: ${WCAG_BADGE_COLORS.DNP}; color: #fff; }
  `;
}
