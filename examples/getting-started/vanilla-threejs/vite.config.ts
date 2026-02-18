import { defineConfig } from 'vite';
import { resolve } from 'path';

// Root of the monorepo (three levels up from this example)
const root = resolve(__dirname, '../../..');
const pkg = (rel: string) => resolve(root, 'packages', rel, 'src/index.ts');

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    dedupe: ['three'],
    // Point all @3lens/* imports directly at their TypeScript source.
    // This avoids the dist files (which still contain bare @3lens/* imports
    // that Vite can't resolve transitively through aliases).
    alias: {
      '@3lens/kernel':          pkg('core/kernel'),
      '@3lens/runtime':         pkg('core/runtime'),
      '@3lens/devtools':        pkg('core/devtools'),
      '@3lens/ui-core':         pkg('ui/core'),
      '@3lens/ui-web':          pkg('ui/web'),
      '@3lens/host-manual':     pkg('hosts/manual'),
      '@3lens/host-r3f':        pkg('hosts/r3f'),
      '@3lens/host-tres':       pkg('hosts/tres'),
      '@3lens/host-worker':     pkg('hosts/worker'),
      '@3lens/addon-inspector': pkg('addons/inspector'),
      '@3lens/addon-perf':      pkg('addons/perf'),
      '@3lens/addon-memory':    pkg('addons/memory'),
      '@3lens/addon-diff':      pkg('addons/diff'),
      '@3lens/addon-shader':    pkg('addons/shader'),
    },
  },
});
