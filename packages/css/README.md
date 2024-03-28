# `@devdocsai/css`

Common CSS for [DevDocs.ai](https://devdocs.ai) components.

<br />
<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@devdocsai/css">
    <img alt="" src="https://badgen.net/npm/v/@devdocsai/css">
  </a>
  <a aria-label="License" href="https://github.com/motifland/devdocsai-js/blob/main/packages/css/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/@devdocsai/css">
  </a>
</p>

## Installation

```sh
npm install @devdocsai/core
```

## Usage

With a bundler:

```js
import '@devdocsai/css';
```

With a CDN:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@devdocsai/css@0.2.0/devdocsai.css"
/>
```

This package adds styling for various CSS classes. All styling is applied using
the [`:where()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:where) pseudo
class, so you can override all styling manually.

## API

### CSS Classes

The package adds styling using the following classes.

- `DevDocsAIAnswer`
- `DevDocsAIAutoScroller`
- `DevDocsAICaret`
- `DevDocsAIClose`
- `DevDocsAIContentDialog`
- `DevDocsAIContentPlain`
- `DevDocsAIForm`
- `DevDocsAIIcon`
- `DevDocsAIOverlay`
- `DevDocsAIProgress`
- `DevDocsAIPrompt`
- `DevDocsAIPromptLabel`
- `DevDocsAIReferences`
- `DevDocsAISearchIcon`
- `DevDocsAITitle`
- `DevDocsAITrigger`

### CSS Variables

Styling can be customized using the following CSS variables.

- `--devdocsai-background`: (Default: `#ffffff`, Default dark: `#050505`)
- `--devdocsai-foreground`: (Default: `#171717`, Default dark: `#d4d4d4`)
- `--devdocsai-muted`: (Default: `#fafafa`, Default dark: `#171717`)
- `--devdocsai-mutedForeground`: (Default: `#737373`, Default dark: `#737373`)
- `--devdocsai-border`: (Default: `#e5e5e5`, Default dark: `#262626`)
- `--devdocsai-input`: (Default: `#ffffff`, Default dark: `#ffffff`)
- `--devdocsai-primary`: (Default: `#6366f1`, Default dark: `#6366f1`)
- `--devdocsai-primaryForeground`: (Default: `#ffffff`, Default dark:
  `#ffffff`)
- `--devdocsai-primaryMuted`: (Default: `#8285f4`, Default dark: `#8285f4`)
- `--devdocsai-secondary`: (Default: `#fafafa`, Default dark: `#0e0e0e`)
- `--devdocsai-secondaryForeground`: (Default: `#171717`, Default dark:
  `#ffffff`)
- `--devdocsai-primaryHighlight`: (Default: `#ec4899`, Default dark: `#ec4899`)
- `--devdocsai-secondaryHighlight`: (Default: `#a855f7`, Default dark:
  `#a855f7`)
- `--devdocsai-overlay`: (Default: `#00000010`, Default dark: `#00000040\`)
- `--devdocsai-ring`: (Default: `#0ea5e9`, Default dark: `#ffffff`)
- `--devdocsai-radius`: (Default: `8px`)
- `--devdocsai-text-size`-(Default: `0.875rem`)
- `--devdocsai-text-size-xs`-(Default: `0.75rem`)
- `--devdocsai-button-icon-size`-(Default: `: 1rem`)

## Authors

This library is created by the team behind [DevDocs.ai](https://devdocs.ai)
([DevDocs.work](https://devdocs.work)). [DevDocs.work](https://devdocs.work) also provides technical writing, software development, custom AI, design, and other consulting services.

## License

[MIT](./LICENSE) © [DevDocs.ai](https://devdocs.ai)
