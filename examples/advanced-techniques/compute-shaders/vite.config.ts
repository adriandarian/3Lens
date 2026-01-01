import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3029,
    open: true,
  },
  resolve: {
    alias: {
      '@3lens/core': resolve(__dirname, '../../../packages/core/src/index.ts'),
      '@3lens/overlay': resolve(__dirname, '../../../packages/overlay/src/index.ts'),
    },
  },
  build: {
    sourcemap: true,
  },
});
