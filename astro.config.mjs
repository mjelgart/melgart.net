import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://melgart.net',
  trailingSlash: 'ignore',
  integrations: [react()],
});