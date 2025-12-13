import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('app-shell')
export class AppShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
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
    }

    .skip-link:focus {
      top: 0;
    }

    header {
      padding: var(--space-md, 1rem) var(--space-lg, 1.5rem);
      background: var(--color-surface-secondary, #f5f5f5);
      border-bottom: 1px solid var(--color-border-default, #d4d4d4);
    }

    h1 {
      margin: 0;
      font-size: var(--font-size-2xl, 1.5rem);
      font-weight: var(--font-weight-bold, 700);
      color: var(--color-text-primary, #1a1a1a);
    }

    main {
      padding: var(--space-lg, 1.5rem);
      max-width: 1200px;
      margin: 0 auto;
    }

    .placeholder {
      padding: var(--space-xl, 2rem);
      background: var(--color-surface-secondary, #f5f5f5);
      border: 2px dashed var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      text-align: center;
      color: var(--color-text-secondary, #555555);
    }
  `;

  render() {
    return html`
      <a href="#main-content" class="skip-link">Skip to main content</a>

      <header>
        <h1>Brand Color Accessibility Tool</h1>
      </header>

      <main id="main-content" role="main">
        <div class="placeholder">
          <p>Color palette input and contrast grid will be rendered here.</p>
        </div>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
