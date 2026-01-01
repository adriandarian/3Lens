import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3027,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
