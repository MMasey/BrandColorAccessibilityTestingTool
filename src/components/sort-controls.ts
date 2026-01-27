/**
 * Sort Controls Component
 *
 * Provides UI for sorting color palettes by various criteria.
 * WCAG 2.2 compliant with full keyboard navigation.
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import { getSortCriteriaLabel, type SortCriteria, type SortDirection } from '../utils/color-sorting';

@customElement('sort-controls')
export class SortControls extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .sort-controls {
      display: flex;
      align-items: center;
      gap: var(--space-sm, 0.5rem);
      flex-wrap: wrap;
    }

    .sort-label {
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--theme-text-secondary-color);
      font-weight: var(--font-weight-medium, 500);
    }

    .sort-select {
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      background: var(--theme-card-bg-color, #f5f5f5);
      color: var(--theme-text-color);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
      min-width: 180px;

      &:hover {
        background: var(--theme-card-bg-color-hover);
        border-color: var(--theme-text-secondary-color);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      @media (max-width: 640px) {
        min-width: 140px;
        font-size: var(--font-size-xs, 0.75rem);
      }
    }

    .direction-btn {
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      background: var(--theme-card-bg-color, #f5f5f5);
      color: var(--theme-text-color);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) {
        background: var(--theme-card-bg-color-hover);
        border-color: var(--theme-text-secondary-color);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 640px) {
        font-size: var(--font-size-xs, 0.75rem);
      }
    }

    .reset-btn {
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      background: transparent;
      color: var(--theme-text-secondary-color);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
      min-width: 44px;
      min-height: 44px;

      &:hover:not(:disabled) {
        background: var(--theme-button-bg-color);
        border-color: var(--theme-button-border-color);
        color: var(--theme-button-text-color);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 640px) {
        font-size: var(--font-size-xs, 0.75rem);
      }
    }

    .sort-indicator {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs, 0.25rem);
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--theme-text-muted-color);
      padding: 0.125rem var(--space-xs, 0.25rem);
      background: var(--theme-button-bg-color);
      color: var(--theme-button-text-color);
      border-radius: var(--radius-sm, 0.25rem);
    }

    /* Screen reader only */
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

    /* Windows High Contrast Mode */
    @media (forced-colors: active) {
      .sort-select,
      .direction-btn,
      .reset-btn {
        border: 2px solid CanvasText;
      }

      .sort-indicator {
        border: 2px solid CanvasText;
      }
    }
  `;

  private store = new ColorStoreController(this);

  @state()
  private statusMessage = '';

  private handleSortChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    const criteria = select.value as SortCriteria;
    const { direction } = this.store.getSortState();

    this.store.sortColorsPalette(criteria, direction);

    // Announce to screen readers
    const label = getSortCriteriaLabel(criteria, direction);
    this.statusMessage = `Colors sorted: ${label}`;
  }

  private toggleDirection(): void {
    const { criteria, direction } = this.store.getSortState();
    const newDirection: SortDirection = direction === 'ascending' ? 'descending' : 'ascending';

    this.store.sortColorsPalette(criteria, newDirection);

    // Announce to screen readers
    const label = getSortCriteriaLabel(criteria, newDirection);
    this.statusMessage = `Sort direction changed: ${label}`;
  }

  private resetOrder(): void {
    this.store.resetToOriginalOrder();
    this.statusMessage = 'Colors reset to original order';
  }

  render() {
    const { criteria, direction, isSorted } = this.store.getSortState();
    const colors = this.store.colors;

    // Don't show controls if less than 2 colors
    if (colors.length < 2) {
      return html``;
    }

    return html`
      <!-- Screen reader announcements -->
      <div
        class="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        ${this.statusMessage}
      </div>

      <div class="sort-controls">
        <label class="sort-label" for="sort-select">Sort:</label>

        <select
          id="sort-select"
          class="sort-select"
          @change="${this.handleSortChange}"
          .value="${criteria}"
          aria-label="Sort colors by"
        >
          <option value="manual">Manual Order</option>
          <option value="luminance">Luminance (Lightest ↔ Darkest)</option>
          <option value="contrast">Contrast Score</option>
          <option value="pass-rate">WCAG Pass Rate</option>
          <option value="hue">Hue (ROYGBIV)</option>
          <option value="alphabetical">Alphabetical</option>
        </select>

        <button
          type="button"
          class="direction-btn"
          @click="${this.toggleDirection}"
          ?disabled="${criteria === 'manual'}"
          aria-label="Toggle sort direction"
          title="${direction === 'ascending' ? 'Switch to descending' : 'Switch to ascending'}"
        >
          ${direction === 'ascending' ? '↑' : '↓'}
        </button>

        ${isSorted ? html`
          <button
            type="button"
            class="reset-btn"
            @click="${this.resetOrder}"
            aria-label="Reset to original order"
            title="Reset to original order"
          >
            ↺ Reset
          </button>
        ` : null}

        ${isSorted ? html`
          <span class="sort-indicator" aria-label="Currently sorted">
            Sorted
          </span>
        ` : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sort-controls': SortControls;
  }
}
