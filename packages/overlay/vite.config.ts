import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '3LensOverlay',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['three', '@3lens/core'],
      output: {
        globals: {
          three: 'THREE',
          '@3lens/core': 'ThreeLensCore',
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    minify: false,
  },
});

