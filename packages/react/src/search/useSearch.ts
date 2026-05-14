import {
  submitAlgoliaDocsearchQuery,
  submitSearchQuery as submitSearchQueryToDevDocsAI,
  type AlgoliaDocSearchHit,
  type AlgoliaDocSearchResultsResponse,
  type SearchResult,
  type SearchResultsResponse,
  isAbortError,
  type SubmitSearchQueryOptions,
} from '@devdocsai/core';
import debounce from 'p-debounce';
import { useCallback, useMemo, useState } from 'react';

import { DEFAULT_DEVDOCSAI_OPTIONS } from '../constants.js';
import type { DevDocsAIOptions, SearchResultComponentProps } from '../types.js';
import { useAbortController } from '../useAbortController.js';

export type SearchLoadingState = 'indeterminate' | 'preload' | 'done';

export interface UseSearchOptions {
  debug?: boolean;
  projectKey: string;
  searchOptions?: Omit<SubmitSearchQueryOptions, 'signal'>;
}

export interface UseSearchResult {
  searchQuery: string;
  searchResults: SearchResultComponentProps[];
  state: SearchLoadingState;
  abort: () => void;
  setSearchQuery: (searchQuery: string) => void;
  submitSearchQuery: (searchQuery: string) => void;
}

export function useSearch({
  debug,
  projectKey,
  searchOptions,
}: UseSearchOptions): UseSearchResult {
  const [state, setState] = useState<SearchLoadingState>('indeterminate');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<
    SearchResultComponentProps[]
  >([]);

  const { ref: controllerRef, abort } = useAbortController();

  const submitSearchQuery = useCallback(
    (searchQuery: string) => {
      abort();

      // reset state if the query was set (back) to empty
      if (searchQuery === '') {
        if (controllerRef.current) controllerRef.current.abort();
        setSearchResults([]);
        setState('indeterminate');
        return;
      }

      setState('preload');

      const controller = new AbortController();
      controllerRef.current = controller;

      let promise: Promise<SearchResult[] | AlgoliaDocSearchHit[] | undefined>;

      if (searchOptions?.provider?.name === 'algolia') {
        promise = (
          submitAlgoliaDocsearchQuery(searchQuery, {
            ...searchOptions,
            signal: controller.signal,
          }) as Promise<AlgoliaDocSearchResultsResponse>
        ).then((result) => result?.hits || []) as Promise<
          AlgoliaDocSearchHit[]
        >;
      } else {
        promise = (
          submitSearchQueryToDevDocsAI(searchQuery, projectKey, {
            ...searchOptions,
            signal: controller.signal,
          }) as Promise<SearchResultsResponse>
        ).then((result) => {
          if (debug) {
            // Show debug info return from DevDocs.ai search API
            // eslint-disable-next-line no-console
            console.debug(JSON.stringify(result?.debug, null, 2));
          }
          return result?.data || [];
        });
      }
      promise.then((searchResults) => {
        if (controller.signal.aborted) return;
        // Discard the response if a newer submitSearchQuery has already
        // replaced our controller. `signal.aborted` alone isn't enough —
        // when fetch resolves synchronously (e.g. MSW in tests), the next
        // keystroke's `abort()` hasn't run yet, so this `.then` would
        // overwrite the latest results with stale ones.
        if (controllerRef.current !== controller) return;
        if (!searchResults) return;

        setSearchResults(
          searchResultsToSearchComponentProps(
            searchQuery,
            searchResults,
            searchOptions,
          ) ?? [],
        );

        // initially focus the first result
        setState('done');
      });

      promise?.catch((error: unknown) => {
        // ignore abort errors
        if (isAbortError(error)) return;

        // todo: surface errors to the user in the UI
        // eslint-disable-next-line no-console
        console.error(error);
      });

      promise?.finally(() => {
        if (controllerRef.current === controller) {
          controllerRef.current = undefined;
        }
      });
    },
    [searchOptions, abort, controllerRef, projectKey, debug],
  );

  // Memoize the debounced wrapper so it survives across renders. Calling
  // `debounce(submitSearchQuery, 220)` inline rebuilt the closure on every
  // render — defeating the debounce — and also tripped react-hooks/refs
  // because submitSearchQuery closes over controllerRef. With useMemo the
  // debounced function is read from cache during render rather than
  // freshly constructed against the ref.
  const debouncedSubmitSearchQuery = useMemo(
    // debounce stores the reference and only invokes it after the timeout
    // fires — the ref read happens in that deferred call (an event-handler-
    // adjacent context), not during render. The rule's static analysis
    // can't see past the function boundary, so disable here with intent.
    // eslint-disable-next-line react-hooks/refs
    () => debounce(submitSearchQuery, 220),
    [submitSearchQuery],
  );

  return {
    state,
    searchResults,
    searchQuery,
    setSearchQuery,
    submitSearchQuery: debouncedSubmitSearchQuery,
    abort,
  };
}

function searchResultsToSearchComponentProps(
  query: string,
  searchResults: SearchResult[] | AlgoliaDocSearchHit[],
  options: DevDocsAIOptions['search'],
): SearchResultComponentProps[] {
  return searchResults.map((result) => {
    return {
      href: (options?.getHref || DEFAULT_DEVDOCSAI_OPTIONS.search!.getHref)?.(
        result,
      ),
      heading: (
        options?.getHeading || DEFAULT_DEVDOCSAI_OPTIONS.search!.getHeading
      )?.(result, query),
      title:
        (options?.getTitle || DEFAULT_DEVDOCSAI_OPTIONS.search!.getTitle)?.(
          result,
          query,
        ) || 'Untitled',
      subtitle: (
        options?.getSubtitle || DEFAULT_DEVDOCSAI_OPTIONS.search!.getSubtitle
      )?.(result, query),
    };
  });
}
