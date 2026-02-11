/**
 * Color parsing utilities
 * Supports hex (#RRGGBB, #RGB), RGB, and HSL formats
 */

import type { RGB, HSL, ColorFormat } from './color-types';

/** Regex patterns for color format detection */
const PATTERNS = {
  // #RGB or #RRGGBB (with or without #)
  hexFull: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
  hexShort: /^#?([a-f\d])([a-f\d])([a-f\d])$/i,

  // rgb(R, G, B) or rgb(R G B) - supports spaces or commas
  rgb: /^rgb\s*\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)$/i,

  // hsl(H, S%, L%) or hsl(H S% L%) - hue can be negative or > 360
  hsl: /^hsl\s*\(\s*(-?\d+(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%?\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%?\s*\)$/i,
} as const;

/**
 * Detect the format of a color string
 */
export function detectColorFormat(input: string): ColorFormat {
  const trimmed = input.trim();

  if (PATTERNS.hexFull.test(trimmed)) return 'hex';
  if (PATTERNS.hexShort.test(trimmed)) return 'hex-short';
  if (PATTERNS.rgb.test(trimmed)) return 'rgb';
  if (PATTERNS.hsl.test(trimmed)) return 'hsl';

  return 'invalid';
}

/**
 * Parse a hex color string to RGB
 * Supports #RGB, #RRGGBB, RGB, RRGGBB
 */
export function parseHex(input: string): RGB | null {
  const trimmed = input.trim();

  // Try full hex first (#RRGGBB)
  let match = trimmed.match(PATTERNS.hexFull);
  if (match) {
    return {
      r: parseInt(match[1]!, 16),
      g: parseInt(match[2]!, 16),
      b: parseInt(match[3]!, 16),
    };
  }

  // Try short hex (#RGB)
  match = trimmed.match(PATTERNS.hexShort);
  if (match) {
    return {
      r: parseInt(match[1]! + match[1]!, 16),
      g: parseInt(match[2]! + match[2]!, 16),
      b: parseInt(match[3]! + match[3]!, 16),
    };
  }

  return null;
}

/**
 * Parse an RGB function string to RGB
 * Supports rgb(R, G, B) and rgb(R G B)
 */
export function parseRgbString(input: string): RGB | null {
  const match = input.trim().match(PATTERNS.rgb);
  if (!match) return null;

  const r = parseInt(match[1]!, 10);
  const g = parseInt(match[2]!, 10);
  const b = parseInt(match[3]!, 10);

  // Validate ranges
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return null;
  }

  return { r, g, b };
}

/**
 * Parse an HSL function string to HSL
 * Supports hsl(H, S%, L%) and hsl(H S% L%)
 */
export function parseHslString(input: string): HSL | null {
  const match = input.trim().match(PATTERNS.hsl);
  if (!match) return null;

  const h = parseFloat(match[1]!);
  const s = parseFloat(match[2]!);
  const l = parseFloat(match[3]!);

  // Validate ranges (hue wraps, s/l are percentages)
  if (s < 0 || s > 100 || l < 0 || l > 100) {
    return null;
  }

  return {
    h: ((h % 360) + 360) % 360, // Normalize hue to 0-360
    s,
    l,
  };
}

/**
 * Parse any supported color format to RGB
 */
export function parseColorToRgb(input: string): RGB | null {
  const format = detectColorFormat(input);

  switch (format) {
    case 'hex':
    case 'hex-short':
      return parseHex(input);
    case 'rgb':
      return parseRgbString(input);
    case 'hsl':
      const hsl = parseHslString(input);
      if (!hsl) return null;
      return hslToRgb(hsl);
    default:
      return null;
  }
}

/**
 * Convert HSL to RGB
 * Based on the standard HSL to RGB conversion algorithm
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    // Achromatic (grey)
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const hueToRgb = (t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  return {
    r: Math.round(hueToRgb(h + 1 / 3) * 255),
    g: Math.round(hueToRgb(h) * 255),
    b: Math.round(hueToRgb(h - 1 / 3) * 255),
  };
}

/**
 * Validate if a string is a valid color in any supported format
 */
export function isValidColor(input: string): boolean {
  return detectColorFormat(input) !== 'invalid';
}
