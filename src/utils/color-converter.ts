/**
 * Color conversion utilities
 * Convert between hex, RGB, and HSL formats
 */

import type { RGB, HSL, Color } from './color-types';
import { parseColorToRgb, hslToRgb, detectColorFormat, parseHslString } from './color-parser';

/**
 * Convert RGB to hex string
 * @returns Uppercase hex string with # prefix (e.g., "#FF5500")
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number): string => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    // Achromatic
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default: // case b
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert hex string to RGB
 */
export function hexToRgb(hex: string): RGB | null {
  return parseColorToRgb(hex);
}

/**
 * Convert hex string to HSL
 */
export function hexToHsl(hex: string): HSL | null {
  const rgb = parseColorToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb);
}

/**
 * Convert HSL to hex string
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

/**
 * Create a full Color object from any valid color input
 * @param input - Color string in hex, RGB, or HSL format
 * @param label - Optional label/name for the color
 */
export function createColor(input: string, label?: string): Color | null {
  const format = detectColorFormat(input);

  let rgb: RGB | null = null;
  let hsl: HSL;

  switch (format) {
    case 'hex':
    case 'hex-short':
    case 'rgb':
      rgb = parseColorToRgb(input);
      if (!rgb) return null;
      hsl = rgbToHsl(rgb);
      break;

    case 'hsl':
      const parsedHsl = parseHslString(input);
      if (!parsedHsl) return null;
      hsl = parsedHsl;
      rgb = hslToRgb(hsl);
      break;

    default:
      return null;
  }

  return {
    hex: rgbToHex(rgb),
    rgb,
    hsl,
    label,
  };
}

/**
 * Format RGB as CSS rgb() function
 */
export function formatRgb(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Format HSL as CSS hsl() function
 */
export function formatHsl(hsl: HSL): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}
