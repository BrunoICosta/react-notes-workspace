import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// The live demo is served from /react-notes-workspace/ (`npm run build:cf` passes --base);
// local dev, preview and the plain build use the root.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    restoreMocks: true,
  },
});
