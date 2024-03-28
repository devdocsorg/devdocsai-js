import * as AccessibleIcon from '@radix-ui/react-accessible-icon';
import React, {
  useEffect,
  type Dispatch,
  type ReactElement,
  type SetStateAction,
} from 'react';

import {
  ChevronUpIcon,
  CommandIcon,
  CornerDownLeftIcon,
  SearchIcon,
} from '../icons.js';
import * as BaseDevDocsAI from '../primitives/headless.js';
import { type DevDocsAIOptions } from '../types.js';

interface SearchBoxTriggerProps {
  trigger: DevDocsAIOptions['trigger'];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

/**
 * A button that can be used to open the DevDocsAI dialog, styled as a search
 * input, displaying a keyboard shortcut. This trigger is relatively positioned
 * in the container where DevDocs.ai is rendered.
 */
export function SearchBoxTrigger(props: SearchBoxTriggerProps): ReactElement {
  const { trigger, setOpen, open } = props;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (open) return;
      if (
        (event.key === 'Enter' && event.ctrlKey) ||
        (event.key === 'Enter' && event.metaKey)
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  return (
    <BaseDevDocsAI.DialogTrigger className="DevDocsAISearchBoxTrigger">
      <AccessibleIcon.Root label={trigger?.label ?? ''}>
        <span className="DevDocsAISearchBoxTriggerContent">
          <span className="DevDocsAISearchBoxTriggerText">
            <SearchIcon width={16} height={16} />{' '}
            {trigger?.placeholder || 'Search'}{' '}
          </span>
          <kbd>
            {navigator.platform.indexOf('Mac') === 0 ||
            navigator.platform === 'iPhone' ? (
              <CommandIcon className="DevDocsAIKeyboardKey" />
            ) : (
              <ChevronUpIcon className="DevDocsAIKeyboardKey" />
            )}
            <CornerDownLeftIcon className="DevDocsAIKeyboardKey" />
          </kbd>
        </span>
      </AccessibleIcon.Root>
    </BaseDevDocsAI.DialogTrigger>
  );
}
