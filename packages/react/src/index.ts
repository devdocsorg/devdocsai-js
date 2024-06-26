export {
  Answer,
  AutoScroller,
  Close,
  Content,
  PlainContent,
  Description,
  DialogTrigger,
  Form,
  Overlay,
  Portal,
  Prompt,
  References,
  Root,
  SearchResult,
  SearchResults,
  Title,
  type AnswerProps,
  type AutoScrollerProps,
  type CloseProps,
  type ContentProps,
  type DescriptionProps,
  type DialogTriggerProps,
  type FormProps,
  type OverlayProps,
  type PortalProps,
  type PromptProps,
  type ReferencesProps,
  type RootProps,
  type SearchResultProps,
  type SearchResultsProps,
  type TitleProps,
} from './primitives/headless.js';

export {
  useFeedback,
  type UseFeedbackOptions,
  type UseFeedbackResult,
} from './feedback/useFeedback.js';

export {
  usePrompt,
  type UsePromptOptions,
  type UsePromptResult,
} from './prompt/usePrompt.js';

export {
  useSearch,
  type SearchLoadingState,
  type UseSearchOptions,
  type UseSearchResult,
} from './search/useSearch.js';

export {
  DevDocsAI,
  type DevDocsAIProps,
  openDevDocsAI,
  closeDevDocsAI,
} from './DevDocsAI.js';

export { ChatView, type ChatViewProps } from './chat/ChatView.js';
export {
  ChatProvider,
  useChatStore,
  createChatStore,
  type CreateChatOptions,
  type ChatViewMessage,
  type ChatLoadingState,
} from './chat/store.js';
export { PromptView, type PromptViewProps } from './prompt/PromptView.js';
export { SearchView, type SearchViewProps } from './search/SearchView.js';

export { DEFAULT_DEVDOCSAI_OPTIONS } from './constants.js';

export * from './types.js';
