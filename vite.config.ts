/// <reference types="vitest" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';
import checker from 'vite-plugin-checker';
import { configDefaults } from 'vitest/config';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TreeView',
      fileName: 'tree-view',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve(__dirname, 'vitest.setup.ts'),
    coverage: {
      provider: 'v8',
      exclude: [
        ...(configDefaults.coverage.exclude as string[]),
        '**/__mocks__/**',
        '**/types.ts/**',
        '**/*.stories.*/**',
      ],
    },
  },
  plugins: [
    vue(),
    eslint({ exclude: ['/virtual:/**', '**/node_modules/**', '/sb-preview/'] }),
    checker({ vueTsc: true }),
    dts(),
  ],
});
