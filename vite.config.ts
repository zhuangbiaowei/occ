import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ _mode }) => ({
  plugins: [react()],
  server: {
    allowedHosts: true,
    hmr: {
      path: '/ws',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
}));
