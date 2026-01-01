import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3031,
    open: true,
  },
  build: {
    sourcemap: true,
  },
});
