import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '/.netlify': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist'
  }
});