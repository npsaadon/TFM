// @ts-check
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { tailwindCandidatesPlugin } from './scripts/tailwind-candidates.mjs';

const root = dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://tfm-us.com',
  output: 'static',
  trailingSlash: 'always',

  integrations: [sitemap()],

  build: {
    // Emit `about/index.html` so URLs stay `/about/` — matches the WordPress
    // URLs exactly, so existing inbound links and search rankings survive.
    format: 'directory',
    inlineStylesheets: 'auto',
  },

  image: {
    // Every image is local and imported, so no remote patterns are allowed.
    // This is deliberate: it means a compromised third party can never inject
    // an image URL that we would optimize and serve from our own origin.
    domains: [],
    remotePatterns: [],
  },

  vite: {
    // The candidate generator must run before Tailwind reads the CSS.
    plugins: [tailwindCandidatesPlugin(root), tailwindcss()],
    build: {
      cssMinify: 'lightningcss',
    },
  },

  devToolbar: { enabled: false },
});
