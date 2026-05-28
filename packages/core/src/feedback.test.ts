import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import { DEFAULT_SUBMIT_FEEDBACK_OPTIONS, submitFeedback } from './index.js';

let status = 200;

const server = setupServer(
  rest.post(DEFAULT_SUBMIT_FEEDBACK_OPTIONS.apiUrl, async (req, res, ctx) => {
    return res(
      ctx.status(status),
      ctx.body(
        status === 200
          ? JSON.stringify({ status: 'ok' })
          : JSON.stringify({ error: 'Internal Server Error' }),
      ),
    );
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  status = 200;
  server.resetHandlers();
  vi.restoreAllMocks();
});

describe('submitFeedback', () => {
  test('requires a projectKey', async () => {
    // @ts-expect-error We test a missing project key.
    await expect(() => submitFeedback()).rejects.toThrowError(
      'A projectKey is required',
    );
  });

  test('makes a request', async () => {
    const response = await submitFeedback(
      {
        feedback: { vote: '1' },
        promptId: 'test-id',
      },
      'testKey',
    );

    expect(response).toStrictEqual({ status: 'ok' });
  });

  test('throws an error on invalid status code', async () => {
    status = 500;

    await expect(
      submitFeedback(
        {
          feedback: { vote: '1' },
          promptId: 'test-id',
        },
        'testKey',
      ),
    ).rejects.toThrowError('Internal Server Error');
  });

  test('falls back to "Unknown error" when the error body has no error field', async () => {
    status = 500;
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue(
      // ok:false with a body that has no `.error` property
      new Response(JSON.stringify({ message: 'no error key here' }), {
        status: 500,
      }),
    );

    try {
      await expect(
        submitFeedback(
          { feedback: { vote: '1' }, promptId: 'test-id' },
          'testKey',
        ),
      ).rejects.toThrowError('Failed to submit feedback: Unknown error');
    } finally {
      mockFetch.mockRestore();
    }
  });

  test('swallows AbortError and resolves undefined (does not throw)', async () => {
    // submitFeedback catches DOMException/AbortError and returns undefined,
    // so a caller cancelling an in-flight request does not see a rejection.
    const abortError = new DOMException(
      'The operation was aborted.',
      'AbortError',
    );
    const mockFetch = vi.spyOn(global, 'fetch').mockRejectedValue(abortError);

    try {
      const result = await submitFeedback(
        { feedback: { vote: '1' }, promptId: 'test-id' },
        'testKey',
      );
      expect(result).toBeUndefined();
    } finally {
      mockFetch.mockRestore();
    }
  });

  test('re-throws non-abort network errors', async () => {
    // Only AbortErrors are swallowed; any other thrown error must propagate.
    const networkError = new TypeError('Failed to fetch');
    const mockFetch = vi.spyOn(global, 'fetch').mockRejectedValue(networkError);

    try {
      await expect(
        submitFeedback(
          { feedback: { vote: '1' }, promptId: 'test-id' },
          'testKey',
        ),
      ).rejects.toBe(networkError);
    } finally {
      mockFetch.mockRestore();
    }
  });
});
