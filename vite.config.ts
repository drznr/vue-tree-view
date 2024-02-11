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
    coverage: {
      provider: 'v8',
      exclude: [...(configDefaults.coverage.exclude as string[]), '**/__mocks__/**', '**/types.ts/**'],
    },
  },
  plugins: [vue(), eslint(), checker({ vueTsc: true }), dts()],
});
