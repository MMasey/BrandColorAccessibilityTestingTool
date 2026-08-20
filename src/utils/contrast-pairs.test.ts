/**
 * Contrast Pair Grouping Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { createColor } from './color-converter';
import { generateContrastMatrix } from './contrast';
import { groupContrastPairs } from './contrast-pairs';
import type { Color } from './color-types';

function makeColors(inputs: [string, string?][]): Color[] {
  return inputs.map(([hex, label]) => {
    const color = createColor(hex, label);
    if (!color) throw new Error(`Invalid test color: ${hex}`);
    return color;
  });
}

describe('groupContrastPairs', () => {
  it('returns empty array for empty palette', () => {
    expect(groupContrastPairs([], [])).toEqual([]);
  });

  it('returns empty array for a single colour (no pairs)', () => {
    const colors = makeColors([['#000000']]);
    const matrix = generateContrastMatrix(colors);

    expect(groupContrastPairs(colors, matrix)).toEqual([]);
  });

  it('lists each unordered pair exactly once (contrast is symmetric)', () => {
    const colors = makeColors([['#000000'], ['#FFFFFF'], ['#767676']]);
    const matrix = generateContrastMatrix(colors);

    const groups = groupContrastPairs(colors, matrix);
    const totalPairs = groups.reduce((sum, g) => sum + g.pairs.length, 0);

    // 3 colours = 3 unordered pairs (not 6 directional ones, not 9 cells)
    expect(totalPairs).toBe(3);
  });

  it('excludes same-colour diagonal entries', () => {
    const colors = makeColors([['#000000'], ['#FFFFFF']]);
    const matrix = generateContrastMatrix(colors);

    const groups = groupContrastPairs(colors, matrix);
    const totalPairs = groups.reduce((sum, g) => sum + g.pairs.length, 0);

    expect(totalPairs).toBe(1);
  });

  it('buckets the black/white pair under AAA', () => {
    const colors = makeColors([['#000000', 'Black'], ['#FFFFFF', 'White']]);
    const matrix = generateContrastMatrix(colors);

    const groups = groupContrastPairs(colors, matrix);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.level).toBe('AAA');
    expect(groups[0]?.pairs).toHaveLength(1);
    expect(groups[0]?.pairs[0]?.result.ratioString).toBe('21:1');
  });

  it('sets colorA to the colour that appears earlier in the palette', () => {
    const colors = makeColors([['#000000', 'Black'], ['#FFFFFF', 'White']]);
    const matrix = generateContrastMatrix(colors);

    const pair = groupContrastPairs(colors, matrix)[0]?.pairs[0];

    expect(pair?.colorA.label).toBe('Black');
    expect(pair?.colorB.label).toBe('White');
  });

  it('omits empty groups entirely', () => {
    // Black on white is AAA only - no AA, AA18, or DNP groups expected
    const colors = makeColors([['#000000'], ['#FFFFFF']]);
    const matrix = generateContrastMatrix(colors);

    const groups = groupContrastPairs(colors, matrix);
    const levels = groups.map((g) => g.level);

    expect(levels).not.toContain('AA');
    expect(levels).not.toContain('AA18');
    expect(levels).not.toContain('DNP');
  });

  it('orders groups AAA, AA, AA18, DNP', () => {
    // Palette chosen to produce a spread of levels, including failures
    const colors = makeColors([
      ['#000000', 'Black'],
      ['#FFFFFF', 'White'],
      ['#767676', 'Mid Gray'],
      ['#CCCCCC', 'Light Gray'],
    ]);
    const matrix = generateContrastMatrix(colors);

    const groups = groupContrastPairs(colors, matrix);
    const levels = groups.map((g) => g.level);

    // Whatever subset is present must follow the canonical order
    const canonical = ['AAA', 'AA', 'AA18', 'DNP'];
    const indices = levels.map((l) => canonical.indexOf(l));
    expect([...indices].sort((a, b) => a - b)).toEqual(indices);

    // This palette produces both passing and failing combinations
    expect(levels).toContain('AAA');
    expect(levels).toContain('DNP');
  });

  it('preserves matrix (row-major) order within a group', () => {
    // Black pairs with both greys at AA level; black/mid-grey comes first
    // in reading order (row 0 before row 0 column 3... i.e. lower indices first)
    const colors = makeColors([
      ['#000000', 'Black'],
      ['#767676', 'Mid Gray'],
      ['#949494', 'Silver'],
    ]);
    const matrix = generateContrastMatrix(colors);

    const groups = groupContrastPairs(colors, matrix);
    for (const group of groups) {
      const positions = group.pairs.map(({ colorA, colorB }) => {
        const a = colors.findIndex((c) => c === colorA);
        const b = colors.findIndex((c) => c === colorB);
        return a * colors.length + b;
      });
      expect([...positions].sort((x, y) => x - y)).toEqual(positions);
    }
  });
});
