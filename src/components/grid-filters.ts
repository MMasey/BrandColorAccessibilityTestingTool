import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import type { GridFilterLevel } from '../state/color-store';

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
      gap: var(--space-md, 1rem);
    }

    .section-title {
      margin: 0;
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-text-secondary, #555555);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filter-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-sm, 0.5rem);
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
      color: var(--color-text-secondary, #555555);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);
    }

    .filter-btn:hover {
      background: var(--color-surface-tertiary, #e8e8e8);
      border-color: var(--color-border-strong, #a3a3a3);
    }

    .filter-btn:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .filter-btn.active {
      background: var(--color-accent-primary, #0066cc);
      color: var(--color-text-inverse, #ffffff);
      border-color: var(--color-accent-primary, #0066cc);
    }

    .filter-btn .label {
      white-space: nowrap;
    }

    .filter-btn .icon {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    .help-text {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-text-muted, #666666);
      line-height: 1.4;
    }
  `;

  private store = new ColorStoreController(this);

  private handleFilterToggle(filter: GridFilterLevel): void {
    this.store.toggleGridFilter(filter);
  }

  render() {
    const activeFilters = this.store.gridFilters;

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

    return html`
      <div class="filters">
        <h3 class="section-title">Show in Grid</h3>

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
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'grid-filters': GridFilters;
  }
}
