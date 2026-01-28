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
      external: [
        '@3lens/runtime',
        '@3lens/ui-core',
        'svelte',
        'svelte/store',
      ],
    },
    sourcemap: true,
    minify: false,
  },
});
