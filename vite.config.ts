/// <reference types="vitest" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';
import checker from 'vite-plugin-checker';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      exclude: [...(configDefaults.coverage.exclude as string[]), '**/__mocks__/**', '**/types.ts/**'],
    },
  },
  plugins: [vue(), eslint(), checker({ vueTsc: true })],
});
