import { describe, expect, test } from 'vitest';

import {
  getErrorMessage,
  parseEncodedJSONHeader,
  isFileSectionReferences,
  isAbortError,
  safeStringify,
} from './utils.js';

const encoder = new TextEncoder();
const unencodedObject = { data: 'Some text' };
const encodedObject = encoder
  .encode(JSON.stringify(unencodedObject))
  .toString();
const unencodedText = 'Some text';
const encodedText = encoder.encode(unencodedText).toString();

describe('getErrorMessage', () => {
  test('returns error from response if present', async () => {
    const mockResponse = new Response(JSON.stringify({ error: 'Test error' }));
    const result = await getErrorMessage(mockResponse);
    expect(result).toBe('Test error');
  });

  test('returns text from response if error is not present', async () => {
    const mockResponse = new Response('Test text');
    const result = await getErrorMessage(mockResponse);
    expect(result).toBe('Test text');
  });

  test('returns raw JSON text when the body is valid JSON without an error field', async () => {
    // `json?.error ?? text` → falls through to the raw text when `.error` absent.
    const body = JSON.stringify({ message: 'no error key' });
    const result = await getErrorMessage(new Response(body));
    expect(result).toBe(body);
  });
});

describe('parseEncodedJSONHeader', () => {
  test('parses and returns the decoded JSON value from the header', () => {
    const mockResponse = new Response(null, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Encoded-Data': encodedObject,
      },
    });

    const parsedValue = parseEncodedJSONHeader(mockResponse, 'X-Encoded-Data');

    expect(parsedValue).toEqual(unencodedObject);
  });

  test('returns undefined if the header is missing or decoding fails', () => {
    const mockResponse = new Response(null, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

    const parsedValue = parseEncodedJSONHeader(mockResponse, 'X-Encoded-Data');

    expect(parsedValue).toBeUndefined();
  });

  test('returns undefined if the header is not a JSON object', () => {
    const mockResponse = new Response(null, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Encoded-Data': encodedText,
      },
    });

    const parsedValue = parseEncodedJSONHeader(mockResponse, 'X-Encoded-Data');

    expect(parsedValue).toBeUndefined();
  });
});

describe('isFileSectionReferences', () => {
  test('identifies FileSectionReference types', () => {
    const references = [
      {
        file: {
          path: '/docs/some-page',
          source: { type: 'website' },
        },
      },
    ];

    expect(isFileSectionReferences(references)).toBe(true);
  });

  test('returns false for a non-array', () => {
    expect(isFileSectionReferences({ file: { path: '/x' } })).toBe(false);
    expect(isFileSectionReferences(null)).toBe(false);
    expect(isFileSectionReferences(undefined)).toBe(false);
    expect(isFileSectionReferences('not-an-array')).toBe(false);
  });

  test('returns false for an empty array', () => {
    // data[0] is undefined → optional chaining yields undefined → Boolean(...) false.
    expect(isFileSectionReferences([])).toBe(false);
  });

  test('returns false when the first entry lacks file.path', () => {
    expect(
      isFileSectionReferences([{ file: { source: { type: 'website' } } }]),
    ).toBe(false);
  });

  test('returns false when the first entry lacks file.source.type', () => {
    expect(isFileSectionReferences([{ file: { path: '/docs/page' } }])).toBe(
      false,
    );
  });
});

describe('isAbortError', () => {
  test('identifies a DOMException whose name is AbortError', () => {
    // The realistic abort case: fetch rejects with a DOMException named
    // "AbortError" (name set via the 2nd ctor arg, not the message).
    const err = new DOMException('The operation was aborted.', 'AbortError');
    expect(err.name).toBe('AbortError');
    expect(isAbortError(err)).toBe(true);
  });

  test('identifies an Error whose message mentions AbortError', () => {
    // Fallback branch for environments/libraries that surface aborts as plain
    // Errors containing the substring.
    expect(isAbortError(new Error('AbortError: aborted'))).toBe(true);
  });

  test('returns false for unrelated errors', () => {
    expect(isAbortError(new Error('Some other error'))).toBe(false);
    // A DOMException that is NOT an abort and whose message lacks the substring.
    expect(isAbortError(new DOMException('boom', 'SyntaxError'))).toBe(false);
  });

  test('returns false for non-error values', () => {
    expect(isAbortError('AbortError')).toBe(false);
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
    expect(isAbortError({ name: 'AbortError' })).toBe(false);
  });
});

describe('parseEncodedJSONHeader (additional)', () => {
  test('returns undefined when the header value is non-numeric garbage', () => {
    // split(',').map(Number) yields NaN → TextDecoder/JSON.parse fails → caught.
    const response = new Response(null, {
      headers: { 'X-Encoded-Data': 'not,numbers,here' },
    });
    expect(parseEncodedJSONHeader(response, 'X-Encoded-Data')).toBeUndefined();
  });
});

describe('safeStringify', () => {
  test('removes non-serializable entries', () => {
    const obj = {
      name: 'Name',
      fn: () => {
        return 1;
      },
      sub: {
        name: 'Sub',
        callback: () => {
          return 0;
        },
      },
    };
    expect(safeStringify(obj)).toEqual(
      JSON.stringify({
        name: 'Name',
        sub: { name: 'Sub' },
      }),
    );
  });

  test('replaces circular references with "[Circular]" instead of throwing', () => {
    // JSON.stringify on this object throws; safeStringify must not.
    const obj: { [key: string]: unknown } = { name: 'root' };
    obj.self = obj;
    expect(() => JSON.stringify(obj)).toThrow();

    const result = safeStringify(obj);
    expect(JSON.parse(result)).toStrictEqual({
      name: 'root',
      self: '[Circular]',
    });
  });

  test('handles circular references nested inside arrays', () => {
    const child: { [key: string]: unknown } = { id: 1 };
    const obj: { [key: string]: unknown } = { items: [child] };
    child.parent = obj;

    const result = safeStringify(obj);
    expect(JSON.parse(result)).toStrictEqual({
      items: [{ id: 1, parent: '[Circular]' }],
    });
  });

  test('does not flag the same object referenced twice (non-circular) as circular', () => {
    // The shared object appears on two sibling branches but is not an ancestor
    // of itself, so neither occurrence should become "[Circular]".
    const shared = { value: 42 };
    const obj = { a: shared, b: shared };

    const result = safeStringify(obj);
    expect(JSON.parse(result)).toStrictEqual({
      a: { value: 42 },
      b: { value: 42 },
    });
  });

  test('applies indentation when provided', () => {
    const result = safeStringify({ a: 1 }, { indentation: 2 });
    expect(result).toBe(JSON.stringify({ a: 1 }, null, 2));
  });
});
