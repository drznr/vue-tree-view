/// <reference types="vitest" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';
import checker from 'vite-plugin-checker';

export default defineConfig({
  test: {
    globals: true,
  },
  plugins: [vue(), eslint(), checker({ vueTsc: true })],
});
