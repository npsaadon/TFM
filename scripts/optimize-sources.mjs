/**
 * Downscales oversized source images in src/assets/images, in place.
 *
 * Why: several sources arrived at print resolution — the hero photograph is
 * 5824px wide, others 4800–5600px — while nothing on the site renders wider
 * than 1920 CSS pixels (2560 device pixels at 2x). Oversized sources cost
 * nothing visually but make every dev-server image request and every build
 * transform decode megapixels that are immediately thrown away, which is why
 * images feel slow in `npm run dev`.
 *
 * Safe to re-run any time — files already at or under the cap are untouched.
 * Originals are re-downloadable from the live site's media library
 * (tfm-us.com/wp-content/uploads/2025/04/) if full resolution is ever needed.
 */

import { readdirSync, statSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/assets/images');

/** Widest rendition anything requests is 2560 (the hero's 2x slot). */
const MAX_WIDTH = 2560;

const HANDLED = new Set(['.jpg', '.jpeg', '.png']);

let saved = 0;
let touched = 0;

for (const file of readdirSync(dir)) {
  const ext = extname(file).toLowerCase();
  if (!HANDLED.has(ext)) continue; // avifs are already small; svgs are vectors

  const path = join(dir, file);
  const before = statSync(path).size;
  const meta = await sharp(path).metadata();
  if (!meta.width || meta.width <= MAX_WIDTH) continue;

  const image = sharp(path).resize({ width: MAX_WIDTH, withoutEnlargement: true });
  const buffer =
    ext === '.png'
      ? await image.png({ compressionLevel: 9 }).toBuffer()
      : await image.jpeg({ quality: 85, mozjpeg: true }).toBuffer();

  if (buffer.length >= before) {
    console.log(`  KEPT ${file}: recompression would grow it`);
    continue;
  }
  await sharp(buffer).metadata(); // decode-validate the result before overwriting
  // Direct overwrite fails on this machine when any process has the file open
  // (dev server, endpoint protection). Writing a sibling then swapping renames
  // works even then. Skip the file rather than abort if the swap is refused.
  try {
    const tmp = path + '.optim';
    writeFileSync(tmp, buffer);
    rmSync(path);
    renameSync(tmp, path);
  } catch (error) {
    console.log(`  SKIPPED ${file}: ${error.code ?? error.message}`);
    continue;
  }
  const after = statSync(path).size;
  touched++;
  saved += before - after;
  console.log(
    `  ${file.padEnd(52)} ${meta.width}px -> ${MAX_WIDTH}px  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`
  );
}

console.log(`\n${touched} file(s) downscaled, ${(saved / 1024 / 1024).toFixed(1)} MB removed from sources.`);
