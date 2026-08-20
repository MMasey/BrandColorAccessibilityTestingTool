import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import type { GridFilterLevel } from '../state/color-store';
import { generateContrastMatrix, groupContrastPairs, WCAG_BADGE_COLORS } from '../utils';
import type { Color, ContrastPairGroup, WCAGLevel } from '../utils';

/**
 * Group headings state plainly whether the combinations work, with the WCAG
 * level as supporting detail. Text is written to be read aloud: ratios are
 * "7 to 1" rather than "7:1" because the colon is silent at default screen
 * reader punctuation levels ("seven one" is ambiguous), and punctuation is
 * limited to marks that produce a natural pause.
 */
const GROUP_CONFIG: Record<WCAGLevel, { heading: string; description: string }> = {
  AAA: {
    heading: 'Excellent: passes AAA',
    description: 'Contrast of 7 to 1 or better. These combinations work for text of any size.',
  },
  AA: {
    heading: 'Good: passes AA',
    description: 'Contrast of 4.5 to 1 or better. These combinations work for text of any size at the minimum level.',
  },
  AA18: {
    heading: 'Large text only: passes AA 18+',
    description: 'Contrast of at least 3 to 1. Only use these combinations for large text, meaning 18pt or larger, or 14pt bold.',
  },
  DNP: {
    heading: 'Do not use: fails WCAG',
    description: 'Contrast below 3 to 1. These combinations do not meet any WCAG level for text.',
  },
};

/** "4.62:1" from the contrast util becomes the speakable "4.62 to 1" */
function speakableRatio(ratioString: string): string {
  return ratioString.replace(':', ' to ');
}

/**
 * Contrast results list view (feature 107).
 * Presents the same colour-pair results as the contrast grid, grouped
 * under WCAG level headings as semantic lists. Designed to be read
 * sequentially by screen readers and copy-pasted as plain text.
 */
@customElement('contrast-list')
export class ContrastList extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .list-wrapper {
      padding: var(--space-md, 1rem);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      background: var(--theme-page-bg-color);
    }

    .level-group {
      margin: 0 0 var(--space-lg, 1.5rem);

      &:last-child {
        margin-bottom: 0;
      }
    }

    .group-heading {
      display: flex;
      align-items: center;
      gap: var(--space-sm, 0.5rem);
      margin: 0 0 var(--space-xs, 0.25rem);
      font-size: var(--font-size-md, 1rem);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--theme-text-color, #1a1a1a);
    }

    /* Coloured chip matching the grid legend badges (aria-hidden - the
       heading text carries the level name for assistive tech) */
    .level-badge {
      display: inline-block;
      width: 0.75rem;
      height: 0.75rem;
      border-radius: var(--radius-sm, 0.25rem);
      flex-shrink: 0;

      &.aaa { background: ${unsafeCSS(WCAG_BADGE_COLORS.AAA)}; }
      &.aa { background: ${unsafeCSS(WCAG_BADGE_COLORS.AA)}; }
      &.aa18 { background: ${unsafeCSS(WCAG_BADGE_COLORS.AA18)}; }
      &.dnp { background: ${unsafeCSS(WCAG_BADGE_COLORS.DNP)}; }
    }

    .group-desc {
      margin: 0 0 var(--space-sm, 0.5rem);
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--theme-text-secondary-color);
    }

    .pair-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs, 0.25rem);
    }

    .pair-item {
      display: flex;
      align-items: center;
      gap: var(--space-sm, 0.5rem);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: 1.6;
      color: var(--theme-text-color, #1a1a1a);
    }

    /* Two "Aa" samples per pair - one each way round - showing the result
       holds whichever colour is the text (WCAG contrast is symmetric). */
    .pair-previews {
      display: inline-flex;
      gap: 2px;
      flex-shrink: 0;
    }

    /* "Aa" sample rendered in the actual pair colours. The glyphs come from
       CSS generated content, so they are invisible to assistive tech, never
       copy-pasted with the list text, and outside axe's text-contrast checks
       (an illegible sample on a failing pair is the point, not a defect). */
    .pair-preview {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 1.5rem;
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-weight: var(--font-weight-semibold, 600);
      flex-shrink: 0;

      &::before {
        content: 'Aa';
      }
    }

    .ratio {
      font-variant-numeric: tabular-nums;
      font-weight: var(--font-weight-medium, 500);
    }

    .empty-state {
      padding: var(--space-xl, 2rem);
      text-align: center;
      background: var(--theme-card-bg-color, #f5f5f5);
      border: 2px dashed var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--theme-text-secondary-color, #555555);
    }

    /* ========================================================================
       Windows High Contrast Mode (forced-colors: active)
       ======================================================================== */
    @media (forced-colors: active) {
      .list-wrapper {
        border: 2px solid CanvasText;
      }

      .level-badge {
        /* MUST preserve actual color - it mirrors the legend badges */
        forced-color-adjust: none;
        border: 1px solid CanvasText;
      }

      .pair-preview {
        /* MUST preserve actual colors - the sample shows the real pair */
        forced-color-adjust: none;
        border: 1px solid CanvasText;
      }

      .empty-state {
        border: 2px dashed CanvasText;
      }
    }
  `;

  private store = new ColorStoreController(this);

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

  private renderGroup(group: ContrastPairGroup) {
    const levelClass = group.level.toLowerCase();
    const config = GROUP_CONFIG[group.level];
    return html`
      <section class="level-group">
        <h3 class="group-heading">
          <span class="level-badge ${levelClass}" aria-hidden="true"></span>
          ${config.heading}
        </h3>
        <p class="group-desc">${config.description}</p>
        <!-- role="list" restores list semantics removed by list-style: none
             in Safari/VoiceOver -->
        <ul class="pair-list" role="list">
          ${group.pairs.map(({ colorA, colorB, result }) => html`
            <li class="pair-item">
              <span class="pair-previews" aria-hidden="true">
                <span
                  class="pair-preview"
                  style="color: ${colorA.hex}; background: ${colorB.hex}"
                ></span>
                <span
                  class="pair-preview"
                  style="color: ${colorB.hex}; background: ${colorA.hex}"
                ></span>
              </span>
              <span class="pair-text">
                ${this.getColorLabel(colorA)} and ${this.getColorLabel(colorB)}, contrast
                <span class="ratio">${speakableRatio(result.ratioString)}</span>
              </span>
            </li>
          `)}
        </ul>
      </section>
    `;
  }

  render() {
    const colors = this.store.colors as Color[];

    // Same empty-state messages as the contrast grid (spec 107)
    if (colors.length === 0) {
      return html`
        <div class="empty-state">
          <p>Add colors to see contrast results.</p>
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

    const matrix = generateContrastMatrix([...colors], 'normal');
    const groups = groupContrastPairs([...colors], matrix).filter((group) =>
      this.store.gridFilters.has(this.mapWCAGLevelToFilterLevel(group.level))
    );

    if (groups.length === 0) {
      return html`
        <div class="empty-state">
          <p>No colour combinations match the current filters.</p>
        </div>
      `;
    }

    return html`
      <div class="list-wrapper">
        ${groups.map((group) => this.renderGroup(group))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'contrast-list': ContrastList;
  }
}
