/**
 * Color Store Controller
 *
 * A Lit reactive controller that connects components to the color store.
 * Automatically handles subscription and triggers re-renders on state changes.
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { ContextConsumer } from '@lit/context';
import { colorStore, type ColorStore, type ColorStoreEvent, type ColorStoreState, type GridFilterLevel, type GridCellSize, type ResultsView, type SortCriteria, type SortDirection } from './color-store';
import { colorStoreContext } from './color-store-context';
import type { Color } from '../utils/color-types';

type ControllerHost = ReactiveControllerHost & HTMLElement;

/**
 * Reactive controller for connecting Lit components to the color store
 *
 * The store is resolved in order: an explicitly injected store, a store
 * provided via `colorStoreContext` by an ancestor, then the `colorStore`
 * singleton.
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
  private host: ControllerHost;
  private injectedStore: ColorStore | undefined;
  private contextStore: ContextConsumer<typeof colorStoreContext, ControllerHost> | undefined;
  private unsubscribe: (() => void) | null = null;

  constructor(host: ControllerHost, store?: ColorStore) {
    this.host = host;
    this.injectedStore = store;
    if (!store) {
      // Must be added before this controller: controllers connect in insertion
      // order, so the context value is resolved by the time we subscribe.
      this.contextStore = new ContextConsumer(host, { context: colorStoreContext });
    }
    host.addController(this);
  }

  private get store(): ColorStore {
    return this.injectedStore ?? this.contextStore?.value ?? colorStore;
  }

  hostConnected(): void {
    // Subscribe to store changes and trigger host update
    this.unsubscribe = this.store.subscribe((_event: ColorStoreEvent) => {
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
    return this.store.getColors();
  }

  /** Get selected algorithm */
  get algorithm(): 'wcag' | 'apca' | 'both' {
    return this.store.getAlgorithm();
  }

  /** Get active grid filters */
  get gridFilters(): ReadonlySet<GridFilterLevel> {
    return this.store.getGridFilters();
  }

  /** Get current grid cell size */
  get gridCellSize(): GridCellSize {
    return this.store.getGridCellSize();
  }

  /** Get current results view (table or list) */
  get resultsView(): ResultsView {
    return this.store.getResultsView();
  }

  /** Get full state snapshot */
  get state(): Readonly<ColorStoreState> {
    return this.store.getState();
  }

  // Convenience methods that delegate to the store

  /** Add a color */
  addColor(input: string | Color, label?: string): Color | null {
    return this.store.addColor(input, label);
  }

  /** Add a Color object directly */
  addColorObject(color: Color): Color {
    return this.store.addColorObject(color);
  }

  /** Add multiple colors */
  addColors(inputs: (string | [string, string])[]): Color[] {
    return this.store.addColors(inputs);
  }

  /** Remove color by index */
  removeColor(index: number): boolean {
    return this.store.removeColor(index);
  }

  /** Update color at index */
  updateColor(index: number, input: string, label?: string): Color | null {
    return this.store.updateColor(index, input, label);
  }

  /** Update color label */
  updateColorLabel(index: number, label: string): boolean {
    return this.store.updateColorLabel(index, label);
  }

  /** Move color from one position to another */
  moveColor(fromIndex: number, toIndex: number): boolean {
    return this.store.moveColor(fromIndex, toIndex);
  }

  /** Clear all colors */
  clearColors(): void {
    this.store.clearColors();
  }

  /** Set algorithm */
  setAlgorithm(algorithm: 'wcag' | 'apca' | 'both'): void {
    this.store.setAlgorithm(algorithm);
  }

  /** Toggle a grid filter on/off */
  toggleGridFilter(level: GridFilterLevel): void {
    this.store.toggleGridFilter(level);
  }

  /** Set all grid filters at once */
  setGridFilters(filters: Set<GridFilterLevel>): void {
    this.store.setGridFilters(filters);
  }

  /** Set grid cell size */
  setGridCellSize(size: GridCellSize): void {
    this.store.setGridCellSize(size);
  }

  /** Set results view (table or list) */
  setResultsView(view: ResultsView): void {
    this.store.setResultsView(view);
  }

  /** Reset store */
  reset(): void {
    this.store.reset();
  }

  /** Sort colors by criteria and direction */
  sortColorsPalette(criteria: SortCriteria, direction: SortDirection = 'ascending'): void {
    this.store.sortColorsPalette(criteria, direction);
  }

  /** Manually reorder colors */
  reorderColors(newOrder: Color[]): void {
    this.store.reorderColors(newOrder);
  }

  /** Reset to original color order */
  resetToOriginalOrder(): void {
    this.store.resetToOriginalOrder();
  }

  /** Get current sort state */
  getSortState(): { criteria: SortCriteria; direction: SortDirection; isSorted: boolean } {
    return this.store.getSortState();
  }

}
