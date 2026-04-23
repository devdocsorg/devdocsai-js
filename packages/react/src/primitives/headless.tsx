import type { FileSectionReference } from '@devdocsai/core';
import { AccessibleIcon } from '@radix-ui/react-accessible-icon';
import * as Dialog from '@radix-ui/react-dialog';
import React, {
  forwardRef,
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
  memo,
  useCallback,
} from 'react';
import Markdown from 'react-markdown';
import { mergeRefs } from 'react-merge-refs';
import remarkGfm from 'remark-gfm';

import { ConditionalVisuallyHidden } from './ConditionalWrap.js';
import { Footer } from './footer.js';
import { CheckIcon, CopyIcon } from '../icons.js';
import type {
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
  SearchResultComponentProps,
} from '../types.js';

type RootProps = Dialog.DialogProps & { display?: 'plain' | 'dialog' };

/**
 * The DevDocs.ai context provider and dialog root.
 */
function Root(props: RootProps): ReactElement {
  const {
    children,
    display = 'dialog',
    defaultOpen,
    modal,
    onOpenChange,
    open,
  } = props;

  if (display === 'plain') {
    return <>{children}</>;
  }

  return (
    <DialogRootWithAbort
      defaultOpen={defaultOpen}
      modal={modal}
      onOpenChange={onOpenChange}
      open={open}
    >
      {children}
    </DialogRootWithAbort>
  );
}

function DialogRootWithAbort(props: Dialog.DialogProps): ReactElement {
  const { modal = true, ...rest } = props;
  return (
    <Dialog.Root {...rest} modal={modal}>
      {props.children}
    </Dialog.Root>
  );
}

type DialogTriggerProps = ComponentPropsWithRef<typeof Dialog.Trigger>;
/**
 * A button to open the DevDocs.ai dialog.
 */
const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  (props, ref) => {
    return <Dialog.Trigger ref={ref} {...props} />;
  },
);
DialogTrigger.displayName = 'DevDocsAI.DialogTrigger';

type PortalProps = ComponentPropsWithoutRef<typeof Dialog.Portal>;
/**
 * The DevDocs.ai dialog portal.
 */
function Portal(props: PortalProps): ReactElement {
  return <Dialog.Portal {...props} />;
}
Portal.displayName = 'DevDocsAI.Portal';

type OverlayProps = ComponentPropsWithRef<typeof Dialog.Overlay>;
/**
 * The DevDocs.ai dialog overlay.
 */
const Overlay = forwardRef<HTMLDivElement, OverlayProps>((props, ref) => {
  return <Dialog.Overlay ref={ref} {...props} />;
});
Overlay.displayName = 'DevDocsAI.Overlay';

type ContentProps = ComponentPropsWithRef<typeof Dialog.Content> & {
  /**
   * Show the DevDocs.ai footer.
   */
  branding?: { show?: boolean; type?: 'plain' | 'text' };
  /**
   * Show Algolia attribution in the footer.
   **/
  showAlgolia?: boolean;
};

/**
 * The DevDocs.ai dialog content.
 */
const Content = forwardRef<HTMLDivElement, ContentProps>(
  function Content(props, ref) {
    const {
      branding = { show: true, type: 'plain' },
      showAlgolia,
      ...rest
    } = props;

    return (
      <Dialog.Content {...rest} ref={ref}>
        {props.children}
        {branding.show && (
          <Footer brandingType={branding.type} showAlgolia={showAlgolia} />
        )}
      </Dialog.Content>
    );
  },
);
Content.displayName = 'DevDocsAI.Content';

type PlainContentProps = ComponentPropsWithRef<'div'> & {
  /**
   * Show the DevDocs.ai footer.
   */
  branding?: { show?: boolean; type?: 'plain' | 'text' };
  /**
   * Show Algolia attribution in the footer.
   **/
  showAlgolia?: boolean;
};

/**
 * The DevDocs.ai plain content.
 */
const PlainContent = forwardRef<HTMLDivElement, PlainContentProps>(
  function PlainContent(props, ref) {
    const {
      branding = { show: true, type: 'plain' },
      showAlgolia,
      ...rest
    } = props;

    return (
      <div {...rest} ref={ref}>
        {props.children}
        {branding.show && (
          <Footer brandingType={branding.type} showAlgolia={showAlgolia} />
        )}
      </div>
    );
  },
);
PlainContent.displayName = 'DevDocsAI.PlainContent';

type CloseProps = ComponentPropsWithRef<typeof Dialog.Close>;
/**
 * A button to close the DevDocs.ai dialog and abort an ongoing request.
 */
const Close = forwardRef<HTMLButtonElement, CloseProps>(
  function Close(props, ref) {
    return <Dialog.Close {...props} ref={ref} />;
  },
);
Close.displayName = 'DevDocsAI.Close';

type TitleProps = ComponentPropsWithRef<typeof Dialog.Title> & {
  hide?: boolean;
};
const Title = forwardRef<HTMLHeadingElement, TitleProps>((props, ref) => {
  const { hide, ...rest } = props;
  return (
    <ConditionalVisuallyHidden hide={hide} asChild>
      <Dialog.Title {...rest} ref={ref} />
    </ConditionalVisuallyHidden>
  );
});
Title.displayName = 'DevDocsAI.Title';

type DescriptionProps = ComponentPropsWithRef<typeof Dialog.Description> & {
  hide?: boolean;
};
/**
 * A visually hidden aria description.
 */
const Description = forwardRef<HTMLParagraphElement, DescriptionProps>(
  (props, ref) => {
    const { hide, ...rest } = props;
    return (
      <ConditionalVisuallyHidden hide={hide} asChild>
        <Dialog.Description {...rest} ref={ref} />
      </ConditionalVisuallyHidden>
    );
  },
);
Description.displayName = 'DevDocsAI.Description';

type FormProps = ComponentPropsWithRef<'form'>;
/**
 * A form which, when submitted, submits the current prompt.
 */
const Form = forwardRef<HTMLFormElement, FormProps>(function Form(props, ref) {
  return <form {...props} ref={ref} />;
});

type PromptProps = ComponentPropsWithRef<'input'> & {
  /** The label for the input. */
  label?: ReactNode;
  /** The class name of the label element. */
  labelClassName?: string;
};
/**
 * The DevDocs.ai input prompt. User input will update the prompt in the DevDocsAI context.
 */
const Prompt = forwardRef<HTMLInputElement, PromptProps>(
  function Prompt(props, ref) {
    const {
      autoCapitalize = 'none',
      autoComplete = 'off',
      autoCorrect = 'off',
      autoFocus = true,
      label,
      labelClassName,
      placeholder,
      spellCheck = false,
      type = 'search',
      name,
      ...rest
    } = props;

    return (
      <>
        <label htmlFor={name} className={labelClassName}>
          {label}
        </label>
        <input
          {...rest}
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          ref={ref}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          autoFocus={autoFocus}
          spellCheck={spellCheck}
        />
      </>
    );
  },
);
Prompt.displayName = 'DevDocsAI.Prompt';

interface UseCopyToClipboardProps {
  content: string;
}

function useCopyToClipboard({ content }: UseCopyToClipboardProps): {
  didCopy: boolean;
  handleClick: () => void;
} {
  const [didCopy, setDidCopy] = React.useState(false);

  const handleClick = (): void => {
    navigator.clipboard.writeText(content);
    setDidCopy(true);
    setTimeout(() => {
      setDidCopy(false);
    }, 2000);
  };

  return { handleClick, didCopy };
}

// TODO: find the right type definition for children. There is a mismatch
// between the type that react-markdown exposes, and what is actually
// serves.
interface CopyCodeButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any;
}

function CopyCodeButton(props: CopyCodeButtonProps): ReactElement {
  const { handleClick, didCopy } = useCopyToClipboard({
    content: props.children[0]?.props?.children?.[0] || '',
  });

  return (
    <button
      className="DevDocsAICopyButton"
      style={{ animationDelay: '100ms' }}
      onClick={handleClick}
    >
      <AccessibleIcon label="copy">
        {didCopy ? (
          <CheckIcon width={16} height={16} strokeWidth={2} />
        ) : (
          <CopyIcon width={16} height={16} strokeWidth={2} />
        )}
      </AccessibleIcon>
    </button>
  );
}
CopyCodeButton.displayName = 'DevDocsAI.CopyCodeButton';

type AnswerProps = Omit<
  ComponentPropsWithoutRef<typeof Markdown>,
  'children'
> & {
  answer: string;
};

/**
 * Render the markdown answer from the DevDocsAI API.
 */
function Answer(props: AnswerProps): ReactElement {
  const { answer, remarkPlugins = [remarkGfm], ...rest } = props;
  return (
    <Markdown
      {...rest}
      remarkPlugins={remarkPlugins}
      components={{
        pre: (props) => {
          const { children, className, ...rest } = props;
          return (
            <div style={{ position: 'relative' }}>
              <CopyCodeButton>{children}</CopyCodeButton>
              <pre {...rest} className={className}>
                {children}
              </pre>
            </div>
          );
        },
      }}
    >
      {answer ?? ''}
    </Markdown>
  );
}
Answer.displayName = 'DevDocsAI.Answer';

type AutoScrollerProps = ComponentPropsWithRef<'div'> & {
  /**
   * Whether or not to enable automatic scrolling.
   *
   * @default true
   */
  autoScroll?: boolean;

  /**
   * The behaviour to use for scrolling.
   *
   * @default 'smooth'
   */
  scrollBehavior?: ScrollBehavior;

  /**
   * The element scrolls when this prop changes, unless scroll
   * lock is enabled.
   * @default undefined
   * */
  scrollTrigger?: unknown;
  /**
   * The element scrolls when this prop changes, overriding
   * scroll lock.
   * @default number
   * */
  discreteScrollTrigger?: number;
};
/**
 * A component automatically that scrolls to the bottom.
 */
const AutoScroller = memo<AutoScrollerProps>(
  forwardRef<HTMLDivElement, AutoScrollerProps>((props, ref) => {
    const {
      // eslint-disable-next-line react/prop-types
      autoScroll = true,
      // eslint-disable-next-line react/prop-types
      scrollBehavior = 'smooth',
      // eslint-disable-next-line react/prop-types
      scrollTrigger,
      // eslint-disable-next-line react/prop-types
      discreteScrollTrigger,
      ...rest
    } = props;
    const localRef = useRef<HTMLDivElement>(null);
    const scrollLockOn = useRef<boolean>(false);
    const didScrollOnce = useRef<boolean>(false);

    const perhapsScroll = useCallback(() => {
      if (!localRef.current) return;
      if (!autoScroll) return;
      if (scrollLockOn.current) return;
      localRef.current.scrollTo({
        top: localRef.current.scrollHeight,
        behavior: didScrollOnce.current ? scrollBehavior : 'instant',
      });
      didScrollOnce.current = true;
    }, [autoScroll, scrollBehavior]);

    useEffect(() => {
      // When scrollTrigger changes, potentially trigger scroll.
      perhapsScroll();
    }, [perhapsScroll, scrollTrigger]);

    useEffect(() => {
      // When discreteScrollTrigger changes (typically when a new message
      // is appended to the list of messages), reset the scroll lock, so
      // it can scroll down to the currently loading message.
      scrollLockOn.current = false;
      perhapsScroll();
    }, [discreteScrollTrigger, perhapsScroll]);

    const handleScroll = (): void => {
      if (!localRef.current) {
        return;
      }

      const element = localRef.current;

      // Check if user has scrolled away from the bottom. Note that the
      // autoscroll may leave a pixel of space, so we give it a 10 pixel
      // buffer.
      const relativeScrollHeight = element.scrollHeight - element.scrollTop;
      if (Math.abs(relativeScrollHeight - element.clientHeight) > 10) {
        scrollLockOn.current = true;
      } else {
        scrollLockOn.current = false;
      }
    };

    return (
      <div ref={mergeRefs([ref, localRef])} {...rest} onScroll={handleScroll} />
    );
  }),
);
AutoScroller.displayName = 'DevDocsAI.AutoScroller';

interface ReferencesProps<
  TRoot extends ElementType,
  TReference extends ElementType<{
    reference: FileSectionReference;
    index: number;
  }>,
> {
  /**
   * The wrapper component to render.
   * @default 'ul'
   */
  RootComponent?: TRoot;

  /**
   * The component to render for each reference.
   * @default 'li'
   */
  ReferenceComponent?: TReference;
  references: FileSectionReference[];
}

/**
 * Render the references that DevDocs.ai returns.
 */
const References = function References<
  TRoot extends ElementType,
  TReference extends ElementType<{
    reference: FileSectionReference;
    index: number;
  }>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  P extends ReferencesProps<TRoot, TReference> = { references: [] },
>(props: P, ref: PolymorphicRef<TRoot>): ReactElement {
  const {
    RootComponent = 'ul',
    ReferenceComponent = 'li',
    references = [],
  } = props;

  return (
    <RootComponent ref={ref}>
      {references.map((reference, index) => {
        return (
          <ReferenceComponent
            key={`${reference.file.path}-${index}`}
            reference={reference}
            index={index}
          />
        );
      })}
    </RootComponent>
  );
};
/**
 * Render the references that DevDocs.ai returned.
 */
const ForwardedReferences = forwardRef(References);
ForwardedReferences.displayName = 'DevDocsAI.References';

type SearchResultsProps = PolymorphicComponentPropWithRef<
  'ul',
  {
    label?: string;
    SearchResultComponent?: ElementType<
      SearchResultComponentProps & { index?: number }
    >;
    searchResults: SearchResultComponentProps[];
  }
>;

const SearchResults = forwardRef<HTMLUListElement, SearchResultsProps>(
  (props, ref) => {
    const {
      as: Component = 'ul',
      label = 'Search results',
      SearchResultComponent = SearchResult,
      searchResults,
      ...rest
    } = props;

    return (
      <Component
        {...rest}
        ref={ref}
        role="listbox"
        id="devdocsai-search-results"
        tabIndex={0}
        aria-label={label}
      >
        {searchResults.map((result, index) => {
          const id = `devdocsai-result-${index}`;
          return (
            <SearchResultComponent
              id={id}
              index={index}
              key={id}
              role="option"
              {...result}
            />
          );
        })}
      </Component>
    );
  },
);
SearchResults.displayName = 'DevDocsAI.SearchResults';

type SearchResultProps = PolymorphicComponentPropWithRef<
  'li',
  SearchResultComponentProps & {
    onMouseMove?: () => void;
    onClick?: () => void;
  }
>;

const SearchResult = forwardRef<HTMLLIElement, SearchResultProps>(
  (props, ref) => {
    const { title, href, ...rest } = props;
    return (
      <li ref={ref} {...rest}>
        <a href={href}>{title}</a>
      </li>
    );
  },
);
SearchResult.displayName = 'DevDocsAI.SearchResult';

interface ErrorMessageProps {
  className?: string;
  children: ReactNode;
}

function ErrorMessage(props: ErrorMessageProps): ReactElement {
  const { className, children } = props;
  return (
    <div className={className}>
      <p>{children}</p>
    </div>
  );
}
ErrorMessage.displayName = 'DevDocsAI.ErrorMessage';

export {
  Answer,
  AutoScroller,
  Close,
  Content,
  Description,
  DialogTrigger,
  ErrorMessage,
  Form,
  Overlay,
  PlainContent,
  Portal,
  Prompt,
  ForwardedReferences as References,
  Root,
  SearchResult,
  SearchResults,
  Title,
  useCopyToClipboard,
  CopyCodeButton,
  type AnswerProps,
  type AutoScrollerProps,
  type CloseProps,
  type ContentProps,
  type DescriptionProps,
  type DialogTriggerProps,
  type ErrorMessageProps,
  type FormProps,
  type OverlayProps,
  type PortalProps,
  type PromptProps,
  type ReferencesProps,
  type RootProps,
  type SearchResultProps,
  type SearchResultsProps,
  type TitleProps,
};
