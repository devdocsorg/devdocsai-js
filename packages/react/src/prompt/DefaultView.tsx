import React, { type JSXElementConstructor, type ReactElement } from 'react';

import type { DefaultViewProps } from '../types.js';

export function DefaultMessage(props: {
  message: string | JSXElementConstructor<unknown>;
}): ReactElement {
  if (typeof props.message === 'string') {
    return <p className="DevDocsAIDefaultViewMessage">{props.message}</p>;
  } else {
    const Message = props.message;
    return <Message />;
  }
}

export function DefaultPrompts(props: {
  promptsHeading?: string;
  prompts: string[];
  onDidSelectPrompt: (prompt: string) => void;
}): ReactElement {
  if (props.prompts.length === 0) {
    return <></>;
  }
  return (
    <div className="DevDocsAIDefaultViewMessagePromptsContainer">
      {props.promptsHeading && <h3>{props.promptsHeading}</h3>}
      {props.prompts.map((prompt, i) => {
        return (
          <a
            key={`devdocsai-default-prompt-${i}`}
            onClick={() => {
              props.onDidSelectPrompt(prompt);
            }}
          >
            {prompt}
          </a>
        );
      })}
    </div>
  );
}

export function DefaultView(
  props: DefaultViewProps & { onDidSelectPrompt: (prompt: string) => void },
): ReactElement {
  return (
    <div className="DevDocsAIDefaultView">
      {props.message && <DefaultMessage message={props.message} />}
      {props.prompts && (
        <DefaultPrompts
          prompts={props.prompts}
          promptsHeading={props.promptsHeading}
          onDidSelectPrompt={props.onDidSelectPrompt}
        />
      )}
    </div>
  );
}
