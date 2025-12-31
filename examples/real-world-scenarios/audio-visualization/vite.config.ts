import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@3lens/core': path.resolve(__dirname, '../../../packages/core/src/index.ts'),
      '@3lens/overlay': path.resolve(__dirname, '../../../packages/overlay/src/index.ts'),
    },
  },
  server: {
    port: 3015,
    open: true,
  },
});
