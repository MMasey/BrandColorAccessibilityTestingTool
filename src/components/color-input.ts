import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { isValidColor, createColor } from '../utils';
import type { Color } from '../utils';

/**
 * Color input component styled to match color-swatch.
 * Layout: [color-box] [hex input + label input] [add button]
 *
 * @fires color-change - When a valid color is entered
 * @fires color-invalid - When input is not a valid color
 * @fires add-color - When the add button is clicked with a valid color
 */
@customElement('color-input')
export class ColorInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    /* Container matches color-swatch exactly */
    .swatch-container {
      display: flex;
      align-items: stretch;
      gap: 0;
      background: var(--color-surface-secondary, #f5f5f5);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      overflow: hidden;
      min-height: var(--touch-target-min, 44px);
      transition: border-color var(--transition-fast, 150ms ease);
    }

    .swatch-container:focus-within {
      border-color: var(--color-border-focus, #0066cc);
    }

    .swatch-container.invalid {
      border-color: var(--color-error, #dc2626);
    }

    /* Color preview box - matches color-swatch */
    .color-box {
      width: 3rem;
      min-width: 3rem;
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
      background: var(--preview-color, transparent);
    }

    /* Info section - matches color-swatch */
    .info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      gap: 0.125rem;
      /* Consistent height with color-swatch */
      min-height: 2.5rem;
    }

    /* Hex input - styled like color-swatch .hex with interactive cues */
    .hex-input {
      width: 100%;
      padding: 0.125rem 0;
      border: none;
      border-bottom: 1px dashed var(--color-border-default, #d4d4d4);
      background: transparent;
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-md, 1rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-primary, #1a1a1a);
      line-height: 1.2;
      transition: border-color var(--transition-fast, 150ms ease),
                  background-color var(--transition-fast, 150ms ease);
      border-radius: 0;
    }

    .hex-input:hover {
      border-bottom-style: solid;
      border-bottom-color: var(--color-text-muted, #888888);
      background: rgba(0, 0, 0, 0.02);
    }

    .hex-input:focus {
      outline: none;
      border-bottom-style: solid;
      border-bottom-color: var(--color-primary, #0066cc);
      /* Use box-shadow for thicker appearance without layout shift */
      box-shadow: 0 1px 0 0 var(--color-primary, #0066cc);
      background: rgba(0, 102, 204, 0.04);
    }

    .hex-input::placeholder {
      color: var(--color-text-muted, #888888);
      font-weight: var(--font-weight-normal, 400);
    }

    /* Label input - styled like color-swatch .label with interactive cues */
    .label-input {
      width: 100%;
      padding: 0.125rem 0;
      border: none;
      border-bottom: 1px dashed var(--color-border-default, #d4d4d4);
      background: transparent;
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-text-secondary, #555555);
      line-height: 1.3;
      transition: border-color var(--transition-fast, 150ms ease),
                  background-color var(--transition-fast, 150ms ease);
      border-radius: 0;
    }

    .label-input:hover {
      border-bottom-style: solid;
      border-bottom-color: var(--color-text-muted, #888888);
      background: rgba(0, 0, 0, 0.02);
    }

    .label-input:focus {
      outline: none;
      border-bottom-style: solid;
      border-bottom-color: var(--color-primary, #0066cc);
      /* Use box-shadow for thicker appearance without layout shift */
      box-shadow: 0 1px 0 0 var(--color-primary, #0066cc);
      background: rgba(0, 102, 204, 0.04);
    }

    .label-input::placeholder {
      color: var(--color-text-muted, #888888);
      font-style: italic;
    }

    /* Add button - styled like color-swatch .remove-btn but positive */
    .add-btn {
      width: var(--touch-target-min, 44px);
      min-width: var(--touch-target-min, 44px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-primary, #0066cc);
      border: none;
      border-left: 1px solid var(--color-border-default, #d4d4d4);
      color: white;
      cursor: pointer;
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      transition: background var(--transition-fast, 150ms ease);
    }

    .add-btn:hover:not(:disabled) {
      background: var(--color-primary-hover, #0052a3);
    }

    .add-btn:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .add-btn:disabled {
      background: var(--color-surface-tertiary, #e0e0e0);
      color: var(--color-text-muted, #888888);
      cursor: not-allowed;
    }

    .add-btn svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    /* Error message - only shown when invalid */
    .error-text {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-error, #dc2626);
      margin-top: var(--space-xs, 0.25rem);
      padding-left: calc(3rem + var(--space-sm, 0.5rem));
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

  /** Current color value (hex, rgb, hsl) */
  @property({ type: String })
  value = '';

  /** Current label value */
  @property({ type: String })
  label = '';

  /** Placeholder text for color input */
  @property({ type: String })
  placeholder = '#000000';

  /** Placeholder text for label input */
  @property({ type: String, attribute: 'label-placeholder' })
  labelPlaceholder = 'Label (optional)';

  /** Whether input is disabled */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Parsed color object (null if invalid) */
  @state()
  private parsedColor: Color | null = null;

  /** Whether current color input is valid */
  @state()
  private isValid = true;

  /** Whether user has typed something (for showing errors) */
  @state()
  private hasInput = false;

  /**
   * Focus the color input field
   */
  public focusInput(): void {
    const input = this.shadowRoot?.querySelector<HTMLInputElement>('.hex-input');
    input?.focus();
  }

  /**
   * Clear the input
   */
  public clear(): void {
    this.value = '';
    this.label = '';
    this.parsedColor = null;
    this.isValid = true;
    this.hasInput = false;
  }

  /**
   * Get the current parsed color
   */
  public getColor(): Color | null {
    return this.parsedColor;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.parseColor();
  }

  updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('value') || changedProperties.has('label')) {
      this.parseColor();
    }
  }

  private parseColor(): void {
    const colorValue = this.value.trim();

    if (!colorValue) {
      this.parsedColor = null;
      this.isValid = true;
      return;
    }

    if (isValidColor(colorValue)) {
      this.parsedColor = createColor(colorValue, this.label.trim());
      this.isValid = true;
    } else {
      this.parsedColor = null;
      this.isValid = false;
    }
  }

  private handleColorInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.hasInput = true;
    this.parseColor();
    this.emitChange();
  }

  private handleLabelInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.label = input.value;
    this.parseColor();
    this.emitChange();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && this.parsedColor) {
      e.preventDefault();
      this.handleAdd();
    }
  }

  private handleAdd(): void {
    if (!this.parsedColor) return;

    this.dispatchEvent(new CustomEvent('add-color', {
      detail: { color: this.parsedColor },
      bubbles: true,
      composed: true,
    }));
  }

  private emitChange(): void {
    if (this.parsedColor) {
      this.dispatchEvent(new CustomEvent('color-change', {
        detail: { color: this.parsedColor, value: this.value, label: this.label },
        bubbles: true,
        composed: true,
      }));
    } else if (this.value.trim()) {
      this.dispatchEvent(new CustomEvent('color-invalid', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }));
    }
  }

  render() {
    const previewColor = this.parsedColor?.hex ?? '';
    const showError = this.hasInput && !this.isValid && this.value.trim();

    return html`
      <div>
        <label class="sr-only" for="hex-input">
          Enter a color value (hex, rgb, or hsl format)
        </label>

        <div
          class="swatch-container ${showError ? 'invalid' : ''}"
          style="--preview-color: ${previewColor || 'transparent'}"
          @keydown="${this.handleKeyDown}"
        >
          <!-- Color preview box -->
          <div
            class="color-box"
            role="img"
            aria-label="${this.parsedColor ? `Color preview: ${this.parsedColor.hex}` : 'No color selected'}"
          ></div>

          <!-- Input fields matching color-swatch info section -->
          <div class="info">
            <input
              id="hex-input"
              type="text"
              class="hex-input"
              .value="${this.value}"
              placeholder="${this.placeholder}"
              ?disabled="${this.disabled}"
              @input="${this.handleColorInput}"
              aria-label="Color value"
              aria-invalid="${showError ? 'true' : 'false'}"
              autocomplete="off"
              spellcheck="false"
            />
            <input
              type="text"
              class="label-input"
              .value="${this.label}"
              placeholder="${this.labelPlaceholder}"
              ?disabled="${this.disabled}"
              @input="${this.handleLabelInput}"
              aria-label="Color label (optional)"
              maxlength="50"
            />
          </div>

          <!-- Add button - matches remove button position in color-swatch -->
          <button
            type="button"
            class="add-btn"
            ?disabled="${!this.parsedColor || this.disabled}"
            @click="${this.handleAdd}"
            aria-label="Add color to palette"
            title="${this.parsedColor ? 'Add color' : 'Enter a valid color first'}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        ${showError ? html`
          <p class="error-text" role="alert">
            Invalid color format
          </p>
        ` : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-input': ColorInput;
  }
}
