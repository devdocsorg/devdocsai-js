# DevDocs.ai Docusaurus plugin

A [DevDocs.ai](https://devdocs.ai) plugin for
[Docusaurus](https://docusaurus.io).

<br />
<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@devdocsai/docusaurus-theme-search">
    <img alt="" src="https://badgen.net/npm/v/@devdocsai/docusaurus-theme-search">
  </a>
  <a aria-label="License" href="https://github.com/devdocsorg/devdocsai-js/blob/main/packages/docusaurus-theme-search/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/@devdocsai/docusaurus-theme-search">
  </a>
</p>

## Installation

```sh
npm install @devdocsai/docusaurus-theme-search
```

## Usage

### Basic Usage

In your `docusaurus.config.js`, add `@devdocsai/docusaurus-theme-search` to
`themes`. Configure `devdocsai` in the `themeConfig`.

```js
const config = {
  // …

  themes: [
    // …
    '@devdocsai/docusaurus-theme-search',
  ],

  themeConfig:
    /** @type {import('@devdocsai/docusaurus-theme-search').ThemeConfig} */ ({
      devdocsai: {
        projectKey: 'YOUR-PROJECT-KEY',
        trigger: { floating: true },
      },
    }),
};
```

Now a search button will appear on your Docusaurus page.

### Usage with another search plugin

If your Docusaurus project already has a search plugin, such as
[theme-search-algolia](https://docusaurus.io/docs/api/themes/@docusaurus/theme-search-algolia),
you need to [swizzle](https://docusaurus.io/docs/swizzling) the current search
plugin, and add DevDocs.ai as a standalone component.

To swizzle your current search plugin, run:

```
npx docusaurus swizzle
```

Choose `Wrap`, and confirm. This will create a `SearchBar` wrapper component in
`/src/theme/SearchBar`. Next, install the standalone DevDocs.ai component and
CSS:

```
npm install @devdocsai/react @devdocsai/css
```

Edit `/src/theme/SearchBar/index.tsx` to include DevDocs.ai next to your
existing search bar. Here is an example:

```tsx
import type { WrapperProps } from '@docusaurus/types';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { type DevDocsAIConfig } from '@devdocsai/docusaurus-theme-search';
import type SearchBarType from '@theme/SearchBar';
import SearchBar from '@theme-original/SearchBar';
import React, { lazy, Suspense } from 'react';

// import DevDocs.ai lazily as Docusaurus does not currently support ESM
const DevDocsAI = lazy(() =>
  import('@devdocsai/react').then((mod) => ({ default: mod.DevDocsAI })),
);

import '@devdocsai/css';

type Props = WrapperProps<typeof SearchBarType>;

export default function SearchBarWrapper(props: Props): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  const { projectKey, ...config } = siteConfig.themeConfig
    .devdocsai as DevDocsAIConfig;

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      {/* Docusaurus' version of `ReactDOMServer` doesn't support Suspense yet, so we can only render the component on the client. */}
      {typeof window !== 'undefined' && (
        <Suspense fallback={null}>
          <DevDocsAI projectKey={projectKey} {...config} />
        </Suspense>
      )}
      <SearchBar {...props} />
    </div>
  );
}
```

## Examples

- [With the Docusaurus plugin](https://github.com/devdocsorg/devdocsai-js/tree/main/examples/with-docusaurus)
- [With an external search plugin](https://github.com/devdocsorg/devdocsai-js/tree/main/examples/with-docusaurus-swizzled)

## Authors

This library is created by the team behind [DevDocs.ai](https://devdocs.ai)
([DevDocs.work](https://devdocs.work)). [DevDocs.work](https://devdocs.work) also provides technical writing, software development, custom AI, design, and other consulting services.

## License

[MIT](./LICENSE) © [DevDocs.ai](https://devdocs.ai)
