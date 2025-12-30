/**
 * Color Store Controller
 *
 * A Lit reactive controller that connects components to the color store.
 * Automatically handles subscription and triggers re-renders on state changes.
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { colorStore, type ColorStoreEvent, type ColorStoreState, type GridFilterLevel, type GridCellSize } from './color-store';
import type { Color, TextSize } from '../utils/color-types';

/**
 * Reactive controller for connecting Lit components to the color store
 *
 * Usage:
 * ```ts
 * class MyComponent extends LitElement {
 *   private store = new ColorStoreController(this);
 *
 *   render() {
 *     return html`
 *       <div>Colors: ${this.store.colors.length}</div>
 *     `;
 *   }
 * }
 * ```
 */
export class ColorStoreController implements ReactiveController {
  private host: ReactiveControllerHost;
  private unsubscribe: (() => void) | null = null;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    // Subscribe to store changes and trigger host update
    this.unsubscribe = colorStore.subscribe((_event: ColorStoreEvent) => {
      this.host.requestUpdate();
    });
  }

  hostDisconnected(): void {
    // Clean up subscription
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Convenience getters that delegate to the store

  /** Get all colors in the palette */
  get colors(): readonly Color[] {
    return colorStore.getColors();
  }

  /** Get current text size setting */
  get textSize(): TextSize {
    return colorStore.getTextSize();
  }

  /** Get selected algorithm */
  get algorithm(): 'wcag' | 'apca' | 'both' {
    return colorStore.getAlgorithm();
  }

  /** Get active grid filters */
  get gridFilters(): ReadonlySet<GridFilterLevel> {
    return colorStore.getGridFilters();
  }

  /** Get current grid cell size */
  get gridCellSize(): GridCellSize {
    return colorStore.getGridCellSize();
  }

  /** Get full state snapshot */
  get state(): Readonly<ColorStoreState> {
    return colorStore.getState();
  }

  // Convenience methods that delegate to the store

  /** Add a color */
  addColor(input: string | Color, label?: string): Color | null {
    return colorStore.addColor(input, label);
  }

  /** Add a Color object directly */
  addColorObject(color: Color): Color {
    return colorStore.addColorObject(color);
  }

  /** Add multiple colors */
  addColors(inputs: (string | [string, string])[]): Color[] {
    return colorStore.addColors(inputs);
  }

  /** Remove color by index */
  removeColor(index: number): boolean {
    return colorStore.removeColor(index);
  }

  /** Update color at index */
  updateColor(index: number, input: string, label?: string): Color | null {
    return colorStore.updateColor(index, input, label);
  }

  /** Update color label */
  updateColorLabel(index: number, label: string): boolean {
    return colorStore.updateColorLabel(index, label);
  }

  /** Move color from one position to another */
  moveColor(fromIndex: number, toIndex: number): boolean {
    return colorStore.moveColor(fromIndex, toIndex);
  }

  /** Clear all colors */
  clearColors(): void {
    colorStore.clearColors();
  }

  /** Set text size */
  setTextSize(textSize: TextSize): void {
    colorStore.setTextSize(textSize);
  }

  /** Toggle text size */
  toggleTextSize(): TextSize {
    return colorStore.toggleTextSize();
  }

  /** Set algorithm */
  setAlgorithm(algorithm: 'wcag' | 'apca' | 'both'): void {
    colorStore.setAlgorithm(algorithm);
  }

  /** Toggle a grid filter on/off */
  toggleGridFilter(level: GridFilterLevel): void {
    colorStore.toggleGridFilter(level);
  }

  /** Set all grid filters at once */
  setGridFilters(filters: Set<GridFilterLevel>): void {
    colorStore.setGridFilters(filters);
  }

  /** Set grid cell size */
  setGridCellSize(size: GridCellSize): void {
    colorStore.setGridCellSize(size);
  }

  /** Reset store */
  reset(): void {
    colorStore.reset();
  }
}
