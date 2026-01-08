import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

const isWatch = process.argv.includes('--watch');

export default defineConfig({
  plugins: [
    // Only generate declarations on full build, not in watch mode
    // This avoids race condition errors when workspace dependencies
    // haven't finished building yet
    !isWatch && dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    }),
  ].filter(Boolean),
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

