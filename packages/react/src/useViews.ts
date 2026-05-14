import { useCallback, useEffect, useState } from 'react';

import type { DevDocsAIOptions } from './types.js';

export type View = 'chat' | 'prompt' | 'search';

interface UseViewsResult {
  activeView: View;
  setActiveView: (view: View) => void;
}

export function useViews(
  options: DevDocsAIOptions,
  defaultView?: DevDocsAIOptions['defaultView'],
): UseViewsResult {
  const { chat, search } = options;

  const numViewsEnabled = [chat?.enabled || true, search?.enabled].filter(
    Boolean,
  ).length;

  const [activeView, setActiveView] = useState<View>(() => {
    if (defaultView) return defaultView;
    if (search?.enabled) return 'search';
    if (chat?.enabled) return 'chat';
    return 'prompt';
  });

  // Mirror chat.enabled changes onto activeView synchronously during render,
  // per the React "adjusting state when a prop changes" pattern. Avoids the
  // useEffect+setState detour that triggers an extra commit and the
  // react-hooks/set-state-in-effect rule.
  const [prevChatEnabled, setPrevChatEnabled] = useState(chat?.enabled);
  if (prevChatEnabled !== chat?.enabled) {
    setPrevChatEnabled(chat?.enabled);
    if (chat?.enabled && activeView === 'prompt') {
      setActiveView('chat');
    } else if (!chat?.enabled && activeView === 'chat') {
      setActiveView('prompt');
    }
  }

  const toggleActiveView = useCallback(() => {
    switch (activeView) {
      case 'chat':
      case 'prompt':
        return setActiveView('search');
      case 'search':
        return setActiveView(chat?.enabled ? 'chat' : 'prompt');
    }
  }, [activeView, chat?.enabled]);

  // toggle the view when a hotkey is pressed
  useEffect(() => {
    if (numViewsEnabled === 1) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        (event.key === 'Enter' && event.ctrlKey) ||
        (event.key === 'Enter' && event.metaKey)
      ) {
        event.preventDefault();
        toggleActiveView();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [numViewsEnabled, toggleActiveView]);

  return { activeView, setActiveView };
}
