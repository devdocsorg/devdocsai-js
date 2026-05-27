import {
  DEFAULT_SUBMIT_SEARCH_QUERY_OPTIONS,
  type SearchResult,
} from '@devdocsai/core';
import { fireEvent, render, screen } from '@testing-library/react';
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
  // Drop any per-test navigator.clipboard mock so it cannot leak.
  if (Object.getOwnPropertyDescriptor(navigator, 'clipboard')?.configurable) {
    // @ts-expect-error allow deleting the configurable test-only property
    delete navigator.clipboard;
  }
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

function mockClipboard(): ReturnType<typeof vi.fn> {
  const writeText = vi.fn().mockResolvedValue(undefined);
  // jsdom does not implement navigator.clipboard; define it directly rather
  // than stubbing the whole navigator global (which breaks userEvent).
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

test('CopyCodeButton copies a plain-string answer to the clipboard', () => {
  const writeText = mockClipboard();

  // PromptView passes the rendered answer as a plain string child. Previously
  // CopyCodeButton read children[0] (the first character) so this copied "".
  render(
    <DevDocsAI.CopyCodeButton>
      {'the full answer text'}
    </DevDocsAI.CopyCodeButton>,
  );

  fireEvent.click(screen.getByRole('button'));

  expect(writeText).toHaveBeenCalledWith('the full answer text');
});

test('CopyCodeButton copies text from the markdown code-block shape', () => {
  const writeText = mockClipboard();

  // react-markdown passes a <code> element tree; the copyable text lives at
  // children[0].props.children[0]. This shape must keep working.
  const markdownChildren = [{ props: { children: ['const answer = 42;'] } }];
  render(
    <DevDocsAI.CopyCodeButton>{markdownChildren}</DevDocsAI.CopyCodeButton>,
  );

  fireEvent.click(screen.getByRole('button'));

  expect(writeText).toHaveBeenCalledWith('const answer = 42;');
});

test('useCopyToClipboard toggles didCopy on click', () => {
  const writeText = mockClipboard();

  function Harness(): React.ReactElement {
    const { handleClick, didCopy } = DevDocsAI.useCopyToClipboard({
      content: 'copied content',
    });
    return <button onClick={handleClick}>{didCopy ? 'copied' : 'copy'}</button>;
  }

  render(<Harness />);
  expect(screen.getByRole('button')).toHaveTextContent('copy');

  fireEvent.click(screen.getByRole('button'));

  expect(writeText).toHaveBeenCalledWith('copied content');
  expect(screen.getByRole('button')).toHaveTextContent('copied');
});
