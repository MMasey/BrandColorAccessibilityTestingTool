import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import type { GridFilterLevel } from '../state/color-store';
import { generateContrastMatrix } from '../utils';
import type { Color, ContrastResult, WCAGLevel } from '../utils';
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
    }

    .grid-wrapper {
      overflow: auto;
      max-height: 70vh;
      border: 1px solid var(--color-border-default, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      background: var(--color-border-default, #d4d4d4);
    }

    .grid-container {
      display: inline-block;
      min-width: 100%;
    }

    .grid {
      display: grid;
      gap: 1px;
      background: var(--color-border-default, #d4d4d4);
      position: relative;
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
      max-width: 10rem;
      overflow: hidden;
      min-width: 5rem;
      min-height: 2.5rem;
      position: sticky;
      z-index: 1;
      border-right: 2px solid var(--color-border-default, #d4d4d4);
      border-bottom: 2px solid var(--color-border-default, #d4d4d4);

      &.corner {
        background: var(--color-surface-tertiary, #e8e8e8);
        position: sticky;
        top: 0;
        left: 0;
        z-index: 3;
        font-weight: var(--font-weight-semibold, 600);
      }

      &.column-header {
        position: sticky;
        top: 0;
        z-index: 2;
      }

      &.row-header {
        justify-content: flex-start;
        min-width: 8rem;
        position: sticky;
        left: 0;
        z-index: 2;

        @media (max-width: 640px) {
          min-width: 4rem;
          max-width: 5rem;
        }

        @media (min-width: 641px) and (max-width: 1023px) {
          min-width: 6rem;
          max-width: 7rem;
        }
      }

      /* Mobile: smaller headers */
      @media (max-width: 640px) {
        min-width: 3.5rem;
        max-width: 5rem;
        padding: var(--space-xs, 0.25rem);
        font-size: var(--font-size-xs, 0.75rem);
      }

      /* Tablet: medium adjustments */
      @media (min-width: 641px) and (max-width: 1023px) {
        min-width: 4rem;
        max-width: 7rem;

        &.row-header {
          min-width: 6rem;
        }
      }
    }

    .color-indicator {
      display: flex;
      align-items: center;
      gap: var(--space-xs, 0.25rem);
      max-width: 100%;
      min-width: 0;
    }

    .color-dot {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      border: 1px solid var(--color-border-default, #d4d4d4);
      flex-shrink: 0;

      @media (max-width: 640px) {
        width: 0.75rem;
        height: 0.75rem;
      }
    }

    .color-label {
      flex: 1;
      min-width: 0;
      max-width: 8rem;
      line-height: 1.3;
      /* Limit to 2 lines with ellipsis */
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
      overflow-wrap: break-word;
      text-overflow: ellipsis;

      @media (max-width: 640px) {
        max-width: 2.5rem;
        -webkit-line-clamp: 1;
        font-size: var(--font-size-xs, 0.75rem);
      }

      @media (min-width: 641px) and (max-width: 1023px) {
        max-width: 4rem;
        -webkit-line-clamp: 1;
      }
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

      @media (max-width: 640px) {
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-sm, 0.5rem);
      }
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--space-xs, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);

      @media (max-width: 640px) {
        font-size: var(--font-size-xs, 0.75rem);
      }
    }

    .legend-badge {
      padding: 0.125rem 0.375rem;
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-semibold, 600);
      border-radius: var(--radius-sm, 0.25rem);
      text-transform: uppercase;

      &.aaa { background: #14532d; color: #fff; }  /* 10.5:1 AAA */
      &.aa { background: #15803d; color: #fff; }   /* 7.3:1 AAA - updated from #166534 */
      &.aa18 { background: #713f12; color: #fff; } /* 8.5:1 AAA */
      &.dnp { background: #991b1b; color: #fff; }  /* 7.1:1 AAA - updated from #7f1d1d */

      @media (max-width: 640px) {
        font-size: 0.625rem;
        padding: 0.0625rem 0.25rem;
      }
    }

    .axis-label {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-text-muted, #666666);
      text-align: center;
      padding: var(--space-xs, 0.25rem);

      @media (max-width: 640px) {
        font-size: var(--font-size-xs, 0.75rem);
      }
    }

    .row-axis-label {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
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

  private mapWCAGLevelToFilterLevel(level: WCAGLevel): GridFilterLevel {
    switch (level) {
      case 'AAA': return 'aaa';
      case 'AA': return 'aa';
      case 'AA18': return 'aa-large';
      case 'DNP': return 'failed';
    }
  }

  private isCellFiltered(result: ContrastResult | null): boolean {
    if (!result) return true;
    const filterLevel = this.mapWCAGLevelToFilterLevel(result.level);
    return !this.store.gridFilters.has(filterLevel);
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
      <!-- Screen reader summary announced on updates -->
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        ${summary}
      </div>

      <div class="axis-label">
        ↓ Foreground (text) &nbsp;&nbsp;|&nbsp;&nbsp; Background →
      </div>

      <div class="grid-wrapper">
        <div class="grid-container">
          <div
            class="grid"
            role="table"
            aria-label="Contrast ratios between foreground and background colors"
            style="grid-template-columns: repeat(${gridSize}, auto)"
          >
            <!-- Corner cell -->
            <div class="header-cell corner" role="columnheader">
              <span aria-label="Foreground versus Background">FG \\ BG</span>
            </div>

            <!-- Column headers (background colors) -->
            ${colors.map((color) => html`
              <div
                class="header-cell column-header"
                role="columnheader"
                aria-label="Background: ${this.getColorLabel(color)}"
                title="${this.getColorLabel(color)}"
              >
                <div class="color-indicator">
                  <div class="color-dot" style="background: ${color.hex}" aria-hidden="true"></div>
                  <span class="color-label">${this.getColorLabel(color)}</span>
                </div>
              </div>
            `)}

          <!-- Rows -->
          ${colors.map((fgColor, fgIndex) => html`
            <!-- Row header (foreground color) -->
            <div
              class="header-cell row-header"
              role="rowheader"
              aria-label="Foreground: ${this.getColorLabel(fgColor)}"
              title="${this.getColorLabel(fgColor)}"
            >
              <div class="color-indicator">
                <div class="color-dot" style="background: ${fgColor.hex}" aria-hidden="true"></div>
                <span class="color-label">${this.getColorLabel(fgColor)}</span>
              </div>
            </div>

            <!-- Cells -->
            ${colors.map((bgColor, bgIndex) => {
              const result = matrix[fgIndex]?.[bgIndex] ?? null;
              const cellLabel = result
                ? `${this.getColorLabel(fgColor)} on ${this.getColorLabel(bgColor)}: ${result.ratioString}, ${result.level === 'DNP' ? 'Does not pass' : 'Passes ' + result.level}`
                : 'No result';
              return html`
                <div role="cell" aria-label="${cellLabel}">
                  <contrast-cell
                  .result="${result}"
                  fg-color="${fgColor.hex}"
                  bg-color="${bgColor.hex}"
                  ?same-color="${fgIndex === bgIndex}"
                  ?compact="${this.compact}"
                  ?filtered="${this.isCellFiltered(result)}"
                  cell-size="${this.store.gridCellSize}"
                ></contrast-cell>
                </div>
              `;
            })}
          `)}
          </div>
        </div>
      </div>

      <div class="legend" aria-label="WCAG compliance legend">
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'contrast-grid': ContrastGrid;
  }
}
