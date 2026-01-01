import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3032,
    open: true,
  },
  build: {
    sourcemap: true,
  },
});
