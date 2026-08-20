import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import type { ResultsView } from '../state';

/**
 * Segmented Table / List toggle for the contrast results view (feature 107).
 * Follows the theme-switcher pattern: fieldset + legend + radio inputs so
 * the current view is announced as a selected radio option.
 */
@customElement('results-view-toggle')
export class ResultsViewToggle extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    /* Control and hint share a toolbar row; the hint wraps below on
       narrow viewports */
    .toggle-row {
      display: flex;
      align-items: center;
      gap: var(--space-md, 1rem);
      flex-wrap: wrap;
    }

    .section {
      display: flex;
      align-items: center;
      gap: var(--space-sm, 0.5rem);
      border: none;
      padding: 0;
      margin: 0;
    }

    .section-label {
      font-size: clamp(0.75rem, 2vw, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--theme-text-secondary-color);
      white-space: nowrap;
    }

    /* Visually hidden but accessible to screen readers */
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

    .view-options {
      display: flex;
      gap: 2px;
      background: var(--theme-card-bg-color, #f5f5f5);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      padding: 2px;
    }

    .view-option {
      flex: 1 1 auto;
      min-width: fit-content;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0 0.75rem;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--theme-text-secondary-color);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
      white-space: nowrap;

      &:hover:not(:has(input:checked)) {
        background: var(--theme-card-bg-color-hover);
      }

      /* Show focus ring when the radio input inside is focused */
      &:has(input:focus-visible) {
        outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
        outline-offset: var(--focus-ring-offset, 2px);
        z-index: 1;
      }

      /* Checked/selected state using :has() for pure CSS selection */
      &:has(input:checked) {
        background: var(--theme-button-bg-color, #0066cc);
        color: var(--theme-button-text-color, #ffffff);
      }

      svg {
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
      }
    }

    .view-hint {
      margin: 0;
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--theme-text-secondary-color);
      max-width: 32rem;
      line-height: 1.4;
    }

    /* ========================================================================
       Windows High Contrast Mode (forced-colors: active)
       ======================================================================== */
    @media (forced-colors: active) {
      .view-options {
        border: 2px solid CanvasText;
      }

      .view-option:has(input:focus-visible) {
        outline: 3px solid Highlight;
        outline-offset: 2px;
        z-index: 1;
      }

      .view-option:has(input:checked) {
        border: 2px solid Highlight;
        box-shadow: inset 0 0 0 2px Highlight;
      }
    }
  `;

  private store = new ColorStoreController(this);

  private handleViewChange(view: ResultsView): void {
    this.store.setResultsView(view);
  }

  private getViewIcon(view: ResultsView) {
    switch (view) {
      case 'table':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
        </svg>`;
      case 'list':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/>
          <line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/>
          <line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/>
          <line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round"/>
          <line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round"/>
          <line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round"/>
        </svg>`;
    }
  }

  render() {
    const currentView = this.store.resultsView;

    const views: { value: ResultsView; label: string }[] = [
      { value: 'table', label: 'Table' },
      { value: 'list', label: 'List' },
    ];

    return html`
      <div class="toggle-row">
        <fieldset class="section" aria-describedby="view-hint">
          <legend class="section-label sr-only">Results view</legend>
          <div class="view-options">
            ${views.map(({ value, label }) => html`
              <label class="view-option">
                <input
                  type="radio"
                  name="results-view"
                  class="sr-only"
                  .value="${value}"
                  .checked="${currentView === value}"
                  @change="${() => this.handleViewChange(value)}"
                />
                ${this.getViewIcon(value)}
                <span class="label">${label}</span>
              </label>
            `)}
          </div>
        </fieldset>
        <p class="view-hint" id="view-hint">
          List view groups results by WCAG level and reads top to bottom,
          making it easier to navigate with a screen reader.
        </p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'results-view-toggle': ResultsViewToggle;
  }
}
