import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import { generateContrastMatrix } from '../utils';
import type { Color, ContrastResult } from '../utils';
import './contrast-cell';

/**
 * Contrast grid component showing all foreground/background color combinations.
 * Displays WCAG compliance for each pair.
 */
@customElement('contrast-grid')
export class ContrastGrid extends LitElement {
  static styles = css`
    :host {
      display: block;
      overflow-x: auto;
    }

    .grid-container {
      display: inline-block;
      min-width: 100%;
    }

    .grid {
      display: grid;
      gap: 1px;
      background: var(--color-border-default, #d4d4d4);
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      overflow: hidden;
    }

    .header-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-sm, 0.5rem);
      background: var(--color-surface-secondary, #f5f5f5);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-secondary, #555555);
      min-width: 5rem;
      min-height: 2.5rem;
    }

    .header-cell.corner {
      background: var(--color-surface-tertiary, #e8e8e8);
    }

    .header-cell.row-header {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      min-height: 5rem;
    }

    .color-indicator {
      display: flex;
      align-items: center;
      gap: var(--space-xs, 0.25rem);
    }

    .color-dot {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      border: 1px solid var(--color-border-default, #d4d4d4);
      flex-shrink: 0;
    }

    .color-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 6rem;
    }

    .empty-state {
      padding: var(--space-xl, 2rem);
      text-align: center;
      background: var(--color-surface-secondary, #f5f5f5);
      border: 2px dashed var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--color-text-secondary, #555555);
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-md, 1rem);
      margin-top: var(--space-md, 1rem);
      padding: var(--space-md, 1rem);
      background: var(--color-surface-secondary, #f5f5f5);
      border-radius: var(--radius-md, 0.5rem);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--space-xs, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
    }

    .legend-badge {
      padding: 0.125rem 0.375rem;
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-semibold, 600);
      border-radius: var(--radius-sm, 0.25rem);
      text-transform: uppercase;
    }

    .legend-badge.aaa { background: var(--color-success, #15803d); color: #fff; }
    .legend-badge.aa { background: var(--color-success, #15803d); color: #fff; }
    .legend-badge.aa18 { background: var(--color-warning, #a16207); color: #fff; }
    .legend-badge.dnp { background: var(--color-error, #dc2626); color: #fff; }

    .axis-label {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-text-muted, #777777);
      text-align: center;
      padding: var(--space-xs, 0.25rem);
    }

    .row-axis-label {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }

    /* Mobile: smaller cells and headers */
    @media (max-width: 640px) {
      .header-cell {
        min-width: 3.5rem;
        padding: var(--space-xs, 0.25rem);
        font-size: var(--font-size-xs, 0.75rem);
      }

      .header-cell.row-header {
        min-height: 3.5rem;
      }

      .color-dot {
        width: 0.75rem;
        height: 0.75rem;
      }

      .color-label {
        max-width: 3rem;
        font-size: var(--font-size-xs, 0.75rem);
      }

      .axis-label {
        font-size: var(--font-size-xs, 0.75rem);
      }

      .legend {
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-sm, 0.5rem);
      }

      .legend-item {
        font-size: var(--font-size-xs, 0.75rem);
      }

      .legend-badge {
        font-size: 0.625rem;
        padding: 0.0625rem 0.25rem;
      }
    }

    /* Tablet: medium adjustments */
    @media (min-width: 641px) and (max-width: 1023px) {
      .header-cell {
        min-width: 4rem;
      }

      .color-label {
        max-width: 4rem;
      }
    }

    /* Screen reader only - visually hidden but accessible */
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
  `;

  private store = new ColorStoreController(this);

  /** Whether to use compact cell mode */
  @property({ type: Boolean })
  compact = false;

  private getContrastMatrix(): ContrastResult[][] {
    const colors = this.store.colors;
    if (colors.length === 0) return [];
    return generateContrastMatrix([...colors], this.store.textSize);
  }

  private getColorLabel(color: Color): string {
    return color.label || color.hex;
  }

  private getAccessibilitySummary(matrix: ContrastResult[][]): string {
    let aaa = 0;
    let aa = 0;
    let aa18 = 0;
    let fail = 0;

    for (const row of matrix) {
      for (const result of row) {
        if (result) {
          switch (result.level) {
            case 'AAA': aaa++; break;
            case 'AA': aa++; break;
            case 'AA18': aa18++; break;
            case 'DNP': fail++; break;
          }
        }
      }
    }

    const total = aaa + aa + aa18 + fail;
    const passing = aaa + aa;

    return `${total} color combinations: ${passing} pass AA or better, ${aa18} pass for large text only, ${fail} fail.`;
  }

  render() {
    const colors = this.store.colors as Color[];
    const textSize = this.store.textSize;

    if (colors.length === 0) {
      return html`
        <div class="empty-state">
          <p>Add colors to see the contrast grid.</p>
        </div>
      `;
    }

    if (colors.length === 1) {
      return html`
        <div class="empty-state">
          <p>Add at least 2 colors to generate contrast comparisons.</p>
        </div>
      `;
    }

    const matrix = this.getContrastMatrix();
    const gridSize = colors.length + 1;
    const summary = this.getAccessibilitySummary(matrix);

    return html`
      <div class="grid-container">
        <!-- Screen reader summary announced on updates -->
        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          ${summary}
        </div>

        <div class="axis-label">
          ↓ Foreground (text) &nbsp;&nbsp;|&nbsp;&nbsp; Background →
        </div>

        <div
          class="grid"
          role="grid"
          aria-label="Color contrast matrix"
          style="grid-template-columns: repeat(${gridSize}, auto)"
        >
          <!-- Corner cell -->
          <div class="header-cell corner" role="columnheader">
            <span aria-hidden="true">FG \\ BG</span>
          </div>

          <!-- Column headers (background colors) -->
          ${colors.map((color) => html`
            <div class="header-cell" role="columnheader">
              <div class="color-indicator">
                <div class="color-dot" style="background: ${color.hex}"></div>
                <span class="color-label">${this.getColorLabel(color)}</span>
              </div>
            </div>
          `)}

          <!-- Rows -->
          ${colors.map((fgColor, fgIndex) => html`
            <!-- Row header (foreground color) -->
            <div class="header-cell row-header" role="rowheader">
              <div class="color-indicator">
                <div class="color-dot" style="background: ${fgColor.hex}"></div>
                <span class="color-label">${this.getColorLabel(fgColor)}</span>
              </div>
            </div>

            <!-- Cells -->
            ${colors.map((bgColor, bgIndex) => html`
              <contrast-cell
                .result="${matrix[fgIndex]?.[bgIndex] ?? null}"
                fg-color="${fgColor.hex}"
                bg-color="${bgColor.hex}"
                ?same-color="${fgIndex === bgIndex}"
                ?compact="${this.compact}"
              ></contrast-cell>
            `)}
          `)}
        </div>

        <div class="legend" role="legend" aria-label="WCAG compliance legend">
          <div class="legend-item">
            <span class="legend-badge aaa">AAA</span>
            <span>Enhanced (7:1${textSize === 'large' ? ', 4.5:1 large' : ''})</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge aa">AA</span>
            <span>Minimum (4.5:1${textSize === 'large' ? ', 3:1 large' : ''})</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge aa18">AA 18+</span>
            <span>Large text only (3:1)</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge dnp">Fail</span>
            <span>Does not pass</span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'contrast-grid': ContrastGrid;
  }
}
