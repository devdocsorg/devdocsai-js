import React from 'react';

import { ChatViewForm } from './ChatViewForm.js';
import { ConversationSidebar } from './ConversationSidebar.js';
import { Messages } from './Messages.js';
import { ChatProvider } from './store.js';
import { DEFAULT_DEVDOCSAI_OPTIONS } from '../constants.js';
import type { DevDocsAIOptions } from '../types.js';
import { useDefaults } from '../useDefaults.js';
import type { View } from '../useViews.js';

export interface ChatViewProps {
  activeView?: View;
  chatOptions?: DevDocsAIOptions['chat'];
  debug?: boolean;
  feedbackOptions?: DevDocsAIOptions['feedback'];
  onDidSelectReference?: () => void;
  projectKey: string;
  referencesOptions?: DevDocsAIOptions['references'];
}

export function ChatView(props: ChatViewProps): JSX.Element {
  const { activeView, debug, projectKey } = props;

  if (!projectKey) {
    throw new Error(
      `DevDocs.ai: a project key is required. Make sure to pass your DevDocs.ai project key to <ChatView />.`,
    );
  }

  // we are also merging defaults in the DevDocs.ai component, but this makes sure
  // that standalone ChatView components also have defaults as expected.
  const chatOptions = useDefaults(
    { ...props.chatOptions },
    DEFAULT_DEVDOCSAI_OPTIONS.chat,
  );

  const feedbackOptions = useDefaults(
    { ...props.feedbackOptions },
    DEFAULT_DEVDOCSAI_OPTIONS.feedback,
  );

  const referencesOptions = useDefaults(
    { ...props.referencesOptions },
    DEFAULT_DEVDOCSAI_OPTIONS.references,
  );

  return (
    <ChatProvider
      chatOptions={chatOptions}
      debug={debug}
      projectKey={projectKey}
    >
      <div className="DevDocsAIChatView">
        <ConversationSidebar />
        <div className="DevDocsAIChatViewChat">
          <Messages
            projectKey={projectKey}
            feedbackOptions={feedbackOptions}
            referencesOptions={referencesOptions}
            defaultView={chatOptions.defaultView}
          />
          <ChatViewForm activeView={activeView} chatOptions={chatOptions} />
        </div>
      </div>
    </ChatProvider>
  );
}
