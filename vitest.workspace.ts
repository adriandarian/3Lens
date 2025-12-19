import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'core',
      root: './packages/core',
      include: ['src/**/*.{test,spec}.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'overlay',
      root: './packages/overlay',
      include: ['src/**/*.{test,spec}.ts'],
    },
  },
]);


