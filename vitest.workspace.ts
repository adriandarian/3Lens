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
  {
    extends: './vitest.config.ts',
    test: {
      name: 'ui',
      root: './packages/ui',
      include: ['src/**/*.{test,spec}.ts'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'react-bridge',
      root: './packages/react-bridge',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      environment: 'jsdom',
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'vue-bridge',
      root: './packages/vue-bridge',
      include: ['src/**/*.{test,spec}.ts'],
      environment: 'jsdom',
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'angular-bridge',
      root: './packages/angular-bridge',
      include: ['src/**/*.{test,spec}.ts'],
    },
  },
]);


