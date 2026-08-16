import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/portfolio/',
  server: { port: 3002, open: '/portfolio/', host: true },
});
