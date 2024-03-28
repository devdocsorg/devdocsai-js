import type { FileSectionReference } from '@devdocsai/core';
import * as AccessibleIcon from '@radix-ui/react-accessible-icon';
import React, {
  useCallback,
  useEffect,
  useRef,
  type ChangeEventHandler,
  type FormEventHandler,
  type ReactElement,
} from 'react';

import { Answer } from './Answer.js';
import { DefaultView } from './DefaultView.js';
import { References } from './References.js';
import { usePrompt, type PromptLoadingState } from './usePrompt.js';
import { DEFAULT_DEVDOCSAI_OPTIONS } from '../constants.js';
import { Feedback } from '../feedback/Feedback.js';
import type { UseFeedbackResult } from '../feedback/useFeedback.js';
import { SparklesIcon } from '../icons.js';
import * as BaseDevDocsAI from '../primitives/headless.js';
import { type DevDocsAIOptions } from '../types.js';
import { useDefaults } from '../useDefaults.js';
import type { View } from '../useViews.js';

export interface PromptViewProps {
  activeView?: View;
  projectKey: string;
  promptOptions: DevDocsAIOptions['prompt'];
  feedbackOptions?: DevDocsAIOptions['feedback'];
  referencesOptions: DevDocsAIOptions['references'];
  onDidSelectReference?: () => void;
  debug?: boolean;
}

export function PromptView(props: PromptViewProps): ReactElement {
  const { activeView, onDidSelectReference, debug, projectKey } = props;

  // we are also merging defaults in the DevDocsAI component, but this makes sure
  // that standalone PromptView components also have defaults as expected.
  const promptOptions = useDefaults(
    { ...props.promptOptions },
    DEFAULT_DEVDOCSAI_OPTIONS.prompt,
  );

  const feedbackOptions = useDefaults(
    { ...props.feedbackOptions },
    DEFAULT_DEVDOCSAI_OPTIONS.feedback,
  );

  const referencesOptions = useDefaults(
    { ...props.referencesOptions },
    DEFAULT_DEVDOCSAI_OPTIONS.references,
  );

  const {
    abort,
    answer,
    error,
    submitPrompt,
    setPrompt,
    prompt,
    promptId,
    state,
    references,
    submitFeedback,
    abortFeedbackRequest,
  } = usePrompt({
    projectKey,
    promptOptions,
    feedbackOptions,
    debug,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (activeView && activeView !== 'prompt') abort();
    return () => abort();
  }, [activeView, abort]);

  useEffect(() => {
    // Bring form input in focus when activeView changes.
    inputRef.current?.focus();
  }, [activeView]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setPrompt(event.target.value);
    },
    [setPrompt],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      submitPrompt();
    },
    [submitPrompt],
  );

  return (
    <div className="DevDocsAIPromptView">
      <BaseDevDocsAI.Form className="DevDocsAIForm" onSubmit={handleSubmit}>
        <div className="DevDocsAIPromptWrapper">
          <BaseDevDocsAI.Prompt
            ref={inputRef}
            className="DevDocsAIPrompt"
            name="devdocsai-prompt"
            onChange={handleChange}
            value={prompt}
            type="text"
            placeholder={
              promptOptions?.placeholder ??
              DEFAULT_DEVDOCSAI_OPTIONS.prompt!.placeholder!
            }
            labelClassName="DevDocsAIPromptLabel"
            label={
              <AccessibleIcon.Root
                label={
                  promptOptions?.label ??
                  DEFAULT_DEVDOCSAI_OPTIONS.prompt!.label!
                }
              >
                <SparklesIcon className="DevDocsAISearchIcon" />
              </AccessibleIcon.Root>
            }
          />
        </div>

        {error && (
          <BaseDevDocsAI.ErrorMessage className="DevDocsAIErrorMessage">
            {promptOptions.errorText}
          </BaseDevDocsAI.ErrorMessage>
        )}
      </BaseDevDocsAI.Form>

      <AnswerContainer
        abortFeedbackRequest={abortFeedbackRequest}
        answer={answer}
        feedbackOptions={feedbackOptions}
        onDidSelectReference={onDidSelectReference}
        promptId={promptId}
        references={references}
        referencesOptions={referencesOptions}
        defaultView={promptOptions.defaultView}
        state={state}
        submitFeedback={(feedback, promptId) => {
          submitFeedback(feedback, promptId);
          feedbackOptions.onFeedbackSubmit?.(
            feedback,
            [
              {
                answer,
                id: promptId!,
                prompt,
                promptId,
                references,
                state,
              },
            ],
            promptId,
          );
        }}
        onDidSelectDefaultViewPrompt={(prompt: string) => {
          setPrompt(prompt);
          submitPrompt(prompt);
        }}
      />
    </div>
  );
}

interface AnswerContainerProps {
  answer: string;
  feedbackOptions?: DevDocsAIOptions['feedback'];
  onDidSelectReference?: () => void;
  references: FileSectionReference[];
  referencesOptions: DevDocsAIOptions['references'];
  defaultView: NonNullable<DevDocsAIOptions['prompt']>['defaultView'];
  state: PromptLoadingState;
  submitFeedback: UseFeedbackResult['submitFeedback'];
  abortFeedbackRequest: UseFeedbackResult['abort'];
  promptId?: string;
  onDidSelectDefaultViewPrompt?: (prompt: string) => void;
}

function AnswerContainer(props: AnswerContainerProps): ReactElement {
  const {
    abortFeedbackRequest,
    answer,
    feedbackOptions,
    onDidSelectReference,
    promptId,
    references,
    referencesOptions,
    state,
    submitFeedback,
    defaultView,
    onDidSelectDefaultViewPrompt,
  } = props;

  if ((!answer || answer.length === 0) && state === 'indeterminate') {
    return (
      <DefaultView
        message={defaultView?.message}
        prompts={defaultView?.prompts}
        promptsHeading={defaultView?.promptsHeading}
        onDidSelectPrompt={(prompt: string) =>
          onDidSelectDefaultViewPrompt?.(prompt)
        }
      />
    );
  }

  return (
    <div className="DevDocsAIAnswerContainer" data-loading-state={state}>
      <BaseDevDocsAI.AutoScroller
        className="DevDocsAIAutoScroller"
        scrollTrigger={answer}
      >
        <Answer answer={answer} state={state} />
        {feedbackOptions?.enabled && state === 'done' && (
          <Feedback
            variant="text"
            className="DevDocsAIPromptFeedback"
            submitFeedback={submitFeedback}
            abortFeedbackRequest={abortFeedbackRequest}
            promptId={promptId}
            heading={feedbackOptions.heading}
          />
        )}
      </BaseDevDocsAI.AutoScroller>

      <References
        getHref={referencesOptions?.getHref}
        getLabel={referencesOptions?.getLabel}
        loadingText={referencesOptions?.loadingText}
        heading={referencesOptions?.heading}
        onDidSelectReference={onDidSelectReference}
        references={references}
        state={state}
        transformReferenceId={referencesOptions?.transformReferenceId}
      />
    </div>
  );
}
