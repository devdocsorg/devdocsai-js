import React from 'react';

import { selectProjectConversations, useChatStore } from './store.js';
import { PlusIcon } from '../icons.js';
import { markdownToString } from '../utils.js';

export function ConversationSidebar(): JSX.Element {
  const selectedConversationId = useChatStore((state) => state.conversationId);
  const conversations = useChatStore(selectProjectConversations);
  const selectConversation = useChatStore((state) => state.selectConversation);

  return (
    <aside className="DevDocsAIChatViewSidebar">
      <p className="DevDocsAIChatViewSidebarTitle">
        <strong>Chats</strong>
      </p>
      <ul className="DevDocsAIChatConversationList">
        <li className="DevDocsAIChatConversationListItem">
          <button onClick={() => selectConversation(undefined)}>
            <p>
              <span className="DevDocsAINewChatOption">
                <PlusIcon className="DevDocsAINewChatIcon" /> New chat
              </span>
            </p>
          </button>
        </li>
        {conversations.map(([conversationId, { messages }], index) => (
          <li
            key={`${conversationId}-${index}`}
            data-selected={selectedConversationId === conversationId}
            className="DevDocsAIChatConversationListItem"
          >
            <button onClick={() => selectConversation(conversationId)}>
              <p>
                <strong>{messages[0]?.prompt ?? 'Unknown conversation'}</strong>
              </p>
              <p>{markdownToString(messages[0]?.answer, 70)}</p>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
