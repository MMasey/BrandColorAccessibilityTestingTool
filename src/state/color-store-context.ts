/**
 * Color Store Context
 *
 * Lets an embedding root (the widget) hand its per-instance store to every
 * descendant component. The main app provides nothing, so controllers fall
 * back to the `colorStore` singleton.
 */

import { createContext } from '@lit/context';
import type { ColorStore } from './color-store';

export const colorStoreContext = createContext<ColorStore>(Symbol('color-store'));
