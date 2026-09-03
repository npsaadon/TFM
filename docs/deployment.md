# Deployment

`npm run build` writes `dist/` — plain static files, nothing to run server-side.
Hosting is still undecided, so the security headers are provided in every major
host's format below. Pick the one that matches and the policy is already written.

## URL structure — do not change this

`astro.config.mjs` sets `trailingSlash: 'always'` and `build.format: 'directory'`
so URLs match the WordPress site exactly:

| URL | File |
| --- | --- |
| `/` | `dist/index.html` |
| `/about/` | `dist/about/index.html` |
| `/private-label/` | `dist/private-label/index.html` |
| `/contact/` | `dist/contact/index.html` |

Every inbound link and search result currently pointing at those URLs keeps
working. Changing `trailingSlash` would silently break all of them.

Configure the host to redirect `/about` → `/about/` with a **301**, so a single
canonical URL exists for each page.

---

## Headers

`public/_headers` is copied into `dist/` and read natively by **Cloudflare Pages**
and **Netlify** — nothing more to do on either.

### Vercel

Create `vercel.json` in the repo root:

```json
{
  "trailingSlash": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-src https://www.google.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    },
    {
      "source": "/_astro/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

### nginx

```nginx
server {
    root /var/www/tfm/dist;
    index index.html;

    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-src https://www.google.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "DENY" always;

    # Canonicalise to the trailing-slash form.
    rewrite ^/(.*[^/])$ /$1/ permanent;

    location / {
        try_files $uri $uri/index.html =404;
    }

    location /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    error_page 404 /404.html;
}
```

### Apache / LiteSpeed (the current host)

`.htaccess` in the document root:

```apache
<IfModule mod_headers.c>
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-src https://www.google.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests"
  Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "DENY"
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  # Add the trailing slash, except for real files.
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^(.*[^/])$ /$1/ [R=301,L]
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

ErrorDocument 404 /404.html
```

---

## About the CSP

`script-src` and `style-src` include `'unsafe-inline'` because Astro inlines
small scripts and critical CSS — that is what keeps the page to 10 requests. The
practical risk is low here: the site takes no user input that is ever rendered
back, has no database, and loads nothing from a third party.

To remove `'unsafe-inline'` entirely, the host must generate a per-request nonce,
which requires server-side rendering. For a brochure site of this size that trade
is not worth making. Revisit it if user-generated content is ever introduced.

**Any new third-party script — analytics, a chat widget, an embedded map — must
be added to the CSP explicitly, or it will be blocked.** That is the point.

---

## Before switching DNS

1. `npm run build && npm test && npm run test:e2e` — all green.
2. Deploy to the host's preview URL and click through all four pages.
3. Confirm the four canonical URLs return **200** directly (no redirect chain).
4. Wire up the contact form (see `src/lib/contact.ts`) and send a real test
   message. **Do not launch with a form that goes nowhere.**
5. Verify headers land: `curl -sI https://<preview-url>/ | grep -i content-security`
6. Lower the TTL on the existing DNS record ~24h beforehand so a rollback is fast.
7. Cut over, then submit `https://tfm-us.com/sitemap-index.xml` to Google Search
   Console.

## After launch

- Decommission the WordPress install rather than leaving it running unpatched on
  the old host — an abandoned WordPress is a liability even with no traffic.
- Until then, close the public username leak at
  `https://tfm-us.com/wp-json/wp/v2/users`, which currently discloses the admin
  username `techcoders` to anyone who asks.
