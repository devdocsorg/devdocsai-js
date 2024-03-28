import * as AccessibleIcon from '@radix-ui/react-accessible-icon';
import * as Tabs from '@radix-ui/react-tabs';
import { clsx } from 'clsx';
import Emittery from 'emittery';
import React, { useEffect, useState, type ReactElement } from 'react';

import { ChatView } from './chat/ChatView.js';
import { DEFAULT_DEVDOCSAI_OPTIONS } from './constants.js';
import { ChatIcon, SparklesIcon } from './icons.js';
import * as BaseDevDocsAI from './primitives/headless.js';
import { PromptView } from './prompt/PromptView.js';
import { SearchBoxTrigger } from './search/SearchBoxTrigger.js';
import { SearchView } from './search/SearchView.js';
import { type DevDocsAIOptions } from './types.js';
import { useDefaults } from './useDefaults.js';
import { useViews, type View } from './useViews.js';

type DevDocsAIProps = DevDocsAIOptions &
  Omit<
    BaseDevDocsAI.RootProps,
    | 'activeView'
    | 'children'
    | 'open'
    | 'onOpenChange'
    | 'promptOptions'
    | 'searchOptions'
  > & {
    projectKey: string;
    onDidRequestOpenChange?: (open: boolean) => void;
  };

const emitter = new Emittery<{ open: undefined; close: undefined }>();

/**
 * Open DevDocs.ai programmatically. Useful for building a custom trigger
 * or opening the DevDocs.ai dialog in response to other user actions.
 */
function openDevDocsAI(): void {
  emitter.emit('open');
}

/**
 * Close DevDocs.ai programmatically. Useful for building a custom trigger
 * or closing the DevDocs.ai dialog in response to other user actions.
 */
function closeDevDocsAI(): void {
  emitter.emit('close');
}

function DevDocsAI(props: DevDocsAIProps): JSX.Element {
  const { projectKey, onDidRequestOpenChange, ...dialogProps } = props;

  if (!projectKey) {
    throw new Error(
      'DevDocs.ai: a project key is required. Make sure to pass the projectKey prop to <DevDocsAI />.',
    );
  }

  const {
    display,
    defaultView,
    close,
    description,
    feedback,
    chat,
    prompt,
    references,
    search,
    trigger,
    title,
    branding,
    debug,
  }: DevDocsAIOptions = useDefaults(
    {
      display: props.display,
      defaultView: props.defaultView,
      close: props.close,
      description: props.description,
      feedback: props.feedback,
      chat: props.chat,
      prompt: props.prompt,
      references: props.references,
      search: props.search,
      trigger: props.trigger,
      title: props.title,
      branding: props.branding || { show: props.showBranding },
      debug: props.debug,
    },
    DEFAULT_DEVDOCSAI_OPTIONS,
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = (): void => {
      onDidRequestOpenChange?.(true);
      if (display === 'dialog') {
        setOpen(true);
      }
    };
    const onClose = (): void => {
      onDidRequestOpenChange?.(false);
      if (display === 'dialog') {
        setOpen(false);
      }
    };

    emitter.on('open', onOpen);
    emitter.on('close', onClose);

    return () => {
      emitter.off('open', onOpen);
      emitter.off('close', onClose);
    };
  }, [trigger?.customElement, display, onDidRequestOpenChange]);

  return (
    <BaseDevDocsAI.Root
      display={display}
      open={open}
      onOpenChange={(open) => {
        onDidRequestOpenChange?.(open);
        setOpen(open);
      }}
      {...dialogProps}
    >
      {!trigger?.customElement && display === 'dialog' && (
        <>
          {trigger?.floating !== false ? (
            <BaseDevDocsAI.DialogTrigger className="DevDocsAIFloatingTrigger">
              {trigger.buttonLabel && <span>{trigger.buttonLabel}</span>}
              <AccessibleIcon.Root label={trigger.label!}>
                {trigger.iconSrc ? (
                  <img
                    className="DevDocsAIChatIcon"
                    width="24"
                    height="24"
                    src={trigger.iconSrc}
                  />
                ) : (
                  <ChatIcon
                    className="DevDocsAIChatIcon"
                    width="24"
                    height="24"
                  />
                )}
              </AccessibleIcon.Root>
            </BaseDevDocsAI.DialogTrigger>
          ) : (
            <SearchBoxTrigger trigger={trigger} setOpen={setOpen} open={open} />
          )}
        </>
      )}

      {display === 'dialog' && (
        <>
          <BaseDevDocsAI.Portal>
            <BaseDevDocsAI.Overlay className="DevDocsAIOverlay" />
            <BaseDevDocsAI.Content
              className="DevDocsAIContentDialog"
              branding={branding}
              showAlgolia={
                search?.enabled && search.provider?.name === 'algolia'
              }
            >
              <BaseDevDocsAI.Title hide={title.hide}>
                {title.text}
              </BaseDevDocsAI.Title>

              {description.text && (
                <BaseDevDocsAI.Description hide={description.hide}>
                  {description.text}
                </BaseDevDocsAI.Description>
              )}

              <DevDocsAIContent
                close={close}
                chat={chat}
                debug={debug}
                defaultView={defaultView}
                feedback={feedback}
                projectKey={projectKey}
                prompt={prompt}
                references={references}
                search={search}
              />
            </BaseDevDocsAI.Content>
          </BaseDevDocsAI.Portal>
        </>
      )}

      {display === 'plain' && (
        <BaseDevDocsAI.PlainContent
          className="DevDocsAIContentPlain"
          branding={branding}
          showAlgolia={search?.enabled && search.provider?.name === 'algolia'}
        >
          <DevDocsAIContent
            chat={chat}
            defaultView={defaultView}
            feedback={feedback}
            projectKey={projectKey}
            prompt={prompt}
            references={references}
            search={search}
          />
        </BaseDevDocsAI.PlainContent>
      )}
    </BaseDevDocsAI.Root>
  );
}

interface DevDocsAIContentProps {
  projectKey: string;
  chat?: DevDocsAIOptions['chat'];
  close?: DevDocsAIOptions['close'];
  debug?: boolean;
  defaultView?: DevDocsAIOptions['defaultView'];
  feedback?: DevDocsAIOptions['feedback'];
  prompt?: DevDocsAIOptions['prompt'];
  references?: DevDocsAIOptions['references'];
  search?: DevDocsAIOptions['search'];
}

function DevDocsAIContent(props: DevDocsAIContentProps): ReactElement {
  const {
    close,
    debug,
    defaultView,
    feedback,
    projectKey,
    chat,
    prompt,
    references,
    search,
  } = props;

  const { activeView, setActiveView } = useViews({ search, chat }, defaultView);

  if (!search?.enabled) {
    return (
      <div className="DevDocsAITabsContainer">
        {/* We still include a div to preserve the grid-template-rows rules */}
        <div></div>

        <div className="DevDocsAIViews">
          <div
            style={{
              position: 'absolute',
              inset: 0,
            }}
          >
            {chat?.enabled ? (
              <ChatView
                activeView={activeView}
                chatOptions={chat}
                debug={debug}
                feedbackOptions={feedback}
                onDidSelectReference={() => emitter.emit('close')}
                projectKey={projectKey}
                referencesOptions={references}
              />
            ) : (
              <PromptView
                activeView={activeView}
                debug={debug}
                feedbackOptions={feedback}
                onDidSelectReference={() => emitter.emit('close')}
                projectKey={projectKey}
                promptOptions={prompt}
                referencesOptions={references}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tabs.Root
      className="DevDocsAITabsContainer"
      value={activeView}
      onValueChange={(value) => setActiveView(value as View)}
    >
      <div style={{ position: 'relative' }}>
        <Tabs.List className="DevDocsAITabsList">
          <Tabs.Trigger
            value="search"
            aria-label={search.tabLabel}
            className="DevDocsAITab"
          >
            {search.tabLabel}
          </Tabs.Trigger>
          {!chat?.enabled && (
            <Tabs.Trigger
              value="prompt"
              className="DevDocsAITab"
              onClick={() => setActiveView('prompt')}
            >
              <SparklesIcon
                focusable={false}
                className={clsx('DevDocsAIBaseIcon', {
                  DevDocsAIPrimaryIcon: activeView === 'prompt',
                  DevDocsAIHighlightedIcon: activeView === 'search',
                })}
              />
              {prompt!.tabLabel}
            </Tabs.Trigger>
          )}
          {chat?.enabled && (
            <Tabs.Trigger
              value="chat"
              className="DevDocsAITab"
              onClick={() => setActiveView('chat')}
            >
              <SparklesIcon
                focusable={false}
                className={clsx('DevDocsAIBaseIcon', {
                  DevDocsAIPrimaryIcon: activeView === 'chat',
                  DevDocsAIHighlightedIcon: activeView === 'search',
                })}
              />
              {chat?.tabLabel}
            </Tabs.Trigger>
          )}
        </Tabs.List>

        {/* Add close button in the tab bar */}
        {close?.visible && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              justifyItems: 'center',
              alignItems: 'center',
              right: '0.5rem',
              top: '0rem',
              bottom: '0rem',
            }}
          >
            <BaseDevDocsAI.Close className="DevDocsAIClose">
              <AccessibleIcon.Root label={close!.label!}>
                <kbd>Esc</kbd>
              </AccessibleIcon.Root>
            </BaseDevDocsAI.Close>
          </div>
        )}
      </div>

      <div className="DevDocsAIViews">
        <Tabs.Content
          value="search"
          style={{
            position: 'absolute',
            inset: 0,
          }}
        >
          <SearchView
            activeView={activeView}
            projectKey={projectKey}
            searchOptions={search}
            onDidSelectResult={() => emitter.emit('close')}
            debug={debug}
          />
        </Tabs.Content>

        {chat?.enabled ? (
          <Tabs.Content
            value="chat"
            style={{
              position: 'absolute',
              inset: 0,
            }}
          >
            <ChatView
              activeView={activeView}
              chatOptions={chat}
              debug={debug}
              feedbackOptions={feedback}
              onDidSelectReference={() => emitter.emit('close')}
              projectKey={projectKey}
              referencesOptions={references}
            />
          </Tabs.Content>
        ) : (
          <Tabs.Content
            value="prompt"
            style={{
              position: 'absolute',
              inset: 0,
            }}
          >
            <PromptView
              activeView={activeView}
              debug={debug}
              feedbackOptions={feedback}
              onDidSelectReference={() => emitter.emit('close')}
              projectKey={projectKey}
              promptOptions={prompt}
              referencesOptions={references}
            />
          </Tabs.Content>
        )}
      </div>
    </Tabs.Root>
  );
}

export { DevDocsAI, openDevDocsAI, closeDevDocsAI, type DevDocsAIProps };
