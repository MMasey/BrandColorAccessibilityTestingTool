/**
 * Color Store Controller Unit Tests
 *
 * Runs in the node environment: a minimal EventTarget-based host stands in for
 * a LitElement, and a context-request listener on it stands in for an ancestor
 * ContextProvider (real DOM propagation is covered by E2E).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { createContext, type ContextEvent } from '@lit/context';
import { ColorStoreController } from './color-store-controller';
import { colorStore, createColorStore, type ColorStore } from './color-store';
import { colorStoreContext } from './color-store-context';

class FakeHost extends EventTarget implements ReactiveControllerHost {
  private controllers: ReactiveController[] = [];
  updateCount = 0;

  addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }

  removeController(controller: ReactiveController): void {
    this.controllers = this.controllers.filter((c) => c !== controller);
  }

  requestUpdate(): void {
    this.updateCount++;
  }

  get updateComplete(): Promise<boolean> {
    return Promise.resolve(true);
  }

  connect(): void {
    this.controllers.forEach((c) => c.hostConnected?.());
  }

  disconnect(): void {
    this.controllers.forEach((c) => c.hostDisconnected?.());
  }

  provide(store: ColorStore, context: typeof colorStoreContext = colorStoreContext): void {
    this.addEventListener('context-request', (event) => {
      const request = event as ContextEvent<typeof colorStoreContext>;
      if (request.context !== context) return;
      request.stopPropagation();
      request.callback(store);
    });
  }
}

function createController(host: FakeHost, store?: ColorStore): ColorStoreController {
  return new ColorStoreController(host as unknown as ReactiveControllerHost & HTMLElement, store);
}

describe('ColorStoreController', () => {
  beforeEach(() => {
    colorStore.reset();
  });

  describe('without an injected or provided store', () => {
    it('falls back to the singleton', () => {
      const host = new FakeHost();
      const controller = createController(host);
      host.connect();

      controller.addColor('#003366');

      expect(colorStore.getColors()).toHaveLength(1);
      expect(controller.colors).toHaveLength(1);
    });
  });

  describe('with an injected store', () => {
    it('reads and writes the injected store, not the singleton', () => {
      const store = createColorStore();
      const host = new FakeHost();
      const controller = createController(host, store);
      host.connect();

      controller.addColor('#003366');
      controller.setResultsView('list');

      expect(store.getColors()).toHaveLength(1);
      expect(store.getResultsView()).toBe('list');
      expect(colorStore.getColors()).toHaveLength(0);
      expect(colorStore.getResultsView()).toBe('table');
    });

    it('requests a host update when the injected store changes', () => {
      const store = createColorStore();
      const host = new FakeHost();
      createController(host, store);
      host.connect();

      store.addColor('#003366');
      colorStore.addColor('#FFFFFF');

      expect(host.updateCount).toBe(1);
    });

    it('stops requesting updates after the host disconnects', () => {
      const store = createColorStore();
      const host = new FakeHost();
      createController(host, store);
      host.connect();
      host.disconnect();

      store.addColor('#003366');

      expect(store.getSubscriberCount()).toBe(0);
      expect(host.updateCount).toBe(0);
    });
  });

  describe('with a context-provided store', () => {
    it('uses the provided store once connected', () => {
      const store = createColorStore();
      const host = new FakeHost();
      host.provide(store);
      const controller = createController(host);
      host.connect();

      controller.addColor('#003366');

      expect(store.getColors()).toHaveLength(1);
      expect(colorStore.getColors()).toHaveLength(0);
    });

    it('uses a store provided through a separately bundled copy of the context', () => {
      // The app bundle and widget.js on one page each evaluate their own copy
      // of color-store-context.ts.
      const otherBundleContext = createContext<ColorStore>(
        Symbol.for('brand-color-accessibility-tool.color-store'),
      );
      const store = createColorStore();
      const host = new FakeHost();
      host.provide(store, otherBundleContext);
      const controller = createController(host);
      host.connect();

      controller.addColor('#003366');

      expect(store.getColors()).toHaveLength(1);
      expect(colorStore.getColors()).toHaveLength(0);
    });

    it('subscribes to the provided store rather than the singleton', () => {
      const store = createColorStore();
      const host = new FakeHost();
      host.provide(store);
      createController(host);
      host.connect();
      const updatesAfterConnect = host.updateCount;

      colorStore.addColor('#FFFFFF');
      store.addColor('#003366');

      expect(store.getSubscriberCount()).toBe(1);
      expect(host.updateCount).toBe(updatesAfterConnect + 1);
    });

    it('prefers an injected store over a provided one', () => {
      const injected = createColorStore();
      const provided = createColorStore();
      const host = new FakeHost();
      host.provide(provided);
      const controller = createController(host, injected);
      host.connect();

      controller.addColor('#003366');

      expect(injected.getColors()).toHaveLength(1);
      expect(provided.getColors()).toHaveLength(0);
    });
  });
});
