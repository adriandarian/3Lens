import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    }),
  ],
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

