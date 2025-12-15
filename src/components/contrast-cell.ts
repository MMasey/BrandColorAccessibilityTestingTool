import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ContrastResult, WCAGLevel } from '../utils';

/**
 * Contrast cell component showing the contrast ratio and WCAG compliance badge.
 * Used as a cell in the contrast grid.
 */
@customElement('contrast-cell')
export class ContrastCell extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-xs, 0.25rem);
      padding: var(--space-sm, 0.5rem);
      min-width: 5rem;
      min-height: 5rem;
      background: var(--bg-color, #ffffff);
      border: 1px solid var(--color-border-default, #d4d4d4);
      position: relative;
      transition: transform var(--transition-fast, 150ms ease);
    }

    .cell:hover {
      z-index: 1;
      transform: scale(1.05);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
    }

    .cell:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
      outline-offset: var(--focus-ring-offset, 2px);
      z-index: 2;
    }

    .cell.same-color {
      background: repeating-linear-gradient(
        45deg,
        var(--bg-color, #ffffff),
        var(--bg-color, #ffffff) 5px,
        var(--color-surface-secondary, #f5f5f5) 5px,
        var(--color-surface-secondary, #f5f5f5) 10px
      );
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
    }

    .badge.aaa {
      background: var(--color-success, #15803d);
      color: #ffffff;
    }

    .badge.aa {
      background: var(--color-success, #15803d);
      color: #ffffff;
    }

    .badge.aa18 {
      background: var(--color-warning, #a16207);
      color: #ffffff;
    }

    .badge.dnp {
      background: var(--color-error, #dc2626);
      color: #ffffff;
    }

    .sample-text {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--fg-color, #000000);
      opacity: 0.8;
    }

    /* Compact mode for smaller cells */
    :host([compact]) .cell {
      min-width: 3.5rem;
      min-height: 3.5rem;
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

    /* Mobile: auto-compact mode */
    @media (max-width: 640px) {
      .cell {
        min-width: 3.5rem;
        min-height: 3.5rem;
        padding: var(--space-xs, 0.25rem);
      }

      .ratio {
        font-size: var(--font-size-sm, 0.875rem);
      }

      .badge {
        font-size: 0.625rem;
        padding: 0.0625rem 0.25rem;
      }

      .sample-text {
        display: none;
      }
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

  private getBadgeClass(level: WCAGLevel): string {
    return level.toLowerCase();
  }

  private getBadgeLabel(level: WCAGLevel): string {
    switch (level) {
      case 'AAA': return 'AAA';
      case 'AA': return 'AA';
      case 'AA18': return 'AA 18+';
      case 'DNP': return 'Fail';
    }
  }

  private getAriaLabel(): string {
    if (!this.result) return 'No contrast data';

    const levelDesc = this.result.level === 'DNP'
      ? 'Does not pass'
      : `Passes ${this.result.level}`;

    return `Contrast ratio ${this.result.ratioString}. ${levelDesc}`;
  }

  render() {
    if (!this.result) return html`<div class="cell">-</div>`;

    return html`
      <div
        class="cell ${this.sameColor ? 'same-color' : ''}"
        style="--fg-color: ${this.fgColor}; --bg-color: ${this.bgColor}"
        aria-label="${this.getAriaLabel()}"
      >
        <span class="ratio">${this.result.ratioString}</span>
        <span class="badge ${this.getBadgeClass(this.result.level)}">
          ${this.getBadgeLabel(this.result.level)}
        </span>
        ${!this.compact && !this.sameColor ? html`
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
