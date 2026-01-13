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
      color: var(--theme-text-color, #1a1a1a);
    }

    .color-count {
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--theme-text-secondary-color);
    }

    .add-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm, 0.5rem);
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
      background: var(--theme-card-bg-color, #f5f5f5);
      border: 2px dashed var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--theme-text-secondary-color);

      p {
        margin: 0 0 var(--space-sm, 0.5rem);
      }

      code {
        font-family: var(--font-family-mono, monospace);
        background: var(--theme-card-bg-color-hover);
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
      color: var(--theme-text-secondary-color);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);

      &:hover {
        background: var(--theme-error-bg-color);
        border-color: var(--theme-error-text-color);
        color: var(--theme-error-text-color);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
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

    /* ========================================================================
       Windows High Contrast Mode (forced-colors: active)

       Let the browser handle most styling. Just add visible borders.
       ======================================================================== */
    @media (forced-colors: active) {
      .empty-state {
        border: 2px dashed CanvasText;
      }

      .empty-state code {
        border: 2px solid CanvasText;
      }

      .clear-btn {
        border: 2px solid CanvasText;
      }
    }
  `;

  private store = new ColorStoreController(this);

  @state()
  private statusMessage = '';

  private handleAddColor(e: CustomEvent): void {
    const { color } = e.detail;
    if (!color) return;

    const added = this.store.addColorObject(color);
    if (added) {
      // Announce to screen readers
      const colorLabel = added.label || added.hex;
      this.statusMessage = `Color ${colorLabel} added to palette`;

      // Clear input and focus for next entry
      const colorInput = this.shadowRoot?.querySelector('color-input') as ColorInput | null;
      if (colorInput) {
        colorInput.clear();
        requestAnimationFrame(() => {
          colorInput.focusInput();
        });
      }
    }
  }

  private updateColorLabel(index: number, newLabel: string): void {
    this.store.updateColorLabel(index, newLabel);
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
          <color-input
            placeholder="#000000"
            label-placeholder="Label (optional)"
            @add-color="${this.handleAddColor}"
          ></color-input>
        </div>

        ${colors.length > 0 ? html`
          <div class="colors-list" role="list" aria-label="Color palette">
            ${colors.map((color: Color, index: number) => html`
              <color-swatch
                role="listitem"
                .color="${color}"
                show-remove
                editable-label
                @swatch-remove="${() => this.removeColor(index)}"
                @label-change="${(e: CustomEvent) => this.updateColorLabel(index, e.detail.label)}"
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
