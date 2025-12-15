import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ThemeStoreController } from '../state';
import type { Theme } from '../state';

/**
 * Theme switcher component for selecting light/dark/high-contrast modes
 * and adjusting font size.
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
    }

    .section-label {
      font-size: clamp(0.75rem, 2vw, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-secondary, #555555);
      white-space: nowrap;
    }

    /* Hide labels on very small screens for compact header */
    @media (max-width: 479px) {
      .section-label {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    }

    /* Theme buttons */
    .theme-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      background: var(--color-surface-secondary, #f5f5f5);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      padding: 2px;
    }

    .theme-btn {
      flex: 1 1 0;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-xs, 0.25rem);
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      min-height: var(--touch-target-min, 44px);
      background: transparent;
      border: none;
      border-radius: var(--radius-sm, 0.25rem);
      font-size: clamp(0.75rem, 2vw, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-secondary, #555555);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
      white-space: nowrap;
    }

    .theme-btn:hover:not(.active) {
      background: var(--color-surface-tertiary, #e8e8e8);
    }

    .theme-btn:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
      z-index: 1;
    }

    .theme-btn.active {
      background: var(--color-accent-primary, #0066cc);
      color: var(--color-text-inverse, #ffffff);
    }

    .theme-btn svg {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    .theme-btn .label {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Show icon-only on very small screens */
    @media (max-width: 359px) {
      .theme-btn .label {
        display: none;
      }
    }

    /* Font size controls */
    .font-controls {
      display: flex;
      align-items: center;
      gap: var(--space-sm, 0.5rem);
    }

    .font-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--touch-target-min, 44px);
      height: var(--touch-target-min, 44px);
      background: var(--color-surface-secondary, #f5f5f5);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      font-size: var(--font-size-lg, 1.125rem);
      font-weight: var(--font-weight-bold, 700);
      color: var(--color-text-secondary, #555555);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
    }

    .font-btn:hover:not(:disabled) {
      background: var(--color-surface-tertiary, #e8e8e8);
      border-color: var(--color-border-strong, #a3a3a3);
    }

    .font-btn:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .font-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .font-display {
      flex: 1;
      text-align: center;
      font-size: var(--font-size-sm, 0.875rem);
      font-family: var(--font-family-mono, monospace);
      color: var(--color-text-secondary, #555555);
    }

    .reset-btn {
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      min-height: var(--touch-target-min, 44px);
      background: transparent;
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-text-muted, #666666);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
    }

    .reset-btn:hover {
      background: var(--color-surface-tertiary, #e8e8e8);
    }

    .reset-btn:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .reset-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
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
    const fontScale = this.themeStore.fontScale;
    const isMinScale = fontScale <= this.themeStore.minFontScale;
    const isMaxScale = fontScale >= this.themeStore.maxFontScale;
    const isDefaultScale = fontScale === 1;

    const themes: { value: Theme; label: string }[] = [
      { value: 'system', label: 'Auto' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'high-contrast', label: 'High' },
    ];

    return html`
      <div class="switcher">
        <div class="section">
          <span class="section-label" id="theme-label">Theme</span>
          <div class="theme-buttons" role="radiogroup" aria-labelledby="theme-label">
            ${themes.map(({ value, label }) => html`
              <button
                type="button"
                role="radio"
                class="theme-btn ${currentTheme === value ? 'active' : ''}"
                aria-checked="${currentTheme === value}"
                @click="${() => this.handleThemeChange(value)}"
                title="${label}"
              >
                ${this.getThemeIcon(value)}
                <span class="label">${label}</span>
              </button>
            `)}
          </div>
        </div>

        <div class="section">
          <span class="section-label" id="font-label">Font size</span>
          <div class="font-controls" role="group" aria-labelledby="font-label">
            <button
              type="button"
              class="font-btn"
              ?disabled="${isMinScale}"
              @click="${() => this.themeStore.decreaseFontScale()}"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <span class="font-display" aria-live="polite">
              ${Math.round(fontScale * 100)}%
            </span>
            <button
              type="button"
              class="font-btn"
              ?disabled="${isMaxScale}"
              @click="${() => this.themeStore.increaseFontScale()}"
              aria-label="Increase font size"
            >
              A+
            </button>
            <button
              type="button"
              class="reset-btn"
              ?disabled="${isDefaultScale}"
              @click="${() => this.themeStore.resetFontScale()}"
              aria-label="Reset font size to default"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'theme-switcher': ThemeSwitcher;
  }
}
