import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  cacheDir: '.vite-layered-rain',
  // GitHub Pages needs /portfolio/; local dev uses / so http://localhost:3002/ works.
  base: command === 'serve' ? '/' : '/portfolio/',
  server: { port: 3002, open: true, host: true },
}));
