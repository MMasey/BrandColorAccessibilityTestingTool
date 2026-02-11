import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * Brand guidance component that shows helpful tips about brand color best practices.
 */
@customElement('brand-guidance')
export class BrandGuidance extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .guidance {
      padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
      background: var(--theme-warning-bg-color);
      border: 1px solid var(--theme-warning-text-color);
      border-radius: var(--radius-md, 0.5rem);
      display: flex;
      align-items: flex-start;
      gap: var(--space-sm, 0.5rem);
    }

    .icon {
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--theme-warning-text-color, #f59e0b);
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .message {
      margin: 0;
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--theme-text-color, #1a1a1a);
      line-height: 1.4;
    }

    .dismiss-btn {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: var(--radius-sm, 0.25rem);
      color: var(--theme-text-muted-color);
      cursor: pointer;
      transition: background var(--transition-fast, 150ms ease);
    }

    .dismiss-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .dismiss-btn:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .dismiss-btn svg {
      width: 1rem;
      height: 1rem;
    }

    :host([hidden]) {
      display: none;
    }

    /* ========================================================================
       Windows High Contrast Mode (forced-colors: active)

       Let the browser handle most styling. Just add visible borders.
       ======================================================================== */
    @media (forced-colors: active) {
      .guidance {
        border: 2px solid CanvasText;
      }
    }
  `;

  @property({ type: Number })
  colorCount = 0;

  @state()
  private dismissed = false;

  private handleDismiss(): void {
    this.dismissed = true;
  }

  render() {
    // Don't show if less than 7 colors or if dismissed
    if (this.colorCount < 7 || this.dismissed) {
      return null;
    }

    return html`
      <div class="guidance" role="alert" aria-live="polite">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>

        <div class="content">
          <p class="message">
            <strong>Many colours detected (${this.colorCount}).</strong> Modern brand guidelines typically use 3-5 core colours for consistency and simplicity.
          </p>
        </div>

        <button
          type="button"
          class="dismiss-btn"
          @click="${this.handleDismiss}"
          aria-label="Dismiss guidance"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'brand-guidance': BrandGuidance;
  }
}
