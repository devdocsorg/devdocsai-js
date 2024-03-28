import {
  DEFAULT_SUBMIT_SEARCH_QUERY_OPTIONS,
  type SearchResult,
} from '@devdocsai/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  expect,
  test,
  vi,
  vitest,
} from 'vitest';

import * as DevDocsAI from './headless.js';

let searchResults: SearchResult[] = [];
let status = 200;
const server = setupServer(
  rest.get(
    DEFAULT_SUBMIT_SEARCH_QUERY_OPTIONS.apiUrl!,
    async (_req, res, ctx) => {
      return res(
        ctx.status(status),
        ctx.body(JSON.stringify({ data: searchResults })),
      );
    },
  ),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  searchResults = [];
  status = 200;
  server.resetHandlers();
});

test('Initial state', async () => {
  render(
    <DevDocsAI.Root>
      <DevDocsAI.DialogTrigger>Trigger</DevDocsAI.DialogTrigger>
      <DevDocsAI.Portal>
        <DevDocsAI.Overlay />
        <DevDocsAI.Content>
          <DevDocsAI.Close>Close</DevDocsAI.Close>
          <DevDocsAI.Form>
            Search
            <DevDocsAI.Prompt />
          </DevDocsAI.Form>
          <DevDocsAI.AutoScroller>
            Caret
            <DevDocsAI.Answer answer="" />
          </DevDocsAI.AutoScroller>
          <DevDocsAI.References references={[]} />
        </DevDocsAI.Content>
      </DevDocsAI.Portal>
    </DevDocsAI.Root>,
  );

  const trigger = await screen.findByText('Trigger');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger).toHaveAttribute('data-state', 'closed');
});

test('Returns children when display is plain', async () => {
  render(
    <DevDocsAI.Root display="plain">
      <DevDocsAI.Form>
        Search
        <DevDocsAI.Prompt />
      </DevDocsAI.Form>
      <DevDocsAI.AutoScroller>
        Caret
        <DevDocsAI.Answer answer="" />
      </DevDocsAI.AutoScroller>
      <DevDocsAI.References references={[]} />
    </DevDocsAI.Root>,
  );

  expect(screen.getByRole('searchbox')).toBeInTheDocument();
});

test('Trigger opens the dialog', async () => {
  const user = userEvent.setup();

  render(
    <DevDocsAI.Root>
      <DevDocsAI.DialogTrigger>Trigger</DevDocsAI.DialogTrigger>
      <DevDocsAI.Portal>
        <DevDocsAI.Overlay />
        <DevDocsAI.Content>
          <DevDocsAI.Close>Close</DevDocsAI.Close>
          <DevDocsAI.Form>
            Search
            <DevDocsAI.Prompt />
          </DevDocsAI.Form>
          <DevDocsAI.AutoScroller>
            Caret
            <DevDocsAI.Answer answer="" />
          </DevDocsAI.AutoScroller>
          <DevDocsAI.References references={[]} />
        </DevDocsAI.Content>
      </DevDocsAI.Portal>
    </DevDocsAI.Root>,
  );

  const trigger = await screen.findByText('Trigger');
  await user.click(trigger);
  expect(await screen.findByText('Caret')).toBeVisible();

  const close = await screen.findByText('Close');
  expect(close).toBeVisible();
});

test('Branding is displayed in Content when set to true', async () => {
  const user = userEvent.setup();

  render(
    <DevDocsAI.Root>
      <DevDocsAI.DialogTrigger>Trigger</DevDocsAI.DialogTrigger>
      <DevDocsAI.Portal>
        <DevDocsAI.Content branding={{ show: true }}></DevDocsAI.Content>
      </DevDocsAI.Portal>
    </DevDocsAI.Root>,
  );

  const trigger = await screen.findByText('Trigger');
  await user.click(trigger);

  const branding = await screen.findByText('Powered by');
  expect(branding).toBeInTheDocument();
});

test('Branding is not displayed in Content when set to false', async () => {
  const user = userEvent.setup();

  render(
    <DevDocsAI.Root>
      <DevDocsAI.DialogTrigger>Trigger</DevDocsAI.DialogTrigger>
      <DevDocsAI.Portal>
        <DevDocsAI.Content branding={{ show: false }}></DevDocsAI.Content>
      </DevDocsAI.Portal>
    </DevDocsAI.Root>,
  );

  const trigger = await screen.findByText('Trigger');
  await user.click(trigger);

  const branding = screen.queryByText('Powered by');
  expect(branding).not.toBeInTheDocument();
});

test('Branding is displayed in PlainContent when set to true', async () => {
  const user = userEvent.setup();

  render(
    <DevDocsAI.Root>
      <DevDocsAI.DialogTrigger>Trigger</DevDocsAI.DialogTrigger>
      <DevDocsAI.Portal>
        <DevDocsAI.PlainContent
          branding={{ show: true }}
        ></DevDocsAI.PlainContent>
      </DevDocsAI.Portal>
    </DevDocsAI.Root>,
  );

  const trigger = await screen.findByText('Trigger');
  await user.click(trigger);

  const branding = await screen.findByText('Powered by');
  expect(branding).toBeInTheDocument();
});

test('Branding is not displayed in PlainContent when set to false', async () => {
  const user = userEvent.setup();

  render(
    <DevDocsAI.Root>
      <DevDocsAI.DialogTrigger>Trigger</DevDocsAI.DialogTrigger>
      <DevDocsAI.Portal>
        <DevDocsAI.PlainContent
          branding={{ show: false }}
        ></DevDocsAI.PlainContent>
      </DevDocsAI.Portal>
    </DevDocsAI.Root>,
  );

  const trigger = await screen.findByText('Trigger');
  await user.click(trigger);

  const branding = screen.queryByText('Powered by');
  expect(branding).not.toBeInTheDocument();
});

test('Close button closes the dialog', async () => {
  const user = userEvent.setup();

  render(
    <DevDocsAI.Root>
      <DevDocsAI.DialogTrigger>Trigger</DevDocsAI.DialogTrigger>
      <DevDocsAI.Portal>
        <DevDocsAI.Overlay />
        <DevDocsAI.Content>
          <DevDocsAI.Close>Close</DevDocsAI.Close>
          <p>test</p>
        </DevDocsAI.Content>
      </DevDocsAI.Portal>
    </DevDocsAI.Root>,
  );

  const trigger = await screen.findByText('Trigger');
  await user.click(trigger);

  const close = await screen.findByText('Close');
  await user.click(close);

  expect(screen.queryByText('test')).not.toBeInTheDocument();
});

test('SearchResult properly includes href', async () => {
  render(
    <DevDocsAI.SearchResult
      href="https://example.com"
      title="Example result"
    />,
  );

  const result = await screen.findByText('Example result');
  expect(result).toHaveAttribute('href', 'https://example.com');
});

test('Title and description should be visible', async () => {
  const user = userEvent.setup();

  render(
    <DevDocsAI.Root>
      <DevDocsAI.DialogTrigger>Trigger</DevDocsAI.DialogTrigger>
      <DevDocsAI.Portal>
        <DevDocsAI.Overlay />
        <DevDocsAI.Content>
          <DevDocsAI.Title hide={false}>Example title</DevDocsAI.Title>
          <DevDocsAI.Description hide={false}>
            Example description
          </DevDocsAI.Description>
        </DevDocsAI.Content>
      </DevDocsAI.Portal>
    </DevDocsAI.Root>,
  );

  const trigger = await screen.findByText('Trigger');
  await user.click(trigger);

  const title = await screen.findByText('Example title');
  expect(title).toBeVisible();

  const description = await screen.findByText('Example description');
  expect(description).toBeVisible();
});

test('Search result title and description should be visible', async () => {
  render(
    <DevDocsAI.SearchResults
      searchResults={[
        {
          href: 'https://example.com',
          heading: 'Test heading',
          title: 'Test title',
          subtitle: 'Test subtitle',
        },
      ]}
    ></DevDocsAI.SearchResults>,
  );

  const heading = await screen.findByText('Test title');
  expect(heading).toBeVisible();
});

test('Prompt changes trigger user-defined callbacks', async () => {
  const cb = vitest.fn();
  const user = userEvent.setup();

  render(
    <DevDocsAI.Root>
      <DevDocsAI.Prompt type="text" onChange={cb} />
    </DevDocsAI.Root>,
  );

  const input = await screen.findByRole('textbox');

  await user.type(input, 'test');
  expect(input).toHaveValue('test');
  expect(cb).toHaveBeenCalled();
});

test('Prompt changes updates prompt state', async () => {
  const user = userEvent.setup();

  render(
    <DevDocsAI.Root>
      <DevDocsAI.Prompt type="text" />
    </DevDocsAI.Root>,
  );

  const input = await screen.findByRole('textbox');

  await user.type(input, 'test');
  expect(input).toHaveValue('test');
});

test('References renders the passed ReferenceComponent', () => {
  const ReferenceComponent = vi.fn(({ reference }) => reference.file.path);
  render(
    <DevDocsAI.References
      references={[
        { file: { path: '/path/to/file', source: { type: 'github' } } },
      ]}
      ReferenceComponent={ReferenceComponent}
    />,
  );
  expect(ReferenceComponent).toHaveBeenCalledOnce();
});
