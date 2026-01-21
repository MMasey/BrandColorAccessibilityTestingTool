import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages deployment
  // Set to '/' for local development, '/BrandColorAccessibilityTestingTool/' for production
  base: process.env.NODE_ENV === 'production'
    ? '/BrandColorAccessibilityTestingTool/'
    : '/',

  build: {
    target: 'esnext',
  },

  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
});
