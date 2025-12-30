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

    if (event.type === 'colors-changed' || event.type === 'text-size-changed') {
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

  const urlState: Partial<URLState> = {
    colors: colors.map(c => hexToURLColor(c.hex)),
    labels: colors.map(c => c.label || ''),
    textSize,
    theme,
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

  const urlState: Partial<URLState> = {
    colors: colors.map(c => hexToURLColor(c.hex)),
    textSize,
    theme,
  };

  // Include labels if any exist
  const labels = colors.map(c => c.label || '').filter(Boolean);
  if (labels.length > 0) {
    urlState.labels = colors.map(c => c.label || '');
  }

  const params = new URLSearchParams();

  if (urlState.colors && urlState.colors.length > 0) {
    params.set('colors', urlState.colors.join(','));
  }

  if (urlState.labels && urlState.labels.some(l => l)) {
    params.set('labels', urlState.labels.map(l => encodeURIComponent(l)).join(','));
  }

  if (urlState.textSize && urlState.textSize !== 'normal') {
    params.set('text', urlState.textSize);
  }

  if (urlState.theme && urlState.theme !== 'system') {
    params.set('theme', urlState.theme);
  }

  const search = params.toString();
  return `${window.location.origin}${window.location.pathname}${search ? '?' + search : ''}`;
}
