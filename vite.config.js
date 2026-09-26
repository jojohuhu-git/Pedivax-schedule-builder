import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base is set for GitHub Pages deployment under /Pedivax-schedule-builder/
// (must match the GitHub repo name exactly — Pages paths are case-sensitive).
// All public asset paths MUST use import.meta.env.BASE_URL.
export default defineConfig({
  base: '/Pedivax-schedule-builder/',
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5187,
  },
  test: {
    // The app speaks in ages only — no calendar dates anywhere — so there is
    // no real-clock dependency to fake. Logic tests run in node; UI rendering
    // tests opt into happy-dom per file with `// @vitest-environment happy-dom`.
    environment: 'node',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
  },
});
