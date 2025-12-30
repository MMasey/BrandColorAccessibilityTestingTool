/**
 * Core color type definitions
 */

/** RGB color representation (0-255 range) */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** HSL color representation */
export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/** Unified color object with hex as canonical form */
export interface Color {
  hex: string;      // Canonical form: #RRGGBB (uppercase)
  rgb: RGB;
  hsl: HSL;
  label?: string;   // Optional user-defined name
}

/** WCAG compliance levels */
export type WCAGLevel = 'AAA' | 'AA' | 'AA18' | 'DNP';

/** Text size context for WCAG evaluation */
export type TextSize = 'normal' | 'large';

/** Contrast result between two colors */
export interface ContrastResult {
  ratio: number;           // The raw contrast ratio (e.g., 4.5)
  ratioString: string;     // Formatted ratio (e.g., "4.5:1")
  level: WCAGLevel;        // Compliance level for current text size
  meetsAA: boolean;        // Passes AA for current text size
  meetsAAA: boolean;       // Passes AAA for current text size
}

/** Color input format detection result */
export type ColorFormat = 'hex' | 'hex-short' | 'rgb' | 'hsl' | 'invalid';
