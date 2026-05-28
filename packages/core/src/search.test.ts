import { rest } from 'msw';
import { setupServer } from 'msw/node';
import type { PartialDeep } from 'type-fest/index.d.ts';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import {
  DEFAULT_SUBMIT_SEARCH_QUERY_OPTIONS,
  submitAlgoliaDocsearchQuery,
  submitSearchQuery,
  type AlgoliaDocSearchHit,
  type SearchResult,
} from './index.js';
import type { AlgoliaProvider } from './search.js';

const searchResults: SearchResult[] = [
  {
    matchType: 'title',
    file: {
      title: 'Home page',
      path: '/',
      source: { type: 'file-upload' },
    },
  },
  {
    matchType: 'leadHeading',
    file: { path: '/page1', source: { type: 'file-upload' } },
    meta: { leadHeading: { value: 'Page 1' } },
  },
  {
    matchType: 'content',
    snippet: 'Page 2 snippet',
    file: { path: '/page2', source: { type: 'file-upload' } },
  },
];

const algoliaSearchHits: PartialDeep<AlgoliaDocSearchHit>[] = [
  {
    url: 'https://devdocs.ai/docs/hit',
    hierarchy: {
      lvl0: 'React',
      lvl1: 'React introduction',
      lvl2: null,
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
];

const algoliaProvider: AlgoliaProvider = {
  name: 'algolia',
  apiKey: 'algolia-test-api-key',
  appId: 'algolia-test-app-id',
  indexName: 'algolia-test-index-name',
};

let status = 200;
const wait = 0;

const server = setupServer(
  rest.get(
    DEFAULT_SUBMIT_SEARCH_QUERY_OPTIONS.apiUrl!,
    async (req, res, ctx) => {
      const url = new URL(req.url);
      const searchParams = new URLSearchParams(url.search);
      const limit = searchParams.get('limit');
      let data = searchResults;
      if (limit !== null) {
        data = searchResults.slice(0, parseInt(limit));
      }
      if (wait > 0) {
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
      return res(
        ctx.status(status),
        ctx.body(
          status === 200
            ? JSON.stringify({ data })
            : JSON.stringify({ error: 'Internal Server Error' }),
        ),
      );
    },
  ),
  rest.post(
    `https://${algoliaProvider.appId}-dsn.algolia.net/1/indexes/${algoliaProvider.indexName}/query`,
    async (req, res, ctx) => {
      return res(
        ctx.status(status),
        ctx.body(JSON.stringify({ hits: algoliaSearchHits })),
      );
    },
  ),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
  vi.restoreAllMocks();
});

afterEach(() => {
  status = 200;
  vi.resetAllMocks();
  server.resetHandlers();
});

describe('submitSearchQuery', () => {
  test('gives results', async () => {
    const result = await submitSearchQuery('react', 'testKey');
    expect(result?.data).toStrictEqual(searchResults);
  });

  test('gives results equal to limit', async () => {
    const result = await submitSearchQuery('react', 'testKey', { limit: 2 });
    expect(result?.data).toStrictEqual(searchResults.slice(0, 2));
  });

  test('throws an error on invalid status code', async () => {
    status = 500;

    try {
      await submitSearchQuery('react', 'testKey');
    } catch (error) {
      expect((error as Error).message).toBe(
        'Failed to fetch search results: Internal Server Error',
      );
    }
  });

  test('throws when an error occurs', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() => {
      throw new Error('test');
    });

    try {
      await expect(submitSearchQuery('react', 'testKey')).rejects.toStrictEqual(
        new Error('test'),
      );
    } finally {
      mockFetch.mockRestore();
    }
  });

  test('swallows AbortError and resolves undefined', async () => {
    // A cancelled search must resolve undefined, not reject.
    const abortError = new DOMException(
      'The operation was aborted.',
      'AbortError',
    );
    const mockFetch = vi.spyOn(global, 'fetch').mockRejectedValue(abortError);

    try {
      const result = await submitSearchQuery('react', 'testKey');
      expect(result).toBeUndefined();
    } finally {
      mockFetch.mockRestore();
    }
  });

  test('falls back to "Unknown error" on a non-ok response with an empty body', async () => {
    // An empty error body makes getErrorMessage() return '' → exercises the
    // `|| 'Unknown error'` fallback in the thrown message.
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('', { status: 500 }));

    try {
      await expect(submitSearchQuery('react', 'testKey')).rejects.toThrowError(
        'Failed to fetch search results: Unknown error',
      );
    } finally {
      mockFetch.mockRestore();
    }
  });

  test('forwards query, projectKey and limit as query params', async () => {
    // Assert the outgoing request is shaped correctly, not just that data returns.
    let capturedUrl: string | undefined;
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (input) => {
        capturedUrl = String(input);
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      });

    try {
      await submitSearchQuery('react', 'testKey', { limit: 3 });
      const url = new URL(capturedUrl!);
      expect(url.searchParams.get('query')).toBe('react');
      expect(url.searchParams.get('projectKey')).toBe('testKey');
      expect(url.searchParams.get('limit')).toBe('3');
    } finally {
      mockFetch.mockRestore();
    }
  });

  test('defaults the limit query param to 8 when not provided', async () => {
    let capturedUrl: string | undefined;
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (input) => {
        capturedUrl = String(input);
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      });

    try {
      await submitSearchQuery('react', 'testKey');
      const url = new URL(capturedUrl!);
      expect(url.searchParams.get('limit')).toBe(
        String(DEFAULT_SUBMIT_SEARCH_QUERY_OPTIONS.limit),
      );
    } finally {
      mockFetch.mockRestore();
    }
  });
});

describe('submitAlgoliaDocsearchQuery', () => {
  test('gives results', async () => {
    const result = await submitAlgoliaDocsearchQuery('react', {
      provider: algoliaProvider,
    });
    expect(result?.hits).toStrictEqual(algoliaSearchHits);
  });

  test('throws with unknown provider', async () => {
    await expect(
      submitAlgoliaDocsearchQuery('react', {
        // @ts-expect-error - provider is not a valid provider
        provider: { name: 'test' },
      }),
    ).rejects.toStrictEqual(new Error(`Unknown provider: test`));
  });

  test('throws "Unknown provider: undefined" when no provider is given', async () => {
    await expect(submitAlgoliaDocsearchQuery('react')).rejects.toStrictEqual(
      new Error('Unknown provider: undefined'),
    );
  });

  test('throws on a non-ok Algolia response', async () => {
    // Algolia error path (res.ok === false) — surfaces the API error message.
    // Override the shared handler so the 500 body carries a clean `error` field.
    server.use(
      rest.post(
        `https://${algoliaProvider.appId}-dsn.algolia.net/1/indexes/${algoliaProvider.indexName}/query`,
        async (_req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.body(JSON.stringify({ error: 'Algolia down' })),
          );
        },
      ),
    );

    await expect(
      submitAlgoliaDocsearchQuery('react', { provider: algoliaProvider }),
    ).rejects.toThrowError('Failed to fetch search results: Algolia down');
  });

  test('swallows AbortError and resolves undefined', async () => {
    const abortError = new DOMException(
      'The operation was aborted.',
      'AbortError',
    );
    const mockFetch = vi.spyOn(global, 'fetch').mockRejectedValue(abortError);

    try {
      const result = await submitAlgoliaDocsearchQuery('react', {
        provider: algoliaProvider,
      });
      expect(result).toBeUndefined();
    } finally {
      mockFetch.mockRestore();
    }
  });

  test('falls back to "Unknown error" on a non-ok Algolia response with an empty body', async () => {
    server.use(
      rest.post(
        `https://${algoliaProvider.appId}-dsn.algolia.net/1/indexes/${algoliaProvider.indexName}/query`,
        async (_req, res, ctx) => {
          return res(ctx.status(500), ctx.body(''));
        },
      ),
    );

    await expect(
      submitAlgoliaDocsearchQuery('react', { provider: algoliaProvider }),
    ).rejects.toThrowError('Failed to fetch search results: Unknown error');
  });

  test('sends Algolia credentials and hitsPerPage in the request', async () => {
    // Assert request shape: headers + body carry the provider config and limit.
    let capturedInit: RequestInit | undefined;
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (_input, init) => {
        capturedInit = init;
        return new Response(JSON.stringify({ hits: [] }), { status: 200 });
      });

    try {
      await submitAlgoliaDocsearchQuery('react', {
        provider: algoliaProvider,
        limit: 4,
      });
      const headers = capturedInit!.headers as { [key: string]: string };
      expect(headers['X-Algolia-API-Key']).toBe(algoliaProvider.apiKey);
      expect(headers['X-Algolia-Application-Id']).toBe(algoliaProvider.appId);
      const body = JSON.parse(capturedInit!.body as string);
      expect(body).toMatchObject({
        query: 'react',
        hitsPerPage: 4,
        getRankingInfo: 1,
      });
    } finally {
      mockFetch.mockRestore();
    }
  });
});
