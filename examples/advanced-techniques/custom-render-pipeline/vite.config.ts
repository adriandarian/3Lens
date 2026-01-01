import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3028,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
