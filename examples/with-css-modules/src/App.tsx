import { FileSectionReference } from '@devdocsai/core';
import * as DevDocsAI from '@devdocsai/react';
import { usePrompt } from '@devdocsai/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import React, { ReactElement } from 'react';

import styles from './devdocsai.module.css';

function Component(): ReactElement {
  return (
    <DevDocsAI.Root>
      <DevDocsAI.DialogTrigger
        aria-label="Ask AI"
        className={styles.DevDocsAIButton}
      >
        <ChatIcon className={styles.DevDocsAIIcon} />
      </DevDocsAI.DialogTrigger>
      <DevDocsAI.Portal>
        <DevDocsAI.Overlay className={styles.DevDocsAIOverlay} />
        <DevDocsAI.Content className={styles.DevDocsAIContentDialog}>
          <DevDocsAI.Close className={styles.DevDocsAIClose}>
            <CloseIcon />
          </DevDocsAI.Close>

          {/* DevDocsAI.Title is required for accessibility reasons. It can be hidden using an accessible content hiding technique. */}
          <VisuallyHidden asChild>
            <DevDocsAI.Title>Ask AI</DevDocsAI.Title>
          </VisuallyHidden>

          {/* DevDocsAI.Description is included for accessibility reasons. It is optional and can be hidden using an accessible content hiding technique. */}
          <VisuallyHidden asChild>
            <DevDocsAI.Description>
              I can answer your questions about DevDocs.ai&apos;s client-side
              libraries, onboarding, API&apos;s and more.
            </DevDocsAI.Description>
          </VisuallyHidden>

          <PromptView projectKey={import.meta.env.VITE_PROJECT_API_KEY} />
        </DevDocsAI.Content>
      </DevDocsAI.Portal>
    </DevDocsAI.Root>
  );
}

interface PromptViewProps {
  projectKey: string;
}

function PromptView(props: PromptViewProps): ReactElement {
  const { projectKey } = props;
  const { answer, submitPrompt, prompt, setPrompt, references, state } =
    usePrompt({ projectKey });
  return (
    <>
      <DevDocsAI.Form
        onSubmit={(event) => {
          event.preventDefault();
          submitPrompt();
        }}
      >
        <SearchIcon className={styles.DevDocsAISearchIcon} />
        <DevDocsAI.Prompt
          className={styles.DevDocsAIPrompt}
          onChange={(event) => setPrompt(event.target.value)}
          value={prompt}
        />
      </DevDocsAI.Form>

      <DevDocsAI.AutoScroller className={styles.DevDocsAIAnswer}>
        <Caret answer={answer} />
        <DevDocsAI.Answer answer={answer} />
      </DevDocsAI.AutoScroller>

      <References references={references} state={state} />
    </>
  );
}

interface CaretProps {
  answer?: string;
}

const Caret = (props: CaretProps): ReactElement | null => {
  const { answer } = props;

  if (answer) {
    return null;
  }

  return <span className={styles.caret} />;
};

const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const removeFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return fileName;
  }
  return fileName.substring(0, lastDotIndex);
};

const Reference = ({
  reference,
  index,
}: {
  reference: FileSectionReference;
  index: number;
}): ReactElement => {
  return (
    <li
      key={`${reference.file?.path}-${index}`}
      className={styles.reference}
      style={{
        animationDelay: `${100 * index}ms`,
      }}
    >
      <a href={removeFileExtension(reference.file.path)}>
        {reference.file.title ||
          capitalize(removeFileExtension(reference.file.path))}
      </a>
    </li>
  );
};

interface ReferencesProps {
  references: FileSectionReference[];
  state: string;
}

const References = (props: ReferencesProps): ReactElement | null => {
  const { references, state } = props;

  if (state === 'indeterminate') return null;

  let adjustedState: string = state;
  if (state === 'done' && references.length === 0) {
    adjustedState = 'indeterminate';
  }

  return (
    <div data-loading-state={adjustedState} className={styles.references}>
      <div className={styles.progress} />
      <p>Fetching relevant pages…</p>
      <p>Answer generated from the following sources:</p>
      <DevDocsAI.References
        RootComponent="ul"
        ReferenceComponent={Reference}
        references={references}
      />
    </div>
  );
};

const SearchIcon = ({ className }: { className?: string }): ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
  </svg>
);

const CloseIcon = ({ className }: { className?: string }): ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" x2="6" y1="6" y2="18"></line>
    <line x1="6" x2="18" y1="6" y2="18"></line>
  </svg>
);

const ChatIcon = ({ className }: { className?: string }): ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
  </svg>
);

export default Component;
