/**
 * Contrast Pair Grouping
 *
 * Pure functions for flattening a contrast matrix into colour pairs
 * grouped by WCAG compliance level. Used by the list view (feature 107),
 * which presents the same results as the contrast grid in a linear,
 * screen-reader-friendly structure.
 */

import type { Color, ContrastResult, WCAGLevel } from './color-types';

/**
 * A single colour pairing with its contrast result.
 * WCAG contrast is symmetric (the formula compares the lighter and darker
 * luminance regardless of which is text), so pairs are unordered: colorA is
 * simply the colour that appears earlier in the palette.
 */
export interface ContrastPair {
  colorA: Color;
  colorB: Color;
  result: ContrastResult;
}

/** Pairs bucketed under one WCAG level */
export interface ContrastPairGroup {
  level: WCAGLevel;
  pairs: ContrastPair[];
}

/** Display order for level groups: best compliance first */
export const PAIR_GROUP_ORDER: WCAGLevel[] = ['AAA', 'AA', 'AA18', 'DNP'];

/**
 * Flatten a contrast matrix into unordered pairs grouped by WCAG level.
 *
 * - Each unordered pair appears once: the ratio and level are identical in
 *   both directions, so "White on Black" would only duplicate "Black on
 *   White" (upper triangle of the matrix)
 * - Same-colour diagonal entries are excluded: they are structural markers
 *   in the grid, not real results
 * - Groups follow PAIR_GROUP_ORDER; empty groups are omitted entirely
 * - Pair order within a group follows matrix (row-major) order, matching
 *   the reading order of the table view
 *
 * @param colors - Colour palette in display order
 * @param matrix - Result of generateContrastMatrix(colors)
 */
export function groupContrastPairs(
  colors: Color[],
  matrix: ContrastResult[][]
): ContrastPairGroup[] {
  const buckets = new Map<WCAGLevel, ContrastPair[]>(
    PAIR_GROUP_ORDER.map((level) => [level, []])
  );

  colors.forEach((colorA, aIndex) => {
    colors.forEach((colorB, bIndex) => {
      if (bIndex <= aIndex) return;
      const result = matrix[aIndex]?.[bIndex];
      if (!result) return;
      buckets.get(result.level)?.push({ colorA, colorB, result });
    });
  });

  return PAIR_GROUP_ORDER
    .map((level) => ({ level, pairs: buckets.get(level) ?? [] }))
    .filter((group) => group.pairs.length > 0);
}
