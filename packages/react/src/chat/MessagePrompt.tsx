import React, { type ReactElement } from 'react';

import { type ChatViewMessage } from './store.js';
import type { DevDocsAIOptions } from '../types.js';

interface MessagePromptProps {
  children: string;
  state: ChatViewMessage['state'];
  referencesOptions?: DevDocsAIOptions['references'];
}

export function MessagePrompt(props: MessagePromptProps): ReactElement {
  const { children, referencesOptions, state } = props;
  return (
    <div className="DevDocsAIMessagePrompt" data-loading-state={state}>
      <h3 className="DevDocsAIMessagePromptText">{children}</h3>
      {(state === 'preload' || state === 'streaming-answer') && (
        <div
          className="DevDocsAIProgress"
          id="devdocsai-progressbar"
          role="progressbar"
          aria-labelledby="devdocsai-loading-text"
        >
          <p id="devdocsai-loading-text">{referencesOptions?.loadingText}</p>
        </div>
      )}
    </div>
  );
}
