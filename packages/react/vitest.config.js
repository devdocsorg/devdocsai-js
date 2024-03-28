import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@devdocsai/core': '../core/src/index',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    reporters: ['default', 'hanging-process'],
  },
});
