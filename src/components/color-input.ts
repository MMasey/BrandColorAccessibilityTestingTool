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
      background: var(--theme-card-bg-color, #f5f5f5);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      overflow: hidden;
      min-height: var(--touch-target-min, 44px);
      transition: border-color var(--transition-fast, 150ms ease);
    }

    .swatch-container.invalid {
      border-color: var(--theme-error-text-color, #dc2626);
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
      border-bottom: 1px dashed var(--theme-input-border-color, #d4d4d4);
      background: transparent;
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-md, 1rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--theme-text-color, #1a1a1a);
      line-height: 1.2;
      transition: border-color var(--transition-fast, 150ms ease),
                  background-color var(--transition-fast, 150ms ease);
      border-radius: 0;
    }

    .hex-input:hover {
      border-bottom-style: solid;
      border-bottom-color: var(--theme-text-muted-color, #888888);
      background: rgba(0, 0, 0, 0.02);
    }

    .hex-input:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
      outline-offset: 1px;
      border-bottom-color: transparent;
    }

    .hex-input::placeholder {
      color: var(--theme-text-muted-color, #888888);
      font-weight: var(--font-weight-normal, 400);
    }

    /* Label input - styled like color-swatch .label with interactive cues */
    .label-input {
      width: 100%;
      padding: 0.125rem 0;
      border: none;
      border-bottom: 1px dashed var(--theme-input-border-color, #d4d4d4);
      background: transparent;
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--theme-text-secondary-color, #555555);
      line-height: 1.3;
      transition: border-color var(--transition-fast, 150ms ease),
                  background-color var(--transition-fast, 150ms ease);
      border-radius: 0;
    }

    .label-input:hover {
      border-bottom-style: solid;
      border-bottom-color: var(--theme-text-muted-color, #888888);
      background: rgba(0, 0, 0, 0.02);
    }

    .label-input:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
      outline-offset: 1px;
      border-bottom-color: transparent;
    }

    .label-input::placeholder {
      color: var(--theme-text-muted-color, #888888);
      font-style: italic;
    }

    /* Add button - styled like color-swatch .remove-btn but positive */
    .add-btn {
      width: var(--touch-target-min, 44px);
      min-width: var(--touch-target-min, 44px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--theme-button-bg-color);
      border: none;
      border-left: 1px solid var(--theme-input-border-color);
      color: var(--theme-button-text-color);
      cursor: pointer;
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      transition: background var(--transition-fast, 150ms ease);
    }

    .add-btn:hover:not(:disabled) {
      background: var(--theme-button-bg-color-hover);
    }

    .add-btn:focus-visible {
      /* Use outline with negative offset to draw inside element, avoiding overflow:hidden clipping */
      outline: var(--focus-ring-width, 2px) solid var(--theme-button-text-color);
      outline-offset: -4px;
    }

    .add-btn:disabled {
      background: var(--theme-card-bg-color-hover);
      color: var(--theme-text-muted-color);
      cursor: not-allowed;
    }

    .add-btn svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    /* Error message - only shown when invalid */
    .error-text {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--theme-error-text-color, #dc2626);
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

    /* ========================================================================
       Windows High Contrast Mode (forced-colors: active)

       Let the browser handle most styling automatically. We only need to:
       1. Preserve actual colors in the color preview box
       2. Add visible borders for structure
       ======================================================================== */
    @media (forced-colors: active) {
      .swatch-container {
        border: 2px solid CanvasText;
      }

      .color-box {
        /* MUST preserve actual color for the preview */
        forced-color-adjust: none;
        border-right: 2px solid CanvasText;
      }

      .color-box::before {
        /* Checkerboard needs visible pattern */
        background: repeating-conic-gradient(Canvas 0% 25%, CanvasText 0% 50%) 50% / 8px 8px;
      }

      /* Let browser handle input styling - just ensure visible borders */
      .hex-input,
      .label-input {
        border-bottom: 2px solid GrayText;
      }

      .add-btn {
        border-left: 2px solid CanvasText;
      }
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
      return;
    }

    if (isValidColor(colorValue)) {
      this.parsedColor = createColor(colorValue, this.label.trim());
    } else {
      this.parsedColor = null;
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
    // If no valid color, trigger validation feedback instead of silently failing
    if (!this.parsedColor) {
      this.hasInput = true; // Triggers error display
      // Focus the input so user can correct the value
      this.focusInput();
      return;
    }

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
    // Show error when user has interacted AND there's no valid color
    const showError = this.hasInput && !this.parsedColor;

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
            aria-label="${this.parsedColor ? `Colour preview: ${this.parsedColor.hex}` : 'No colour selected'}"
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
              aria-invalid="${showError ? 'true' : 'false'}"
              autocomplete="off"
              spellcheck="false"
            />
            <!-- aria-invalid: Required for custom validation. Native :invalid only works with
                 HTML5 validation attributes (required, pattern). Since we validate programmatically,
                 aria-invalid tells assistive tech when the input has an error. -->
            <input
              type="text"
              class="label-input"
              .value="${this.label}"
              placeholder="${this.labelPlaceholder}"
              ?disabled="${this.disabled}"
              @input="${this.handleLabelInput}"
              aria-label="Colour label (optional)"
              maxlength="50"
            />
          </div>

          <!-- Add button - always enabled to allow validation feedback on click -->
          <button
            type="button"
            class="add-btn"
            ?disabled="${this.disabled}"
            @click="${this.handleAdd}"
            aria-label="Add colour to palette"
            title="Add colour to palette"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        ${showError ? html`
          <p class="error-text" role="alert">
            ${this.value.trim() ? 'Invalid color format' : 'Enter a color value'}
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
