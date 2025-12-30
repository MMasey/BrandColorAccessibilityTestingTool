/**
 * Color Parser Unit Tests
 *
 * Tests color parsing for various formats with edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  detectColorFormat,
  parseHex,
  parseRgbString,
  parseHslString,
  parseColorToRgb,
  isValidColor,
} from './color-parser';

describe('detectColorFormat', () => {
  it('detects full hex format with #', () => {
    expect(detectColorFormat('#FF5500')).toBe('hex');
    expect(detectColorFormat('#ff5500')).toBe('hex');
    expect(detectColorFormat('#000000')).toBe('hex');
    expect(detectColorFormat('#FFFFFF')).toBe('hex');
  });

  it('detects full hex format without #', () => {
    expect(detectColorFormat('FF5500')).toBe('hex');
    expect(detectColorFormat('ff5500')).toBe('hex');
  });

  it('detects short hex format', () => {
    expect(detectColorFormat('#F50')).toBe('hex-short');
    expect(detectColorFormat('#fff')).toBe('hex-short');
    expect(detectColorFormat('F50')).toBe('hex-short');
  });

  it('detects RGB format', () => {
    expect(detectColorFormat('rgb(255, 85, 0)')).toBe('rgb');
    expect(detectColorFormat('rgb(255,85,0)')).toBe('rgb');
    expect(detectColorFormat('RGB(255, 85, 0)')).toBe('rgb');
    expect(detectColorFormat('rgb(0 0 0)')).toBe('rgb');
  });

  it('detects HSL format', () => {
    expect(detectColorFormat('hsl(20, 100%, 50%)')).toBe('hsl');
    expect(detectColorFormat('hsl(20,100%,50%)')).toBe('hsl');
    expect(detectColorFormat('HSL(20, 100, 50)')).toBe('hsl');
  });

  it('returns invalid for bad formats', () => {
    expect(detectColorFormat('')).toBe('invalid');
    expect(detectColorFormat('not-a-color')).toBe('invalid');
    expect(detectColorFormat('#GGG')).toBe('invalid');
    expect(detectColorFormat('#12345')).toBe('invalid');
    expect(detectColorFormat('rgb(256, 0, 0)')).toBe('rgb'); // Still parses, validation is separate
  });
});

describe('parseHex', () => {
  it('parses full hex colors', () => {
    expect(parseHex('#FF5500')).toEqual({ r: 255, g: 85, b: 0 });
    expect(parseHex('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHex('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('#1a2b3c')).toEqual({ r: 26, g: 43, b: 60 });
  });

  it('parses hex without #', () => {
    expect(parseHex('FF5500')).toEqual({ r: 255, g: 85, b: 0 });
  });

  it('parses short hex colors', () => {
    expect(parseHex('#F50')).toEqual({ r: 255, g: 85, b: 0 });
    expect(parseHex('#000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHex('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('#abc')).toEqual({ r: 170, g: 187, b: 204 });
  });

  it('handles whitespace', () => {
    expect(parseHex('  #FF5500  ')).toEqual({ r: 255, g: 85, b: 0 });
  });

  it('returns null for invalid hex', () => {
    expect(parseHex('#GGG')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
    expect(parseHex('')).toBeNull();
  });
});

describe('parseRgbString', () => {
  it('parses rgb with commas', () => {
    expect(parseRgbString('rgb(255, 85, 0)')).toEqual({ r: 255, g: 85, b: 0 });
    expect(parseRgbString('rgb(0,0,0)')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('parses rgb with spaces', () => {
    expect(parseRgbString('rgb(255 85 0)')).toEqual({ r: 255, g: 85, b: 0 });
  });

  it('returns null for out-of-range values', () => {
    expect(parseRgbString('rgb(256, 0, 0)')).toBeNull();
    expect(parseRgbString('rgb(-1, 0, 0)')).toBeNull();
  });

  it('returns null for invalid format', () => {
    expect(parseRgbString('not-rgb')).toBeNull();
    expect(parseRgbString('rgb()')).toBeNull();
  });
});

describe('parseHslString', () => {
  it('parses hsl with commas', () => {
    expect(parseHslString('hsl(20, 100%, 50%)')).toEqual({ h: 20, s: 100, l: 50 });
    expect(parseHslString('hsl(0,0%,0%)')).toEqual({ h: 0, s: 0, l: 0 });
  });

  it('parses hsl without % symbols', () => {
    expect(parseHslString('hsl(20, 100, 50)')).toEqual({ h: 20, s: 100, l: 50 });
  });

  it('normalizes hue to 0-360', () => {
    expect(parseHslString('hsl(380, 50%, 50%)')?.h).toBe(20);
    expect(parseHslString('hsl(-20, 50%, 50%)')?.h).toBe(340);
  });

  it('returns null for out-of-range s/l', () => {
    expect(parseHslString('hsl(0, 101%, 50%)')).toBeNull();
    expect(parseHslString('hsl(0, 50%, -1%)')).toBeNull();
  });
});

describe('parseColorToRgb', () => {
  it('parses any valid format to RGB', () => {
    // All these should produce the same or similar RGB
    const hexResult = parseColorToRgb('#FF5500');
    const rgbResult = parseColorToRgb('rgb(255, 85, 0)');

    expect(hexResult).toEqual({ r: 255, g: 85, b: 0 });
    expect(rgbResult).toEqual({ r: 255, g: 85, b: 0 });
  });

  it('converts HSL to RGB correctly', () => {
    // Pure red: hsl(0, 100%, 50%) = rgb(255, 0, 0)
    expect(parseColorToRgb('hsl(0, 100%, 50%)')).toEqual({ r: 255, g: 0, b: 0 });

    // Pure green: hsl(120, 100%, 50%) = rgb(0, 255, 0)
    expect(parseColorToRgb('hsl(120, 100%, 50%)')).toEqual({ r: 0, g: 255, b: 0 });

    // Pure blue: hsl(240, 100%, 50%) = rgb(0, 0, 255)
    expect(parseColorToRgb('hsl(240, 100%, 50%)')).toEqual({ r: 0, g: 0, b: 255 });

    // Gray: hsl(0, 0%, 50%) = rgb(128, 128, 128)
    expect(parseColorToRgb('hsl(0, 0%, 50%)')).toEqual({ r: 128, g: 128, b: 128 });
  });

  it('returns null for invalid input', () => {
    expect(parseColorToRgb('not-a-color')).toBeNull();
    expect(parseColorToRgb('')).toBeNull();
  });
});

describe('isValidColor', () => {
  it('returns true for valid colors', () => {
    expect(isValidColor('#FF5500')).toBe(true);
    expect(isValidColor('#F50')).toBe(true);
    expect(isValidColor('rgb(255, 85, 0)')).toBe(true);
    expect(isValidColor('hsl(20, 100%, 50%)')).toBe(true);
  });

  it('returns false for invalid colors', () => {
    expect(isValidColor('')).toBe(false);
    expect(isValidColor('not-a-color')).toBe(false);
    expect(isValidColor('#GGG')).toBe(false);
  });
});
