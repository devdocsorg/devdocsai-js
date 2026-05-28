import { rest, type RestRequest } from 'msw';
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

import { DEFAULT_SUBMIT_CHAT_OPTIONS, submitChat } from './index.js';

const encoder = new TextEncoder();
let devdocsaiData: unknown = '';
const devdocsaiDebug = '';
let response: string[] = [];
let status = 200;
let request: RestRequest;
let requestBody: unknown = {};
let stream: ReadableStream;

const server = setupServer(
  rest.post(DEFAULT_SUBMIT_CHAT_OPTIONS.apiUrl!, async (req, res, ctx) => {
    request = req;
    requestBody = await req.json();
    stream = new ReadableStream({
      start(controller) {
        for (const chunk of response) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller?.close();
      },
    });

    return res(
      ctx.status(status),
      ctx.set(
        'x-devdocsai-data',
        encoder.encode(JSON.stringify(devdocsaiData)).toString(),
      ),
      ctx.set(
        'x-devdocsai-debug-info',
        encoder.encode(JSON.stringify(devdocsaiDebug)).toString(),
      ),
      ctx.body(stream),
    );
  }),
);

describe('submitChat', () => {
  const onAnswerChunk = vi.fn().mockReturnValue(true);
  const onReferences = vi.fn();
  const onPromptId = vi.fn();
  const onConversationId = vi.fn();
  const onError = vi.fn();

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    response = [];
    requestBody = {};
    devdocsaiData = '';
    status = 200;
    server.resetHandlers();
    vi.resetAllMocks();
  });

  test('require projectKey', async () => {
    await expect(() =>
      // @ts-expect-error We test a missing project key.
      submitChat([]),
    ).rejects.toThrowError('A projectKey is required');
  });

  test('don’t make requests if the prompt is empty', async () => {
    await submitChat(
      [],
      'testKey',
      onAnswerChunk,
      onReferences,
      onConversationId,
      onPromptId,
      onError,
    );

    expect(request).toBeUndefined();
    expect(onAnswerChunk).not.toHaveBeenCalled();
    expect(onReferences).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  test('endpoint is called with the default options if none are provided', async () => {
    await submitChat(
      [{ content: 'How much is 1+2?', role: 'user' }],
      'testKey',
      onAnswerChunk,
      onReferences,
      onConversationId,
      onPromptId,
      onError,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { apiUrl, ...rest } = DEFAULT_SUBMIT_CHAT_OPTIONS;

    expect(requestBody).toStrictEqual({
      messages: [{ content: 'How much is 1+2?', role: 'user' }],
      projectKey: 'testKey',
      ...rest,
    });
  });

  test('make a request', async () => {
    onAnswerChunk.mockReturnValue(true);

    response = ['According to my calculator ', '1 + 2 = 3'];

    await submitChat(
      [{ content: 'How much is 1+2?', role: 'user' }],
      'testKey',
      onAnswerChunk,
      onReferences,
      onConversationId,
      onPromptId,
      onError,
    );

    expect(request).toBeDefined();
    expect(onAnswerChunk.mock.calls).toStrictEqual([
      ['According to my calculator '],
      ['1 + 2 = 3'],
    ]);
    expect(onError).not.toHaveBeenCalled();
  });

  test('handle error status code', async () => {
    status = 500;
    response = ['Internal Server Error'];

    await submitChat(
      [{ content: 'How much is 1+2?', role: 'user' }],
      'testKey',
      onAnswerChunk,
      onReferences,
      onConversationId,
      onPromptId,
      onError,
    );

    expect(request).toBeDefined();
    expect(onAnswerChunk.mock.calls).toStrictEqual([
      [DEFAULT_SUBMIT_CHAT_OPTIONS.iDontKnowMessage],
    ]);
    expect(onReferences).not.toHaveBeenCalled();
    expect(onError.mock.calls).toStrictEqual([
      [new Error('Internal Server Error')],
    ]);
  });

  test('ignore invalid references', async () => {
    onAnswerChunk.mockReturnValue(true);

    response = ['According to my calculator ', '1 + 2 = 3'];

    await submitChat(
      [{ content: 'How much is 1+2?', role: 'user' }],
      'testKey',
      onAnswerChunk,
      onReferences,
      onConversationId,
      onPromptId,
      onError,
    );

    expect(request).toBeDefined();
    expect(onAnswerChunk.mock.calls).toStrictEqual([
      ['According to my calculator '],
      ['1 + 2 = 3'],
    ]);
    expect(onReferences).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  test('stop if onAnswerChunk returns false', async () => {
    onAnswerChunk.mockReturnValue(false);

    response = ['According to my calculator ', '1 + 2 = 3'];

    await submitChat(
      [{ content: 'How much is 1+2?', role: 'user' }],
      'testKey',
      onAnswerChunk,
      onReferences,
      onConversationId,
      onPromptId,
      onError,
    );

    expect(request).toBeDefined();
    expect(onAnswerChunk.mock.calls).toStrictEqual([
      ['According to my calculator '],
    ]);
    expect(onReferences).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  test('calls back user-provided onReferences', async () => {
    const references = [
      {
        file: { path: '/page1', source: { type: 'file-upload' } },
        meta: { leadHeading: { value: 'Page 1' } },
      },
    ];

    devdocsaiData = { references };

    response = ['According to my calculator ', '1 + 2 = 3'];

    await submitChat(
      [{ content: 'How much is 1+2?', role: 'user' }],
      'testKey',
      onAnswerChunk,
      onReferences,
      onConversationId,
      onPromptId,
      onError,
    );

    expect(request).toBeDefined();
    expect(onAnswerChunk).toHaveBeenCalled();
    expect(onReferences).toHaveBeenCalledWith(references);
    expect(onError).not.toHaveBeenCalled();
  });

  test('calls back user-provided onPromptId', async () => {
    const promptId = 'test-id';

    devdocsaiData = { promptId };

    response = ['According to my calculator ', '1 + 2 = 3'];

    await submitChat(
      [{ content: 'How much is 1+2?', role: 'user' }],
      'testKey',
      onAnswerChunk,
      onReferences,
      onConversationId,
      onPromptId,
      onError,
    );

    expect(request).toBeDefined();
    expect(onAnswerChunk).toHaveBeenCalled();
    expect(onPromptId).toHaveBeenCalledWith(promptId);
    expect(onError).not.toHaveBeenCalled();
  });

  test('calls back user-provided onConversationId', async () => {
    const conversationId = 'test-id';

    devdocsaiData = { conversationId };

    response = ['According to my calculator ', '1 + 2 = 3'];

    await submitChat(
      [{ content: 'How much is 1+2?', role: 'user' }],
      'testKey',
      onAnswerChunk,
      onReferences,
      onConversationId,
      onPromptId,
      onError,
    );

    expect(request).toBeDefined();
    expect(onAnswerChunk).toHaveBeenCalled();
    expect(onConversationId).toHaveBeenCalledWith(conversationId);
    expect(onError).not.toHaveBeenCalled();
  });

  test('expect onError to be called when an error occurs', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() => {
      throw new Error('test');
    });

    try {
      response = ['According to my calculator ', '1 + 2 = 3'];

      await submitChat(
        [{ content: 'How much is 1+2?', role: 'user' }],
        'testKey',
        onAnswerChunk,
        onConversationId,
        onReferences,
        onPromptId,
        onError,
      );

      expect(request).toBeDefined();
      expect(onError).toHaveBeenCalledWith(new Error('test'));
    } finally {
      mockFetch.mockRestore();
    }
  });

  test('expect to log the error when debug is enabled and an error occurs', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() => {
      throw new Error('test');
    });

    try {
      response = ['According to my calculator ', '1 + 2 = 3'];

      await submitChat(
        [{ content: 'How much is 1+2?', role: 'user' }],
        'testKey',
        onAnswerChunk,
        onConversationId,
        onReferences,
        onPromptId,
        onError,
        { debug: true },
      );

      expect(request).toBeDefined();
      expect(onError).toHaveBeenCalledWith(new Error('test'));
    } finally {
      mockFetch.mockRestore();
    }
  });

  test('expect onError to be called when a non-error is thrown', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation(() => {
      throw 'test';
    });

    try {
      response = ['According to my calculator ', '1 + 2 = 3'];

      await submitChat(
        [{ content: 'How much is 1+2?', role: 'user' }],
        'testKey',
        onAnswerChunk,
        onConversationId,
        onReferences,
        onPromptId,
        onError,
      );

      expect(request).toBeDefined();
      expect(onError).toHaveBeenCalledWith(new Error('test'));
    } finally {
      mockFetch.mockRestore();
    }
  });

  test('logs debugInfo to the console when the positional debug arg is set', async () => {
    const debugSpy = vi
      .spyOn(console, 'debug')
      .mockImplementation(() => undefined);
    // The streamed body must be valid JSON so res.clone().json() can read it.
    response = [JSON.stringify({ debugInfo: { tokens: 7 } })];

    try {
      await submitChat(
        [{ content: 'How much is 1+2?', role: 'user' }],
        'testKey',
        onAnswerChunk,
        onReferences,
        onConversationId,
        onPromptId,
        onError,
        {},
        true, // positional debug
      );

      expect(debugSpy).toHaveBeenCalledWith({ tokens: 7 });
      expect(onError).not.toHaveBeenCalled();
    } finally {
      debugSpy.mockRestore();
    }
  });

  test('logs debugInfo when options.debug is set (documented option honored)', async () => {
    // Regression test for the previously-dead `SubmitChatOptions.debug` option:
    // it MUST trigger client-side debug logging just like the positional arg.
    const debugSpy = vi
      .spyOn(console, 'debug')
      .mockImplementation(() => undefined);
    response = [JSON.stringify({ debugInfo: { source: 'options' } })];

    try {
      await submitChat(
        [{ content: 'How much is 1+2?', role: 'user' }],
        'testKey',
        onAnswerChunk,
        onReferences,
        onConversationId,
        onPromptId,
        onError,
        { debug: true }, // documented option, no positional arg
      );

      expect(debugSpy).toHaveBeenCalledWith({ source: 'options' });
    } finally {
      debugSpy.mockRestore();
    }
  });

  test('does NOT log debugInfo when neither debug flag is set', async () => {
    // Mutation guard: ensures the assertions above are not vacuously passing —
    // with debug off, console.debug must not be called even when debugInfo is
    // present in the response body.
    const debugSpy = vi
      .spyOn(console, 'debug')
      .mockImplementation(() => undefined);
    response = [JSON.stringify({ debugInfo: { tokens: 7 } })];

    try {
      await submitChat(
        [{ content: 'How much is 1+2?', role: 'user' }],
        'testKey',
        onAnswerChunk,
        onReferences,
        onConversationId,
        onPromptId,
        onError,
        {},
      );

      expect(debugSpy).not.toHaveBeenCalled();
    } finally {
      debugSpy.mockRestore();
    }
  });

  test('logs the error body to console.error when options.debug is set on a failed request', async () => {
    // The error-path debug log must also honor the documented option.
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    status = 500;
    response = ['Internal Server Error'];

    try {
      await submitChat(
        [{ content: 'How much is 1+2?', role: 'user' }],
        'testKey',
        onAnswerChunk,
        onReferences,
        onConversationId,
        onPromptId,
        onError,
        { debug: true },
      );

      expect(errorSpy).toHaveBeenCalledWith('Internal Server Error');
      expect(onError).toHaveBeenCalledWith(new Error('Internal Server Error'));
    } finally {
      errorSpy.mockRestore();
    }
  });

  test('sends the resolved chat options in the request body', async () => {
    // Asserts that caller-provided options override defaults in the payload
    // and that signal/apiUrl are NOT part of the serialized body.
    response = ['ok'];

    await submitChat(
      [{ content: 'Hi', role: 'user' }],
      'testKey',
      onAnswerChunk,
      onReferences,
      onConversationId,
      onPromptId,
      onError,
      {
        temperature: 0.9,
        maxTokens: 123,
        signal: new AbortController().signal,
      },
    );

    const body = requestBody as { [key: string]: unknown };
    expect(body.temperature).toBe(0.9);
    expect(body.maxTokens).toBe(123);
    expect(body.projectKey).toBe('testKey');
    expect(body.messages).toStrictEqual([{ content: 'Hi', role: 'user' }]);
    // signal and apiUrl must not leak into the request body.
    expect(body).not.toHaveProperty('signal');
    expect(body).not.toHaveProperty('apiUrl');
  });
});
