import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ContrastResult } from '../utils';
import {
  WCAG_BADGE_COLORS,
  getBadgeClass,
  getBadgeLabel,
  getBadgeTitle,
} from '../utils';

/**
 * Contrast cell component showing the contrast ratio and WCAG compliance badge.
 * Used as a cell in the contrast grid.
 */
@customElement('contrast-cell')
export class ContrastCell extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    * {
      box-sizing: border-box;
    }

    /* Filtered cells are hidden - use visibility to hide content from axe analysis */
    :host([filtered]) {
      pointer-events: none;
    }

    :host([filtered]) .cell {
      background: var(--color-surface-secondary, #f5f5f5) !important;
    }

    :host([filtered]) .ratio,
    :host([filtered]) .badge,
    :host([filtered]) .sample-text {
      visibility: hidden;
    }

    .cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-xs, 0.25rem);
      padding: var(--space-sm, 0.5rem);
      /* Fill parent container */
      width: 100%;
      height: 100%;
      background: var(--bg-color, #ffffff);
      position: relative;
      aspect-ratio: 1 / 1;

      &.same-color {
        background: repeating-linear-gradient(
          45deg,
          var(--bg-color, #ffffff),
          var(--bg-color, #ffffff) 5px,
          var(--color-surface-secondary, #f5f5f5) 5px,
          var(--color-surface-secondary, #f5f5f5) 10px
        );
      }
    }

    /* Cell size variations - adjust internal styling */
    :host([cell-size="small"]) .cell {
      padding: var(--space-xs, 0.25rem);
    }

    :host([cell-size="small"]) .ratio {
      font-size: 0.75rem;
    }

    :host([cell-size="small"]) .badge {
      font-size: 0.5rem;
      padding: 0.0625rem 0.25rem;
    }

    :host([cell-size="small"]) .sample-text {
      font-size: 0.5rem;
    }

    :host([cell-size="medium"]) .cell {
      padding: var(--space-sm, 0.5rem);
    }

    :host([cell-size="medium"]) .ratio {
      font-size: var(--font-size-md, 1rem);
    }

    :host([cell-size="medium"]) .badge {
      font-size: var(--font-size-xs, 0.75rem);
      padding: 0.125rem 0.375rem;
    }

    :host([cell-size="medium"]) .sample-text {
      font-size: var(--font-size-xs, 0.75rem);
    }

    :host([cell-size="large"]) .cell {
      padding: var(--space-md, 1rem);
    }

    :host([cell-size="large"]) .ratio {
      font-size: 1.25rem;
    }

    :host([cell-size="large"]) .badge {
      font-size: var(--font-size-md, 1rem);
      padding: 0.25rem 0.5rem;
    }

    :host([cell-size="large"]) .sample-text {
      font-size: var(--font-size-md, 1rem);
    }

    /* Compact mode for smaller cells */
    :host([compact]) .cell {
      padding: var(--space-xs, 0.25rem);
    }

    :host([compact]) .ratio {
      font-size: var(--font-size-sm, 0.875rem);
    }

    :host([compact]) .badge {
      font-size: 0.625rem;
      padding: 0.0625rem 0.25rem;
    }

    :host([compact]) .sample-text {
      display: none;
    }

    .ratio {
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-md, 1rem);
      font-weight: var(--font-weight-bold, 700);
      color: var(--fg-color, #000000);
    }

    .badge {
      padding: 0.125rem 0.375rem;
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-semibold, 600);
      border-radius: var(--radius-sm, 0.25rem);
      text-transform: uppercase;
      letter-spacing: 0.025em;

      /* Badge colors from WCAG_BADGE_COLORS in utils/wcag-config.ts */
      &.aaa { background: ${unsafeCSS(WCAG_BADGE_COLORS.AAA)}; color: #fff; }
      &.aa { background: ${unsafeCSS(WCAG_BADGE_COLORS.AA)}; color: #fff; }
      &.aa18 { background: ${unsafeCSS(WCAG_BADGE_COLORS.AA18)}; color: #fff; }
      &.dnp { background: ${unsafeCSS(WCAG_BADGE_COLORS.DNP)}; color: #fff; }
    }

    .sample-text {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--fg-color, #000000);
      opacity: 0.8;
    }
  `;

  /** The contrast result to display */
  @property({ type: Object })
  result: ContrastResult | null = null;

  /** Foreground color hex */
  @property({ type: String, attribute: 'fg-color' })
  fgColor = '#000000';

  /** Background color hex */
  @property({ type: String, attribute: 'bg-color' })
  bgColor = '#ffffff';

  /** Whether this is the same color (diagonal cell) */
  @property({ type: Boolean, attribute: 'same-color' })
  sameColor = false;

  /** Compact display mode */
  @property({ type: Boolean, reflect: true })
  compact = false;

  /** Whether this cell is filtered out by grid filters */
  @property({ type: Boolean, reflect: true })
  filtered = false;

  /** Grid cell size */
  @property({ type: String, reflect: true, attribute: 'cell-size' })
  cellSize: 'small' | 'medium' | 'large' = 'medium';

  private getAriaLabel(): string {
    if (!this.result) return 'No contrast data';

    const levelDesc = this.result.level === 'DNP'
      ? 'Does not pass'
      : `Passes ${this.result.level}`;

    return `Contrast ratio ${this.result.ratioString}. ${levelDesc}`;
  }

  render() {
    if (!this.result) return html`<div class="cell">—</div>`;

    // For same-color cells (diagonal), show em dash instead of ratio
    if (this.sameColor) {
      return html`
        <div
          class="cell same-color"
          style="--fg-color: ${this.fgColor}; --bg-color: ${this.bgColor}"
          aria-label="Same color"
        >
          <span class="ratio">—</span>
        </div>
      `;
    }

    return html`
      <div
        class="cell"
        style="--fg-color: ${this.fgColor}; --bg-color: ${this.bgColor}"
        aria-label="${this.getAriaLabel()}"
      >
        <span class="ratio">${this.result.ratioString}</span>
        <span
          class="badge ${getBadgeClass(this.result.level)}"
          title="${getBadgeTitle(this.result.level)}"
        >
          ${getBadgeLabel(this.result.level)}
        </span>
        ${!this.compact ? html`
          <span class="sample-text">Aa</span>
        ` : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'contrast-cell': ContrastCell;
  }
}
