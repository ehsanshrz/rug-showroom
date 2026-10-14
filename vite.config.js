import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/rug-showroom/' : '/',
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
  },
});
