import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import json from "./package.json"

export default defineConfig({
  base: './',
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          title: `Little Fighter Wemake v${json.version}`
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  }
})
