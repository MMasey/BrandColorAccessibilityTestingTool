import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import type { GridFilterLevel } from '../state/color-store';
import { generateContrastMatrix, getLevelAnnouncement, WCAG_BADGE_COLORS } from '../utils';
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

    /*
      Native table. The 1px gap between cells comes from border-spacing over
      the table background (same visual as the previous CSS grid gap).
      Table elements keep their default display values — overriding display
      on table/tr/th/td can silently strip table semantics in some browsers,
      which is exactly the fragility this native structure exists to avoid.
      Flex layout lives on inner divs (.color-indicator) instead.
    */
    .grid {
      border-collapse: separate;
      border-spacing: 1px;
      table-layout: fixed;
      background: var(--theme-input-border-color, #d4d4d4);
      position: relative;
    }

    caption {
      caption-side: top;
      text-align: left;
      background: var(--theme-page-bg-color);
    }

    /* Data cells - constrain to grid cell size */
    .cell-wrapper {
      width: var(--cell-size, 5.5rem);
      height: var(--cell-size, 5.5rem);
      padding: 0;
      overflow: hidden;
    }

    .header-cell {
      vertical-align: top;
      text-align: left;
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
        /* Align the hint text with neighbouring header labels, which sit
           below the full-bleed colour chip (0.5rem) and gap (0.25rem) */
        padding-top: calc(0.5rem + var(--space-xs, 0.25rem));
      }

      &.column-header {
        position: sticky;
        top: 0;
        z-index: 2;
        width: var(--cell-size, 5.5rem);
        height: var(--header-height, 2.5rem);
      }

      &.row-header {
        position: sticky;
        left: 0;
        z-index: 2;
        width: var(--row-header-width, 5.5rem);
        height: var(--cell-size, 5.5rem);
      }
    }

    /* Colour chip stacked above the label: the swatch spans the full cell
       width so the colour has presence, and the text keeps the full width
       to reduce wrapping of longer colour names. */
    .color-indicator {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.25rem;
      width: 100%;
      min-width: 0;
    }

    /* Full-bleed strip: negative margins cancel the cell padding so the
       colour meets the cell edges like a tab. Square corners - the strip
       merges with the cell edge, so a radius would leave odd notches. */
    .color-chip {
      height: 0.5rem;
      margin: calc(-1 * var(--space-xs, 0.25rem)) calc(-1 * var(--space-xs, 0.25rem)) 0;
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      flex-shrink: 0;
    }

    .color-label {
      min-width: 0;
      max-width: 100%;
      line-height: 1.3;
      /* Line limit varies with cell size (1 line in compact mode) */
      display: -webkit-box;
      -webkit-line-clamp: var(--header-label-lines, 2);
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
      overflow-wrap: break-word;
      text-overflow: ellipsis;
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

    /* Caption text explaining the table structure. Sticky so it stays in
       view when the table is wider than the scroll wrapper. */
    .caption-text {
      display: block;
      position: sticky;
      left: 0;
      width: max-content;
      max-width: 100%;
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--theme-text-muted-color);
      padding: var(--space-xs, 0.25rem);
    }

    /* Visual-only orientation hint in the sticky corner cell (the caption
       scrolls out of view on tall grids). Hidden from assistive tech - the
       caption and header labels carry the same information. */
    .corner-label {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      font-size: 0.625rem;
      line-height: 1.2;
      text-align: left;
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

      .color-chip {
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

  /** Column header height: fits the colour chip + label (see getHeaderLabelLines) */
  private getHeaderHeight(): string {
    switch (this.store.gridCellSize) {
      case 'small': return '2.25rem';
      case 'large': return '3.25rem';
      default: return '3.25rem';
    }
  }

  /** Max label lines in header cells; compact mode keeps headers to one line */
  private getHeaderLabelLines(): number {
    return this.store.gridCellSize === 'small' ? 1 : 2;
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
    const summary = this.getAccessibilitySummary(matrix);

    return html`
      <!-- Screen reader summary announced on updates -->
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        ${summary}
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
        aria-label="Contrast results grid, scrollable"
        @keydown="${this.handleGridKeydown}"
      >
        <div class="grid-container">
          <!--
            width calc: table-layout fixed needs an explicit width. Columns are
            one row-header plus one cell per colour; border-spacing adds
            (columns + 1) x 1px gaps.
          -->
          <table
            class="grid"
            style="
              --cell-size: ${this.getCellSize()};
              --row-header-width: ${this.getRowHeaderWidth()};
              --header-height: ${this.getHeaderHeight()};
              --header-label-lines: ${this.getHeaderLabelLines()};
              width: calc(var(--row-header-width) + ${colors.length} * var(--cell-size) + ${colors.length + 2}px);
            "
          >
            <caption>
              <span class="caption-text">
                Each row is a foreground (text) colour; each column is a background colour.
              </span>
            </caption>

            <thead>
              <tr>
                <!-- Corner cell: visual orientation hint only. A plain <td>
                     so assistive tech sees a standard empty corner cell - the
                     caption and header labels already explain the axes. -->
                <td class="header-cell corner">
                  <span class="corner-label" aria-hidden="true">
                    <span>↓ Foreground</span>
                    <span>→ Background</span>
                  </span>
                </td>

                <!-- Column headers (background colors) -->
                ${colors.map((color) => html`
                  <th
                    scope="col"
                    class="header-cell column-header"
                    aria-label="Background: ${this.getColorLabel(color)}"
                    title="${this.getColorLabel(color)}"
                  >
                    <div class="color-indicator">
                      <div class="color-chip" style="background: ${color.hex}" aria-hidden="true"></div>
                      <span class="color-label">${this.getColorLabel(color)}</span>
                    </div>
                  </th>
                `)}
              </tr>
            </thead>

            <tbody>
              ${colors.map((fgColor, fgIndex) => html`
                <tr>
                  <!-- Row header (foreground color) -->
                  <th
                    scope="row"
                    class="header-cell row-header"
                    aria-label="Foreground: ${this.getColorLabel(fgColor)}"
                    title="${this.getColorLabel(fgColor)}"
                  >
                    <div class="color-indicator">
                      <div class="color-chip" style="background: ${fgColor.hex}" aria-hidden="true"></div>
                      <span class="color-label">${this.getColorLabel(fgColor)}</span>
                    </div>
                  </th>

                  <!-- Cells -->
                  ${colors.map((bgColor, bgIndex) => {
                    const result = matrix[fgIndex]?.[bgIndex] ?? null;
                    const isFiltered = this.isCellFiltered(result);
                    const cellLabel = fgIndex === bgIndex
                      ? 'Same colour'
                      : result
                        ? `${this.getColorLabel(fgColor)} on ${this.getColorLabel(bgColor)}: ${result.ratioString}, ${getLevelAnnouncement(result.level)}`
                        : 'No result';
                    return html`
                      <td
                        class="cell-wrapper"
                        aria-label="${isFiltered ? '' : cellLabel}"
                      >
                        <contrast-cell
                          .result="${result}"
                          fg-color="${fgColor.hex}"
                          bg-color="${bgColor.hex}"
                          ?same-color="${fgIndex === bgIndex}"
                          ?compact="${this.compact}"
                          ?filtered="${isFiltered}"
                          cell-size="${this.store.gridCellSize}"
                          aria-hidden="true"
                        ></contrast-cell>
                      </td>
                    `;
                  })}
                </tr>
              `)}
            </tbody>
          </table>
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
