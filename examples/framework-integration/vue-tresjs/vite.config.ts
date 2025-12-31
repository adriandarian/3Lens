import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
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

