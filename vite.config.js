import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Food-Management/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
