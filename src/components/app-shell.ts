import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import './color-palette';
import './text-size-toggle';
import './contrast-grid';
import './theme-switcher';

/**
 * Main application shell component.
 * Provides the overall layout and wires together all UI components.
 */
@customElement('app-shell')
export class AppShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--color-surface-primary, #ffffff);
    }

    .skip-link {
      position: absolute;
      top: -100%;
      left: 0;
      padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
      background: var(--color-accent-primary, #0066cc);
      color: var(--color-text-inverse, #ffffff);
      text-decoration: none;
      font-weight: var(--font-weight-medium, 500);
      z-index: 9999;
      border-radius: 0 0 var(--radius-md, 0.5rem) 0;
    }

    .skip-link:focus {
      top: 0;
    }

    header {
      padding: var(--space-md, 1rem) var(--space-lg, 1.5rem);
      background: var(--color-surface-secondary, #f5f5f5);
      border-bottom: 1px solid var(--color-border-default, #d4d4d4);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-lg, 1.5rem);
    }

    .header-main {
      flex: 1 1 auto;
      min-width: 0; /* Allow text to wrap */
    }

    .header-controls {
      flex: 0 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: var(--space-md, 1rem);
      align-self: flex-end;
    }

    h1 {
      margin: 0 0 var(--space-xs, 0.25rem) 0;
      font-size: clamp(1.25rem, 4vw, 1.5rem);
      font-weight: var(--font-weight-bold, 700);
      color: var(--color-text-primary, #1a1a1a);
      line-height: 1.2;
    }

    .tagline {
      margin: 0;
      font-size: clamp(0.8125rem, 2vw, 0.875rem);
      color: var(--color-text-secondary, #555555);
      line-height: 1.4;
    }

    /* Responsive header layout */
    @media (max-width: 767px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-md, 1rem);
      }

      .header-controls {
        align-self: stretch;
        justify-content: flex-start;
      }
    }

    main {
      padding: var(--space-lg, 1.5rem);
      max-width: 1400px;
      margin: 0 auto;
    }

    .layout {
      display: grid;
      gap: var(--space-xl, 2rem);
    }

    /* Desktop: sidebar layout */
    @media (min-width: 1024px) {
      .layout {
        grid-template-columns: 320px 1fr;
        grid-template-rows: auto 1fr;
      }

      .sidebar {
        grid-row: 1 / -1;
      }
    }

    /* Tablet: stacked layout */
    @media (min-width: 768px) and (max-width: 1023px) {
      .layout {
        grid-template-columns: 1fr 1fr;
      }

      .sidebar {
        grid-column: 1 / -1;
      }
    }

    /* Mobile: single column */
    @media (max-width: 767px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg, 1.5rem);
    }

    .controls-section {
      padding: var(--space-md, 1rem);
      background: var(--color-surface-secondary, #f5f5f5);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
    }

    .section-title {
      margin: 0 0 var(--space-sm, 0.5rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-text-secondary, #555555);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .grid-section {
      min-width: 0;
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
      color: var(--color-text-primary, #1a1a1a);
    }

    footer {
      padding: var(--space-md, 1rem) var(--space-lg, 1.5rem);
      background: var(--color-surface-secondary, #f5f5f5);
      border-top: 1px solid var(--color-border-default, #d4d4d4);
      text-align: center;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--color-text-secondary, #555555);
    }

    .footer-content a {
      color: var(--color-accent-primary, #0066cc);
      text-decoration: underline;
    }

    .footer-content a:hover {
      text-decoration-thickness: 2px;
    }

    .footer-content a:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
    }
  `;

  render() {
    return html`
      <a href="#main-content" class="skip-link">Skip to main content</a>

      <header>
        <div class="header-content">
          <div class="header-main">
            <h1>Brand Color Accessibility Tool</h1>
            <p class="tagline">Validate your color palette against WCAG 2.1 contrast requirements</p>
          </div>
          <div class="header-controls">
            <text-size-toggle></text-size-toggle>
            <theme-switcher></theme-switcher>
          </div>
        </div>
      </header>

      <main id="main-content" role="main">
        <div class="layout">
          <aside class="sidebar" aria-label="Color palette controls">
            <color-palette></color-palette>
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
            <a href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html" target="_blank" rel="noopener">
              WCAG 2.1 Success Criterion 1.4.3
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
