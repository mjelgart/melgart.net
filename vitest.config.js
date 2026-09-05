import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      // Astro's content API is a virtual module that only exists during a
      // build. Unit tests reach site modules that import it, so point it at a
      // stub; the parts worth unit testing don't call into it.
      'astro:content': fileURLToPath(new URL('./tests/stubs/astro-content.js', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    css: false,
  },
});
