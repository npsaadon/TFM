/**
 * Feeds Tailwind the list of utility classes this project uses.
 *
 * Why this exists
 * ---------------
 * Tailwind v4 finds classes with Oxide, a native Rust scanner. On this machine
 * the endpoint-protection agent blocks that binary, so we run Tailwind's
 * official `wasm32-wasi` build instead — and that build cannot read the disk:
 * its WASI sandbox is given a `C:\` preopen, but WASI addresses paths
 * POSIX-style, so on Windows no path ever resolves and the scanner reports
 * zero files. Tailwind then emits its base layer and no utilities at all,
 * which renders the site completely unstyled.
 *
 * Node has no such restriction. So we do the scan here and hand Tailwind the
 * result through `@source inline(...)`, which injects candidates directly and
 * never touches the scanner.
 *
 * This is a workaround for a blocked binary, not a permanent design. Once the
 * native scanner is allowed to load, delete this file, drop the plugin from
 * astro.config.mjs, and Tailwind's own scanning takes over with no other
 * changes.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const SCAN_EXTENSIONS = new Set(['.astro', '.ts', '.tsx', '.js', '.jsx', '.md', '.mdx', '.html']);
const OUTPUT_RELATIVE = 'src/styles/_candidates.css';

/**
 * Everything is split on whitespace and quote characters, then filtered.
 *
 * An earlier version only read tokens out of quoted string literals, which
 * seemed tidier and was quietly broken: a single apostrophe in ordinary prose
 * ("the page's opening whitespace", "doesn't exist") reads as an opening quote,
 * so the lexer swallows everything up to the next apostrophe — silently
 * dropping every class in between. That failure is invisible until a style goes
 * missing somewhere far away.
 *
 * Splitting on whitespace cannot desynchronise. It does pick up prose words
 * that happen to be real utilities ("block", "grid", "hidden"), which costs a
 * few hundred bytes of unused CSS; Tailwind discards every other token. That is
 * the right trade against losing styles without warning.
 */
/* No parentheses in this set: Tailwind class names legitimately contain them —
   `rounded-(--radius-card)`, `grid-cols-[minmax(0,22rem)_1fr]` — and splitting
   on them silently dropped every such utility from the generated CSS, which is
   how the contact page lost its two-column layout. */
const TOKEN_SEPARATORS = /[\s"'`{}<>=]+/;

/** SVG path and viewBox data tokenizes into thousands of junk fragments. */
const STRIP_ATTRIBUTES = /\s(?:d|viewBox|points|transform)\s*=\s*(?:"[^"]*"|'[^']*')/g;
const STRIP_COMMENTS = /\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|(^|\s)\/\/[^\n]*/g;

/**
 * A token is worth passing to Tailwind when it looks like a utility rather
 * than a sentence, a URL, or a file path.
 *
 * `{` `}` and backslashes are excluded because `@source inline()` performs
 * brace expansion on its argument — a stray brace would explode into garbage
 * candidates or fail to parse. Nothing in Tailwind's own syntax needs them.
 */
function isCandidate(token) {
  if (token.length < 2 || token.length > 80) return false;
  if (/[{}\\"`\s]/.test(token)) return false;
  if (token.includes('://')) return false;
  // Utilities start with a lowercase letter, an arbitrary-variant bracket, a
  // negative sign, or an important marker. Anything starting with a digit,
  // slash, dot or hash is a CSS value, a path, or an SVG coordinate.
  if (!/^[a-z[!-]/.test(token)) return false;
  return /[a-z]/.test(token);
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) walk(full, files);
    else if (SCAN_EXTENSIONS.has(extname(entry))) files.push(full);
  }
  return files;
}

/**
 * Scans `<root>/src` and writes the candidate stylesheet.
 * Returns the number of unique candidates found.
 */
export function generateCandidates(root) {
  const srcDir = join(root, 'src');
  if (!existsSync(srcDir)) return 0;

  const candidates = new Set();

  for (const file of walk(srcDir)) {
    const source = readFileSync(file, 'utf8')
      .replace(STRIP_COMMENTS, ' ')
      .replace(STRIP_ATTRIBUTES, ' ');

    for (const token of source.split(TOKEN_SEPARATORS)) {
      if (isCandidate(token)) candidates.add(token);
    }
  }

  const sorted = [...candidates].sort();
  const body = sorted.map((candidate) => `@source inline("${candidate}");`).join('\n');

  const output = `/* AUTO-GENERATED — do not edit. See scripts/tailwind-candidates.mjs.
 * ${sorted.length} candidates scanned from src/.
 * Regenerated automatically on dev start, on build, and whenever a source file
 * changes. Committed so that a clean checkout builds identically. */

${body}
`;

  const outputPath = join(root, OUTPUT_RELATIVE);
  const previous = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : '';
  // Only write when something actually changed — an unconditional write would
  // retrigger the watcher and loop.
  if (previous !== output) writeFileSync(outputPath, output);

  return sorted.length;
}

/**
 * Vite plugin wrapper. Regenerates before the build and whenever a scanned
 * file changes in dev.
 */
export function tailwindCandidatesPlugin(root) {
  return {
    name: 'tfm:tailwind-candidates',
    enforce: 'pre',
    buildStart() {
      generateCandidates(root);
    },
    configureServer() {
      generateCandidates(root);
    },
    handleHotUpdate({ file }) {
      if (SCAN_EXTENSIONS.has(extname(file)) && !relative(root, file).startsWith('_recon')) {
        generateCandidates(root);
      }
    },
  };
}
