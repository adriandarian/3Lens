import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const source = (path: string) => fileURLToPath(new URL(`./packages/${path}/src/index.ts`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@3lens/kernel': source('core/kernel'),
      '@3lens/runtime': source('core/runtime'),
      '@3lens/devtools': source('core/devtools'),
      '@3lens/host-manual': source('hosts/manual'),
      '@3lens/ui-core': source('ui/core'),
      '@3lens/ui-web': source('ui/web'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/src/**/*.{test,spec}.{ts,tsx}', 'tests/contracts/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/**/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/*.bench.ts', '**/index.ts'],
    },
    passWithNoTests: true,
  },
});


