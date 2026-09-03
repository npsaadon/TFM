# TFM US — website

A static rebuild of [tfm-us.com](https://tfm-us.com), replacing WordPress +
Elementor with Astro. Same brand, same photography, same page structure — no
database, no admin login, no plugins.

---

## Running it

```bash
npm install      # also restores the WASM build tools (see "Windows note")
npm run dev      # http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the built site |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end + accessibility tests (Playwright) |
| `npm run audit` | Dependency vulnerability scan |

**Node 22.12 or newer is required.** This machine has a portable Node 24.20.0
LTS at `C:\Users\NateSaadon\.local\node24` — add it to `PATH` before running
anything, since the system-wide Node is 20.17.0 and too old:

```bash
export PATH="/c/Users/NateSaadon/.local/node24:$PATH"   # Git Bash
$env:PATH = "C:\Users\NateSaadon\.local\node24;$env:PATH"  # PowerShell
```

---

## Layout

```
src/
├── data/          All copy and content. Edit text HERE, never in markup.
│   ├── site.ts        Nav, phone, address, social links
│   ├── home.ts        Homepage
│   ├── about.ts       About page
│   ├── privateLabel.ts
│   └── contact.ts     Contact details + form fields
├── layouts/       BaseLayout — <head>, meta, structured data, skip link
├── components/
│   ├── layout/    Header, Footer, UtilityBar
│   ├── sections/  One component per page section
│   └── ui/        Button, Headline, Icon
├── lib/
│   └── contact.ts Form validation + the submission adapter
├── pages/         One file per route
├── assets/        Images and icons (optimized at build time)
└── styles/
    ├── global.css       Design tokens and base styles
    └── _candidates.css  AUTO-GENERATED — do not edit
```

**Content and markup are deliberately separate.** Fixing a typo or changing a
phone number is a one-line edit in `src/data/`, with no risk of breaking layout.

---

## Design tokens

Lifted from the live Elementor kit, so the brand is unchanged:

| Token | Value | Use |
| --- | --- | --- |
| `brand` | `#BE2A2B` | Buttons, accent word in headlines |
| `navy` | `#263358` | Logo, secondary headings |
| `ink` | `#1E2226` | Headings, dark panels |
| `muted` | `#6B6D70` | Body copy |
| `surface` | `#F8F8F8` | Alternating section backgrounds |

Type is **Oswald** (display, uppercase) + **Roboto** (body), self-hosted as
variable woff2 — 71 KB for every weight, and no request ever leaves for Google.

One deliberate change from the original: body copy was `#898A8B`, which measures
**3.5:1** on white and fails the WCAG AA minimum of 4.5:1. It is now `#6B6D70`
at **5.3:1** — visually near-identical, and it passes.

---

## The contact form is not connected yet

By design. The form is fully built — validation, error messaging, focus
management, honeypot and timing-based bot rejection — but submissions currently
resolve a simulated success and go nowhere.

To connect it, replace **only** the body of `submitContactForm` in
`src/lib/contact.ts`. Nothing else needs to change.

Two rules when you do:

1. **Re-validate on the server.** Everything in that file runs in the visitor's
   browser and can be bypassed with `curl`. Client validation is a courtesy, not
   a security control.
2. **Never put an API key in that file** — it ships to every visitor. Keys belong
   in a serverless function's environment.

---

## Deploying

`npm run build` produces `dist/`: plain static files, no server runtime, no
adapter. It will run on Cloudflare Pages, Netlify, Vercel, S3, or the existing
LiteSpeed host.

Security headers are already written in `public/_headers` (read natively by
Cloudflare Pages and Netlify). See `docs/deployment.md` for the nginx, Apache
and LiteSpeed translations, plus DNS cutover notes.

URLs match WordPress exactly (`/about/`, `/private-label/`, `/contact/` with
trailing slashes), so inbound links and search rankings carry over unchanged.

---

## Windows note: the WASM build tools

Astro's compiler, Tailwind's Oxide engine, and Rollup all ship as native Rust
binaries. **Acronis Cyber Protect on this machine refuses to load them** — it
reports `ERROR_VIRUS_INFECTED` even though all three files match their published
npm integrity hashes exactly. It also blocks copying and deleting them.

Rather than weaken endpoint protection, the project uses the official WebAssembly
builds that Astro, Tailwind and Rollup publish for exactly this situation:

- `scripts/setup-wasm-fallback.mjs` installs the Astro and Tailwind WASM builds.
  It runs automatically on `postinstall` and **no-ops** where native binaries
  work, so it costs nothing on an unaffected machine.
- `scripts/astro-run.mjs` wraps the Astro CLI and switches to WASM only when it
  detects the native compiler cannot load.
- `scripts/tailwind-candidates.mjs` scans `src/` and writes
  `src/styles/_candidates.css`. This is needed because Tailwind's WASM scanner
  gets a `C:\` WASI preopen but addresses paths POSIX-style, so on Windows it
  resolves nothing, finds zero files, and emits **zero utility classes** — an
  entirely unstyled site. Node does the scan instead.
- `package.json` has an `overrides` entry pointing `rollup` at
  `@rollup/wasm-node`, Rollup's own WebAssembly build.

**To remove all of this** once the binaries are allowed to load: delete the three
scripts, drop the plugin from `astro.config.mjs`, remove the `@source
'./_candidates.css'` import from `global.css`, and delete the `overrides` block.
Everything else works unchanged.

The long-term fix is to have IT allowlist the project folder in Acronis.

---

## Testing

- **Unit** (`tests/unit/`) — form validation and bot detection.
- **E2E + accessibility** (`tests/e2e/`) — runs against the production build on
  desktop and mobile viewports. Asserts zero axe-core violations on all four
  pages, zero console errors, working navigation, no empty `href`s, correct
  metadata, and that every image has alt text and intrinsic dimensions.

Current status: **63 passing** (42 E2E, 21 unit).
