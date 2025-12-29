import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '3LensReactBridge',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'three', '@react-three/fiber', '@3lens/core'],
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'jsxRuntime',
          three: 'THREE',
          '@react-three/fiber': 'ReactThreeFiber',
          '@3lens/core': 'ThreeLensCore',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
});

