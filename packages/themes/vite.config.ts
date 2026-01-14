import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

const isWatch = process.argv.includes('--watch');

// Plugin to copy CSS files to dist
const copyCSSPlugin = () => {
  return {
    name: 'copy-css',
    writeBundle() {
      const distDir = resolve(__dirname, 'dist');
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
      }
      
      const cssFiles = [
        'styles.css',
        'theme-dark.css',
        'theme-light.css',
        'theme-high-contrast.css',
        'base.css',
      ];
      
      cssFiles.forEach((file) => {
        const src = resolve(__dirname, 'src', file);
        const dest = resolve(distDir, file);
        if (existsSync(src)) {
          copyFileSync(src, dest);
        }
      });
    },
  };
};

export default defineConfig({
  plugins: [
    !isWatch && dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    }),
    copyCSSPlugin(),
  ].filter(Boolean),
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    cssCodeSplit: false,
    sourcemap: true,
    minify: false,
  },
});
