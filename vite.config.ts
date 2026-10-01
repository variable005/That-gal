import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/danbooru': {
        target: 'https://danbooru.donmai.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/danbooru/, ''),
        headers: {
          'User-Agent': 'ThatGalArtDiscovery/1.0',
        },
      },
      '/api/testbooru': {
        target: 'https://testbooru.donmai.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/testbooru/, ''),
      },
      '/api/safebooru': {
        target: 'https://safebooru.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/safebooru/, ''),
      },
    },
  },
});
