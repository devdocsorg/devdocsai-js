import { describe, expect, test } from 'vitest';

import { markdownToString, isPresent, isIterable } from './utils.js';

describe('utils', () => {
  test('isIterable', () => {
    // isIterable guards a `[...new Set([...value])]` spread in the chat store,
    // so it must return true exactly for values that can be spread.
    expect(isIterable([])).toBe(true);
    expect(isIterable([1, 2, 3])).toBe(true);
    expect(isIterable('a string is iterable')).toBe(true);
    expect(isIterable(new Set([1, 2]))).toBe(true);
    expect(isIterable(new Map())).toBe(true);

    // Non-iterables (spreading these into an array would throw).
    expect(isIterable({})).toBe(false);
    expect(isIterable({ length: 3 })).toBe(false);
    expect(isIterable(42)).toBe(false);
    expect(isIterable(true)).toBe(false);
    // Null/undefined are handled by the explicit `obj == null` guard.
    expect(isIterable(null)).toBe(false);
    expect(isIterable(undefined)).toBe(false);
  });

  test('isPresent', () => {
    // Test case with a non-null and non-undefined value
    const value1 = 'Test String';
    const result1 = isPresent(value1);
    expect(result1).toBe(true);

    // Test case with a null value
    const value2 = null;
    const result2 = isPresent(value2);
    expect(result2).toBe(false);

    // Test case with an undefined value
    const value3 = undefined;
    const result3 = isPresent(value3);
    expect(result3).toBe(false);
  });

  test('markdownToString', () => {
    // Test case with markdown text fitting in maxLength
    const testMarkdown1 = '# Hello Vitest';
    const expectedString1 = 'Hello Vitest';

    const result1 = markdownToString(testMarkdown1);
    expect(result1).toBe(expectedString1);

    // Test case with markdown text exceeding maxLength and being trimmed
    const testMarkdown2 =
      '# This is a very very long markdown string just for the sake of this unit testing, I promise!';
    const expectedString2 = 'This is a very very long markdown string just f…';

    const result2 = markdownToString(testMarkdown2, 47);

    expect(result2).toBe(expectedString2);

    // Test case with void input
    const expectedString3 = '';
    const result3 = markdownToString();
    expect(result3).toBe(expectedString3);
  });
});
