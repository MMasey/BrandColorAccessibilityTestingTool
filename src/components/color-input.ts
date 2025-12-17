import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { isValidColor, createColor } from '../utils';
import type { Color } from '../utils';

/**
 * Color input component with live preview and format auto-detection.
 * Supports hex (#RGB, #RRGGBB), RGB, and HSL formats.
 *
 * @fires color-change - When a valid color is entered
 * @fires color-invalid - When input is not a valid color
 */
@customElement('color-input')
export class ColorInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .input-wrapper {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      overflow: hidden;
      transition: border-color var(--transition-fast, 150ms ease);
    }

    .input-wrapper:focus-within {
      border-color: var(--color-border-focus, #0066cc);
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .input-wrapper.invalid {
      border-color: var(--color-error, #dc2626);
    }

    .color-row {
      display: flex;
      align-items: stretch;
      gap: 0;
    }

    .color-preview {
      width: 3rem;
      min-width: 3rem;
      background: var(--preview-color, #ffffff);
      border: none;
      cursor: pointer;
      position: relative;
    }

    .color-preview::before {
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
      z-index: 0;
    }

    .color-preview::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--preview-color, #ffffff);
      z-index: 1;
    }

    .color-preview.empty::after {
      background: transparent;
    }

    input[type="text"] {
      flex: 1;
      min-width: 0;
      padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
      border: none;
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-md, 1rem);
      background: var(--color-surface-primary, #ffffff);
      color: var(--color-text-primary, #1a1a1a);
    }

    input[type="text"]:focus {
      outline: none;
    }

    input[type="text"]::placeholder {
      color: var(--color-text-muted, #666666);
    }

    .label-input {
      width: 100%;
      padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
      border: none;
      border-top: 1px solid var(--color-border-default, #d4d4d4);
      font-size: var(--font-size-sm, 0.875rem);
      background: var(--color-surface-secondary, #f5f5f5);
      color: var(--color-text-primary, #1a1a1a);
    }

    .label-input:focus {
      outline: none;
      background: var(--color-surface-primary, #ffffff);
    }

    .label-input::placeholder {
      color: var(--color-text-muted, #666666);
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

    .help-text {
      margin-top: var(--space-xs, 0.25rem);
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-text-muted);
      line-height: 1.4;
    }

    .error-text {
      margin-top: var(--space-xs, 0.25rem);
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-error, #dc2626);
      line-height: 1.4;
    }
  `;

  /** Current color value (hex, rgb, or hsl string) */
  @property({ type: String })
  value = '';

  /** Optional label for the color */
  @property({ type: String })
  label = '';

  /** Placeholder text for color input */
  @property({ type: String })
  placeholder = '#000000';

  /** Whether to show the label input */
  @property({ type: Boolean, attribute: 'show-label' })
  showLabel = true;

  /** Whether input is disabled */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Parsed color object (null if invalid) */
  @state()
  private parsedColor: Color | null = null;

  /**
   * Focus the color input field
   * Public method for programmatic focus management
   */
  public focusInput(): void {
    const input = this.shadowRoot?.querySelector<HTMLInputElement>('#color-value');
    input?.focus();
  }

  /** Whether current input is valid */
  @state()
  private isValid = true;

  connectedCallback(): void {
    super.connectedCallback();
    this.updateParsedColor();
  }

  updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('value')) {
      this.updateParsedColor();
    }
  }

  private updateParsedColor(): void {
    if (!this.value.trim()) {
      this.parsedColor = null;
      this.isValid = true;
      return;
    }

    const color = createColor(this.value, this.label);
    this.parsedColor = color;
    this.isValid = color !== null;
  }

  private handleColorInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.value = input.value;

    if (isValidColor(this.value)) {
      this.parsedColor = createColor(this.value, this.label);
      this.isValid = true;
      this.dispatchEvent(new CustomEvent('color-change', {
        detail: { color: this.parsedColor, value: this.value },
        bubbles: true,
        composed: true,
      }));
    } else if (this.value.trim()) {
      this.isValid = false;
      this.dispatchEvent(new CustomEvent('color-invalid', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }));
    } else {
      this.isValid = true;
      this.parsedColor = null;
    }
  }

  private handleLabelInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.label = input.value;

    if (this.parsedColor) {
      this.parsedColor = { ...this.parsedColor, label: this.label };
      this.dispatchEvent(new CustomEvent('color-change', {
        detail: { color: this.parsedColor, value: this.value },
        bubbles: true,
        composed: true,
      }));
    }
  }

  render() {
    const previewColor = this.parsedColor?.hex ?? '';
    const isEmpty = !previewColor;

    return html`
      <div
        class="input-wrapper ${this.isValid ? '' : 'invalid'}"
        style="--preview-color: ${previewColor || 'transparent'}"
      >
        <div class="color-row">
          <div
            class="color-preview ${isEmpty ? 'empty' : ''}"
            role="img"
            aria-label="${this.parsedColor ? `Color preview: ${this.parsedColor.hex}` : 'No color selected'}"
          ></div>

          <label class="sr-only" for="color-value">Color value</label>
          <input
            id="color-value"
            type="text"
            .value="${this.value}"
            ?disabled="${this.disabled}"
            @input="${this.handleColorInput}"
            aria-invalid="${!this.isValid}"
            aria-describedby="${!this.isValid ? 'color-error' : 'color-help'}"
          />
        </div>

        ${this.showLabel ? html`
          <label class="sr-only" for="color-label">Color label</label>
          <input
            id="color-label"
            type="text"
            class="label-input"
            .value="${this.label}"
            placeholder="Label (optional)"
            ?disabled="${this.disabled}"
            @input="${this.handleLabelInput}"
          />
        ` : null}
      </div>

      ${!this.isValid ? html`
        <p id="color-error" class="error-text">
          Invalid color format. Use hex (#RGB or #RRGGBB), rgb(), or hsl().
        </p>
      ` : html`
        <p id="color-help" class="help-text">
          Enter a color using hex (#RGB or #RRGGBB), rgb(r, g, b), or hsl(h, s%, l%) format.
        </p>
      `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-input': ColorInput;
  }
}
