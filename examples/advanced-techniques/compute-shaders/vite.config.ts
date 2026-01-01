import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3029,
    open: true,
  },
  build: {
    sourcemap: true,
  },
});
