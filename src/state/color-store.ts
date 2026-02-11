/**
 * Color Palette Store
 *
 * Lightweight reactive store for managing brand colors and settings.
 * Uses a simple pub/sub pattern compatible with Lit's reactive system.
 */

import type { Color } from '../utils/color-types';
import { createColor } from '../utils/color-converter';
import { sortColors as applySorting, type SortCriteria, type SortDirection } from '../utils/color-sorting';

/** Grid filter levels for WCAG compliance */
export type GridFilterLevel = 'aaa' | 'aa' | 'aa-large' | 'failed';

/** Grid cell size options */
export type GridCellSize = 'small' | 'medium' | 'large';

/** Store state shape */
export interface ColorStoreState {
  colors: Color[];
  selectedAlgorithm: 'wcag' | 'apca' | 'both';
  gridFilters: Set<GridFilterLevel>;
  gridCellSize: GridCellSize;
  sortCriteria: SortCriteria;
  sortDirection: SortDirection;
  originalColorOrder: Color[];
}

/** Event types emitted by the store */
export type ColorStoreEvent =
  | { type: 'colors-changed'; colors: Color[] }
  | { type: 'algorithm-changed'; algorithm: 'wcag' | 'apca' | 'both' }
  | { type: 'grid-filters-changed'; filters: Set<GridFilterLevel> }
  | { type: 'grid-cell-size-changed'; size: GridCellSize }
  | { type: 'sort-changed'; criteria: SortCriteria; direction: SortDirection }
  | { type: 'order-reset' }
  | { type: 'state-reset' };

type Listener = (event: ColorStoreEvent) => void;

/**
 * Create the color store singleton
 */
function createColorStore() {
  // Initial state
  let state: ColorStoreState = {
    colors: [],
    selectedAlgorithm: 'wcag',
    gridFilters: new Set(['aaa', 'aa', 'aa-large']),
    gridCellSize: 'medium',
    sortCriteria: 'manual',
    sortDirection: 'ascending',
    originalColorOrder: [],
  };

  // Subscribers
  const listeners = new Set<Listener>();

  // Emit event to all listeners
  function emit(event: ColorStoreEvent): void {
    listeners.forEach((listener) => listener(event));
  }

  return {
    /** Get current state (readonly snapshot) */
    getState(): Readonly<ColorStoreState> {
      return { ...state, colors: [...state.colors] };
    },

    /** Get all colors */
    getColors(): readonly Color[] {
      return state.colors;
    },

    /** Get selected algorithm */
    getAlgorithm(): 'wcag' | 'apca' | 'both' {
      return state.selectedAlgorithm;
    },

    /**
     * Add a color to the palette
     * @param input - Color string (hex, rgb, hsl) or Color object
     * @param label - Optional label for the color
     * @returns The added color, or null if invalid
     */
    addColor(input: string | Color, label?: string): Color | null {
      let color: Color | null;

      if (typeof input === 'string') {
        color = createColor(input, label);
      } else {
        color = { ...input, label: label ?? input.label };
      }

      if (!color) return null;

      // Add to array
      const newColors = [...state.colors, color];

      // If we're tracking original order, append the new color to it
      const newOriginalOrder = state.originalColorOrder.length > 0
        ? [...state.originalColorOrder, color]
        : [];

      // If currently sorted (not manual mode), re-apply sort
      if (state.sortCriteria !== 'manual') {
        const sortedColors = applySorting(newColors, state.sortCriteria, state.sortDirection);
        state = {
          ...state,
          colors: sortedColors,
          originalColorOrder: newOriginalOrder,
        };
      } else {
        state = {
          ...state,
          colors: newColors,
          originalColorOrder: newOriginalOrder,
        };
      }

      emit({ type: 'colors-changed', colors: state.colors });
      return color;
    },

    /**
     * Add a Color object directly to the palette
     * @param color - Color object to add
     * @returns The added color
     */
    addColorObject(color: Color): Color {
      const newColors = [...state.colors, { ...color }];

      // If we're tracking original order, append the new color to it
      const newOriginalOrder = state.originalColorOrder.length > 0
        ? [...state.originalColorOrder, { ...color }]
        : [];

      // If currently sorted (not manual mode), re-apply sort
      if (state.sortCriteria !== 'manual') {
        const sortedColors = applySorting(newColors, state.sortCriteria, state.sortDirection);
        state = {
          ...state,
          colors: sortedColors,
          originalColorOrder: newOriginalOrder,
        };
      } else {
        state = {
          ...state,
          colors: newColors,
          originalColorOrder: newOriginalOrder,
        };
      }

      emit({ type: 'colors-changed', colors: state.colors });
      return color;
    },

    /**
     * Add multiple colors at once
     * @param inputs - Array of color strings or [color, label] tuples
     * @returns Array of added colors (excludes invalid inputs)
     */
    addColors(inputs: (string | [string, string])[]): Color[] {
      const newColors: Color[] = [];

      for (const input of inputs) {
        let color: Color | null;
        if (Array.isArray(input)) {
          color = createColor(input[0], input[1]);
        } else {
          color = createColor(input);
        }
        if (color) {
          newColors.push(color);
        }
      }

      if (newColors.length > 0) {
        const allColors = [...state.colors, ...newColors];

        // If we're tracking original order, append the new colors to it
        const newOriginalOrder = state.originalColorOrder.length > 0
          ? [...state.originalColorOrder, ...newColors]
          : [];

        // If currently sorted (not manual mode), re-apply sort
        if (state.sortCriteria !== 'manual') {
          const sortedColors = applySorting(allColors, state.sortCriteria, state.sortDirection);
          state = {
            ...state,
            colors: sortedColors,
            originalColorOrder: newOriginalOrder,
          };
        } else {
          state = {
            ...state,
            colors: allColors,
            originalColorOrder: newOriginalOrder,
          };
        }

        emit({ type: 'colors-changed', colors: state.colors });
      }

      return newColors;
    },

    /**
     * Remove a color by index
     */
    removeColor(index: number): boolean {
      if (index < 0 || index >= state.colors.length) return false;

      const removedColor = state.colors[index];
      const newColors = state.colors.filter((_, i) => i !== index);

      // If we're tracking original order, remove the color from it too
      const newOriginalOrder = state.originalColorOrder.length > 0
        ? state.originalColorOrder.filter(c => c !== removedColor)
        : [];

      state = {
        ...state,
        colors: newColors,
        originalColorOrder: newOriginalOrder,
      };

      emit({ type: 'colors-changed', colors: state.colors });
      return true;
    },

    /**
     * Remove a color by hex value
     */
    removeColorByHex(hex: string): boolean {
      const normalizedHex = hex.toUpperCase().startsWith('#')
        ? hex.toUpperCase()
        : `#${hex.toUpperCase()}`;

      const index = state.colors.findIndex((c) => c.hex === normalizedHex);
      if (index === -1) return false;

      return this.removeColor(index);
    },

    /**
     * Update a color at a specific index
     */
    updateColor(index: number, input: string, label?: string): Color | null {
      if (index < 0 || index >= state.colors.length) return null;

      const color = createColor(input, label);
      if (!color) return null;

      const newColors = [...state.colors];
      newColors[index] = color;

      state = { ...state, colors: newColors };
      emit({ type: 'colors-changed', colors: state.colors });

      return color;
    },

    /**
     * Update just the label of a color
     */
    updateColorLabel(index: number, label: string): boolean {
      if (index < 0 || index >= state.colors.length) return false;

      const newColors = [...state.colors];
      const existingColor = newColors[index];
      if (!existingColor) return false;

      newColors[index] = { ...existingColor, label };

      state = { ...state, colors: newColors };
      emit({ type: 'colors-changed', colors: state.colors });

      return true;
    },

    /**
     * Reorder colors (move from one index to another)
     */
    moveColor(fromIndex: number, toIndex: number): boolean {
      if (
        fromIndex < 0 ||
        fromIndex >= state.colors.length ||
        toIndex < 0 ||
        toIndex >= state.colors.length
      ) {
        return false;
      }

      const newColors = [...state.colors];
      const [removed] = newColors.splice(fromIndex, 1);
      if (!removed) return false;

      newColors.splice(toIndex, 0, removed);

      state = { ...state, colors: newColors };
      emit({ type: 'colors-changed', colors: state.colors });

      return true;
    },

    /**
     * Clear all colors
     */
    clearColors(): void {
      state = { ...state, colors: [] };
      emit({ type: 'colors-changed', colors: state.colors });
    },

    /**
     * Set algorithm for contrast calculation
     */
    setAlgorithm(algorithm: 'wcag' | 'apca' | 'both'): void {
      if (state.selectedAlgorithm === algorithm) return;

      state = { ...state, selectedAlgorithm: algorithm };
      emit({ type: 'algorithm-changed', algorithm });
    },

    /**
     * Get active grid filters
     */
    getGridFilters(): ReadonlySet<GridFilterLevel> {
      return new Set(state.gridFilters);
    },

    /**
     * Toggle a grid filter on/off
     */
    toggleGridFilter(level: GridFilterLevel): void {
      const newFilters = new Set(state.gridFilters);
      if (newFilters.has(level)) {
        newFilters.delete(level);
      } else {
        newFilters.add(level);
      }
      state = { ...state, gridFilters: newFilters };
      emit({ type: 'grid-filters-changed', filters: state.gridFilters });
    },

    /**
     * Set all grid filters at once
     */
    setGridFilters(filters: Set<GridFilterLevel>): void {
      state = { ...state, gridFilters: new Set(filters) };
      emit({ type: 'grid-filters-changed', filters: state.gridFilters });
    },

    /**
     * Get current grid cell size
     */
    getGridCellSize(): GridCellSize {
      return state.gridCellSize;
    },

    /**
     * Set grid cell size
     */
    setGridCellSize(size: GridCellSize): void {
      if (state.gridCellSize === size) return;
      state = { ...state, gridCellSize: size };
      emit({ type: 'grid-cell-size-changed', size });
    },

    /**
     * Sort colors by the specified criteria
     * Stores original order for later reset
     */
    sortColorsPalette(criteria: SortCriteria, direction: SortDirection = 'ascending'): void {
      // Don't sort if already sorted with same criteria and direction
      if (state.sortCriteria === criteria && state.sortDirection === direction && criteria !== 'manual') {
        return;
      }

      // Store original order on first sort (if not already stored)
      if (state.sortCriteria === 'manual' && state.originalColorOrder.length === 0) {
        state.originalColorOrder = [...state.colors];
      }

      // Apply sorting
      const sortedColors = applySorting(state.colors, criteria, direction);

      state = {
        ...state,
        colors: sortedColors,
        sortCriteria: criteria,
        sortDirection: direction,
      };

      emit({ type: 'sort-changed', criteria, direction });
      emit({ type: 'colors-changed', colors: state.colors });
    },

    /**
     * Manually reorder colors (for drag-and-drop or move up/down buttons)
     * @param newOrder - Array of colors in the desired order
     */
    reorderColors(newOrder: Color[]): void {
      // Validate that newOrder contains all and only the current colors
      if (newOrder.length !== state.colors.length) {
        console.warn('reorderColors: newOrder length mismatch');
        return;
      }

      // Store original order on first manual reorder (if not already stored)
      if (state.sortCriteria === 'manual' && state.originalColorOrder.length === 0) {
        state.originalColorOrder = [...state.colors];
      }

      state = {
        ...state,
        colors: [...newOrder],
        sortCriteria: 'manual',
      };

      emit({ type: 'sort-changed', criteria: 'manual', direction: state.sortDirection });
      emit({ type: 'colors-changed', colors: state.colors });
    },

    /**
     * Reset to original color order (insertion order)
     */
    resetToOriginalOrder(): void {
      if (state.originalColorOrder.length === 0) {
        // Nothing to reset to
        return;
      }

      state = {
        ...state,
        colors: [...state.originalColorOrder],
        sortCriteria: 'manual',
        originalColorOrder: [], // Clear original order after reset
      };

      emit({ type: 'order-reset' });
      emit({ type: 'colors-changed', colors: state.colors });
    },

    /**
     * Get current sort state
     */
    getSortState(): { criteria: SortCriteria; direction: SortDirection; isSorted: boolean } {
      return {
        criteria: state.sortCriteria,
        direction: state.sortDirection,
        isSorted: state.sortCriteria !== 'manual',
      };
    },

    /**
     * Reset store to initial state
     */
    reset(): void {
      state = {
        colors: [],
        selectedAlgorithm: 'wcag',
        gridFilters: new Set(['aaa', 'aa', 'aa-large']),
        gridCellSize: 'medium',
        sortCriteria: 'manual',
        sortDirection: 'ascending',
        originalColorOrder: [],
      };
      emit({ type: 'state-reset' });
    },

    /**
     * Subscribe to store changes
     * @returns Unsubscribe function
     */
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /**
     * Get subscriber count (useful for debugging)
     */
    getSubscriberCount(): number {
      return listeners.size;
    },
  };
}

/** Singleton store instance */
export const colorStore = createColorStore();

/** Type for the store */
export type ColorStore = typeof colorStore;

/** Re-export sorting types for convenience */
export type { SortCriteria, SortDirection } from '../utils/color-sorting';
