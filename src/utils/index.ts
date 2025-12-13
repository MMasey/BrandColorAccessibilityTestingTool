/**
 * Color utilities barrel export
 */

// Types
export type {
  RGB,
  HSL,
  Color,
  WCAGLevel,
  TextSize,
  ContrastResult,
  ColorFormat,
} from './color-types';

// Parser
export {
  detectColorFormat,
  parseHex,
  parseRgbString,
  parseHslString,
  parseColorToRgb,
  hslToRgb,
  isValidColor,
} from './color-parser';

// Converter
export {
  rgbToHex,
  rgbToHsl,
  hexToRgb,
  hexToHsl,
  hslToHex,
  createColor,
  formatRgb,
  formatHsl,
} from './color-converter';

// Contrast
export {
  WCAG_THRESHOLDS,
  getRelativeLuminance,
  getContrastRatio,
  formatContrastRatio,
  getWCAGLevel,
  meetsWCAGLevel,
  getContrastResult,
  getColorContrastResult,
  generateContrastMatrix,
  getWCAGLevelDescription,
} from './contrast';
