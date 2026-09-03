/**
 * Rewrites the built site in dist/ to live under a URL prefix.
 *
 *   node scripts/apply-base.mjs /TFM
 *
 * Why: the site is built for a domain root (tfm-us.com), so every internal
 * URL is root-absolute — /about/, /_astro/x.webp, /fonts/y.woff2. GitHub
 * Pages serves a project site under /<repo>/, where all of those would 404.
 * Rather than thread a base path through every component for the sake of a
 * demo host, the finished output is rewritten in place.
 *
 * Also stamps <meta name="robots" content="noindex"> into every page: the
 * demo must never compete with the real tfm-us.com in search results.
 *
 * Production deploys to a real domain never run this script.
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = (process.argv[2] ?? '').replace(/\/$/, '');
if (!base.startsWith('/')) {
  console.error('Usage: node scripts/apply-base.mjs /<prefix>');
  process.exit(1);
}

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Prefix one URL if it is site-root-absolute (not //host or a scheme). */
const prefix = (url) => (url.startsWith('/') && !url.startsWith('//') ? base + url : url);

let htmlCount = 0;
let cssCount = 0;

for (const file of walk(dist)) {
  const ext = extname(file).toLowerCase();

  if (ext === '.html' || ext === '.xml' || ext === '.txt' || ext === '.webmanifest') {
    let s = readFileSync(file, 'utf8');

    // Attribute URLs: href/src/content/action/poster/data.
    s = s.replace(
      /\b(href|src|content|action|poster)="(\/[^"/][^"]*|\/)"/g,
      (_, attr, url) => `${attr}="${prefix(url)}"`
    );

    // srcset: comma-separated "url descriptor" pairs.
    s = s.replace(/\bsrcset="([^"]+)"/g, (_, list) => {
      const rewritten = list
        .split(',')
        .map((part) => {
          const [url, ...desc] = part.trim().split(/\s+/);
          return [prefix(url), ...desc].join(' ');
        })
        .join(', ');
      return `srcset="${rewritten}"`;
    });

    // CSS url() inside inline <style> blocks and style attributes.
    s = s.replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (_, quote, url) => `url(${quote}${prefix(url)}${quote})`);

    if (ext === '.html' && !s.includes('name="robots"')) {
      s = s.replace('<head>', '<head><meta name="robots" content="noindex">');
    }

    // The manifest and sitemap carry plain string URLs.
    if (ext === '.webmanifest') {
      s = s.replace(/"(\/[^"]+)"/g, (_, url) => `"${prefix(url)}"`);
    }

    writeFileSync(file, s);
    htmlCount++;
  }

  if (ext === '.css') {
    let s = readFileSync(file, 'utf8');
    s = s.replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (_, quote, url) => `url(${quote}${prefix(url)}${quote})`);
    writeFileSync(file, s);
    cssCount++;
  }
}

console.log(`Rewrote ${htmlCount} document(s) and ${cssCount} stylesheet(s) for base "${base}", all pages noindex.`);
