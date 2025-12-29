import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '3LensAngularBridge',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@angular/core',
        '@angular/common',
        'rxjs',
        'rxjs/operators',
        'three',
        '@3lens/core',
      ],
      output: {
        globals: {
          '@angular/core': 'ng.core',
          '@angular/common': 'ng.common',
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators',
          three: 'THREE',
          '@3lens/core': 'ThreeLensCore',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
});

