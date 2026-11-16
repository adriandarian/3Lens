import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const source = (path: string) => fileURLToPath(new URL(`./packages/${path}/src/index.ts`, import.meta.url));

export default defineConfig({
  plugins: [{
    name: 'angular-test-decorator-metadata',
    enforce: 'pre',
    transform(code, id) {
      // Angular's JIT injector needs constructor metadata that esbuild does not emit.
      if (!id.includes('/packages/mounts/angular/src/') || !id.endsWith('.ts')) return;
      const { outputText, sourceMapText } = ts.transpileModule(code, {
        fileName: id,
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          sourceMap: true,
        },
      });
      return { code: outputText, map: sourceMapText };
    },
  }],
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


