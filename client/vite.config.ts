import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // only imported lazily (an SVG upload, the inner pages' forms): pre-bundle them, or the dev
  // server would discover them mid-session and reload the page, losing the visitor's design
  optimizeDeps: {
    include: ['dompurify', 'react-hook-form', '@hookform/resolvers/zod', 'zod'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
