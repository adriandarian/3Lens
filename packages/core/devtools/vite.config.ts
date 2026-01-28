import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        bootstrap: resolve(__dirname, 'src/bootstrap.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@3lens/kernel',
        '@3lens/runtime',
        '@3lens/host-manual',
        '@3lens/addon-inspector',
        '@3lens/addon-perf',
        '@3lens/addon-memory',
        '@3lens/addon-diff',
        '@3lens/addon-shader',
        '@3lens/ui-core',
        'three',
      ],
    },
    sourcemap: true,
    minify: false,
  },
});
