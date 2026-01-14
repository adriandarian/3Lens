import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    alias: {
      '@3lens/core': resolve(__dirname, '../../../packages/core/src/index.ts'),
      '@3lens/overlay': resolve(__dirname, '../../../packages/overlay/src/index.ts'),
      '@3lens/ui': resolve(__dirname, '../../../packages/ui/src/index.ts'),
      '@3lens/react-bridge': resolve(__dirname, '../../../packages/react-bridge/src/index.ts'),
      '@3lens/themes': resolve(__dirname, '../../../packages/themes/dist'),
    },
  },
  plugins: [react()],
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
});

