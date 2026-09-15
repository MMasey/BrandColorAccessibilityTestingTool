/**
 * Theme Store Unit Tests
 *
 * Runs in the node environment: `document` and `localStorage` are stubbed per
 * test and modules are re-imported so each test gets a fresh singleton.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const STORAGE_KEY = 'brand-color-a11y-theme';

function createFakeElement(initial: Record<string, string> = {}) {
  const attributes = new Map(Object.entries(initial));
  return {
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: vi.fn((name: string, value: string) => void attributes.set(name, value)),
    removeAttribute: vi.fn((name: string) => void attributes.delete(name)),
  };
}

function createFakeStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => items.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void items.set(key, value)),
  };
}

type FakeElement = ReturnType<typeof createFakeElement>;

describe('themeStore', () => {
  let documentElement: FakeElement;
  let storage: ReturnType<typeof createFakeStorage>;

  beforeEach(() => {
    vi.resetModules();
    documentElement = createFakeElement({ 'data-theme': 'host-theme' });
    storage = createFakeStorage({ [STORAGE_KEY]: 'dark' });
    vi.stubGlobal('document', { documentElement });
    vi.stubGlobal('localStorage', storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('importing state modules', () => {
    it('does not touch the document or storage when the barrel is imported', async () => {
      await import('./index');

      expect(documentElement.setAttribute).not.toHaveBeenCalled();
      expect(documentElement.removeAttribute).not.toHaveBeenCalled();
      expect(documentElement.getAttribute('data-theme')).toBe('host-theme');
      expect(storage.getItem).not.toHaveBeenCalled();
    });

    it('reports the system theme until initialised', async () => {
      const { themeStore } = await import('./theme-store');

      expect(themeStore.theme).toBe('system');
    });
  });

  describe('initTheme', () => {
    it('applies the stored theme to the document element by default', async () => {
      const { initTheme, themeStore } = await import('./theme-store');

      initTheme();

      expect(themeStore.theme).toBe('dark');
      expect(documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('applies the theme to a passed root instead of the document element', async () => {
      const { initTheme, themeStore } = await import('./theme-store');
      const root = createFakeElement();

      initTheme(root as unknown as HTMLElement);
      themeStore.setTheme('high-contrast');

      expect(root.getAttribute('data-theme')).toBe('high-contrast');
      expect(documentElement.getAttribute('data-theme')).toBe('host-theme');
    });

    it('clears the attribute for the system theme', async () => {
      storage = createFakeStorage({ [STORAGE_KEY]: 'system' });
      vi.stubGlobal('localStorage', storage);
      const { initTheme } = await import('./theme-store');

      initTheme();

      expect(documentElement.getAttribute('data-theme')).toBeNull();
    });

    it('notifies subscribers of the loaded theme', async () => {
      const { initTheme, themeStore } = await import('./theme-store');
      const listener = vi.fn();
      themeStore.subscribe(listener);

      initTheme();

      expect(listener).toHaveBeenCalledWith({ theme: 'dark' });
    });

    it('only initialises once', async () => {
      const { initTheme } = await import('./theme-store');
      const secondRoot = createFakeElement();

      initTheme();
      initTheme(secondRoot as unknown as HTMLElement);

      expect(secondRoot.setAttribute).not.toHaveBeenCalled();
      expect(documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
