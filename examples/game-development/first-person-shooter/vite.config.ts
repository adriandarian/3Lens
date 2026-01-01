import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3020,
    open: true,
  },
  resolve: {
    alias: {
      '@3lens/core': resolve(__dirname, '../../../packages/core/src/index.ts'),
      '@3lens/overlay': resolve(__dirname, '../../../packages/overlay/src/index.ts'),
      '@3lens/ui': resolve(__dirname, '../../../packages/ui/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
  },
});
