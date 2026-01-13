import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import type { GridFilterLevel, GridCellSize } from '../state/color-store';

/**
 * Grid filter controls for showing/hiding contrast combinations
 * based on WCAG compliance levels.
 */
@customElement('grid-filters')
export class GridFilters extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .filters {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl, 2rem);
    }

    .filter-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm, 0.5rem);
    }

    .section-title {
      margin: 0 0 var(--space-xs, 0.25rem) 0;
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--theme-text-secondary-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filter-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-sm, 0.5rem);

      @media (max-width: 360px) {
        grid-template-columns: 1fr;
      }
    }

    .filter-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-xs, 0.25rem);
      padding: var(--space-sm, 0.5rem);
      min-height: var(--touch-target-min, 44px);
      background: var(--theme-card-bg-color, #f5f5f5);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--theme-text-secondary-color);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);

      &:hover {
        background: var(--theme-card-bg-color-hover);
        border-color: var(--theme-input-border-color-hover);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      /* Active/pressed state using aria-pressed attribute */
      &[aria-pressed="true"] {
        background: var(--theme-button-bg-color);
        color: var(--theme-button-text-color);
        border-color: var(--theme-button-bg-color);
      }

      .label {
        white-space: nowrap;
      }

      .icon {
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
      }
    }

    .size-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-xs, 0.25rem);
    }

    .size-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      min-height: var(--touch-target-min, 44px);
      background: var(--theme-card-bg-color);
      border: 1px solid var(--theme-input-border-color);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--theme-text-secondary-color);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);

      &:hover {
        background: var(--theme-card-bg-color-hover);
        border-color: var(--theme-input-border-color-hover);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      /* Active/pressed state using aria-pressed attribute */
      &[aria-pressed="true"] {
        background: var(--theme-button-bg-color);
        color: var(--theme-button-text-color);
        border-color: var(--theme-button-bg-color);
      }
    }

    /* ========================================================================
       Windows High Contrast Mode (forced-colors: active)

       Let the browser handle most styling automatically. We only need to:
       1. Ensure visible borders
       2. Indicate selected state with inset box-shadow (so outline is free for focus)
       ======================================================================== */
    @media (forced-colors: active) {
      .filter-btn,
      .size-btn {
        border: 2px solid CanvasText;
      }

      /* Focus state - use outline (outer) */
      .filter-btn:focus-visible,
      .size-btn:focus-visible {
        outline: 3px solid Highlight;
        outline-offset: 2px;
      }

      /* Selected state - use inset box-shadow so it doesn't conflict with focus outline */
      .filter-btn[aria-pressed="true"],
      .size-btn[aria-pressed="true"] {
        border-color: Highlight;
        box-shadow: inset 0 0 0 2px Highlight;
      }
    }
  `;

  private store = new ColorStoreController(this);

  private handleFilterToggle(filter: GridFilterLevel): void {
    this.store.toggleGridFilter(filter);
  }

  private handleCellSizeChange(size: GridCellSize): void {
    this.store.setGridCellSize(size);
  }

  render() {
    const activeFilters = this.store.gridFilters;
    const currentSize = this.store.gridCellSize;

    const filters = [
      {
        id: 'aaa' as const,
        label: 'AAA',
        description: '7:1 normal, 4.5:1 large',
        icon: html`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="7 13 10 16 17 9" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="7 8 10 11 17 4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
      },
      {
        id: 'aa' as const,
        label: 'AA',
        description: '4.5:1 normal text',
        icon: html`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
      },
      {
        id: 'aa-large' as const,
        label: 'AA Large',
        description: '3:1 large text (18pt+)',
        icon: html`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke-linecap="round"/>
          <polyline points="16 10 11 15 8 12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
      },
      {
        id: 'failed' as const,
        label: 'Failed',
        description: 'Does not meet WCAG',
        icon: html`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round"/>
        </svg>`,
      },
    ];

    const sizes: Array<{ id: GridCellSize; label: string; description: string }> = [
      { id: 'small', label: 'S', description: 'Small grid cells' },
      { id: 'medium', label: 'M', description: 'Medium grid cells' },
      { id: 'large', label: 'L', description: 'Large grid cells' },
    ];

    return html`
      <div class="filters">
        <!-- Show in Grid Section -->
        <section class="filter-section" aria-labelledby="show-in-grid-heading">
          <h3 id="show-in-grid-heading" class="section-title">Show in Grid</h3>

          <div class="filter-buttons" role="group" aria-label="Filter contrast grid by WCAG level">
            ${filters.map(({ id, label, description, icon }) => html`
              <button
                type="button"
                class="filter-btn"
                @click="${() => this.handleFilterToggle(id)}"
                aria-pressed="${activeFilters.has(id)}"
                title="${description}"
              >
                ${icon}
                <span class="label">${label}</span>
              </button>
            `)}
          </div>

        </section>

        <!-- Cell Size Section -->
        <section class="filter-section" aria-labelledby="cell-size-heading">
          <h3 id="cell-size-heading" class="section-title">Cell Size</h3>

          <div class="size-buttons" role="group" aria-label="Adjust grid cell size">
            ${sizes.map(({ id, label, description }) => html`
              <button
                type="button"
                class="size-btn"
                @click="${() => this.handleCellSizeChange(id)}"
                aria-pressed="${currentSize === id}"
                aria-label="${description}"
                title="${description}"
              >
                ${label}
              </button>
            `)}
          </div>
        </section>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'grid-filters': GridFilters;
  }
}
