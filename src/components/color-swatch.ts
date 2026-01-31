import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Color } from '../utils';

/**
 * Color swatch component displaying a color with its hex value and optional label.
 * Supports inline label editing when editable-label is set.
 *
 * @fires swatch-click - When the swatch is clicked
 * @fires swatch-remove - When the remove button is clicked
 * @fires label-change - When the label is edited (detail: { label: string })
 */
@customElement('color-swatch')
export class ColorSwatch extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .swatch-container {
      display: flex;
      align-items: stretch;
      gap: 0;
      background: var(--theme-card-bg-color, #f5f5f5);
      border: 1px solid var(--theme-input-border-color, #d4d4d4);
      border-radius: var(--radius-md, 0.5rem);
      overflow: hidden;
      min-height: var(--touch-target-min, 44px);
      position: relative;
      transition: opacity var(--transition-fast, 150ms ease),
                  transform var(--transition-fast, 150ms ease),
                  box-shadow var(--transition-fast, 150ms ease),
                  border-style var(--transition-fast, 150ms ease),
                  border-color var(--transition-fast, 150ms ease),
                  border-width var(--transition-fast, 150ms ease);
      cursor: grab;
    }

    .swatch-container[draggable="true"]:active {
      cursor: grabbing;
    }

    :host([dragging]) .swatch-container {
      opacity: 0.8;
      cursor: grabbing;
      transform: scale(1.02);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      z-index: 100;
    }


    /* Shake animation for boundary collision (respects prefers-reduced-motion) */
    @media (prefers-reduced-motion: no-preference) {
      @keyframes shake {
        0%, 100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-4px);
        }
        75% {
          transform: translateX(4px);
        }
      }

      :host([shake]) .swatch-container {
        animation: shake 200ms ease-in-out;
      }
    }

    .drag-handle {
      width: var(--touch-target-min, 44px);
      min-width: var(--touch-target-min, 44px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-right: 1px solid var(--theme-input-border-color);
      color: var(--theme-text-muted-color);
      cursor: grab;
      transition: color var(--transition-fast, 150ms ease),
                  background var(--transition-fast, 150ms ease),
                  transform var(--transition-fast, 150ms ease);
      user-select: none;
    }

    .drag-handle:hover {
      background: var(--theme-card-bg-color-hover);
      color: var(--theme-text-color);
    }

    @media (prefers-reduced-motion: no-preference) {
      .drag-handle:hover {
        transform: scale(1.05);
      }
    }

    .drag-handle:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
      outline-offset: -4px;
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .drag-handle svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .reorder-buttons {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
      padding: 4px 0;
      border-right: 1px solid var(--theme-input-border-color);
    }

    .reorder-btn {
      width: var(--touch-target-min, 44px);
      min-width: var(--touch-target-min, 44px);
      height: var(--touch-target-min, 44px);
      min-height: var(--touch-target-min, 44px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--theme-text-muted-color);
      cursor: pointer;
      transition: color var(--transition-fast, 150ms ease),
                  background var(--transition-fast, 150ms ease);
      font-size: var(--font-size-xs, 0.75rem);
    }

    .reorder-btn:hover:not(:disabled) {
      background: var(--theme-card-bg-color-hover);
      color: var(--theme-text-color);
    }

    .reorder-btn:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
      outline-offset: -4px;
    }

    .reorder-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .reorder-btn:not(:last-child) {
      border-bottom: 1px solid var(--theme-input-border-color);
    }

    .color-box {
      width: 3rem;
      min-width: 3rem;
      position: relative;
      overflow: hidden;
    }

    .color-box::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 8px 8px;
      background-position: 0 0, 0 4px, 4px -4px, -4px 0;
    }

    .color-box::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--swatch-color);
    }

    .info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      gap: 0.125rem;
      /* Match color-input info section height for consistency */
      min-height: 2.5rem;
    }

    /* Hex value - primary, larger text */
    .hex {
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-md, 1rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--theme-text-color, #1a1a1a);
      line-height: 1.2;
    }

    /* Label - secondary, smaller text */
    .label {
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--theme-text-secondary-color, #555555);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    /* Editable label button */
    .label-editable {
      background: none;
      border: none;
      padding: 0.125rem 0.25rem;
      margin: -0.125rem -0.25rem;
      font: inherit;
      color: inherit;
      cursor: pointer;
      text-align: left;
      border-radius: var(--radius-sm, 0.25rem);
      transition: background var(--transition-fast, 150ms ease);
    }

    .label-editable:hover {
      background: var(--theme-card-bg-color-hover);
    }

    .label-editable:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
      outline-offset: 1px;
    }

    /* Placeholder state for "Add label" - uses darker color for contrast accessibility */
    .label-placeholder {
      color: var(--theme-text-muted-color);
      font-style: italic;
    }

    /* Label input when editing */
    .label-input {
      width: 100%;
      padding: 0.125rem 0.25rem;
      margin: -0.125rem -0.25rem;
      font-size: var(--font-size-xs, 0.75rem);
      font-family: inherit;
      color: var(--theme-text-secondary-color);
      background: var(--theme-page-bg-color);
      border: 1px solid var(--theme-input-border-color-focus);
      border-radius: var(--radius-sm, 0.25rem);
      outline: none;
    }

    .label-input:focus {
      outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
      outline-offset: 1px;
    }

    .remove-btn {
      width: var(--touch-target-min, 44px);
      min-width: var(--touch-target-min, 44px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-left: 1px solid var(--theme-input-border-color);
      color: var(--theme-text-muted-color);
      cursor: pointer;
      transition: color var(--transition-fast, 150ms ease),
                  background var(--transition-fast, 150ms ease);
    }

    .remove-btn:hover {
      color: var(--theme-error-text-color);
      background: var(--theme-error-bg-color);
    }

    .remove-btn:focus-visible {
      /* Use outline with negative offset to draw inside element, avoiding overflow:hidden clipping */
      outline: var(--focus-ring-width, 2px) solid var(--theme-focus-ring-color);
      outline-offset: -4px;
    }

    .remove-btn svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    :host([compact]) .color-box {
      width: 2rem;
      min-width: 2rem;
    }

    :host([compact]) .info {
      display: none;
    }

    :host([compact]) .remove-btn {
      width: 2rem;
      min-width: 2rem;
    }

    /* ========================================================================
       Windows High Contrast Mode (forced-colors: active)

       Let the browser handle most styling automatically. We only need to:
       1. Preserve actual colors in the color preview box
       2. Add visible borders for structure
       ======================================================================== */
    @media (forced-colors: active) {
      .swatch-container {
        border: 2px solid CanvasText;
      }

      .color-box {
        /* MUST preserve actual color for the preview */
        forced-color-adjust: none;
        border-right: 2px solid CanvasText;
      }

      .color-box::before {
        /* Checkerboard needs visible pattern */
        background: repeating-conic-gradient(Canvas 0% 25%, CanvasText 0% 50%) 50% / 8px 8px;
      }

      .label-input {
        border: 2px solid Highlight;
      }

      .remove-btn {
        border-left: 2px solid CanvasText;
      }

      .drag-handle {
        border-right: 2px solid CanvasText;
      }

      .reorder-buttons {
        border-right: 2px solid CanvasText;
      }

      .reorder-btn {
        border: 2px solid CanvasText;
      }
    }
  `;

  /** The color to display */
  @property({ type: Object })
  color: Color | null = null;

  /** Whether to show the remove button */
  @property({ type: Boolean, attribute: 'show-remove' })
  showRemove = false;

  /** Whether the label is editable */
  @property({ type: Boolean, attribute: 'editable-label' })
  editableLabel = false;

  /** Whether to use compact mode */
  @property({ type: Boolean, reflect: true })
  compact = false;

  /** Whether to enable drag-and-drop reordering */
  @property({ type: Boolean, attribute: 'draggable-swatch' })
  draggableSwatch = false;

  /** Whether manual reorder controls should be visible */
  @property({ type: Boolean, attribute: 'manual-reorder-enabled' })
  manualReorderEnabled = false;

  /** Index of this swatch in the palette (for reordering) */
  @property({ type: Number })
  index = -1;

  /** Total number of colors (for reordering) */
  @property({ type: Number, attribute: 'total-colors' })
  totalColors = 0;

  /** Whether currently editing the label */
  @state()
  private isEditing = false;

  /** Temporary label value while editing */
  @state()
  private editValue = '';

  /** Whether to show shake animation for boundary collision */
  @property({ type: Boolean, reflect: true })
  shake = false;

  /** Track drag state - reflected to host for styling */
  @property({ type: Boolean, reflect: true, attribute: 'dragging' })
  isDragging = false;

  @property({ type: Boolean, reflect: true, attribute: 'drag-over' })
  isDragOver = false;

  /** Track where to show drop indicator: 'before' or 'after' */
  @property({ type: String, reflect: true, attribute: 'drag-position' })
  dragPosition: 'before' | 'after' | 'none' = 'none';

  /** Store the index being dragged (accessible during dragover) */
  private static draggedIndex: number = -1;

  /** Timeout for clearing stuck drag states */
  private dragCleanupTimeout?: number;

  /** Timeout for debouncing drag leave */
  private dragLeaveTimeout?: number;

  private handleRemove(e: Event): void {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('swatch-remove', {
      detail: { color: this.color },
      bubbles: true,
      composed: true,
    }));
  }

  private startEditing(): void {
    if (!this.editableLabel || !this.color) return;
    this.editValue = this.color.label || '';
    this.isEditing = true;

    // Focus the input after render
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector<HTMLInputElement>('.label-input');
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  private saveLabel(): void {
    if (!this.isEditing) return;

    const newLabel = this.editValue.trim();
    this.isEditing = false;

    // Only dispatch if label actually changed
    if (newLabel !== (this.color?.label || '')) {
      this.dispatchEvent(new CustomEvent('label-change', {
        detail: { label: newLabel },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private cancelEditing(): void {
    this.isEditing = false;
    this.editValue = '';
  }

  private handleInputKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.saveLabel();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.cancelEditing();
    }
  }

  private handleInputBlur(): void {
    // Save on blur
    this.saveLabel();
  }

  private handleInputChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.editValue = input.value;
  }

  // ========================================================================
  // HTML5 Drag-and-Drop
  // ========================================================================

  private handleDragStart(e: DragEvent): void {
    if (!this.draggableSwatch || !this.manualReorderEnabled) return;

    // Clear any previous cleanup timeout
    if (this.dragCleanupTimeout) {
      window.clearTimeout(this.dragCleanupTimeout);
    }

    this.isDragging = true;
    ColorSwatch.draggedIndex = this.index; // Store for use in dragover
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.index.toString());
    }

    // Notify parent that dragging has started, including which index is being dragged
    this.dispatchEvent(new CustomEvent('drag-state-change', {
      detail: { dragging: true, draggedIndex: this.index },
      bubbles: true,
      composed: true,
    }));

    // Safety: clear drag state after 2 seconds if dragend doesn't fire
    this.dragCleanupTimeout = window.setTimeout(() => {
      this.clearDragState();
      // Also clear all other swatches in case they're stuck
      this.dispatchEvent(new CustomEvent('clear-all-drag-states', {
        bubbles: true,
        composed: true,
      }));
    }, 2000);
  }

  private handleDragEnd(): void {
    if (this.dragCleanupTimeout) {
      window.clearTimeout(this.dragCleanupTimeout);
    }
    this.clearDragState();

    // Notify parent that dragging has ended
    this.dispatchEvent(new CustomEvent('drag-state-change', {
      detail: { dragging: false },
      bubbles: true,
      composed: true,
    }));
  }

  private clearDragState(): void {
    // Clear any pending timeouts
    if (this.dragLeaveTimeout) {
      window.clearTimeout(this.dragLeaveTimeout);
      this.dragLeaveTimeout = undefined;
    }

    this.isDragging = false;
    this.isDragOver = false;
    this.dragPosition = 'none';
    ColorSwatch.draggedIndex = -1;
  }

  private handleDragOver(e: DragEvent): void {
    if (!this.draggableSwatch || !this.manualReorderEnabled) return;
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to parent elements

    // Clear any pending drag leave timeout since we're still over the element
    if (this.dragLeaveTimeout) {
      window.clearTimeout(this.dragLeaveTimeout);
      this.dragLeaveTimeout = undefined;
    }

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }

    // Don't show indicator on the element being dragged
    if (ColorSwatch.draggedIndex === this.index) {
      this.isDragOver = false;
      this.dragPosition = 'none';
      return;
    }

    this.isDragOver = true;

    // Calculate drop position with hysteresis to reduce rapid switching
    const rect = this.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const heightThird = rect.height / 3;

    // Use thirds instead of halves to create a more stable middle zone
    let newPosition: 'before' | 'after';
    if (relativeY < heightThird) {
      // Clearly in top third - before
      newPosition = 'before';
    } else if (relativeY > rect.height - heightThird) {
      // Clearly in bottom third - after
      newPosition = 'after';
    } else {
      // In middle third - stick to current position if any, default to before
      newPosition = this.dragPosition !== 'none' ? this.dragPosition : 'before';
    }

    // Only update if position actually changed to reduce visual jumps
    if (this.dragPosition !== newPosition) {
      this.dragPosition = newPosition;
    }

    // Notify parent about drop position for visual indicator
    this.dispatchEvent(new CustomEvent('drop-position-change', {
      detail: {
        targetIndex: this.index,
        position: this.dragPosition,
      },
      bubbles: true,
      composed: true,
    }));
  }

  private handleDragLeave(): void {
    // Debounce drag leave to prevent flickering when moving over child elements
    // or when the indicator itself causes slight layout changes
    if (this.dragLeaveTimeout) {
      window.clearTimeout(this.dragLeaveTimeout);
    }

    this.dragLeaveTimeout = window.setTimeout(() => {
      this.isDragOver = false;
      this.dragPosition = 'none';
      this.dragLeaveTimeout = undefined;

      // Notify parent to hide drop indicator
      this.dispatchEvent(new CustomEvent('drop-position-change', {
        detail: {
          targetIndex: -1,
          position: 'none',
        },
        bubbles: true,
        composed: true,
      }));
    }, 100);
  }

  private handleDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this.draggableSwatch || !this.manualReorderEnabled) return;
    if (!e.dataTransfer) return;

    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    let toIndex = this.index;

    // If dropping "after", adjust the target index
    if (this.dragPosition === 'after') {
      toIndex = this.index + 1;
    }

    // When moving forward (fromIndex < toIndex), after removal the indices shift
    // so we need to adjust toIndex down by 1
    if (fromIndex < toIndex) {
      toIndex = toIndex - 1;
    }

    // Clear all drag states immediately
    this.clearDragState();

    if (fromIndex !== toIndex && !isNaN(fromIndex)) {
      this.dispatchEvent(new CustomEvent('swatch-move', {
        detail: { fromIndex, toIndex },
        bubbles: true,
        composed: true,
      }));
    }

    // Broadcast to clear all other swatches too
    this.dispatchEvent(new CustomEvent('clear-all-drag-states', {
      bubbles: true,
      composed: true,
    }));
  }

  // ========================================================================
  // Keyboard Reordering (WCAG 2.2 2.5.7 Compliant)
  // ========================================================================

  /**
   * WCAG 2.2 2.5.7 Dragging Movements - Keyboard Alternative
   * Move this swatch up in the list
   */
  private moveUp(): void {
    // Use the index property set by Lit (reliable after updateComplete)
    if (this.index <= 0) {
      // Show shake animation and announce boundary to screen readers
      this.shake = true;
      setTimeout(() => {
        this.shake = false;
      }, 200);

      this.dispatchEvent(new CustomEvent('boundary-reached', {
        detail: { message: 'Cannot move up - already at beginning of list' },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    this.dispatchEvent(new CustomEvent('swatch-move', {
      detail: { fromIndex: this.index, toIndex: this.index - 1 },
      bubbles: true,
      composed: true,
    }));
  }

  /**
   * WCAG 2.2 2.5.7 Dragging Movements - Keyboard Alternative
   * Move this swatch down in the list
   */
  private moveDown(): void {
    // Use the index property set by Lit (reliable after updateComplete)
    if (this.index >= this.totalColors - 1) {
      // Show shake animation and announce boundary to screen readers
      this.shake = true;
      setTimeout(() => {
        this.shake = false;
      }, 200);

      this.dispatchEvent(new CustomEvent('boundary-reached', {
        detail: { message: 'Cannot move down - already at end of list' },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    this.dispatchEvent(new CustomEvent('swatch-move', {
      detail: { fromIndex: this.index, toIndex: this.index + 1 },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this.color) return null;

    const label = this.color.label || '';
    const hasLabel = label.length > 0;

    return html`
      <div
        class="swatch-container"
        style="--swatch-color: ${this.color.hex}"
        draggable="${this.draggableSwatch && this.manualReorderEnabled ? 'true' : 'false'}"
        @dragstart="${this.handleDragStart}"
        @dragend="${this.handleDragEnd}"
        @dragover="${this.handleDragOver}"
        @dragleave="${this.handleDragLeave}"
        @drop="${this.handleDrop}"
      >
        <!-- WCAG 2.2 2.5.7: Keyboard alternative to dragging -->
        ${this.draggableSwatch && this.manualReorderEnabled ? html`
          <div class="reorder-buttons">
            <button
              type="button"
              class="reorder-btn"
              aria-label="Move ${hasLabel ? label : this.color.hex} up"
              title="Move up"
              @click="${this.moveUp}"
            >
              ▲
            </button>
            <button
              type="button"
              class="reorder-btn"
              aria-label="Move ${hasLabel ? label : this.color.hex} down"
              title="Move down"
              @click="${this.moveDown}"
            >
              ▼
            </button>
          </div>
        ` : null}

        <!-- Drag handle (visual indicator for drag-and-drop) -->
        ${this.draggableSwatch && this.manualReorderEnabled ? html`
          <div
            class="drag-handle"
            role="img"
            aria-label="Drag to reorder ${hasLabel ? label : this.color.hex}"
            title="Drag to reorder"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style="pointer-events: none;">
              <circle cx="9" cy="5" r="1.5"/>
              <circle cx="9" cy="12" r="1.5"/>
              <circle cx="9" cy="19" r="1.5"/>
              <circle cx="15" cy="5" r="1.5"/>
              <circle cx="15" cy="12" r="1.5"/>
              <circle cx="15" cy="19" r="1.5"/>
            </svg>
          </div>
        ` : null}

        <div class="color-box" aria-hidden="true"></div>

        <div class="info">
          <!-- Hex value - primary, larger text -->
          <div class="hex">${this.color.hex}</div>

          <!-- Label - secondary, smaller text (only if present or editing) -->
          ${this.isEditing ? html`
            <input
              type="text"
              class="label-input"
              .value="${this.editValue}"
              @input="${this.handleInputChange}"
              @keydown="${this.handleInputKeydown}"
              @blur="${this.handleInputBlur}"
              aria-label="Edit color label"
              placeholder="Add label"
              maxlength="50"
            />
          ` : hasLabel ? (
            this.editableLabel ? html`
              <button
                type="button"
                class="label label-editable"
                title="Click to edit label"
                @click="${this.startEditing}"
              >
                ${label}
              </button>
            ` : html`
              <div class="label" title="${label}">${label}</div>
            `
          ) : (
            this.editableLabel ? html`
              <button
                type="button"
                class="label label-editable label-placeholder"
                title="Click to add label"
                @click="${this.startEditing}"
              >
                Add label
              </button>
            ` : null
          )}
        </div>

        ${this.showRemove ? html`
          <button
            type="button"
            class="remove-btn"
            aria-label="Remove ${hasLabel ? label : this.color.hex}"
            @click="${this.handleRemove}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ` : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'color-swatch': ColorSwatch;
  }
}
