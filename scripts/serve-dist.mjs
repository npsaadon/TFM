/**
 * Minimal static file server for `dist/`, used by the Playwright suite.
 *
 * `astro preview` runs as a detached daemon and returns immediately, which
 * Playwright's `webServer` reads as the process having crashed. This stays in
 * the foreground.
 *
 * It also mirrors how a real static host resolves URLs, so the tests exercise
 * the same routing visitors will get:
 *   - `/about/`  -> `dist/about/index.html`
 *   - `/about`   -> 301 to `/about/`   (trailingSlash: 'always')
 *   - anything unmatched -> `dist/404.html` with a real 404 status
 *   - headers from `public/_headers` are applied to every response
 *
 * Usage: node scripts/serve-dist.mjs [--port 4321] [--dir dist]
 */

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, readFileSync } from 'node:fs';
import { join, extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const readArg = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const port = Number(readArg('--port', '4321'));
const dist = resolve(root, readArg('--dir', 'dist'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

/**
 * Parse the `/*` block of public/_headers so the security headers under test
 * are the same ones that will be deployed, rather than a second copy that can
 * drift out of sync.
 */
function loadGlobalHeaders() {
  const file = join(root, 'public', '_headers');
  if (!existsSync(file)) return {};
  const headers = {};
  let inGlobal = false;
  for (const rawLine of readFileSync(file, 'utf8').split('\n')) {
    const line = rawLine.trimEnd();
    if (!line || line.trimStart().startsWith('#')) continue;
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      inGlobal = line.trim() === '/*';
      continue;
    }
    if (!inGlobal) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return headers;
}

const globalHeaders = loadGlobalHeaders();

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { ...globalHeaders, ...headers });
  res.end(body);
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  // Block traversal before touching the filesystem.
  const pathname = normalize(decodeURIComponent(url.pathname)).replace(/\\/g, '/');
  if (pathname.includes('..')) return send(res, 400, 'Bad request');

  const candidate = resolve(dist, '.' + pathname);
  if (!candidate.startsWith(dist)) return send(res, 403, 'Forbidden');

  // Directory-style URL -> its index.html
  if (pathname.endsWith('/')) {
    const index = join(candidate, 'index.html');
    if (existsSync(index)) return stream(res, index);
  } else if (existsSync(candidate) && statSync(candidate).isFile()) {
    return stream(res, candidate);
  } else if (existsSync(join(dist, '.' + pathname, 'index.html'))) {
    // Extensionless URL that maps to a directory: redirect to the canonical
    // trailing-slash form, matching `trailingSlash: 'always'`.
    return send(res, 301, '', { Location: pathname + '/' });
  }

  const notFound = join(dist, '404.html');
  if (existsSync(notFound)) {
    const body = readFileSync(notFound);
    return send(res, 404, body, { 'Content-Type': MIME['.html'] });
  }
  return send(res, 404, 'Not found');
});

function stream(res, file) {
  const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, { ...globalHeaders, 'Content-Type': type });
  createReadStream(file).pipe(res);
}

server.listen(port, () => {
  console.log(`Serving ${dist} at http://localhost:${port}`);
});
