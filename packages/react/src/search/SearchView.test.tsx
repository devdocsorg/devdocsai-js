import {
  DEFAULT_SUBMIT_SEARCH_QUERY_OPTIONS,
  type AlgoliaDocSearchHit,
  type SearchResult,
} from '@devdocsai/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { suppressErrorOutput } from '../test-utils.js';
import { SearchView } from './SearchView.js';

let status = 200;
let results: SearchResult[] | AlgoliaDocSearchHit[] = [];
let debug: unknown;

const server = setupServer(
  rest.get(DEFAULT_SUBMIT_SEARCH_QUERY_OPTIONS.apiUrl!, (req, res, ctx) => {
    if (status >= 400) {
      return res(
        ctx.status(status),
        ctx.json({ error: 'Server error', debug }),
      );
    }

    return res(ctx.status(status), ctx.json({ data: results, debug }));
  }),
  rest.post(
    `https://test-dsn.algolia.net/1/indexes/test/query`,
    (req, res, ctx) => {
      return res(ctx.status(status), ctx.json({ hits: results }));
    },
  ),
);

describe('SearchView', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    vi.resetAllMocks();
    server.resetHandlers();

    status = 200;
    results = [];
    debug = undefined;
  });

  afterAll(() => {
    vi.restoreAllMocks();
    server.close();
  });

  it('renders', () => {
    render(<SearchView projectKey="test-key" />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('throws without a project key', () => {
    const restoreConsole = suppressErrorOutput();
    try {
      // @ts-expect-error intentionally missing projectKey
      expect(() => render(<SearchView />)).toThrow(
        'DevDocs.ai: a project key is required. Make sure to pass your DevDocs.ai project key to <SearchView />.',
      );
    } finally {
      restoreConsole();
    }
  });

  it('displays search queries', async () => {
    const query = 'test query';
    const user = await userEvent.setup();

    results = [
      {
        file: { path: 'path/to/file', source: { type: 'github' } },
        matchType: 'title',
      },
      {
        file: {
          path: 'path/to/file',
          title: 'result 1',
          source: { type: 'github' },
        },
        matchType: 'title',
      },
      {
        file: {
          path: 'path/to/file',
          title: 'result 2',
          source: { type: 'github' },
        },
        matchType: 'title',
        meta: {
          leadHeading: {
            id: 'test-id',
          },
        },
      },
      {
        file: {
          path: 'path/to/file',
          source: { type: 'github' },
        },
        matchType: 'leadHeading',
        meta: {
          leadHeading: {
            value: 'result 3',
            slug: 'result-3',
          },
        },
      },
      {
        file: {
          path: 'path/to/file',
          source: { type: 'github' },
        },
        meta: {
          leadHeading: {
            value: 'result 4',
            slug: 'result-4',
          },
        },
        matchType: 'content',
        snippet: '# result 4\n snippet',
      },
    ];

    render(<SearchView projectKey="test-key" />);

    await user.type(screen.getByRole('searchbox'), query);
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Untitled' }),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'result 1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'result 2' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'result 3' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'result 4 snippet' }),
    ).toBeInTheDocument();
  });

  it('display an empty state when there are no search results', async () => {
    const query = 'test query';
    const user = await userEvent.setup();

    results = [];

    render(<SearchView projectKey="test-key" />);

    await user.type(screen.getByRole('searchbox'), query);
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });

  it('allows users to select search queries', async () => {
    const query = 'test query';
    const user = await userEvent.setup();

    results = [
      {
        file: { path: 'path/to/file', source: { type: 'github' } },
        matchType: 'title',
      },
      {
        file: {
          path: 'path/to/file',
          title: 'result 1',
          source: { type: 'github' },
        },
        matchType: 'title',
      },
      {
        file: {
          path: 'path/to/file',
          title: 'result 2',
          source: { type: 'github' },
        },
        matchType: 'title',
        meta: {
          leadHeading: {
            id: 'test-id',
          },
        },
      },
    ];

    render(<SearchView projectKey="test-key" />);

    await user.type(screen.getByRole('searchbox'), query);
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Untitled' }),
      ).toBeInTheDocument();
    });

    // first item selected by default. Wrapped in waitFor because the
    // initial selection lands via a useEffect that fires AFTER the
    // setSearchResults render — `waitFor(getByRole link 'Untitled')`
    // above returns before that effect has committed.
    await waitFor(() =>
      expect(
        screen.getByRole('option', { selected: true }),
      ).toHaveAttribute('id', 'devdocsai-result-0'),
    );

    // After the form-submit Enter via `user.keyboard('{Enter}')`, userEvent
    // v14 no longer tracks the input as the active typing target — its
    // internal pointer state is invalidated by the synthetic submit even
    // though document.activeElement is still the input. Subsequent
    // `user.keyboard()` calls become no-ops. We're testing the SearchView's
    // own keydown handler, not user-event's pointer tracking, so dispatch
    // arrow / non-submit-Enter events directly on the input via fireEvent.
    const searchbox = screen.getByRole('searchbox');

    // select item on arrow down
    fireEvent.keyDown(searchbox, { key: 'ArrowDown' });

    await waitFor(() =>
      expect(
        screen.getByRole('option', { selected: true }),
      ).toHaveAttribute('id', 'devdocsai-result-1'),
    );

    // select item on mousemove
    await userEvent.hover(screen.getByRole('link', { name: 'result 2' }));

    await waitFor(() =>
      expect(
        screen.getByRole('option', { selected: true }),
      ).toHaveAttribute('id', 'devdocsai-result-2'),
    );

    // select previous on arrow up
    fireEvent.keyDown(searchbox, { key: 'ArrowUp' });

    await waitFor(() =>
      expect(
        screen.getByRole('option', { selected: true }),
      ).toHaveAttribute('id', 'devdocsai-result-1'),
    );

    // don't go past the last result
    fireEvent.keyDown(searchbox, { key: 'ArrowDown' });
    fireEvent.keyDown(searchbox, { key: 'ArrowDown' });
    fireEvent.keyDown(searchbox, { key: 'ArrowDown' });

    await waitFor(() =>
      expect(
        screen.getByRole('option', { selected: true }),
      ).toHaveAttribute('id', 'devdocsai-result-2'),
    );
  });

  it('reselects the first search result when the search query changes', async () => {
    const query = 'test query';
    const user = await userEvent.setup();

    results = [
      {
        file: { path: 'path/to/file', source: { type: 'github' } },
        matchType: 'title',
      },
      {
        file: {
          path: 'path/to/file',
          title: 'result 1',
          source: { type: 'github' },
        },
        matchType: 'title',
      },
    ];

    render(<SearchView projectKey="test-key" />);

    await user.type(screen.getByRole('searchbox'), query);
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Untitled' }),
      ).toBeInTheDocument();
    });

    // Default selection lands via a useEffect after the link renders, so
    // poll for it.
    await waitFor(() =>
      expect(
        screen.getByRole('option', { selected: true }),
      ).toHaveAttribute('id', 'devdocsai-result-0'),
    );

    // Navigate down so the active selection is no longer the first item.
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'ArrowDown' });
    await waitFor(() =>
      expect(
        screen.getByRole('option', { selected: true }),
      ).toHaveAttribute('id', 'devdocsai-result-1'),
    );

    // Change the search query (append more typing). The selection should
    // reset back to the first result for the new query.
    await user.type(screen.getByRole('searchbox'), query);

    await waitFor(() =>
      expect(
        screen.getByRole('option', { selected: true }),
      ).toHaveAttribute('id', 'devdocsai-result-0'),
    );
  });

  it('allows users to open search results', async () => {
    const query = 'test query';
    const user = await userEvent.setup();

    results = [
      {
        file: { path: '#file', source: { type: 'github' } },
        matchType: 'title',
      },
    ];

    render(<SearchView projectKey="test-key" />);

    await user.type(screen.getByRole('searchbox'), query);
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Untitled' }),
      ).toBeInTheDocument();
    });

    // Wait for the default selection to land via the post-results effect
    // before firing Enter — otherwise handleKeyDown's `if (!activeSearchResult)
    // return` short-circuits.
    await waitFor(() =>
      expect(
        screen.getByRole('option', { selected: true }),
      ).toHaveAttribute('id', 'devdocsai-result-0'),
    );

    // See `select search queries` for why we dispatch via fireEvent here
    // instead of `user.keyboard`.
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' });

    await waitFor(() => expect(window.location.href).toContain('#file'));
  });

  it('highlights matches', async () => {
    const query = 'test';
    const user = await userEvent.setup();

    results = [
      {
        file: {
          path: 'path/to/file',
          title: 'test',
          source: { type: 'github' },
        },
        matchType: 'title',
      },
    ];

    render(<SearchView projectKey="test-key" />);

    await user.type(screen.getByRole('searchbox'), query);
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'test' })).toBeInTheDocument();
    });

    expect(screen.getByText('test')).toHaveClass('DevDocsAIMatch');

    await user.clear(screen.getByRole('searchbox'));
    expect(screen.getByText('test')).not.toHaveClass('DevDocsAIMatch');
  });

  it('can use algolia as a search provider', async () => {
    const user = await userEvent.setup();
    const query = 'react';

    results = [
      {
        url: 'https://devdocs.ai/docs/hit',
        hierarchy: {
          lvl0: 'React',
          lvl1: 'React introduction',
          lvl2: 'Integrate with React',
          lvl3: null,
          lvl4: null,
          lvl5: null,
          lvl6: null,
        },
        _highlightResult: {
          hierarchy: {
            lvl0: {
              value: 'React',
              matchLevel: 'full',
              matchedWords: ['react'],
            },
            lvl1: {
              value: 'React introduction',
              matchLevel: 'partial',
              matchedWords: ['react'],
            },
          },
        },
      },
    ] as AlgoliaDocSearchHit[];

    render(
      <SearchView
        projectKey="test-key"
        searchOptions={{
          provider: {
            name: 'algolia',
            apiKey: 'test',
            appId: 'test',
            indexName: 'test',
          },
        }}
      />,
    );

    await user.type(screen.getByRole('searchbox'), query);
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(
        screen.getByRole('option', { selected: true }),
      ).toBeInTheDocument();
    });
  });

  it('logs debug information', async () => {
    const query = 'test query';
    const user = await userEvent.setup();

    results = [
      {
        file: { path: 'path/to/file', source: { type: 'github' } },
        matchType: 'title',
      },
    ];

    debug = {
      query,
      results,
      timing: 100.7,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    render(<SearchView debug projectKey="test-key" />);

    await user.type(screen.getByRole('searchbox'), query);
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Untitled' }),
      ).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(debug, null, 2));
  });
});
