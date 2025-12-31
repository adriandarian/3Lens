import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'three': 'three'
    }
  },
  optimizeDeps: {
    include: ['three']
  },
  build: {
    target: 'esnext'
  }
});
