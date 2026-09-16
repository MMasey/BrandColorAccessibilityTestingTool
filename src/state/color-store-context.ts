/**
 * Color Store Context
 *
 * Lets an embedding root (the widget) hand its per-instance store to every
 * descendant component. The main app provides nothing, so controllers fall
 * back to the `colorStore` singleton.
 */

import { createContext } from '@lit/context';
import type { ColorStore } from './color-store';

// Contexts match by strict equality. A registry symbol lets separately bundled
// copies (the app and widget.js on one page) still find each other's provider.
export const colorStoreContext = createContext<ColorStore>(
  Symbol.for('brand-color-accessibility-tool.color-store'),
);
