import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ColorStoreController } from '../state';

/**
 * Toggle component for switching between normal and large text WCAG thresholds.
 */
@customElement('text-size-toggle')
export class TextSizeToggle extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .toggle-group {
      display: flex;
      align-items: center;
      gap: var(--space-sm, 0.5rem);
    }

    .label {
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--color-text-secondary, #555555);
    }

    .toggle-buttons {
      display: flex;
      background: var(--color-surface-secondary, #f5f5f5);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      padding: 2px;
    }

    .toggle-btn {
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      min-height: var(--touch-target-min, 44px);
      background: transparent;
      border: none;
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-secondary, #555555);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
    }

    .toggle-btn:hover:not(.active) {
      background: var(--color-surface-tertiary, #e8e8e8);
    }

    .toggle-btn:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .toggle-btn.active {
      background: var(--color-accent-primary, #0066cc);
      color: var(--color-text-inverse, #ffffff);
    }

    .size-info {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-text-muted, #666666);
    }

    .thresholds {
      display: flex;
      gap: var(--space-md, 1rem);
      margin-top: var(--space-xs, 0.25rem);
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-text-muted, #666666);
    }

    .threshold {
      display: flex;
      align-items: center;
      gap: var(--space-xs, 0.25rem);
    }

    .threshold-label {
      font-weight: var(--font-weight-medium, 500);
    }
  `;

  private store = new ColorStoreController(this);

  private handleToggle(size: 'normal' | 'large'): void {
    this.store.setTextSize(size);
  }

  render() {
    const textSize = this.store.textSize;
    const isNormal = textSize === 'normal';
    const isLarge = textSize === 'large';

    return html`
      <div class="toggle-group" role="group" aria-label="Text size for contrast evaluation">
        <span class="label">Text size:</span>

        <div class="toggle-buttons" role="radiogroup">
          <button
            type="button"
            role="radio"
            class="toggle-btn ${isNormal ? 'active' : ''}"
            aria-checked="${isNormal}"
            @click="${() => this.handleToggle('normal')}"
          >
            Normal
          </button>
          <button
            type="button"
            role="radio"
            class="toggle-btn ${isLarge ? 'active' : ''}"
            aria-checked="${isLarge}"
            @click="${() => this.handleToggle('large')}"
          >
            Large (18pt+)
          </button>
        </div>
      </div>

      <div class="thresholds">
        <div class="threshold">
          <span class="threshold-label">AA:</span>
          <span>${isNormal ? '4.5:1' : '3:1'}</span>
        </div>
        <div class="threshold">
          <span class="threshold-label">AAA:</span>
          <span>${isNormal ? '7:1' : '4.5:1'}</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'text-size-toggle': TextSizeToggle;
  }
}
