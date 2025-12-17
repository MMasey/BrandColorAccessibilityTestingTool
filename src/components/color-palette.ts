import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import type { Color } from '../utils';
import type { ColorInput } from './color-input';
import './color-input';
import './color-swatch';
import './brand-guidance';

/**
 * Color palette component for managing a list of brand colors.
 * Integrates with the color store for state management.
 */
@customElement('color-palette')
export class ColorPalette extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .palette {
      display: flex;
      flex-direction: column;
      gap: var(--space-md, 1rem);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md, 1rem);
    }

    h2 {
      margin: 0;
      font-size: var(--font-size-lg, 1.125rem);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-text-primary, #1a1a1a);
    }

    .color-count {
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--color-text-secondary);
    }

    .add-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm, 0.5rem);
    }

    .add-row {
      display: flex;
      gap: var(--space-sm, 0.5rem);

      color-input {
        flex: 1;
        min-width: 0;
      }

      /* Mobile: stack input and button */
      @media (max-width: 400px) {
        flex-direction: column;

        color-input {
          width: 100%;
        }
      }
    }

    .add-btn {
      padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
      min-width: var(--touch-target-min, 44px);
      background: var(--color-accent-primary, #0066cc);
      color: var(--color-text-inverse, #ffffff);
      border: none;
      border-radius: var(--radius-md, 0.5rem);
      font-size: var(--font-size-md, 1rem);
      font-weight: var(--font-weight-medium, 500);
      cursor: pointer;
      transition: background var(--transition-fast, 150ms ease);

      &:hover {
        background: var(--color-accent-primary-hover, #0052a3);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .colors-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs, 0.25rem);
      max-height: 400px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .empty-state {
      padding: var(--space-xl, 2rem);
      text-align: center;
      background: var(--color-surface-secondary, #f5f5f5);
      border: 2px dashed var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--color-text-secondary);

      p {
        margin: 0 0 var(--space-sm, 0.5rem);
      }

      code {
        font-family: var(--font-family-mono, monospace);
        background: var(--color-surface-tertiary, #e8e8e8);
        padding: 0.1em 0.3em;
        border-radius: var(--radius-sm, 0.25rem);
      }
    }

    .actions {
      display: flex;
      gap: var(--space-sm, 0.5rem);
    }

    .clear-btn {
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      background: transparent;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);

      &:hover {
        background: var(--color-error-bg, #fee2e2);
        border-color: var(--color-error, #dc2626);
        color: var(--color-error, #dc2626);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
        outline-offset: var(--focus-ring-offset, 2px);
      }
    }

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
  `;

  private store = new ColorStoreController(this);

  @state()
  private newColorValue = '';

  @state()
  private newColorLabel = '';

  @state()
  private isNewColorValid = false;

  @state()
  private statusMessage = '';

  private handleColorChange(e: CustomEvent): void {
    const { value, color } = e.detail;
    this.newColorValue = value;
    this.newColorLabel = color?.label || '';
    this.isNewColorValid = color !== null;
  }

  private handleColorInvalid(): void {
    this.isNewColorValid = false;
  }

  private addColor(): void {
    if (!this.isNewColorValid) return;

    const added = this.store.addColor(this.newColorValue, this.newColorLabel || undefined);
    if (added) {
      // Announce to screen readers
      const colorLabel = this.newColorLabel || added.hex;
      this.statusMessage = `Color ${colorLabel} added to palette`;

      // Clear inputs
      this.newColorValue = '';
      this.newColorLabel = '';
      this.isNewColorValid = false;

      // Focus back on the color input for easy sequential entry
      const colorInput = this.shadowRoot?.querySelector('color-input') as ColorInput | null;
      if (colorInput && typeof colorInput.focusInput === 'function') {
        // Use requestAnimationFrame to ensure DOM updates complete
        requestAnimationFrame(() => {
          colorInput.focusInput();
        });
      }
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && this.isNewColorValid) {
      this.addColor();
    }
  }

  private removeColor(index: number): void {
    this.store.removeColor(index);
  }

  private clearAll(): void {
    if (confirm('Remove all colors from the palette?')) {
      this.store.clearColors();
    }
  }

  render() {
    const colors = this.store.colors;

    return html`
      <div class="palette">
        <!-- Screen reader announcements for status updates -->
        <div
          class="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          ${this.statusMessage}
        </div>

        <div class="header">
          <h2>Brand Colors</h2>
          ${colors.length > 0 ? html`
            <span class="color-count">${colors.length} color${colors.length !== 1 ? 's' : ''}</span>
          ` : null}
        </div>

        ${colors.length >= 7 ? html`
          <brand-guidance .colorCount="${colors.length}"></brand-guidance>
        ` : null}

        <div class="add-section">
          <div class="add-row" @keydown="${this.handleKeyDown}">
            <color-input
              .value="${this.newColorValue}"
              .label="${this.newColorLabel}"
              placeholder="#000000 or rgb() or hsl()"
              @color-change="${this.handleColorChange}"
              @color-invalid="${this.handleColorInvalid}"
            ></color-input>
            <button
              type="button"
              class="add-btn"
              ?disabled="${!this.isNewColorValid}"
              @click="${this.addColor}"
              aria-label="Add color to palette"
            >
              Add
            </button>
          </div>
        </div>

        ${colors.length > 0 ? html`
          <div class="colors-list" role="list" aria-label="Color palette">
            ${colors.map((color: Color, index: number) => html`
              <color-swatch
                role="listitem"
                .color="${color}"
                show-remove
                @swatch-remove="${() => this.removeColor(index)}"
              ></color-swatch>
            `)}
          </div>

          <div class="actions">
            <button
              type="button"
              class="clear-btn"
              @click="${this.clearAll}"
            >
              Clear all
            </button>
          </div>
        ` : html`
          <div class="empty-state">
            <p>No colors added yet.</p>
            <p>Enter a color using <code>#hex</code>, <code>rgb()</code>, or <code>hsl()</code> format.</p>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-palette': ColorPalette;
  }
}
