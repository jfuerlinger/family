import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        // next-intl's createNavigation needs Vite transform in tests
        // https://github.com/vercel/next.js/issues/77200
        inline: ['next-intl'],
      },
    },
  },
});
