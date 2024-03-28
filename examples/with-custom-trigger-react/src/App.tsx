import '@devdocsai/css';

import { DevDocsAI, openDevDocsAI } from '@devdocsai/react';
import React, { ReactElement } from 'react';

import styles from './App.module.css';

function App(): ReactElement {
  return (
    <div className={styles.app}>
      <div className={styles.centered}>
        <p>Open the DevDocs.ai dialog ⬇️</p>
        <DevDocsAI
          projectKey={import.meta.env.VITE_PROJECT_API_KEY}
          trigger={{ customElement: true }}
        />
        <button className={styles.customTrigger} onClick={openDevDocsAI}>
          Open DevDocs.ai
        </button>
      </div>
    </div>
  );
}

export default App;
