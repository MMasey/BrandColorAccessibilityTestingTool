/**
 * URL State Management
 *
 * Handles reading and writing application state to URL parameters
 * for shareable links and progressive enhancement.
 *
 * URL format: ?colors=FF5733,3498DB&labels=Orange,Blue&theme=dark&show=aaa,aa,aa-large&size=small
 */

import type { Theme } from './theme-store';
import type { GridFilterLevel, GridCellSize } from './color-store';

/** URL parameter names */
const PARAM_COLORS = 'colors';
const PARAM_LABELS = 'labels';
const PARAM_THEME = 'theme';
const PARAM_SHOW = 'show';
const PARAM_SIZE = 'size';

/** Valid filter levels for URL params */
const VALID_FILTERS: GridFilterLevel[] = ['aaa', 'aa', 'aa-large', 'failed'];

/** Valid cell sizes for URL params */
const VALID_CELL_SIZES: GridCellSize[] = ['small', 'medium', 'large'];

/** Default active filters (show passing, hide failed) */
const DEFAULT_FILTERS: GridFilterLevel[] = ['aaa', 'aa', 'aa-large'];

/** State that can be stored in URL */
export interface URLState {
  colors: string[];       // Hex values without #
  labels: string[];       // Color labels (URL-encoded)
  theme: Theme;
  filters: GridFilterLevel[];  // Active grid filters
  cellSize: GridCellSize;      // Grid cell size
}

/** Default state when no URL params present */
const DEFAULT_STATE: URLState = {
  colors: [],
  labels: [],
  theme: 'system',
  filters: DEFAULT_FILTERS,
  cellSize: 'medium',
};

/**
 * Parse URL search params into state object
 */
export function parseURLState(search: string = window.location.search): Partial<URLState> {
  const params = new URLSearchParams(search);
  const state: Partial<URLState> = {};

  // Parse colors (comma-separated hex values without #)
  const colorsParam = params.get(PARAM_COLORS);
  if (colorsParam) {
    state.colors = colorsParam
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(c => /^[0-9A-F]{3}([0-9A-F]{3})?$/i.test(c));
  }

  // Parse labels (comma-separated, URL-encoded)
  const labelsParam = params.get(PARAM_LABELS);
  if (labelsParam) {
    state.labels = labelsParam.split(',').map(l => decodeURIComponent(l.trim()));
  }

  // Parse theme
  const themeParam = params.get(PARAM_THEME);
  if (themeParam === 'light' || themeParam === 'dark' || themeParam === 'high-contrast' || themeParam === 'system') {
    state.theme = themeParam;
  }

  // Parse filters (comma-separated filter levels)
  const showParam = params.get(PARAM_SHOW);
  if (showParam) {
    const filters = showParam
      .split(',')
      .map(f => f.trim().toLowerCase() as GridFilterLevel)
      .filter(f => VALID_FILTERS.includes(f));
    if (filters.length > 0) {
      state.filters = filters;
    }
  }

  // Parse cell size
  const sizeParam = params.get(PARAM_SIZE);
  if (sizeParam && VALID_CELL_SIZES.includes(sizeParam as GridCellSize)) {
    state.cellSize = sizeParam as GridCellSize;
  }

  return state;
}

/**
 * Serialize state to URL search string
 */
export function serializeURLState(state: Partial<URLState>): string {
  const params = new URLSearchParams();

  // Serialize colors
  if (state.colors && state.colors.length > 0) {
    params.set(PARAM_COLORS, state.colors.join(','));
  }

  // Serialize labels (only if colors exist)
  if (state.labels && state.labels.length > 0 && state.colors && state.colors.length > 0) {
    params.set(PARAM_LABELS, state.labels.map(l => encodeURIComponent(l)).join(','));
  }

  // Serialize theme (only if not system default)
  if (state.theme && state.theme !== 'system') {
    params.set(PARAM_THEME, state.theme);
  }

  // Serialize filters (only if different from default)
  if (state.filters) {
    const sortedFilters = [...state.filters].sort();
    const sortedDefaults = [...DEFAULT_FILTERS].sort();
    const isDifferent = sortedFilters.length !== sortedDefaults.length ||
      sortedFilters.some((f, i) => f !== sortedDefaults[i]);

    if (isDifferent) {
      params.set(PARAM_SHOW, state.filters.join(','));
    }
  }

  // Serialize cell size (only if not default)
  if (state.cellSize && state.cellSize !== 'medium') {
    params.set(PARAM_SIZE, state.cellSize);
  }

  const search = params.toString();
  return search ? `?${search}` : '';
}

/**
 * Update the browser URL without page reload
 * Uses History API for clean back/forward navigation
 */
export function updateURL(state: Partial<URLState>, replace: boolean = false): void {
  const search = serializeURLState(state);
  const url = `${window.location.pathname}${search}`;

  if (replace) {
    window.history.replaceState(null, '', url);
  } else {
    window.history.pushState(null, '', url);
  }
}

/**
 * Get full state with defaults for missing values
 */
export function getFullURLState(search?: string): URLState {
  const parsed = parseURLState(search);
  return {
    ...DEFAULT_STATE,
    ...parsed,
  };
}

/**
 * Check if URL has any state params
 */
export function hasURLState(search: string = window.location.search): boolean {
  const params = new URLSearchParams(search);
  return params.has(PARAM_COLORS) || params.has(PARAM_THEME) || params.has(PARAM_SHOW) || params.has(PARAM_SIZE);
}

/**
 * Generate a shareable URL with current state
 */
export function generateShareableURL(state: Partial<URLState>): string {
  const search = serializeURLState(state);
  return `${window.location.origin}${window.location.pathname}${search}`;
}

/**
 * Convert hex color to URL-safe format (no #)
 */
export function hexToURLColor(hex: string): string {
  return hex.replace(/^#/, '').toUpperCase();
}

/**
 * Convert URL color to hex format (with #)
 */
export function urlColorToHex(color: string): string {
  const cleaned = color.replace(/^#/, '').toUpperCase();
  return `#${cleaned}`;
}
