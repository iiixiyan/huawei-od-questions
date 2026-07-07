import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['antd'],
          markdown: ['react-markdown', 'remark-gfm'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
});
