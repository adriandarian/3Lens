import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  resolve: {
    alias: {
      '@3lens/core': resolve(__dirname, '../../../packages/core/src/index.ts'),
      '@3lens/overlay': resolve(__dirname, '../../../packages/overlay/src/index.ts'),
    },
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // TresJS uses custom elements
          isCustomElement: (tag) => tag.startsWith('Tres') || tag.startsWith('tres'),
        },
      },
    }),
  ],
  optimizeDeps: {
    include: ['three', '@tresjs/core'],
  },
});

