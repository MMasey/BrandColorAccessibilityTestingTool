import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ColorStoreController } from '../state';
import type { Color } from '../utils';
import type { ColorInput } from './color-input';
import './color-input';
import './color-swatch';
import './brand-guidance';
import './sort-controls';

/**
 * CustomEvent detail interfaces for type safety
 */
interface AddColorEventDetail {
  color: Color;
}

interface SwatchMoveEventDetail {
  fromIndex: number;
  toIndex: number;
}

interface BoundaryReachedEventDetail {
  message: string;
}

interface LabelChangeEventDetail {
  label: string;
}

/**
 * Color palette component for managing a list of brand colors.
 * Integrates with the color store for state management.
 */
@customElement('color-palette')
export class ColorPalette extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .palette {
      display: flex;
      flex-direction: column;
      gap: var(--space-md, 1rem);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md, 1rem);
    }

    h2 {
      margin: 0;
      font-size: var(--font-size-lg, 1.125rem);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--theme-text-color, #1a1a1a);
    }

    .color-count {
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--theme-text-secondary-color);
    }

    .add-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm, 0.5rem);
    }

    .colors-list-wrapper {
      position: relative;
    }

    .colors-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs, 0.25rem);
      max-height: 400px;
      overflow-y: auto;
      /* Reset native list styles - using semantic ul for accessibility */
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      transition: gap 250ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Expand gaps when dragging for better drop targeting */
    /* When dragging, shrink all cards to create visual gaps */
    .colors-list.dragging-active > li {
      transform: scaleY(0.92);
      opacity: 0.85;
    }

    /* Smooth transition for card shrinking */
    .colors-list > li {
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (prefers-reduced-motion: reduce) {
      .colors-list > li {
        transition: none;
      }

      .colors-list.dragging-active > li {
        transform: none;
        opacity: 0.85;
      }
    }

    /* Drop indicator - JavaScript-managed element */
    .drop-indicator {
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--theme-primary-color, #0066cc);
      z-index: 1000;
      pointer-events: none;
      transition: opacity 150ms ease, top 150ms ease;
      border-radius: 2px;
      box-shadow: 0 0 12px rgba(0, 102, 204, 0.6);
    }

    .drop-indicator::before,
    .drop-indicator::after {
      content: '';
      position: absolute;
      width: 10px;
      height: 10px;
      background: var(--theme-primary-color, #0066cc);
      border-radius: 50%;
      top: 50%;
      transform: translateY(-50%);
      box-shadow: 0 0 8px rgba(0, 102, 204, 0.8);
    }

    .drop-indicator::before {
      left: -5px;
    }

    .drop-indicator::after {
      right: -5px;
    }

    .drop-indicator.hidden {
      opacity: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .colors-list {
        transition: none;
      }
    }

    .colors-list > li {
      position: relative;
    }

   
    /* SortableJS drag states */
    .colors-list .sortable-ghost {
      opacity: 0.4;
    }

    .colors-list .sortable-chosen {
      cursor: grabbing;
    }

    .colors-list .sortable-drag {
      opacity: 0.9;
    }

    .empty-state {
      padding: var(--space-xl, 2rem);
      text-align: center;
      background: var(--theme-card-bg-color, #f5f5f5);
      border: 2px dashed var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--theme-text-secondary-color);

      p {
        margin: 0 0 var(--space-sm, 0.5rem);
      }

      code {
        font-family: var(--font-family-mono, monospace);
        background: var(--theme-card-bg-color-hover);
        padding: 0.1em 0.3em;
        border-radius: var(--radius-sm, 0.25rem);
      }
    }

    .actions {
      display: flex;
      gap: var(--space-sm, 0.5rem);
    }

    .clear-btn {
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      background: transparent;
      color: var(--theme-text-secondary-color);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-sm, 0.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      cursor: pointer;
      transition: all var(--transition-fast, 150ms ease);

      &:hover {
        background: var(--theme-error-bg-color);
        border-color: var(--theme-error-text-color);
        color: var(--theme-error-text-color);
      }

      &:focus-visible {
        outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
        outline-offset: var(--focus-ring-offset, 2px);
      }
    }

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

       Let the browser handle most styling. Just add visible borders.
       ======================================================================== */
    @media (forced-colors: active) {
      .empty-state {
        border: 2px dashed CanvasText;
      }

      .empty-state code {
        border: 2px solid CanvasText;
      }

      .clear-btn {
        border: 2px solid CanvasText;
      }
    }
  `;

  private store = new ColorStoreController(this);
  private isReordering = false; // Prevent concurrent moves
  private activeAnimations: Animation[] = []; // Track ongoing animations

  @state()
  private statusMessage = '';

  @state()
  private isDraggingCard = false; // Track if any card is being dragged

  @state()
  private dropIndicatorIndex = -1; // Which gap to show drop indicator in

  @state()
  private dropIndicatorPosition: 'before' | 'after' | 'none' = 'none'; // Where in the gap

  private handleAddColor(e: CustomEvent<AddColorEventDetail>): void {
    const { color } = e.detail;
    if (!color) return;

    const added = this.store.addColorObject(color);
    if (added) {
      // Announce to screen readers
      const colorLabel = added.label || added.hex;
      this.statusMessage = `Colour ${colorLabel} added to palette`;

      // Clear input and focus for next entry
      const colorInput = this.shadowRoot?.querySelector('color-input') as ColorInput | null;
      if (colorInput) {
        colorInput.clear();
        requestAnimationFrame(() => {
          colorInput.focusInput();
        });
      }
    }
  }

  private updateColorLabel(index: number, newLabel: string): void {
    this.store.updateColorLabel(index, newLabel);
  }

  private removeColor(index: number): void {
    this.store.removeColor(index);
  }

  private clearAll(): void {
    if (confirm('Remove all colors from the palette?')) {
      this.store.clearColors();
    }
  }

  /**
   * Clear all drag states from all color swatches
   */
  private clearAllDragStates(): void {
    const colorsList = this.shadowRoot?.querySelector('.colors-list');
    if (!colorsList) return;

    const swatches = colorsList.querySelectorAll('color-swatch');
    swatches.forEach((swatch) => {
      swatch.removeAttribute('drag-position');
      swatch.removeAttribute('dragging');
      swatch.removeAttribute('drag-over');
    });
  }

  /**
   * Handle color reordering via keyboard arrow buttons (WCAG 2.2 2.5.7)
   * Uses Web Animations API for smooth, reliable animations
   */
  private handleColorMove(e: CustomEvent<SwatchMoveEventDetail>): void {
    // Clear any stuck drag states first
    this.clearAllDragStates();

    // Prevent concurrent moves (indices may be stale during re-render)
    if (this.isReordering) {
      console.warn('Move blocked - reorder in progress');
      return;
    }

    const { fromIndex, toIndex } = e.detail;

    // Validate indices before proceeding
    const colorCount = this.store.colors.length;
    // toIndex can be up to colorCount (meaning append to end)
    if (fromIndex < 0 || fromIndex >= colorCount || toIndex < 0 || toIndex > colorCount) {
      console.warn('Invalid move indices:', { fromIndex, toIndex, colorCount });
      return;
    }

    // Mark reorder in progress
    this.isReordering = true;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // No animation - just update immediately
      const currentColors = this.store.colors;
      const newColors = [...currentColors];
      const [movedColor] = newColors.splice(fromIndex, 1);

      if (!movedColor) {
        console.warn('Failed to move color: no color at fromIndex', { fromIndex });
        this.isReordering = false;
        return;
      }

      newColors.splice(toIndex, 0, movedColor);
      this.store.reorderColors(newColors);

      const color = this.store.colors[toIndex];
      const colorLabel = color?.label || color?.hex;
      this.statusMessage = `${colorLabel} moved to position ${toIndex + 1}`;
      this.manageFocusAfterMove(toIndex, fromIndex);

      // Clear flag after update completes
      this.updateComplete.then(() => {
        this.isReordering = false;
      });
      return;
    }

    // Immediately update store and move focus BEFORE animation
    // This prevents rapid key presses from moving the same color multiple times
    {
      const currentColors = this.store.colors;
      const newColors = [...currentColors];
      const [movedColor] = newColors.splice(fromIndex, 1);

      if (!movedColor) {
        console.warn('Failed to move color: no color at fromIndex', { fromIndex });
        this.isReordering = false;
        return;
      }

      newColors.splice(toIndex, 0, movedColor);
      this.store.reorderColors(newColors);

      const color = this.store.colors[toIndex];
      const colorLabel = color?.label || color?.hex;
      this.statusMessage = `${colorLabel} moved to position ${toIndex + 1}`;

      // Move focus immediately to new position
      this.manageFocusAfterMove(toIndex, fromIndex);
    }

    // Now animate the visual transition
    // Wait for DOM to render with new order first
    this.updateComplete.then(() => {
      const colorsList = this.shadowRoot?.querySelector('.colors-list');
      if (!colorsList) return;

      const listItems = Array.from(colorsList.querySelectorAll('li'));

      // Cancel any ongoing animations first
      this.activeAnimations.forEach(anim => anim.cancel());
      this.activeAnimations = [];

      // Clear all drag states again to prevent visual conflicts during animation
      this.clearAllDragStates();

      // Clear all transforms and z-indices from previous animations/drags
      listItems.forEach((li) => {
        const htmlLi = li as HTMLElement;
        htmlLi.style.transform = '';
        htmlLi.style.zIndex = '';
      });

      // After reordering, the elements are at new positions in DOM
      // We need to animate ALL affected cards to show the movement clearly
      const movedElement = listItems[toIndex];
      if (!movedElement) return;

      // Calculate card height and gap for animations
      const computedStyle = window.getComputedStyle(colorsList);
      const gap = parseFloat(computedStyle.gap) || 0;
      const cardHeight = movedElement.offsetHeight + gap;

      const timing = {
        duration: 200,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
      };

      // Determine the range of affected indices
      const minIndex = Math.min(fromIndex, toIndex);
      const maxIndex = Math.max(fromIndex, toIndex);
      const movingDown = toIndex > fromIndex;

      // Set z-index for moved element so it appears on top
      (movedElement as HTMLElement).style.zIndex = '10';

      // Animate all affected cards
      for (let i = minIndex; i <= maxIndex; i++) {
        const element = listItems[i];
        if (!element) continue;

        let animation;

        if (i === toIndex) {
          // This is the moved card - animate it from its old position
          const distance = Math.abs(toIndex - fromIndex) * cardHeight;
          const direction = movingDown ? -1 : 1;
          animation = element.animate(
            [
              { transform: `translateY(${direction * distance}px)` },
              { transform: 'translateY(0)' }
            ],
            timing
          );
        } else {
          // This is a card that got shifted - animate it shifting back
          const direction = movingDown ? 1 : -1;
          animation = element.animate(
            [
              { transform: `translateY(${direction * cardHeight}px)` },
              { transform: 'translateY(0)' }
            ],
            timing
          );
        }

        this.activeAnimations.push(animation);
      }

      // Wait for all animations to complete
      if (this.activeAnimations.length > 0) {
        Promise.all(this.activeAnimations.map(anim => anim.finished))
          .then(() => {
            (movedElement as HTMLElement).style.zIndex = '';
            this.activeAnimations = [];
            this.isReordering = false;
          })
          .catch(() => {
            // Animations were cancelled - still need to clean up
            this.activeAnimations = [];
            this.isReordering = false;
          });
      } else {
        this.isReordering = false;
      }
    });
  }

  /**
   * Manage focus after a color move
   */
  private manageFocusAfterMove(toIndex: number, fromIndex: number): void {
    this.updateComplete.then(() => {
      const colorsList = this.shadowRoot?.querySelector('.colors-list');
      if (colorsList) {
        const swatchElements = colorsList.querySelectorAll('color-swatch');
        const targetSwatch = swatchElements[toIndex];
        if (targetSwatch) {
          const buttons = targetSwatch.shadowRoot?.querySelectorAll<HTMLButtonElement>('.reorder-btn');
          if (buttons && buttons.length === 2) {
            // Always focus the button matching the direction that was pressed
            // buttons[0] = up, buttons[1] = down
            const movedDown = toIndex > fromIndex;
            const targetButton = movedDown ? buttons[1] : buttons[0];

            if (targetButton) {
              targetButton.focus();
            }
          }
        }
      }
    });
  }

  private handleBoundaryReached(e: CustomEvent<BoundaryReachedEventDetail>): void {
    // Announce boundary message to screen readers
    this.statusMessage = e.detail.message;
  }

  private handleDragStateChange(e: CustomEvent<{dragging: boolean, draggedIndex?: number}>): void {
    this.isDraggingCard = e.detail.dragging;

    // Clear drop indicator when drag ends
    if (!e.detail.dragging) {
      this.dropIndicatorIndex = -1;
      this.dropIndicatorPosition = 'none';
    }
  }

  private handleDropPositionChange(e: CustomEvent<{targetIndex: number, position: 'before' | 'after' | 'none'}>): void {
    this.dropIndicatorIndex = e.detail.targetIndex;
    this.dropIndicatorPosition = e.detail.position;

    // Update indicator position when drop position changes
    this.updateDropIndicatorPosition();
  }

  /**
   * Calculate transform offset for a card based on its position relative to the dragged card
   * Note: Card shrinking is now handled by CSS (.dragging-active class)
   */
  private getCardTransform(_cardIndex: number): string {
    // No per-card transforms needed - CSS handles shrinking all cards
    return '';
  }

  /**
   * Get the inline style for the drop indicator based on current drop position
   */
  private getDropIndicatorStyle(): string {
    if (this.dropIndicatorIndex === -1 || this.dropIndicatorPosition === 'none') {
      return 'display: none;';
    }

    // We need to calculate position based on the li elements
    // This will be updated after render when we can measure actual positions
    return 'display: block; opacity: 0;'; // Hidden by default, will be positioned via updateComplete
  }

  /**
   * Update drop indicator position after render (when we can measure actual DOM positions)
   */
  private updateDropIndicatorPosition(): void {
    if (this.dropIndicatorIndex === -1 || this.dropIndicatorPosition === 'none') {
      return;
    }

    this.updateComplete.then(() => {
      const colorsList = this.shadowRoot?.querySelector('.colors-list');
      const wrapper = this.shadowRoot?.querySelector('.colors-list-wrapper') as HTMLElement | null;
      const dropIndicator = this.shadowRoot?.querySelector('.drop-indicator') as HTMLElement;

      if (!colorsList || !wrapper || !dropIndicator) return;

      const listItems = Array.from(colorsList.querySelectorAll('li'));
      const targetLi = listItems[this.dropIndicatorIndex];

      if (!targetLi) {
        dropIndicator.style.opacity = '0';
        return;
      }

      const targetRect = targetLi.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();

      // Position relative to wrapper using viewport coordinates (no scrollTop needed —
      // the indicator lives outside the scrollable list so its containing block doesn't scroll)
      const relativeTop = targetRect.top - wrapperRect.top;

      let indicatorTop: number;
      const indicatorHeight = 4; // Thin line indicator

      // With card shrinking, we position at the exact edge of the card
      if (this.dropIndicatorPosition === 'before') {
        // Position at top edge of card
        indicatorTop = relativeTop - (indicatorHeight / 2);
      } else {
        // Position at bottom edge of card
        indicatorTop = relativeTop + targetRect.height - (indicatorHeight / 2);
      }

      dropIndicator.style.top = `${indicatorTop}px`;
      dropIndicator.style.opacity = '1';
    });
  }


  render() {
    const colors = this.store.colors;
    const { criteria } = this.store.getSortState();
    const showReorderControls = criteria === 'manual';

    return html`
      <div class="palette">
        <!-- Screen reader announcements for status updates -->
        <div
          class="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          ${this.statusMessage}
        </div>

        <div class="header">
          <h2>Brand Colours</h2>
          ${colors.length > 0 ? html`
            <span class="color-count">${colors.length} colour${colors.length !== 1 ? 's' : ''}</span>
          ` : null}
        </div>

        ${colors.length >= 7 ? html`
          <brand-guidance .colorCount="${colors.length}"></brand-guidance>
        ` : null}

        <!-- Sort controls (shown when 2+ colors) -->
        ${colors.length >= 2 ? html`
          <sort-controls></sort-controls>
        ` : null}

        <div class="add-section">
          <color-input
            placeholder="#000000"
            label-placeholder="Label (optional)"
            @add-color="${this.handleAddColor}"
          ></color-input>
        </div>

        ${colors.length > 0 ? html`
          <!-- Wrapper provides the positioning context for the drop indicator -->
          <div class="colors-list-wrapper">
            <!-- Using native ul/li instead of ARIA roles for better semantics -->
            <ul class="colors-list ${this.isDraggingCard ? 'dragging-active' : ''}">
              ${colors.map((color, index) => html`
                  <li
                    data-color-id="${color.hex}"
                    style="transform: ${this.getCardTransform(index)}"
                  >
                    <color-swatch
                      .color="${color}"
                      .index="${index}"
                      .totalColors="${colors.length}"
                      ?manual-reorder-enabled="${showReorderControls}"
                      show-remove
                      editable-label
                      draggable-swatch
                      @swatch-remove="${() => this.removeColor(index)}"
                      @label-change="${(e: CustomEvent<LabelChangeEventDetail>) => this.updateColorLabel(index, e.detail.label)}"
                      @swatch-move="${this.handleColorMove}"
                      @boundary-reached="${this.handleBoundaryReached}"
                      @clear-all-drag-states="${this.clearAllDragStates}"
                      @drag-state-change="${this.handleDragStateChange}"
                      @drop-position-change="${this.handleDropPositionChange}"
                    ></color-swatch>
                  </li>
                `
              )}
            </ul>

            <!-- Drop indicator - absolutely positioned sibling to the list, managed by JS -->
            <div
              class="drop-indicator"
              style="${this.getDropIndicatorStyle()}"
              aria-hidden="true"
            ></div>
          </div>

          <div class="actions">
            <button
              type="button"
              class="clear-btn"
              @click="${this.clearAll}"
            >
              Clear all
            </button>
          </div>
        ` : html`
          <div class="empty-state">
            <p>No colours added yet.</p>
            <p>Enter a color using <code>#hex</code>, <code>rgb()</code>, or <code>hsl()</code> format.</p>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-palette': ColorPalette;
  }
}
