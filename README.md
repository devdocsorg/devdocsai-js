[DevDocs.ai](https://devdocs.ai) is a platform for building GPT-powered prompts. It takes Markdown,
Markdoc, MDX, reStructuredText, HTML and plain text files (from a GitHub repo,
website or file uploads), and creates embeddings that you can use to create a
prompt, for instance using the companion
[headless DevDocs.ai React components or our prebuilt dialog](https://devdocs.ai/docs#components).
DevDocs.ai also offers analytics, so you can gain insights on how visitors
interact with your docs.

<br />

<p align="center">
  <a aria-label="License" href="https://github.com/devdocsorg/devdocsai-js/blob/main/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/devdocsai">
  </a>
</p>

## Components

This repo contains various UI libraries for building prompts based on the
DevDocs.ai API:

- [`@devdocsai/core`](packages/core#readme) — shared utility functions to speak
  with the DevDocs.ai API.
- [`@devdocsai/react`](packages/react#readme) — a React component.
- [`@devdocsai/web`](packages/web#readme) — a pre-built DevDocs.ai component,
  based on `@devdocsai/react`, built with Preact for bundle-size savings.
  Viable for use with vanilla JavaScript or any framework.
- [`@devdocsai/docusaurus-theme-search`](packages/docusaurus-theme-search#readme)
  — a DevDocs.ai search theme for Docusaurus.

and some example implementations:

- [`with-next`](examples/with-next#readme) — a web application based on
  `@devdocsai/react`, `@devdocsai/web`, and Next.js.
- [`with-devdocsai-web`](examples/with-devdocsai-web#readme) — a web
  application based on `@devdocsai/web` and Vite.
- [`with-css-modules`](examples/with-css-modules#readme) — a web application
  based on `@devdocsai/react`, Vite and CSS Modules.
- [`with-docusaurus`](examples/with-docusaurus#readme) — a Docusaurus project
  with `@devdocsai/docusaurus-theme-search`.
- [`with-docusaurus-algolia`](examples/with-docusaurus-algolia#readme) — a
  Docusaurus project with `@devdocsai/docusaurus-theme-search` and our Algolia
  integration.
- [`with-docusaurus-swizzled`](examples/with-docusaurus-swizzled#readme) — a
  Docusaurus project with DevDocs.ai and
  [theme-search-algolia](https://docusaurus.io/docs/api/themes/@docusaurus/theme-search-algolia).

## Documentation

To use the DevDocs.ai platform as is, please refer to the
[DevDocs.ai documentation](https://devdocs.ai/docs).

## Authors

This library is created by the team behind [DevDocs.ai](https://devdocs.ai)
([DevDocs.work](https://devdocs.work)). [DevDocs.work](https://devdocs.work) also provides technical writing, software development, custom AI, design, and other consulting services.

## License

[MIT](./LICENSE) © [DevDocs.ai](https://devdocs.ai)
