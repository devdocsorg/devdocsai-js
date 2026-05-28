import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DevDocsAIOptions } from './types.js';
import { useViews } from './useViews.js';

afterEach(() => {
  vi.restoreAllMocks();
});

function dispatchCtrlEnter(): void {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }),
    );
  });
}

describe('useViews', () => {
  describe('initial view selection', () => {
    it('uses the explicit defaultView when provided', () => {
      const { result } = renderHook(() =>
        useViews({ search: { enabled: true } }, 'prompt'),
      );
      expect(result.current.activeView).toBe('prompt');
    });

    it('prefers search when search is enabled and no defaultView is given', () => {
      const { result } = renderHook(() =>
        useViews({ search: { enabled: true }, chat: { enabled: true } }),
      );
      expect(result.current.activeView).toBe('search');
    });

    it('falls back to chat when only chat is enabled', () => {
      const { result } = renderHook(() =>
        useViews({ chat: { enabled: true } }),
      );
      expect(result.current.activeView).toBe('chat');
    });

    it('falls back to prompt when neither search nor chat is enabled', () => {
      const { result } = renderHook(() => useViews({}));
      expect(result.current.activeView).toBe('prompt');
    });
  });

  describe('setActiveView', () => {
    it('updates the active view imperatively', () => {
      const { result } = renderHook(() =>
        useViews({ chat: { enabled: true } }),
      );
      expect(result.current.activeView).toBe('chat');
      act(() => result.current.setActiveView('search'));
      expect(result.current.activeView).toBe('search');
    });
  });

  describe('prop-change effect', () => {
    it('switches prompt -> chat when chat becomes enabled', () => {
      const { result, rerender } = renderHook(
        ({ options }: { options: DevDocsAIOptions }) => useViews(options),
        { initialProps: { options: {} as DevDocsAIOptions } },
      );
      expect(result.current.activeView).toBe('prompt');

      rerender({ options: { chat: { enabled: true } } });
      expect(result.current.activeView).toBe('chat');
    });

    it('switches chat -> prompt when chat becomes disabled', () => {
      const { result, rerender } = renderHook(
        ({ options }: { options: DevDocsAIOptions }) => useViews(options),
        { initialProps: { options: { chat: { enabled: true } } } },
      );
      expect(result.current.activeView).toBe('chat');

      rerender({ options: { chat: { enabled: false } } });
      expect(result.current.activeView).toBe('prompt');
    });
  });

  describe('Ctrl/Cmd+Enter hotkey toggle', () => {
    it('toggles between search and chat when both views are enabled', () => {
      const { result } = renderHook(() =>
        useViews({ search: { enabled: true }, chat: { enabled: true } }),
      );
      expect(result.current.activeView).toBe('search');

      dispatchCtrlEnter();
      expect(result.current.activeView).toBe('chat');

      dispatchCtrlEnter();
      expect(result.current.activeView).toBe('search');
    });

    it('toggles search -> prompt when chat is disabled but search is enabled', () => {
      // numViewsEnabled === 2 here (the chat/prompt slot always counts as one,
      // plus search), so the hotkey is active; from search it falls back to
      // prompt because chat is disabled.
      const { result } = renderHook(() =>
        useViews({ search: { enabled: true }, chat: { enabled: false } }),
      );
      expect(result.current.activeView).toBe('search');

      dispatchCtrlEnter();
      expect(result.current.activeView).toBe('prompt');

      dispatchCtrlEnter();
      expect(result.current.activeView).toBe('search');
    });

    it('does nothing for a plain Enter without a modifier key', () => {
      const { result } = renderHook(() =>
        useViews({ search: { enabled: true }, chat: { enabled: true } }),
      );
      expect(result.current.activeView).toBe('search');

      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });
      expect(result.current.activeView).toBe('search');
    });

    it('removes the keydown listener on unmount', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = renderHook(() =>
        useViews({ search: { enabled: true }, chat: { enabled: true } }),
      );
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
