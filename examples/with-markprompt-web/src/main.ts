import '@devdocsai/css';
import './style.css';

import { devdocsai, type DevDocsAIOptions } from '@devdocsai/web';

const el = document.querySelector('#devdocsai');

if (el && el instanceof HTMLElement) {
  devdocsai(import.meta.env.VITE_PROJECT_API_KEY, el, {
    feedback: { enabled: true },
    search: { enabled: true },
    chat: {
      enabled: true,
      apiUrl: `${import.meta.env.VITE_DEVDOCSAI_API_URL}/v1/chat`,
      defaultView: {
        message:
          "Welcome to DevDocs.ai! We're here to assist you. Just type your question to get started.",
        promptsHeading: 'Popular questions',
        prompts: [
          'What is DevDocs.ai?',
          'How do I setup the React component?',
          'Do you have a REST API?',
        ],
      },
    },
    defaultView: 'chat',
    trigger: {
      buttonLabel: 'Ask AI',
    },
  } satisfies DevDocsAIOptions);
}
