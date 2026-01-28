import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@3lens/kernel', '@3lens/runtime', 'three'],
    },
    sourcemap: true,
    minify: false,
  },
});
