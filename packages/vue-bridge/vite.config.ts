import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '3LensVueBridge',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'three', '@tresjs/core', '@3lens/core'],
      output: {
        globals: {
          vue: 'Vue',
          three: 'THREE',
          '@tresjs/core': 'TresJS',
          '@3lens/core': 'ThreeLensCore',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
});

