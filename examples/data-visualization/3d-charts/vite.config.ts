import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3024,
  },
  build: {
    target: 'esnext',
  },
});
