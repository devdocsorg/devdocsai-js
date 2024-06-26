import * as esbuild from 'esbuild';

import { config } from './config.js';

const ctx = await esbuild.context({
  ...config,
  jsxDev: true,
  minify: false,
  external: ['@devdocsai/core'],
});

await ctx.watch();
