import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ThemeStoreController } from '../state';
import type { Theme } from '../state';

/**
 * Theme switcher component for selecting light/dark/high-contrast modes.
 */
@customElement('theme-switcher')
export class ThemeSwitcher extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .switcher {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-lg, 1.5rem);
    }

    .section {
      display: flex;
      align-items: center;
      gap: var(--space-sm, 0.5rem);
      border: none;
      padding: 0;
      margin: 0;
    }

    .section-label {
      font-size: clamp(0.75rem, 2vw, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--theme-text-secondary-color);
      white-space: nowrap;
    }

    /* Visually hidden but accessible to screen readers */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Theme options container */
    .theme-options {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      background: var(--theme-card-bg-color, #f5f5f5);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      padding: 2px;
    }

    .theme-option {
      flex: 1 1 auto;
      min-width: fit-content;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-xs, 0.25rem);
      padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
      min-height: var(--touch-target-min, 44px);
      background: transparent;
      border: none;
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--theme-text-secondary-color);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
      white-space: nowrap;

      &:hover:not(:has(input:checked)) {
        background: var(--theme-card-bg-color-hover);
      }

      /* Show focus ring when the radio input inside is focused */
      &:has(input:focus-visible) {
        outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
        outline-offset: var(--focus-ring-offset, 2px);
        z-index: 1;
      }

      /* Checked/selected state using :has() for pure CSS selection */
      &:has(input:checked) {
        background: var(--theme-button-bg-color, #0066cc);
        color: var(--theme-button-text-color, #ffffff);
      }

      svg {
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
      }

      .label {
        /* Labels are always visible */
      }
    }

    /* ========================================================================
       Windows High Contrast Mode (forced-colors: active)

       Let the browser handle most styling automatically. We only need to:
       1. Ensure visible borders
       2. Indicate selected state with inset box-shadow (so outline is free for focus)
       ======================================================================== */
    @media (forced-colors: active) {
      .theme-options {
        border: 2px solid CanvasText;
      }

      /* Focus state - use outline (outer) */
      .theme-option:has(input:focus-visible) {
        outline: 3px solid Highlight;
        outline-offset: 2px;
        z-index: 1;
      }

      /* Selected state - use inset box-shadow so it doesn't conflict with focus outline */
      .theme-option:has(input:checked) {
        border: 2px solid Highlight;
        box-shadow: inset 0 0 0 2px Highlight;
      }
    }
  `;

  private themeStore = new ThemeStoreController(this);

  private handleThemeChange(theme: Theme): void {
    this.themeStore.setTheme(theme);
  }

  private getThemeIcon(theme: Theme) {
    switch (theme) {
      case 'light':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>`;
      case 'dark':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>`;
      case 'high-contrast':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2v20" fill="currentColor"/>
          <path d="M12 2a10 10 0 010 20" fill="currentColor"/>
        </svg>`;
      case 'system':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>`;
    }
  }

  render() {
    const currentTheme = this.themeStore.theme;

    const themes: { value: Theme; label: string }[] = [
      { value: 'system', label: 'Auto' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'high-contrast', label: 'High' },
    ];

    return html`
      <div class="switcher">
        <fieldset class="section">
          <legend class="section-label">Theme</legend>
          <div class="theme-options">
            ${themes.map(({ value, label }) => html`
              <label class="theme-option">
                <input
                  type="radio"
                  name="theme"
                  class="sr-only"
                  .value="${value}"
                  .checked="${currentTheme === value}"
                  @change="${() => this.handleThemeChange(value)}"
                />
                ${this.getThemeIcon(value)}
                <span class="label">${label}</span>
              </label>
            `)}
          </div>
        </fieldset>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'theme-switcher': ThemeSwitcher;
  }
}
