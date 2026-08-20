/**
 * URL State Unit Tests
 *
 * parseURLState / serializeURLState are pure when given explicit input,
 * so these run in the node environment without a window.
 */

import { describe, it, expect } from 'vitest';
import { parseURLState, serializeURLState } from './url-state';

describe('url-state view param', () => {
  describe('parseURLState', () => {
    it('parses view=list', () => {
      const state = parseURLState('?view=list');

      expect(state.view).toBe('list');
    });

    it('parses view=table', () => {
      const state = parseURLState('?view=table');

      expect(state.view).toBe('table');
    });

    it('ignores invalid view values', () => {
      const state = parseURLState('?view=grid');

      expect(state.view).toBeUndefined();
    });

    it('leaves view undefined when param is absent', () => {
      const state = parseURLState('?colors=000000,FFFFFF');

      expect(state.view).toBeUndefined();
    });

    it('parses view alongside other params', () => {
      const state = parseURLState('?colors=000000,FFFFFF&theme=dark&view=list');

      expect(state.colors).toEqual(['000000', 'FFFFFF']);
      expect(state.theme).toBe('dark');
      expect(state.view).toBe('list');
    });
  });

  describe('serializeURLState', () => {
    it('writes view=list', () => {
      const search = serializeURLState({ view: 'list' });

      expect(search).toBe('?view=list');
    });

    it('omits view param for table default (keeps URLs clean)', () => {
      const search = serializeURLState({ view: 'table' });

      expect(search).toBe('');
    });

    it('combines view with other params', () => {
      const search = serializeURLState({
        colors: ['000000', 'FFFFFF'],
        view: 'list',
      });

      expect(search).toContain('colors=000000%2CFFFFFF');
      expect(search).toContain('view=list');
    });

    it('round-trips list view through serialize and parse', () => {
      const search = serializeURLState({ colors: ['FF5733'], view: 'list' });
      const state = parseURLState(search);

      expect(state.view).toBe('list');
      expect(state.colors).toEqual(['FF5733']);
    });
  });
});
