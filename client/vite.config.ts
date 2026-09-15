import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const outDir = resolve(__dirname, 'dist');

export default defineConfig({
  build: {
    outDir,
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/umbraco-package.ts'),
      formats: ['es'],
      fileName: () => 'our-personal-appearance.js',
    },
    sourcemap: true,
    target: 'es2022',
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
  },
});
