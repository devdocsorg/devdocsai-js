import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

function verboseResolvePlugin(): Plugin {
  return {
    name: 'verbose-resolve', // name of the plugin
    resolveId(source) {
      // Since we are running the root of the project, the paths are incorrect for vite
      return `${process.cwd()}${source}`;
    },
  };
}

export default defineConfig({
  plugins: [verboseResolvePlugin()],
  resolve: {
    alias: {
      '@devdocsai/core': '/packages/core/src/index',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    reporters: ['default', 'hanging-process'],
  },
});
