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
      gap: var(--space-lg, 1.5rem);
      padding: var(--space-md, 1rem);
      background: var(--color-surface-primary, #ffffff);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
    }

    .filter-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm, 0.5rem);
    }

    .section-title {
      margin: 0;
      font-size: var(--font-size-md, 1rem);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-text-primary);
    }

    .filter-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-sm, 0.5rem);
      margin-bottom: var(--space-sm, 0.5rem);
    }

    .filter-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-xs, 0.25rem);
      padding: var(--space-sm, 0.5rem);
      min-height: var(--touch-target-min, 44px);
      background: var(--color-surface-secondary, #f5f5f5);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);

      &:hover {
        background: var(--color-surface-tertiary, #e8e8e8);
        border-color: var(--color-border-strong, #a3a3a3);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      &.active {
        background: var(--color-accent-primary, #0066cc);
        color: var(--color-text-inverse, #ffffff);
        border-color: var(--color-accent-primary, #0066cc);
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

    .help-text {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-text-muted);
      line-height: 1.4;
    }

    .size-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-xs, 0.25rem);
      margin-bottom: var(--space-sm, 0.5rem);
    }

    .size-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      min-height: var(--touch-target-min, 44px);
      background: var(--color-surface-secondary, #f5f5f5);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);

      &:hover {
        background: var(--color-surface-tertiary, #e8e8e8);
        border-color: var(--color-border-strong, #a3a3a3);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
        outline-offset: var(--focus-ring-offset, 2px);
      }

      &.active {
        background: var(--color-accent-primary, #0066cc);
        color: var(--color-text-inverse, #ffffff);
        border-color: var(--color-accent-primary, #0066cc);
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
                class="filter-btn ${activeFilters.has(id) ? 'active' : ''}"
                @click="${() => this.handleFilterToggle(id)}"
                aria-pressed="${activeFilters.has(id)}"
                title="${description}"
              >
                ${icon}
                <span class="label">${label}</span>
              </button>
            `)}
          </div>

          <p class="help-text">
            Click to show or hide combinations. All enabled levels will be visible in the contrast grid.
          </p>
        </section>

        <!-- Cell Size Section -->
        <section class="filter-section" aria-labelledby="cell-size-heading">
          <h3 id="cell-size-heading" class="section-title">Cell Size</h3>

          <div class="size-buttons" role="group" aria-label="Adjust grid cell size">
            ${sizes.map(({ id, label, description }) => html`
              <button
                type="button"
                class="size-btn ${currentSize === id ? 'active' : ''}"
                @click="${() => this.handleCellSizeChange(id)}"
                aria-pressed="${currentSize === id}"
                aria-label="${description}"
                title="${description}"
              >
                ${label}
              </button>
            `)}
          </div>

          <p class="help-text">
            Adjust the size of grid cells. Text scales proportionally for accessibility.
          </p>
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
