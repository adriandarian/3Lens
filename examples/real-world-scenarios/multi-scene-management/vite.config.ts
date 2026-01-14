import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@3lens/core': path.resolve(__dirname, '../../../packages/core/src/index.ts'),
      '@3lens/overlay': path.resolve(__dirname, '../../../packages/overlay/src/index.ts'),
      '@3lens/themes': path.resolve(__dirname, '../../../packages/themes/dist'),
    },
  },
  server: {
    port: 3013,
    open: true,
  },
});
