import type { DevDocsAIOptions } from '@devdocsai/react';

import { devdocsai } from './index.js';

declare global {
  interface Window {
    devdocsai?: {
      projectKey: string;
      container?: HTMLElement | string;
      options?: DevDocsAIOptions;
    };
  }
}

if (!window.devdocsai) {
  throw new Error(
    'DevDocsAI configuration not found on window. See: https://devdocs.ai/docs#script-tag',
  );
}

let { container } = window.devdocsai;

if (!container) {
  container = document.createElement('div');
  container.id = 'devdocsai';
  document.body.appendChild(container);
}

const { projectKey, options } = window.devdocsai;

if (!projectKey) {
  throw new Error(
    'DevDocs.ai project key not found on window. Find your project key in the project settings on https://devdocs.ai/',
  );
}

devdocsai(projectKey, container, options);

export {};
