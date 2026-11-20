import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteDevApiPlugin } from './vite-dev-api';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteDevApiPlugin()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    host: true,
  },
});

