# `@devdocsai/web`

A prebuilt version of the DevDocs.ai dialog, based on `@devdocsai/react`, built
with Preact for bundle-size savings. Viable for use from vanilla JavaScript or
any framework.

<br />
<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/devdocsai">
    <img alt="" src="https://badgen.net/npm/v/devdocsai">
  </a>
  <a aria-label="License" href="https://github.com/devdocsorg/devdocsai/blob/main/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/devdocsai">
  </a>
</p>

## Installation

Install the package from NPM:

```sh
npm add @devdocsai/web @devdocsai/css
```

## Usage

Include the CSS on your page, via a link tag or by importing it in your
JavaScript:

```html
<!-- load from a CDN: -->
<link rel="stylesheet" href="https://esm.sh/@devdocsai/css@0.5.1?css" />
```

```js
import '@devdocsai/css';
```

Call the `devdocsai` function with your project key:

```js
import { devdocsai } from '@devdocsai/web';

const devdocsaiEl = document.querySelector('#devdocsai');

devdocsai('YOUR-PROJECT-KEY', devdocsaiEl, {
  references: {
    getHref: (reference) => reference.file.path.replace(/\.[^.]+$/, '');
    getLabel: (reference) => {
      return reference.meta?.leadHeading?.value || reference.file?.title;
    }
  },
});
```

where `YOUR-PROJECT-KEY` can be obtained in your project settings on
[devdocs.ai](https://devdocs.ai/).

Options are optional and allow you to configure the texts and links used in the
component to some extent. You will most likely want to pass `references.getHref`
and `reference.getLabel` to transform your prompt references into links to your
corresponding documentation, and `search.getHref` to transform search result
paths into links to your documentation.

```ts
import type {
  SubmitFeedbackOptions,
  SubmitPromptOptions,
  SubmitSearchQueryOptions,
} from '@devdocsai/core';

interface DevDocsAIOptions {
  /**
   * Display format.
   * @default "dialog"
   **/
  display?: 'plain' | 'dialog';
  /**
   * Enable and configure search functionality.
   * @default "search"
   * */
  defaultView?: 'search' | 'chat' | 'prompt';
  close?: {
    /**
     * `aria-label` for the close modal button
     * @default "Close DevDocs.ai"
     **/
    label?: string;
    /**
     * Show the close button
     * @default true
     **/
    visible?: boolean;
  };
  description?: {
    /**
     * Visually hide the description
     * @default true
     **/
    hide?: boolean;
    /**
     * Description text
     **/
    text?: string;
  };
  feedback?: SubmitFeedbackOptions & {
    /**
     * Enable feedback functionality, shows a thumbs up/down button after a
     * prompt was submitted.
     * @default false
     * */
    enabled?: boolean;
    /**
     * Heading above the form
     * @default "Was this response helpful?"
     **/
    heading?: string;
    /**
     * Called when feedback is submitted
     * @default undefined
     */
    onFeedbackSubmit?: (
      feedback: PromptFeedback,
      messages: ChatViewMessage[],
      promptId?: string,
    ) => void;
  };
  /**
   * Enable and configure chat functionality. Allows users to have a conversation with an assistant.
   * Enabling chat functionality will disable prompt functionality.
   */
  chat?: SubmitChatOptions & {
    /**
     * Show a chat-like prompt input allowing for conversation-style interaction
     * rather than single question prompts.
     * @default false
     **/
    enabled?: boolean;
    /**
     * Label for the chat input
     * @default "Ask AI"
     **/
    label?: string;
    /**
     * Label for the tab bar
     * @default "Ask AI"
     **/
    tabLabel?: string;
    /**
     * Placeholder for the chat input
     * @default "Ask AI…"
     **/
    placeholder?: string;
    /**
     * Show sender info, like avatar
     * @default true
     **/
    showSender?: boolean;
    /**
     * Enable chat history features
     * - enable saving chat history to local storage
     * - show chat history UI
     * - resume chat conversations
     * @default true
     */
    history?: boolean;
    /**
     * Default (empty) view
     */
    defaultView?:  {
      message?: string | ReactElement;
      promptsHeading?: string;
      prompts?: string[];
    };
  };
  /**
   * Enable and configure prompt functionality. Allows users to ask a single question to an assistant
   */
  prompt?: SubmitChatOptions & {
    /**
     * Label for the prompt input
     * @default "Ask AI"
     **/
    label?: string;
    /**
     * Label for the tab bar
     * @default "Ask AI"
     **/
    tabLabel?: string;
    /**
     * Placeholder for the prompt input
     * @default "Ask AI…"
     **/
    placeholder?: string;
    /**
     * Default (empty) view
     */
    defaultView?:  {
      message?: string | ReactElement;
      promptsHeading?: string;
      prompts?: string[];
    };
  };
  references?: {
    /**
     * Display mode for the references. References can either be
     * displayed after the response or not displayed at all.
     * @default 'end'
     * */
    display?: 'none' | 'end';
    /** Callback to transform a reference into an href */
    getHref?: (reference: FileSectionReference) => string | undefined;
    /** Callback to transform a reference into a label */
    getLabel?: (reference: FileSectionReference) => string | undefined;
    /**
     * Heading above the references
     * @default "Answer generated from the following sources:"
     **/
    heading?: string;
    /** Loading text, default: `Fetching relevant pages…` */
    loadingText?: string;
    /**
     * Callback to transform a reference id into an href and text
     * @deprecated Use `getHref` and `getLabel` instead
     **/
    transformReferenceId?: (referenceId: string) => {
      href: string;
      text: string;
    };
  };
  /**
   * Enable and configure search functionality
   */
  search?: SubmitSearchQueryOptions & {
    /**
     * Enable search
     * @default false
     **/
    enabled?: boolean;
    /** Callback to transform a search result into an href */
    getHref?: (
      reference: SearchResult | AlgoliaDocSearchHit,
    ) => string | undefined;
    /** Callback to transform a search result into a heading */
    getHeading?: (
      reference: SearchResult | AlgoliaDocSearchHit,
      query: string,
    ) => string | undefined;
    /** Callback to transform a search result into a title */
    getTitle?: (
      reference: SearchResult | AlgoliaDocSearchHit,
      query: string,
    ) => string | undefined;
    /** Callback to transform a search result into a subtitle */
    getSubtitle?: (
      reference: SearchResult | AlgoliaDocSearchHit,
      query: string,
    ) => string | undefined;
    /**
     * Label for the search input, not shown but used for `aria-label`
     * @default "Search docs…"
     **/
    label?: string;
    /**
     * Label for the tab bar
     * @default "Search"
     **/
    tabLabel?: string;
    /**
     * Placeholder for the search input
     * @default "Search docs…"
     */
    placeholder?: string;
  };
  trigger?: {
    /**
     * `aria-label` for the open button
     * @default "Ask AI"
     **/
    label?: string;
    /**
     * Label the open button
     **/
    buttonLabel?: string;
    /**
     * Placeholder text for non-floating element
     * @default "Ask AI"
     **/
    placeholder?: string;
    /**
     * Should the trigger button be displayed as a floating button at the bottom right of the page?
     * Setting this to false will display a trigger button in the element passed
     * to the `devdocsai` function.
     */
    floating?: boolean;
    /**
     * Do you use a custom element as the dialog trigger?
     */
    customElement?: boolean;
    /**
     * Custom image icon source for the open button
     */
    iconSrc?: string;
  };
  title?: {
    /**
     * Visually hide the title
     * @default true
     **/
    hide?: boolean;
    /**
     * Text for the title
     * @default "Ask AI"
     **/
    text?: string;
  };
  /**
   * Show DevDocs.ai branding
   * @default true
   **/
  showBranding?: boolean;
  /**
   * Display debug info
   * @default false
   **/
  debug?: boolean;
}
```

Styles are easily overridable for customization via targeting classes.
Additionally, see the [styling section](https://devdocs.ai/docs#styling) in
our documentation for a full list of variables.

## Usage via `<script>` tag

Besides initializing the DevDocs.ai component yourselves from JavaScript, you
can load the script from a CDN. You can attach the options for the DevDocs.ai
component to the window prior to loading our script:

```html
<link rel="stylesheet" href="https://esm.sh/@devdocsai/css@0.13.x?css" />
<script>
  window.devdocsai = {
    projectKey: `YOUR-PROJECT-KEY`,
    container: `#devdocsai`,
    options: {
      references: {
        getHref: (reference) => reference.file?.path?.replace(/\.[^.]+$/, ''),
        getLabel: (reference) => {
          return reference.meta?.leadHeading?.value || reference.file?.title;
        },
      },
    },
  };
</script>
<script type="module" src="https://esm.sh/@devdocsai/web@0.16.x/init"></script>

<div id="devdocsai"></div>
```

## API

### `devdocsai(projectKey, container, options?)`

Render a DevDocs.ai dialog button.

#### Arguments

- `projectKey` (`string`): Your DevDocs.ai project key.
- `container` (`HTMLElement | string`): The element or selector to render
  DevDocs.ai into.
- `options` (`object`): Options for customizing DevDocs.ai, see above.

When rendering the DevDocs.ai component, it will render a search input-like
button by default. You have two other options:

- set `trigger.floating = true` to render a floating button
- set `trigger.customElement = true`, then
  `import { openDevDocsAI } from '@devdocsai/react'` and call
  `openDevDocsAI()` from your code. This gives you the flexibility to render
  your own trigger element and attach whatever event handlers you would like
  and/or open the DevDocs.ai dialog programmatically.

  ### `devdocsaiOpen()`

  Open the DevDocs.ai dialog programmatically.

  ### `devdocsaiClose()`

  Close the DevDocs.ai dialog programmatically.

  ### `devdocsaiChat(projectKey, container, options?)`

  Render the DevDocs.ai chat view standalone, outside of a dialog.

  - `projectKey` (`string`): Your DevDocs.ai project key.
  - `container` (`HTMLElement | string`): The element or selector to render
    DevDocs.ai into.
  - `options` (`object`): Options for customizing DevDocs.ai, see above.
  - `options.chatOptions` (`DevDocsAIOptions.chat`): Enable and configure chat
    functionality. Allows users to have a conversation with an assistant.
    Enabling chat functionality will disable prompt functionality. See above for options.
  - `options.debug` (`boolean`): Display debug info
  - `options.feedbackOptions` (`DevDocsAIOptions.feedback`): Enable feedback
    functionality, shows a thumbs up/down button after a prompt was submitted. See above for options.
  - `options.referencesOptions` (`DevDocsAIOptions.references`): Enable and
    configure references functionality. See above for options.

## Documentation

The full documentation for `@devdocsai/web` can be found on the
[DevDocs.ai docs](https://devdocs.ai/docs#javascript).

## Authors

This library is created by the team behind [DevDocs.ai](https://devdocs.ai)
([DevDocs.work](https://devdocs.work)). [DevDocs.work](https://devdocs.work) also provides technical writing, software development, custom AI, design, and other consulting services.

## License

[MIT](./LICENSE) © [DevDocs.ai](https://devdocs.ai)
