import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3013,
    open: true,
  },
  resolve: {
    alias: {
      '@3lens/core': resolve(__dirname, '../../../packages/core/src/index.ts'),
      '@3lens/overlay': resolve(__dirname, '../../../packages/overlay/src/index.ts'),
      '@3lens/ui': resolve(__dirname, '../../../packages/ui/src/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['three'],
  },
  // Allow importing .glsl files as strings
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],
});

