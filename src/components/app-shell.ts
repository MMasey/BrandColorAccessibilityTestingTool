import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import './color-palette';
import './contrast-grid';
import './theme-switcher';
import './grid-filters';

/**
 * Main application shell component.
 * Provides the overall layout and wires together all UI components.
 */
@customElement('app-shell')
export class AppShell extends LitElement {
  /**
   * Set up skip link handler to focus the internal <main> element.
   * The skip link is in light DOM (index.html) for native hash navigation,
   * but we enhance it to focus the semantic <main> inside shadow DOM.
   */
  connectedCallback() {
    super.connectedCallback();
    const skipLink = document.querySelector('a[href="#main-content"]');
    if (skipLink) {
      skipLink.addEventListener('click', this.handleSkipLink);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const skipLink = document.querySelector('a[href="#main-content"]');
    if (skipLink) {
      skipLink.removeEventListener('click', this.handleSkipLink);
    }
  }

  private handleSkipLink = (e: Event) => {
    e.preventDefault();
    // Focus the semantic <main> element inside shadow DOM and scroll to it
    const main = this.shadowRoot?.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  };

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--theme-page-bg-color, #ffffff);
    }

    header {
      padding: var(--space-md, 1rem) var(--space-lg, 1.5rem);
      background: var(--theme-card-bg-color, #f5f5f5);
      border-bottom: 1px solid var(--theme-input-border-color, #d4d4d4);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-lg, 1.5rem);

      /* Responsive header layout */
      @media (max-width: 767px) {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-md, 1rem);
      }
    }

    .header-main {
      flex: 1 1 auto;
      min-width: 0; /* Allow text to wrap */
    }

    .header-controls {
      flex: 0 0 auto;
      align-self: center;

      @media (max-width: 767px) {
        align-self: stretch;
        justify-content: flex-start;
      }
    }

    h1 {
      margin: 0 0 var(--space-xs, 0.25rem) 0;
      font-size: clamp(1.25rem, 4vw, 1.5rem);
      font-weight: var(--font-weight-bold, 700);
      color: var(--theme-text-color, #1a1a1a);
      line-height: 1.2;
    }

    .tagline {
      margin: 0;
      font-size: clamp(0.8125rem, 2vw, 0.875rem);
      color: var(--theme-text-secondary-color);
      line-height: 1.4;
    }

    main {
      padding: var(--space-lg, 1.5rem);
      max-width: 1400px;
      margin: 0 auto;
    }

    .layout {
      display: grid;
      gap: var(--space-xl, 2rem);

      /* Desktop: sidebar layout */
      @media (min-width: 1024px) {
        grid-template-columns: 320px 1fr;
        grid-template-rows: auto 1fr;
      }

      /* Tablet: stacked layout */
      @media (min-width: 768px) and (max-width: 1023px) {
        grid-template-columns: 1fr 1fr;
      }

      /* Mobile: single column */
      @media (max-width: 767px) {
        grid-template-columns: 1fr;
      }
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg, 1.5rem);

      @media (min-width: 1024px) {
        grid-row: 1 / -1;
      }

      @media (min-width: 768px) and (max-width: 1023px) {
        grid-column: 1 / -1;
      }
    }

    .controls-section {
      padding: var(--space-md, 1rem);
      background: var(--theme-card-bg-color, #f5f5f5);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
    }

    .section-title {
      margin: 0 0 var(--space-sm, 0.5rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--theme-text-secondary-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .grid-section {
      min-width: 0;

      @media (min-width: 768px) and (max-width: 1023px) {
        grid-column: 1 / -1;
      }
    }

    .grid-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-md, 1rem);
      margin-bottom: var(--space-md, 1rem);
    }

    .grid-title {
      margin: 0;
      font-size: var(--font-size-lg, 1.125rem);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--theme-text-color, #1a1a1a);
    }

    footer {
      padding: var(--space-md, 1rem) var(--space-lg, 1.5rem);
      background: var(--theme-card-bg-color, #f5f5f5);
      border-top: 1px solid var(--theme-input-border-color, #d4d4d4);
      text-align: center;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--theme-text-secondary-color);

      a {
        color: var(--theme-focus-ring-color);
        text-decoration: underline;

        &:hover {
          text-decoration-thickness: 2px;
        }

        &:focus-visible {
          outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
          outline-offset: var(--focus-ring-offset, 2px);
        }
      }
    }

    /* ========================================================================
       Windows High Contrast Mode (forced-colors: active)

       Let the browser handle most styling. Just add visible borders.
       ======================================================================== */
    @media (forced-colors: active) {
      header {
        border-bottom: 2px solid CanvasText;
      }

      .controls-section {
        border: 2px solid CanvasText;
      }

      footer {
        border-top: 2px solid CanvasText;
      }
    }
  `;

  render() {
    return html`
      <header>
        <div class="header-content">
          <div class="header-main">
            <h1>Brand Colour Accessibility Tool</h1>
            <p class="tagline">Validate your colour palette against WCAG 2.2 contrast requirements</p>
          </div>
          <div class="header-controls">
            <theme-switcher></theme-switcher>
          </div>
        </div>
      </header>

      <main>
        <div class="layout">
          <aside class="sidebar" aria-label="Colour palette controls">
            <color-palette></color-palette>

            <div class="controls-section">
              <grid-filters></grid-filters>
            </div>
          </aside>

          <section class="grid-section" aria-label="Contrast results">
            <div class="grid-header">
              <h2 class="grid-title">Contrast Grid</h2>
            </div>
            <contrast-grid></contrast-grid>
          </section>
        </div>
      </main>

      <footer>
        <div class="footer-content">
          <p>
            Built for accessibility. Evaluates contrast against
            <a href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" target="_blank" rel="noopener">
              WCAG 2.2 Success Criterion 1.4.3
            </a>
          </p>
        </div>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
