import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import type { GridFilterLevel } from '../state/color-store';
import { generateContrastMatrix, WCAG_BADGE_COLORS } from '../utils';
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

    * {
      box-sizing: border-box;
    }

    .grid-wrapper {
      overflow: auto;
      max-height: 70vh;
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      background: var(--theme-page-bg-color);

      /* Keyboard focus styles for scrollable region */
      &:focus {
        outline: 3px solid var(--theme-focus-ring-color);
        outline-offset: 2px;
      }

      &:focus-visible {
        outline: 3px solid var(--theme-focus-ring-color);
        outline-offset: 2px;
      }
    }

    .grid-container {
      display: inline-block;
    }

    .grid {
      display: grid;
      gap: 1px;
      background: var(--theme-input-border-color, #d4d4d4);
      position: relative;
      width: fit-content;
    }

    /* Data cell wrappers - constrain to grid cell size */
    .cell-wrapper {
      width: var(--cell-size, 5.5rem);
      height: var(--cell-size, 5.5rem);
      overflow: hidden;
    }

    /* Row wrappers for ARIA table structure - display:contents keeps grid layout intact */
    .grid-row {
      display: contents;
    }

    .header-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xs, 0.25rem);
      background: var(--theme-card-bg-color, #f5f5f5);
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--theme-text-secondary-color, #555555);
      overflow: hidden;
      position: sticky;
      z-index: 1;

      &.corner {
        background: var(--theme-card-bg-color-hover);
        position: sticky;
        top: 0;
        left: 0;
        z-index: 3;
        font-weight: var(--font-weight-semibold, 600);
        width: var(--row-header-width, 5.5rem);
        height: var(--header-height, 2.5rem);
      }

      &.column-header {
        position: sticky;
        top: 0;
        z-index: 2;
        width: var(--cell-size, 5.5rem);
        height: var(--header-height, 2.5rem);
      }

      &.row-header {
        justify-content: flex-start;
        position: sticky;
        left: 0;
        z-index: 2;
        width: var(--row-header-width, 5.5rem);
        height: var(--cell-size, 5.5rem);
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
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
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
      background: var(--theme-card-bg-color, #f5f5f5);
      border: 2px dashed var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--theme-text-secondary-color, #555555);
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-md, 1rem);
      margin-top: var(--space-md, 1rem);
      padding: var(--space-md, 1rem);
      background: var(--theme-card-bg-color, #f5f5f5);
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

      /* Badge colors from WCAG_BADGE_COLORS in utils/wcag-config.ts */
      &.aaa { background: ${unsafeCSS(WCAG_BADGE_COLORS.AAA)}; color: #fff; }
      &.aa { background: ${unsafeCSS(WCAG_BADGE_COLORS.AA)}; color: #fff; }
      &.aa18 { background: ${unsafeCSS(WCAG_BADGE_COLORS.AA18)}; color: #fff; }
      &.dnp { background: ${unsafeCSS(WCAG_BADGE_COLORS.DNP)}; color: #fff; }

      @media (max-width: 640px) {
        font-size: 0.625rem;
        padding: 0.0625rem 0.25rem;
      }
    }

    .axis-label {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--theme-text-muted-color);
      text-align: center;
      padding: var(--space-xs, 0.25rem);

      @media (max-width: 640px) {
        font-size: var(--font-size-xs, 0.75rem);
        text-align: left;
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

    /* ========================================================================
       Windows High Contrast Mode (forced-colors: active)

       Let the browser handle most styling. We only need to:
       1. Preserve actual colors in color preview dots
       2. Add visible borders for structure
       ======================================================================== */
    @media (forced-colors: active) {
      .grid-wrapper {
        border: 2px solid CanvasText;
      }

      .header-cell {
        border: 2px solid CanvasText;
      }

      .color-dot {
        /* MUST preserve actual color for the preview */
        forced-color-adjust: none;
        border: 2px solid CanvasText;
      }

      .empty-state {
        border: 2px dashed CanvasText;
      }

      .legend {
        border: 2px solid CanvasText;
      }

      .legend-badge {
        border: 2px solid CanvasText;
      }
    }
  `;

  private store = new ColorStoreController(this);

  /** Whether to use compact cell mode */
  @property({ type: Boolean })
  compact = false;

  private getContrastMatrix(): ContrastResult[][] {
    const colors = this.store.colors;
    if (colors.length === 0) return [];
    return generateContrastMatrix([...colors], 'normal');
  }

  private getColorLabel(color: Color): string {
    return color.label || color.hex;
  }

  private getCellSize(): string {
    switch (this.store.gridCellSize) {
      case 'small': return '3.5rem';
      case 'large': return '8rem';
      default: return '5.5rem';
    }
  }

  private getRowHeaderWidth(): string {
    switch (this.store.gridCellSize) {
      case 'small': return '4rem';
      case 'large': return '8rem';
      default: return '5.5rem';
    }
  }

  private getHeaderHeight(): string {
    switch (this.store.gridCellSize) {
      case 'small': return '2rem';
      case 'large': return '3rem';
      default: return '2.5rem';
    }
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

  /**
   * Handle keyboard navigation within the grid wrapper.
   * Arrow keys scroll the grid content.
   */
  private handleGridKeydown(e: KeyboardEvent): void {
    const wrapper = e.currentTarget as HTMLElement;
    const scrollAmount = 100;

    switch (e.key) {
      case 'ArrowUp':
        wrapper.scrollTop -= scrollAmount;
        e.preventDefault();
        break;
      case 'ArrowDown':
        wrapper.scrollTop += scrollAmount;
        e.preventDefault();
        break;
      case 'ArrowLeft':
        wrapper.scrollLeft -= scrollAmount;
        e.preventDefault();
        break;
      case 'ArrowRight':
        wrapper.scrollLeft += scrollAmount;
        e.preventDefault();
        break;
      case 'Home':
        if (e.ctrlKey) {
          wrapper.scrollTop = 0;
          wrapper.scrollLeft = 0;
        } else {
          wrapper.scrollLeft = 0;
        }
        e.preventDefault();
        break;
      case 'End':
        if (e.ctrlKey) {
          wrapper.scrollTop = wrapper.scrollHeight;
          wrapper.scrollLeft = wrapper.scrollWidth;
        } else {
          wrapper.scrollLeft = wrapper.scrollWidth;
        }
        e.preventDefault();
        break;
    }
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

      <!--
        tabindex="0": Required for keyboard accessibility. The grid can overflow with many colors,
        and scrollable containers are not keyboard-focusable by default. This allows keyboard users
        to focus the container and scroll with arrow keys (handled by handleGridKeydown).
        Without this, keyboard users cannot access off-screen content.

        role="region": Landmark role for significant content section. Combined with aria-label,
        allows screen reader users to navigate directly to the grid.
      -->
      <div
        class="grid-wrapper"
        tabindex="0"
        role="region"
        aria-label="Contrast grid. Use arrow keys to scroll when focused."
        @keydown="${this.handleGridKeydown}"
      >
        <div class="grid-container">
          <div
            class="grid"
            role="table"
            aria-label="Contrast ratios between foreground and background colours"
            style="
              --cell-size: ${this.getCellSize()};
              --row-header-width: ${this.getRowHeaderWidth()};
              --header-height: ${this.getHeaderHeight()};
              grid-template-columns: var(--row-header-width) repeat(${gridSize - 1}, var(--cell-size));
              grid-template-rows: var(--header-height) repeat(${gridSize - 1}, var(--cell-size));
            "
          >
            <!-- Header row -->
            <div class="grid-row" role="row">
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
            </div>

            <!-- Data rows -->
            ${colors.map((fgColor, fgIndex) => html`
              <div class="grid-row" role="row">
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
                  const isFiltered = this.isCellFiltered(result);
                  const cellLabel = result
                    ? `${this.getColorLabel(fgColor)} on ${this.getColorLabel(bgColor)}: ${result.ratioString}, ${result.level === 'DNP' ? 'Does not pass' : 'Passes ' + result.level}`
                    : 'No result';
                  return html`
                    <div
                      class="cell-wrapper"
                      role="${isFiltered ? 'presentation' : 'cell'}"
                      aria-label="${isFiltered ? '' : cellLabel}"
                      aria-hidden="${isFiltered ? 'true' : 'false'}"
                    >
                      <contrast-cell
                        .result="${result}"
                        fg-color="${fgColor.hex}"
                        bg-color="${bgColor.hex}"
                        ?same-color="${fgIndex === bgIndex}"
                        ?compact="${this.compact}"
                        ?filtered="${isFiltered}"
                        cell-size="${this.store.gridCellSize}"
                        aria-hidden="${isFiltered ? 'true' : 'false'}"
                      ></contrast-cell>
                    </div>
                  `;
                })}
              </div>
            `)}
          </div>
        </div>
      </div>

      <div class="legend" aria-label="WCAG compliance legend">
        <div class="legend-item">
          <span class="legend-badge aaa">AAA</span>
          <span>Enhanced (7:1)</span>
        </div>
        <div class="legend-item">
          <span class="legend-badge aa">AA</span>
          <span>Minimum (4.5:1)</span>
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
