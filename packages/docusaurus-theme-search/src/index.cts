// @ts-expect-error TypeScript doesn’t allow us to import types from an ESM
// file in a CJS file. Apart from that, TypeScript does recognize the type.
import type { DevDocsAIProps } from '@devdocsai/react';
import { type PluginModule } from '@docusaurus/types';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace themeSearchDevDocsAI {
  export type DevDocsAIConfig = DevDocsAIProps;

  export interface ThemeConfig {
    devdocsai?: DevDocsAIConfig;
  }
}

// eslint-disable-next-line no-redeclare
const themeSearchDevDocsAI: PluginModule = () => ({
  name: '@devdocsai/docusaurus-theme-search',
  getThemePath: () => '../dist/theme',
  getTypeScriptThemePath: () => '../src/theme',
  getSwizzleComponentList: () => ['SearchBar'],
});

themeSearchDevDocsAI.validateThemeConfig = (data) => {
  return data.themeConfig;
};

export = themeSearchDevDocsAI;
