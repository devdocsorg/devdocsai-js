import '@devdocsai/css';
import './style.css';

import { devdocsaiChat } from '@devdocsai/web';

const root = document.getElementById('devdocsai-chat');

if (root) {
  devdocsaiChat(import.meta.env.VITE_DEVDOCSAI_PROJECT_KEY, root, {
    chatOptions: {
      apiUrl: import.meta.env.VITE_DEVDOCSAI_API_URL + '/v1/chat',
      history: true,
    },
  });
}
