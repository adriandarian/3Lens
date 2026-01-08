import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

const isWatch = process.argv.includes('--watch');

export default defineConfig({
  plugins: [
    // Only generate declarations on full build, not in watch mode
    // This avoids race condition errors when workspace dependencies
    // haven't finished building yet
    !isWatch && dts(),
  ].filter(Boolean),
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@3lens/core'],
    },
    sourcemap: true,
    minify: false,
  },
});
