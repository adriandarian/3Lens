import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        bin: resolve(__dirname, 'src/bin.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@3lens/kernel',
        '@3lens/runtime',
        'node:fs',
        'node:path',
        'node:crypto',
      ],
    },
    sourcemap: true,
    minify: false,
  },
});
