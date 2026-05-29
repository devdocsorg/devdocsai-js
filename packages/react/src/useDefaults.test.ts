import { describe, expect, it } from 'vitest';

import { renderHook } from './test-utils.js';
import { useDefaults } from './useDefaults.js';

describe('useDefaults', () => {
  it('returns the options unchanged when no defaults are provided', () => {
    const options = { a: 1, b: { c: 2 } };
    const { result } = renderHook(() => useDefaults(options, undefined));
    expect(result.current).toStrictEqual({ a: 1, b: { c: 2 } });
  });

  it('fills in missing top-level keys from the defaults', () => {
    const { result } = renderHook(() => useDefaults({ a: 1 }, { a: 99, b: 2 }));
    // Provided value wins; missing key is filled from defaults.
    expect(result.current).toStrictEqual({ a: 1, b: 2 });
  });

  it('deep-merges nested objects rather than overwriting them', () => {
    // This is the entire reason the hook exists: lodash `defaults` only merges
    // the first level, `defaultsDeep` (used here) recurses.
    const { result } = renderHook(() =>
      useDefaults(
        { nested: { keep: 'from-options' } },
        { nested: { keep: 'from-defaults', added: 'from-defaults' } },
      ),
    );
    expect(result.current).toStrictEqual({
      nested: { keep: 'from-options', added: 'from-defaults' },
    });
  });

  it('does not mutate the caller-provided options object', () => {
    // defaultsDeep mutates its first argument, so the hook clones options first.
    const options = { a: 1 } as { a: number; b?: number };
    renderHook(() => useDefaults(options, { a: 0, b: 2 }));
    expect(options).toStrictEqual({ a: 1 });
    expect(options).not.toHaveProperty('b');
  });

  it('returns a memoized reference for stable inputs across re-renders', () => {
    const options = { a: 1 };
    const defaultOptions = { a: 0, b: 2 };
    const { result, rerender } = renderHook(() =>
      useDefaults(options, defaultOptions),
    );
    const first = result.current;
    rerender();
    // Same object identity (useMemo) because deps did not change.
    expect(result.current).toBe(first);
  });
});
