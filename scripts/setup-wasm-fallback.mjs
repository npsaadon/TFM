/**
 * Installs the official WebAssembly builds of Astro's compiler and Tailwind's
 * Oxide engine into node_modules.
 *
 * npm refuses to install these normally: they declare `"cpu": ["wasm32"]`, so
 * npm's platform check rejects them on an x64 host. They are nonetheless the
 * upstream-published, upstream-supported fallback for exactly this case. We
 * stage them in a scratch tree with the check bypassed, verify no native
 * binaries came along, then copy them into place.
 *
 * Idempotent — safe to re-run. Skips all work when the native binaries load,
 * so this is a no-op on a machine without an endpoint agent in the way.
 *
 *   node scripts/setup-wasm-fallback.mjs [--force]
 */

import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');

/** Versions are pinned to the natively-installed ones so the ABI matches. */
function installedVersion(pkg) {
  const p = join(root, 'node_modules', pkg, 'package.json');
  if (!existsSync(p)) throw new Error(`${pkg} is not installed — run \`npm install\` first.`);
  return JSON.parse(readFileSync(p, 'utf8')).version;
}

/**
 * Whether the platform-native binaries actually load.
 *
 * Importing the wrapper package is not a valid test: napi-rs loaders fall back
 * to the WASM build automatically when it is present, so the import succeeds
 * either way and would report "native works" on a machine where it plainly
 * does not. The `.node` files are dlopen'd directly instead.
 */
function nativeWorks() {
  const binaries = [
    `@astrojs/compiler-binding-win32-x64-msvc/astro.win32-x64-msvc.node`,
    `@tailwindcss/oxide-win32-x64-msvc/tailwindcss-oxide.win32-x64-msvc.node`,
  ];

  for (const relative of binaries) {
    const full = join(root, 'node_modules', ...relative.split('/'));
    // A missing binary means a different platform, where this whole workaround
    // is irrelevant — treat that as "native is fine" and do nothing.
    if (!existsSync(full)) continue;
    try {
      process.dlopen({ exports: {} }, full);
    } catch (error) {
      // A napi module rejects a bare dlopen after loading successfully; only an
      // AV block reports the file itself as the problem.
      if (/virus|unwanted software/i.test(String(error?.message))) return false;
    }
  }
  return true;
}

if (!force && nativeWorks()) {
  console.log('✓ Native binaries load fine — no WASM fallback needed.');
  process.exit(0);
}

const compilerVersion = installedVersion('@astrojs/compiler-binding');
const oxideVersion = installedVersion('@tailwindcss/oxide');

const targets = [
  `@astrojs/compiler-binding-wasm32-wasi@${compilerVersion}`,
  `@tailwindcss/oxide-wasm32-wasi@${oxideVersion}`,
];

const stage = join(tmpdir(), 'tfm-wasm-stage');
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
writeFileSync(join(stage, 'package.json'), JSON.stringify({ name: 'stage', version: '1.0.0', private: true }));

console.log(`› Staging WASM builds:\n    ${targets.join('\n    ')}\n`);

// `--force` bypasses only the cpu/os gate. npm still verifies every tarball
// against the registry's published sha512 integrity, so authenticity is
// unaffected by this flag.
// Run npm's CLI entry point directly with the current Node binary. Spawning
// `npm.cmd` would need `shell: true` on Windows (Node blocks .cmd spawns since
// the CVE-2024-27980 fix), and passing arguments through a shell means they are
// concatenated rather than escaped. This avoids the shell altogether.
const npmCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
if (!existsSync(npmCli)) {
  console.error(`✗ Could not locate npm's CLI at ${npmCli}`);
  process.exit(1);
}

execFileSync(
  process.execPath,
  [npmCli, 'install', '--no-fund', '--no-audit', '--force', '--ignore-scripts', ...targets],
  { cwd: stage, stdio: 'inherit' }
);

// Refuse to copy anything containing a native binary — that would defeat the
// entire point of this fallback.
const offenders = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.node')) offenders.push(full);
  }
})(join(stage, 'node_modules'));

if (offenders.length) {
  console.error('✗ Staged tree unexpectedly contains native binaries:\n  ' + offenders.join('\n  '));
  process.exit(1);
}

let copied = 0;
for (const scope of readdirSync(join(stage, 'node_modules'))) {
  const src = join(stage, 'node_modules', scope);
  const dest = join(root, 'node_modules', scope);
  cpSync(src, dest, { recursive: true, force: true });
  copied++;
}

rmSync(stage, { recursive: true, force: true });

console.log(`\n✓ Installed ${copied} WASM package trees. \`npm run dev\` will now use them automatically.`);
