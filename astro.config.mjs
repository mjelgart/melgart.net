import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://melgart.net',
  trailingSlash: 'ignore',
  integrations: [react()],
  // Fonts are downloaded at build time and served from the site, so no
  // visitor request reaches Google. Astro also derives fallback metrics from
  // the real faces, which keeps the swap from shifting layout.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Literata',
      cssVariable: '--font-body',
      weights: ['375 700'],
      styles: ['normal', 'italic'],
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Source Code Pro',
      cssVariable: '--font-mono',
      weights: [400, 600],
      fallbacks: ['ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
  ],
  markdown: {
    // Default is github-dark, which stamps an inline dark background on every
    // code block. `css-variables` defers the colours to --astro-code-* in global.css, so fenced code
    // follows the theme toggle.
    shikiConfig: { theme: 'css-variables' },
  },
});
