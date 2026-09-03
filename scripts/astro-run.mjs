/**
 * Astro CLI wrapper that transparently falls back to the WebAssembly build of
 * the native compilers when the platform-native ones cannot be loaded.
 *
 * Why this exists
 * ---------------
 * Astro's compiler and Tailwind's Oxide engine ship as native Rust binaries
 * (`.node`). Some endpoint-protection agents — Acronis Cyber Protect on this
 * machine — refuse to let unsigned Rust binaries load, failing with
 * ERROR_VIRUS_INFECTED even though the files match their published npm
 * integrity hashes exactly.
 *
 * Rather than ask anyone to weaken endpoint protection, we use the official
 * `wasm32-wasi` builds that upstream publishes for exactly this situation.
 * They are pure WebAssembly with no native binary to block. Builds are
 * somewhat slower, which is irrelevant at this site's size.
 *
 * The probe below runs on every invocation, so on a machine where the native
 * binaries load fine, nothing changes and full native speed is used. Run
 * `npm run setup:wasm` once to fetch the WASM packages.
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

/** Try to load the native Astro compiler. Returns true when it works. */
async function nativeCompilerWorks() {
  try {
    await import('@astrojs/compiler-binding');
    return true;
  } catch {
    return false;
  }
}

const useWasi = !(await nativeCompilerWorks());

if (useWasi) {
  console.log(
    '\x1b[33m›\x1b[0m native compiler unavailable (blocked by endpoint protection) — using WebAssembly build\n'
  );
}

const child = spawn(
  process.execPath,
  [resolve(root, 'node_modules/astro/bin/astro.mjs'), ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    cwd: root,
    env: {
      ...process.env,
      ...(useWasi ? { NAPI_RS_FORCE_WASI: '1' } : {}),
      // The WASI shim is stable enough for our use; silence the notice so it
      // does not bury real warnings in the dev-server output.
      NODE_OPTIONS: [process.env.NODE_OPTIONS, '--no-warnings=ExperimentalWarning']
        .filter(Boolean)
        .join(' '),
    },
  }
);

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
