import '@devdocsai/css';
import './style.css';
import { devdocsai, openDevDocsAI } from '@devdocsai/web';

import styles from './main.module.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class=${styles.centered}>
    <p>Open the DevDocs.ai dialog ⬇️</p>
    <button id="devdocsai-trigger" class=${styles.customTrigger}>
      Open DevDocs.ai
    </button>
    <div id="devdocsai"></div>
  </div>
`;

const el = document.querySelector('#devdocsai');

if (el instanceof HTMLElement) {
  devdocsai(import.meta.env.VITE_PROJECT_API_KEY, el, {
    trigger: { customElement: true },
    search: { enabled: false },
  });
}

const trigger = document.querySelector<HTMLButtonElement>('#devdocsai-trigger');

if (trigger) {
  trigger.addEventListener('click', () => {
    openDevDocsAI();
  });
}
