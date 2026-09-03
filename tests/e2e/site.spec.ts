import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/', heading: /leaders in foam/i },
  { path: '/about/', heading: /about us/i },
  { path: '/private-label/', heading: /private label/i },
  { path: '/contact/', heading: /contact us/i },
] as const;

test.describe('pages', () => {
  for (const { path, heading } of PAGES) {
    test(`${path} renders and logs no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        // The contact page embeds a Google map; console noise originating
        // inside Google's own frame is theirs to fix and outside our control.
        // Everything from our origin still fails the test.
        const src = msg.location()?.url ?? '';
        if (/google.com|googleapis.com|gstatic.com/.test(src + msg.text())) return;
        errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));

      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toContainText(heading);

      // The live site logs 192 console errors on its homepage alone.
      expect(errors, `console errors on ${path}`).toEqual([]);
    });
  }

  test('unknown URLs render the 404 page', async ({ page }) => {
    await page.goto('/no-such-page/');
    await expect(page.locator('h1')).toContainText(/doesn't exist/i);
  });
});

test.describe('navigation', () => {
  test('desktop nav marks the current page', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveText('About');
  });

  test('every nav link resolves without a redirect or 404', async ({ page, request }) => {
    await page.goto('/');
    const hrefs = await page.locator('nav[aria-label="Main"] a').evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href') ?? '')
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const res = await request.get(href, { maxRedirects: 0 });
      expect(res.status(), `${href} should return 200 directly`).toBe(200);
    }
  });

  test('no link on any page points at an empty href', async ({ page }) => {
    // The live site ships four social icons whose href is "" — keyboard traps
    // that navigate nowhere.
    for (const { path } of PAGES) {
      await page.goto(path);
      await expect(page.locator('a[href=""]'), `empty href on ${path}`).toHaveCount(0);
    }
  });
});

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens, closes on Escape, and returns focus', async ({ page }) => {
    await page.goto('/');
    // Locate by id, not by accessible name: the name intentionally flips
    // between "Open menu" and "Close menu", so a name-based locator would stop
    // matching the same element as soon as the menu opens.
    const toggle = page.locator('#menu-toggle');
    const menu = page.locator('#mobile-menu');

    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAccessibleName(/open menu/i);

    await toggle.click();
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName(/close menu/i);

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });
});

test.describe('contact form', () => {
  test('blocks an empty submission and describes each problem', async ({ page }) => {
    await page.goto('/contact/');
    await page.getByRole('button', { name: /send your message/i }).click();

    await expect(page.locator('[data-error-for="name"]')).toBeVisible();
    await expect(page.locator('[data-error-for="email"]')).toBeVisible();
    await expect(page.locator('[name="name"]')).toHaveAttribute('aria-invalid', 'true');
    // Phone is optional — it must not be flagged.
    await expect(page.locator('[name="phone"]')).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[name="name"]')).toBeFocused();
  });

  test('rejects a malformed email address', async ({ page }) => {
    await page.goto('/contact/');
    await page.fill('[name="name"]', 'Test Person');
    await page.fill('[name="email"]', 'not-an-email');
    await page.fill('[name="subject"]', 'Hello');
    await page.fill('[name="message"]', 'This is a message of sufficient length.');
    await page.getByRole('button', { name: /send your message/i }).click();

    await expect(page.locator('[data-error-for="email"]')).toContainText(/valid email/i);
  });

  test('accepts a complete submission and clears the form', async ({ page }) => {
    await page.goto('/contact/');
    // The form rejects anything submitted within 2.5s as automated.
    await page.waitForTimeout(2700);

    await page.fill('[name="name"]', 'Test Person');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="subject"]', 'Private label enquiry');
    await page.fill('[name="message"]', 'We would like to discuss a private label program.');
    await page.getByRole('button', { name: /send your message/i }).click();

    await expect(page.locator('#cf-status')).toContainText(/has been sent/i);
    await expect(page.locator('[name="name"]')).toHaveValue('');
  });
});

test.describe('seo and metadata', () => {
  test('each page has a unique title, description and canonical', async ({ page }) => {
    const seen = new Set<string>();
    for (const { path } of PAGES) {
      await page.goto(path);
      const title = await page.title();
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');

      expect(title.length, `${path} title`).toBeGreaterThan(10);
      expect(description?.length ?? 0, `${path} description`).toBeGreaterThan(50);
      expect(canonical, `${path} canonical`).toContain(path);
      expect(seen.has(title), `${path} title should be unique`).toBe(false);
      seen.add(title);
    }
  });

  test('homepage exposes Organization structured data', async ({ page }) => {
    await page.goto('/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = blocks.map((b) => JSON.parse(b));
    const org = parsed.find((p) => p['@type'] === 'Organization');
    expect(org).toBeTruthy();
    expect(org.telephone).toBe('(800) 646-0112');
    expect(org.address.addressLocality).toBe('Lansdale');
  });
});

test.describe('images', () => {
  test('every image has alt text and intrinsic dimensions', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      const problems = await page.locator('img').evaluateAll((imgs) =>
        imgs
          .filter((img) => {
            const el = img as HTMLImageElement;
            const decorative = el.getAttribute('aria-hidden') === 'true' || el.alt === '';
            const hasAlt = el.hasAttribute('alt');
            const hasDims = el.hasAttribute('width') && el.hasAttribute('height');
            return !hasAlt || !hasDims || (!decorative && el.alt.trim() === '');
          })
          .map((img) => (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src)
      );
      expect(problems, `images missing alt/dimensions on ${path}`).toEqual([]);
    }
  });
});
