/**
 * URL State Synchronization
 *
 * Syncs application state with URL parameters for:
 * - Shareable links
 * - Browser back/forward navigation
 * - Progressive enhancement (state in URL before JS loads)
 */

import { colorStore } from './color-store';
import { themeStore } from './theme-store';
import {
  parseURLState,
  updateURL,
  serializeURLState,
  hexToURLColor,
  urlColorToHex,
  type URLState,
} from './url-state';

let isInitialized = false;
let isSyncing = false; // Prevent infinite loops during sync

/**
 * Initialize stores from URL parameters
 * Should be called once on app startup
 */
export function initializeFromURL(): void {
  if (isInitialized) return;
  isInitialized = true;

  const urlState = parseURLState();

  // Initialize colors from URL
  if (urlState.colors && urlState.colors.length > 0) {
    const labels = urlState.labels || [];

    // Clear existing colors and add from URL
    colorStore.clearColors();

    urlState.colors.forEach((color, index) => {
      const hex = urlColorToHex(color);
      const label = labels[index] || undefined;
      colorStore.addColor(hex, label);
    });
  }

  // Initialize text size from URL
  if (urlState.textSize) {
    colorStore.setTextSize(urlState.textSize);
  }

  // Initialize theme from URL (if specified, overrides localStorage)
  if (urlState.theme) {
    themeStore.setTheme(urlState.theme);
  }

  // Initialize filters from URL
  if (urlState.filters && urlState.filters.length > 0) {
    colorStore.setGridFilters(new Set(urlState.filters));
  }

  // Set up state change listeners to update URL
  setupURLUpdateListeners();

  // Handle browser back/forward navigation
  setupPopStateHandler();
}

/**
 * Set up listeners to update URL when state changes
 */
function setupURLUpdateListeners(): void {
  // Listen to color store changes
  colorStore.subscribe((event) => {
    if (isSyncing) return;

    if (event.type === 'colors-changed' || event.type === 'text-size-changed' || event.type === 'grid-filters-changed') {
      syncStateToURL();
    }
  });

  // Listen to theme store changes
  themeStore.subscribe(() => {
    if (isSyncing) return;
    syncStateToURL();
  });
}

/**
 * Sync current state to URL
 */
function syncStateToURL(): void {
  const colors = colorStore.getColors();
  const textSize = colorStore.getTextSize();
  const theme = themeStore.theme;
  const filters = colorStore.getGridFilters();

  const urlState: Partial<URLState> = {
    colors: colors.map(c => hexToURLColor(c.hex)),
    labels: colors.map(c => c.label || ''),
    textSize,
    theme,
    filters: [...filters],
  };

  // Only include labels if any color has a label
  if (!colors.some(c => c.label)) {
    delete urlState.labels;
  }

  updateURL(urlState, true); // Use replaceState to avoid cluttering history
}

/**
 * Handle browser back/forward navigation
 */
function setupPopStateHandler(): void {
  window.addEventListener('popstate', () => {
    isSyncing = true;

    try {
      const urlState = parseURLState();

      // Sync colors
      if (urlState.colors) {
        colorStore.clearColors();
        const labels = urlState.labels || [];
        urlState.colors.forEach((color, index) => {
          colorStore.addColor(urlColorToHex(color), labels[index]);
        });
      } else {
        colorStore.clearColors();
      }

      // Sync text size
      if (urlState.textSize) {
        colorStore.setTextSize(urlState.textSize);
      }

      // Sync theme
      if (urlState.theme) {
        themeStore.setTheme(urlState.theme);
      }

      // Sync filters
      if (urlState.filters && urlState.filters.length > 0) {
        colorStore.setGridFilters(new Set(urlState.filters));
      }
    } finally {
      isSyncing = false;
    }
  });
}

/**
 * Get a shareable URL for the current state
 */
export function getShareableURL(): string {
  const colors = colorStore.getColors();
  const textSize = colorStore.getTextSize();
  const theme = themeStore.theme;
  const filters = colorStore.getGridFilters();

  const urlState: Partial<URLState> = {
    colors: colors.map(c => hexToURLColor(c.hex)),
    textSize,
    theme,
    filters: [...filters],
  };

  // Include labels if any exist
  const labels = colors.map(c => c.label || '').filter(Boolean);
  if (labels.length > 0) {
    urlState.labels = colors.map(c => c.label || '');
  }

  const search = serializeURLState(urlState);
  return `${window.location.origin}${window.location.pathname}${search}`;
}
