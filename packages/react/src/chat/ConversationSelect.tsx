import React from 'react';

import { selectProjectConversations, useChatStore } from './store.js';
import { CounterClockwiseClockIcon, PlusIcon } from '../icons.js';
import { Select } from '../primitives/Select.js';

export function ConversationSelect(): JSX.Element {
  const conversations = useChatStore(selectProjectConversations);
  const selectConversation = useChatStore((state) => state.selectConversation);

  return (
    <Select
      className="DevDocsAIConversationSelect"
      label="Select previous conversation"
      toggle={
        <CounterClockwiseClockIcon
          aria-hidden
          focusable={false}
          className={'DevDocsAISearchIcon'}
        />
      }
      items={[
        ...conversations.map(([conversationId, { messages }]) => ({
          value: conversationId,
          label: messages[0].prompt,
        })),
        {
          value: 'new',
          label: 'Start new chat',
          children: (
            <span className="DevDocsAINewChatOption">
              <PlusIcon
                className="DevDocsAINewChatIcon"
                aria-hidden
                focusable={false}
              />{' '}
              New chat
            </span>
          ),
        },
      ]}
      itemToString={(item) => item?.label ?? ''}
      itemToChildren={(item) => {
        if ('children' in item!) return item.children;
        return item!.label;
      }}
      onSelectedItemChange={({ selectedItem }) => {
        selectConversation(
          selectedItem!.value === 'new' ? undefined : selectedItem!.value,
        );
      }}
    />
  );
}
