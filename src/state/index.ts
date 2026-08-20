/**
 * State management barrel export
 */

export { colorStore, type ColorStore, type ColorStoreState, type ColorStoreEvent, type ResultsView } from './color-store';
export { ColorStoreController } from './color-store-controller';
export { themeStore, type Theme, type ThemeStoreState } from './theme-store';
export { ThemeStoreController } from './theme-store-controller';
export {
  parseURLState,
  serializeURLState,
  updateURL,
  getFullURLState,
  hasURLState,
  generateShareableURL,
  hexToURLColor,
  urlColorToHex,
  type URLState,
} from './url-state';
export { initializeFromURL, getShareableURL } from './url-sync';
