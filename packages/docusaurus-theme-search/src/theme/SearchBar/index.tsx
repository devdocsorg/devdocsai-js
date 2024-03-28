import '@devdocsai/css';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  DevDocsAI,
  type DevDocsAIProps,
  openDevDocsAI,
} from '@devdocsai/react';
import React, { useEffect, type ReactElement, useState } from 'react';

export default function SearchBar(): ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [devdocsaiExtras, setDevDocsAIExtras] = useState<any>({});
  const { siteConfig } = useDocusaurusContext();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDevDocsAIExtras((window as any).devdocsaiConfigExtras || {});
  }, []);

  const devdocsaiConfigProps = siteConfig.themeConfig
    .devdocsai as DevDocsAIProps;
  const devdocsaiProps = {
    ...devdocsaiConfigProps,
    references: {
      ...devdocsaiConfigProps.references,
      ...devdocsaiExtras.references,
    },
    search: {
      ...devdocsaiConfigProps.search,
      ...devdocsaiExtras.search,
    },
  };

  if (devdocsaiProps.trigger?.floating) {
    return <DevDocsAI {...devdocsaiProps} />;
  } else {
    return (
      <>
        <div id="devdocsai" />
        <div className="navbar__search" key="search-box">
          <span
            aria-label="expand searchbar"
            role="button"
            className="search-icon"
            onClick={openDevDocsAI}
            tabIndex={0}
          />
          <input
            id="search_input_react"
            type="search"
            placeholder={
              devdocsaiProps.trigger?.placeholder || 'Search or ask'
            }
            aria-label={devdocsaiProps.trigger?.label || 'Search or ask'}
            className="navbar__search-input search-bar"
            onClick={openDevDocsAI}
          />
          <DevDocsAI
            {...devdocsaiProps}
            trigger={{
              ...devdocsaiProps.trigger,
              customElement: true,
            }}
          />
        </div>
      </>
    );
  }
}
