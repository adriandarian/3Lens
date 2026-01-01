import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3022,
  },
  build: {
    target: 'esnext',
  },
});
