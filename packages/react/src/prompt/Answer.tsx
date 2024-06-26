import clsx from 'clsx';
import React, { type ReactElement } from 'react';

import type { PromptLoadingState } from './usePrompt.js';
import type { ChatLoadingState } from '../chat/store.js';
import * as BaseDevDocsAI from '../primitives/headless.js';

interface CaretProps {
  answer: string;
}

export function Caret(props: CaretProps): ReactElement | null {
  const { answer } = props;

  if (answer) {
    return null;
  }

  return <span className="DevDocsAICaret" />;
}

interface AnswerProps {
  className?: string;
  answer: string;
  state: PromptLoadingState | ChatLoadingState;
}

export function Answer(props: AnswerProps): ReactElement {
  const { answer, className, state } = props;

  return (
    <div
      className={clsx('DevDocsAIAnswer', className)}
      aria-describedby="devdocsai-progressbar"
      aria-busy={state === 'preload' || state === 'streaming-answer'}
      aria-live="polite"
    >
      <Caret answer={answer} />
      <BaseDevDocsAI.Answer answer={answer} />
    </div>
  );
}
