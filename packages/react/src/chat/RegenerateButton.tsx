import React, { type ReactElement, useCallback } from 'react';

import type { ChatViewMessage } from './store.js';
import { ReloadIcon, StopIcon } from '../icons.js';

interface RegenerateButtonProps {
  abortSubmitChat?: () => void;
  lastMessageState: ChatViewMessage['state'];
  regenerateLastAnswer: () => void;
}

export function RegenerateButton(props: RegenerateButtonProps): ReactElement {
  const { abortSubmitChat, lastMessageState, regenerateLastAnswer } = props;

  const handleClick = useCallback(() => {
    if (lastMessageState === 'done' || lastMessageState === 'cancelled') {
      regenerateLastAnswer();
    } else {
      abortSubmitChat?.();
    }
  }, [lastMessageState, regenerateLastAnswer, abortSubmitChat]);

  return (
    <button
      className="DevDocsAIRegenerateButton"
      type="button"
      onClick={handleClick}
    >
      {(lastMessageState === 'done' || lastMessageState === 'cancelled') && (
        <>
          <ReloadIcon className="DevDocsAISearchIcon" /> Regenerate
        </>
      )}

      {(lastMessageState === 'preload' ||
        lastMessageState === 'streaming-answer') && (
        <>
          <StopIcon className="DevDocsAISearchIcon" /> Stop generating
        </>
      )}
    </button>
  );
}
