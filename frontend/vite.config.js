import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 1337,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});