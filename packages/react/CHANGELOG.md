# @devdocsai/react

## 1.0.0

### Major Changes

- [#8](https://github.com/devdocsorg/devdocsai-js/pull/8)
  [`2fe95643e783c77510c620f2f69bff82084942ab`](https://github.com/devdocsorg/devdocsai-js/commit/2fe95643e783c77510c620f2f69bff82084942ab)
  Thanks [@TheDiscordian](https://github.com/TheDiscordian)! - **BREAKING**:
  Drop React 16 and React 17 support. The peer range is now `^18 || ^19`.

  Why: `react-markdown@9` (required to compile under React 19's removed-global
  `JSX` namespace) itself peers `react: ">=18"`, so a `@devdocsai/react` install
  on a React 17 host hits an unmet-peer error transitively even if our own peer
  range allowed it. Cleanly dropping React 16/17 here makes the supported range
  honest.

  Migration: pin `@devdocsai/react@^0.30.x` if you must stay on React 17.
  Otherwise upgrade your host to React 18 or 19.

  Also bumps:
  - `react-markdown` 8 → 9
  - `remark-gfm` 3 → 4
  - `@testing-library/react` 12 → 16 (dev dep)
  - `@testing-library/dom` 8 → 10 (dev dep)
  - Drops `@testing-library/react-hooks` (deprecated; its `renderHook` was
    merged into `@testing-library/react` in v13).

  Race-condition fix in `useSearch` / `SearchView`: a fast-resolving stale
  search response no longer overwrites the user's keyboard selection.
  Behavioural detail worth knowing for hosts that style the active result — when
  the search query changes, the selection now reliably resets to the first
  result of the new result set rather than transiently appearing cleared until
  the user navigates. In the previous code this only worked when the second
  response happened to come back empty (a race-timing artefact), which is
  exactly what the fix removes; the production intent — "fresh query → first
  result selected" — is now deterministic.

## 0.30.3

### Patch Changes

- Updated dependencies
  [[`87e1ae2771f2539f97597602fb1cceb4f70f51b9`](https://github.com/devdocsorg/devdocsai-js/commit/87e1ae2771f2539f97597602fb1cceb4f70f51b9)]:
  - @devdocsai/core@0.20.0

## 0.30.2

### Patch Changes

- [`cd348be103c35c376a68b1d91900177a7183a61a`](https://github.com/devdocsorg/devdocsai-js/commit/cd348be103c35c376a68b1d91900177a7183a61a)
  Thanks [@devdocsai](https://github.com/devdocsai)! - Make devdocs icon
  transparent

## 0.30.1

### Patch Changes

- Updated dependencies
  [[`7582fff02781cf44baa489bde5ca7cc3441a9e6b`](https://github.com/devdocsorg/devdocsai-js/commit/7582fff02781cf44baa489bde5ca7cc3441a9e6b)]:
  - @devdocsai/core@0.19.1

## 0.30.0

### Minor Changes

- [`93742188ed7f66070576475dea8d7fb673d66510`](https://github.com/devdocsorg/devdocsai-js/commit/93742188ed7f66070576475dea8d7fb673d66510)
  Thanks [@justinr1234](https://github.com/justinr1234)! - Initial release of
  devdocs.ai

### Patch Changes

- Updated dependencies
  [[`93742188ed7f66070576475dea8d7fb673d66510`](https://github.com/devdocsorg/devdocsai-js/commit/93742188ed7f66070576475dea8d7fb673d66510)]:
  - @devdocsai/core@0.19.0
