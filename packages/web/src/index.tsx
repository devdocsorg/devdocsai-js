import {
  DevDocsAI,
  openDevDocsAI,
  closeDevDocsAI,
  type DevDocsAIOptions,
  type ChatViewProps,
  ChatView,
} from '@devdocsai/react';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';

function getHTMLElement(
  value: HTMLElement | string,
  environment: typeof window = window,
): HTMLElement {
  if (typeof value !== 'string') return value;
  const el = environment.document.querySelector<HTMLElement>(value);
  if (!el) throw new Error(`Could not find element with selector "${value}"`);
  return el;
}

let root: Root;

/**
 * Render a DevDocs.ai dialog.
 *
 * @param projectKey Your DevDocs.ai project key
 * @param container The element or selector to render DevDocs.ai into
 * @param options Options for customizing DevDocs.ai
 */
function devdocsai(
  projectKey: string,
  container: HTMLElement | string,
  options?: DevDocsAIOptions,
): void {
  if (!root) root = createRoot(getHTMLElement(container));
  root.render(<DevDocsAI projectKey={projectKey} {...options} />);
}

let chatRoot: Root;

type ChatOptions = Omit<ChatViewProps, 'activeView' | 'projectKey'>;

/**
 * Render the DevDocs.ai chat view.
 * Useful when you want to incorporate the chat view into your own UI.
 * @param projectKey Your DevDocsAI project key
 * @param container The element or selector to render the chat view into
 * @param options Options for customizing the chat view
 */
function devdocsaiChat(
  projectKey: string,
  container: HTMLElement | string,
  options?: ChatOptions,
): void {
  if (!chatRoot) chatRoot = createRoot(getHTMLElement(container));
  chatRoot.render(
    <ChatView
      projectKey={projectKey}
      {...options}
      chatOptions={{ ...options?.chatOptions, enabled: true }}
    />,
  );
}

export {
  devdocsai,
  openDevDocsAI,
  closeDevDocsAI,
  type DevDocsAIOptions,
  devdocsaiChat,
};
