import { ReactiveController, ReactiveControllerHost } from 'lit';
import { themeStore, Theme, ThemeStoreState } from './theme-store';

/**
 * Reactive controller for theme store integration with Lit components.
 * Automatically triggers component updates when theme or font scale changes.
 */
export class ThemeStoreController implements ReactiveController {
  private host: ReactiveControllerHost;
  private unsubscribe?: () => void;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.unsubscribe = themeStore.subscribe(() => {
      this.host.requestUpdate();
    });
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
  }

  // Expose store state and methods

  get theme(): Theme {
    return themeStore.theme;
  }

  get fontScale(): number {
    return themeStore.fontScale;
  }

  get resolvedTheme(): 'light' | 'dark' | 'high-contrast' {
    return themeStore.resolvedTheme;
  }

  get minFontScale(): number {
    return themeStore.minFontScale;
  }

  get maxFontScale(): number {
    return themeStore.maxFontScale;
  }

  setTheme(theme: Theme): void {
    themeStore.setTheme(theme);
  }

  setFontScale(scale: number): void {
    themeStore.setFontScale(scale);
  }

  increaseFontScale(): void {
    themeStore.increaseFontScale();
  }

  decreaseFontScale(): void {
    themeStore.decreaseFontScale();
  }

  resetFontScale(): void {
    themeStore.resetFontScale();
  }

  getState(): ThemeStoreState {
    return themeStore.getState();
  }
}
