/**
 * Theme Store
 * Manages theme (light/dark/high-contrast) and font scale preferences.
 * Persists to localStorage and syncs with system preferences.
 */

export type Theme = 'light' | 'dark' | 'high-contrast' | 'system';

export interface ThemeStoreState {
  theme: Theme;
  fontScale: number;
}

type ThemeStoreListener = (state: ThemeStoreState) => void;

const STORAGE_KEY = 'brand-color-a11y-theme';
const FONT_SCALE_KEY = 'brand-color-a11y-font-scale';

const MIN_FONT_SCALE = 0.75;
const MAX_FONT_SCALE = 1.5;
const FONT_SCALE_STEP = 0.125;

class ThemeStoreImpl {
  private state: ThemeStoreState;
  private listeners: Set<ThemeStoreListener> = new Set();

  constructor() {
    this.state = {
      theme: this.loadTheme(),
      fontScale: this.loadFontScale(),
    };
    this.applyTheme();
    this.applyFontScale();
    this.setupSystemThemeListener();
  }

  private loadTheme(): Theme {
    if (typeof localStorage === 'undefined') return 'system';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'high-contrast' || stored === 'system') {
      return stored;
    }
    return 'system';
  }

  private loadFontScale(): number {
    if (typeof localStorage === 'undefined') return 1;
    const stored = localStorage.getItem(FONT_SCALE_KEY);
    if (stored) {
      const scale = parseFloat(stored);
      if (!isNaN(scale) && scale >= MIN_FONT_SCALE && scale <= MAX_FONT_SCALE) {
        return scale;
      }
    }
    return 1;
  }

  private saveTheme(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, this.state.theme);
    }
  }

  private saveFontScale(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FONT_SCALE_KEY, String(this.state.fontScale));
    }
  }

  private applyTheme(): void {
    const root = document.documentElement;

    // Remove existing theme attribute
    root.removeAttribute('data-theme');

    if (this.state.theme === 'system') {
      // Let CSS handle it via prefers-color-scheme
      return;
    }

    root.setAttribute('data-theme', this.state.theme);
  }

  private applyFontScale(): void {
    document.documentElement.style.setProperty('--user-font-scale', String(this.state.fontScale));
  }

  private setupSystemThemeListener(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.state.theme === 'system') {
        this.notify();
      }
    });
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Public API

  get theme(): Theme {
    return this.state.theme;
  }

  get fontScale(): number {
    return this.state.fontScale;
  }

  get resolvedTheme(): 'light' | 'dark' | 'high-contrast' {
    if (this.state.theme !== 'system') {
      return this.state.theme;
    }

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  setTheme(theme: Theme): void {
    if (this.state.theme === theme) return;

    this.state = { ...this.state, theme };
    this.saveTheme();
    this.applyTheme();
    this.notify();
  }

  setFontScale(scale: number): void {
    const clampedScale = Math.max(MIN_FONT_SCALE, Math.min(MAX_FONT_SCALE, scale));
    // Round to nearest step
    const roundedScale = Math.round(clampedScale / FONT_SCALE_STEP) * FONT_SCALE_STEP;

    if (this.state.fontScale === roundedScale) return;

    this.state = { ...this.state, fontScale: roundedScale };
    this.saveFontScale();
    this.applyFontScale();
    this.notify();
  }

  increaseFontScale(): void {
    this.setFontScale(this.state.fontScale + FONT_SCALE_STEP);
  }

  decreaseFontScale(): void {
    this.setFontScale(this.state.fontScale - FONT_SCALE_STEP);
  }

  resetFontScale(): void {
    this.setFontScale(1);
  }

  get minFontScale(): number {
    return MIN_FONT_SCALE;
  }

  get maxFontScale(): number {
    return MAX_FONT_SCALE;
  }

  subscribe(listener: ThemeStoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): ThemeStoreState {
    return { ...this.state };
  }
}

// Singleton instance
export const themeStore = new ThemeStoreImpl();
