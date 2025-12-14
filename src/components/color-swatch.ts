import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Color } from '../utils';

/**
 * Color swatch component displaying a color with its hex value and optional label.
 *
 * @fires swatch-click - When the swatch is clicked
 * @fires swatch-remove - When the remove button is clicked
 */
@customElement('color-swatch')
export class ColorSwatch extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .swatch-container {
      display: flex;
      align-items: center;
      gap: 0;
      background: var(--color-surface-secondary, #f5f5f5);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      overflow: hidden;
    }

    .swatch {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--space-sm, 0.5rem);
      padding: var(--space-sm, 0.5rem);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background var(--transition-fast, 150ms ease);
      font-family: inherit;
      text-align: left;
    }

    .swatch:hover {
      background: var(--color-surface-tertiary, #e8e8e8);
    }

    .swatch:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .color-box {
      width: 2.5rem;
      height: 2.5rem;
      min-width: 2.5rem;
      border-radius: var(--radius-sm, 0.25rem);
      border: 1px solid var(--color-border-default, #d4d4d4);
      position: relative;
      overflow: hidden;
    }

    .color-box::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 8px 8px;
      background-position: 0 0, 0 4px, 4px -4px, -4px 0;
    }

    .color-box::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--swatch-color);
    }

    .info {
      flex: 1;
      min-width: 0;
    }

    .label {
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-primary, #1a1a1a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hex {
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-text-secondary, #555555);
    }

    .remove-btn {
      width: var(--touch-target-min, 44px);
      height: var(--touch-target-min, 44px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: var(--radius-sm, 0.25rem);
      color: var(--color-text-muted, #666666);
      cursor: pointer;
      transition: color var(--transition-fast, 150ms ease),
                  background var(--transition-fast, 150ms ease);
    }

    .remove-btn:hover {
      color: var(--color-error, #dc2626);
      background: var(--color-error-bg, #fee2e2);
    }

    .remove-btn:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .remove-btn svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    :host([compact]) .swatch {
      padding: var(--space-xs, 0.25rem);
    }

    :host([compact]) .color-box {
      width: 1.5rem;
      height: 1.5rem;
      min-width: 1.5rem;
    }

    :host([compact]) .info {
      display: none;
    }

    :host([compact]) .remove-btn {
      width: 1.5rem;
      height: 1.5rem;
    }

    .swatch-container:hover .remove-btn {
      opacity: 1;
    }
  `;

  /** The color to display */
  @property({ type: Object })
  color: Color | null = null;

  /** Whether to show the remove button */
  @property({ type: Boolean, attribute: 'show-remove' })
  showRemove = false;

  /** Whether to use compact mode */
  @property({ type: Boolean, reflect: true })
  compact = false;

  private handleClick(): void {
    this.dispatchEvent(new CustomEvent('swatch-click', {
      detail: { color: this.color },
      bubbles: true,
      composed: true,
    }));
  }

  private handleRemove(e: Event): void {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('swatch-remove', {
      detail: { color: this.color },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this.color) return null;

    const label = this.color.label || 'Unnamed';

    return html`
      <div class="swatch-container" style="--swatch-color: ${this.color.hex}">
        <button
          type="button"
          class="swatch"
          aria-label="${label}: ${this.color.hex}"
          @click="${this.handleClick}"
        >
          <div class="color-box" aria-hidden="true"></div>

          <div class="info">
            <div class="label">${label}</div>
            <div class="hex">${this.color.hex}</div>
          </div>
        </button>

        ${this.showRemove ? html`
          <button
            type="button"
            class="remove-btn"
            aria-label="Remove ${label}"
            @click="${this.handleRemove}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ` : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-swatch': ColorSwatch;
  }
}
