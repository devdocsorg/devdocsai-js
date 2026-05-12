/* eslint-disable no-console */
import {
  act,
  renderHook as rtlRenderHook,
  type RenderHookOptions,
  type RenderHookResult,
} from '@testing-library/react';

export { act };

export function suppressErrorOutput(): () => void {
  const original = console.error;
  console.error = () => undefined;
  return () => {
    console.error = original;
  };
}

// Compatibility wrapper that emulates @testing-library/react-hooks' `result.error`
// semantics on top of @testing-library/react's renderHook. The legacy library
// caught synchronous throws from the hook and surfaced them on `result.error`
// instead of bubbling. Tests written against that API rely on it.
interface LegacyResult<T> {
  current: T;
  error?: Error;
}

type LegacyRenderHookResult<T, P> = Omit<RenderHookResult<T, P>, 'result'> & {
  result: LegacyResult<T>;
};

export function renderHook<T, P>(
  callback: (props: P) => T,
  options?: RenderHookOptions<P>,
): LegacyRenderHookResult<T, P> {
  let caught: Error | undefined;
  const restore = suppressErrorOutput();
  try {
    const rendered = rtlRenderHook(callback, options);
    restore();
    return rendered as LegacyRenderHookResult<T, P>;
  } catch (e) {
    restore();
    caught = e as Error;
    const legacyResult: LegacyResult<T> = {
      current: undefined as unknown as T,
      error: caught,
    };
    return {
      result: legacyResult,
      rerender: () => undefined,
      unmount: () => undefined,
    } as unknown as LegacyRenderHookResult<T, P>;
  }
}
