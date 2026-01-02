/**
 * Theme Store
 * Manages theme (light/dark/high-contrast) preferences.
 * Persists to localStorage and syncs with system preferences.
 */

export type Theme = 'light' | 'dark' | 'high-contrast' | 'system';

export interface ThemeStoreState {
  theme: Theme;
}

type ThemeStoreListener = (state: ThemeStoreState) => void;

const STORAGE_KEY = 'brand-color-a11y-theme';

class ThemeStoreImpl {
  private state: ThemeStoreState;
  private listeners: Set<ThemeStoreListener> = new Set();

  constructor() {
    this.state = {
      theme: this.loadTheme(),
    };
    this.applyTheme();
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

  private saveTheme(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, this.state.theme);
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
