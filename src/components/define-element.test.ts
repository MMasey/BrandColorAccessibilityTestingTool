/**
 * Custom Element Registration Guard Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineElement } from './define-element';

/** Mirrors the native registry: define() throws on a taken name */
function createRegistry() {
  const definitions = new Map<string, CustomElementConstructor>();
  return {
    get: (name: string) => definitions.get(name),
    define: vi.fn((name: string, ctor: CustomElementConstructor) => {
      if (definitions.has(name)) {
        throw new DOMException(`"${name}" has already been used with this registry`);
      }
      definitions.set(name, ctor);
    }),
  };
}

const elementClass = () => class {} as unknown as CustomElementConstructor;

describe('defineElement', () => {
  let registry: ReturnType<typeof createRegistry>;

  beforeEach(() => {
    registry = createRegistry();
    vi.stubGlobal('customElements', registry);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('defines the element when the tag is free', () => {
    const Element = elementClass();

    defineElement('bca-test')(Element);

    expect(registry.get('bca-test')).toBe(Element);
  });

  it('warns instead of throwing when the tag is already defined', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    defineElement('bca-test')(elementClass());

    expect(() => defineElement('bca-test')(elementClass())).not.toThrow();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain('<bca-test>');
  });

  it('keeps the existing definition', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const First = elementClass();
    defineElement('bca-test')(First);

    defineElement('bca-test')(elementClass());

    expect(registry.get('bca-test')).toBe(First);
    expect(registry.define).toHaveBeenCalledOnce();
  });
});
