import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '3LensUIWeb',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@3lens/ui-core', '@3lens/runtime'],
      output: {
        globals: {
          '@3lens/ui-core': 'ThreeLensUICore',
          '@3lens/runtime': 'ThreeLensRuntime',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
});
