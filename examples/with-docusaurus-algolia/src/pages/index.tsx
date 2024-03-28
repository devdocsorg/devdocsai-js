import Layout from '@theme/Layout';
import React, { ReactElement } from 'react';

import styles from './index.module.css';

export default function Home(): ReactElement {
  return (
    <Layout description="A demo showing DevDocs.ai + Algolia in Docusaurus">
      <main className={styles.main}>
        <h1>DevDocs.ai + Algolia demo</h1>
        <p>
          This is the demo of the{' '}
          <code>@devdocsai/docusaurus-theme-search</code> plugin.
        </p>
        <p>Click the button at the bottom right to open DevDocs.ai.</p>
      </main>
    </Layout>
  );
}
