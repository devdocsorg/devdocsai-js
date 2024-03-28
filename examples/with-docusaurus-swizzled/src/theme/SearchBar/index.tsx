/* eslint-disable @typescript-eslint/no-explicit-any */
import '@devdocsai/css';

import type { WrapperProps } from '@docusaurus/types';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { type DevDocsAIConfig } from '@devdocsai/docusaurus-theme-search';
import type SearchBarType from '@theme/SearchBar';
import SearchBar from '@theme-original/SearchBar';
import React, { Suspense, lazy } from 'react';

// import DevDocs.ai lazily as Docusaurus does not currently support ESM
const DevDocsAI = lazy(() => {
  return import('@devdocsai/react').then((mod) => ({
    default: mod.DevDocsAI,
  }));
});

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
