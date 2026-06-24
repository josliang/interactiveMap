import path from 'path';
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  base: '/tar-im/', // 在根目录部署时修改为'./'
  publicDir: './src/assets',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'package.json': path.resolve(__dirname, 'package.json'),
    },
  },
  plugins: [
    react(),
    eslintPlugin({
      include: [
        './src/**/*.ts',
        './src/**/*.tsx',
      ],
      fix: true,
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, './dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].css',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // 后端 API 代理
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      // WebSocket 代理
      '/ws': {
        target: 'ws://localhost:8001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
