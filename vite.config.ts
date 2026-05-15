import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { createHtmlPlugin } from 'vite-plugin-html';
import json from "./package.json";
import dayjs from "dayjs"

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
    }),
    glsl()
  ],
  define: {
    VERSION_NAME: JSON.stringify(json.version),
    BUILD_TIME: JSON.stringify(dayjs().format(`YYYY-MM-DD HH:mm:ss`)),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    watch: {
      ignored: [
        './.vscode/**', './temp/**', './art/**', './docs/**', './lf2s/**',
        './server/**', './script/**', './release/**'
      ]
    }
  }
})
