import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3023,
  },
  build: {
    target: 'esnext',
  },
});
