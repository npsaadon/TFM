import { test, expect, type Page } from '@playwright/test';

/**
 * Clicks every link on every page and confirms it actually navigates.
 *
 * Resolving hrefs on paper is not the same as a link working: a sticky header,
 * a decorative pseudo-element, or a stacking-context mistake can sit over an
 * anchor and swallow the click while the markup still looks perfect. These
 * tests drive the real thing.
 */

const PAGES = ['/', '/about/', '/private-label/', '/contact/'] as const;

/** `CSS.escape` is a browser API and is not defined in the Node test context. */
const escapeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);

async function internalLinks(page: Page) {
  return page.locator('a[href]').evaluateAll((els) =>
    els
      .map((el) => {
        const a = el as HTMLAnchorElement;
        return {
          href: a.getAttribute('href') ?? '',
          text: (a.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40),
        };
      })
      .filter((l) => l.href.startsWith('/') || l.href.startsWith('#'))
  );
}

for (const path of PAGES) {
  test(`every link on ${path} navigates when clicked`, async ({ page }) => {
    await page.goto(path);
    const links = await internalLinks(page);
    expect(links.length, `${path} should contain internal links`).toBeGreaterThan(3);

    const seen = new Set<string>();

    for (const link of links) {
      if (seen.has(link.href)) continue;
      seen.add(link.href);

      await page.goto(path);

      // Same-page fragment: the target element must exist.
      if (link.href.startsWith('#')) {
        const id = link.href.slice(1);
        await expect(page.locator(`#${escapeId(id)}`), `${path} → ${link.href}`).toHaveCount(1);
        continue;
      }

      const anchor = page.locator(`a[href="${link.href}"]`).first();

      // Links only shown at another breakpoint (the mobile menu) are verified by
      // request instead of by click; the menu has its own dedicated test.
      if (!(await anchor.isVisible())) {
        const res = await page.request.get(link.href);
        expect(res.status(), `${path} → ${link.href} (hidden link)`).toBe(200);
        continue;
      }

      await anchor.click();
      await page.waitForLoadState('domcontentloaded');

      const [targetPath, fragment] = link.href.split('#');

      if (targetPath) {
        expect(
          new URL(page.url()).pathname,
          `clicking "${link.text}" on ${path} should land on ${targetPath}`
        ).toBe(targetPath);
      }

      // The destination must render, not just resolve.
      await expect(page.locator('h1'), `${link.href} rendered no heading`).toHaveCount(1);

      if (fragment) {
        await expect(
          page.locator(`#${escapeId(fragment)}`),
          `${link.href} — target id missing after navigation`
        ).toHaveCount(1);
      }
    }
  });
}

test('the header logo returns to the homepage from every page', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    await page.locator('header a[aria-label*="home" i]').first().click();
    await page.waitForLoadState('domcontentloaded');
    expect(new URL(page.url()).pathname).toBe('/');
  }
});

test('nothing invisible is covering the primary calls to action', async ({ page }) => {
  await page.goto('/');
  // Element-at-point: if a scrim or decorative rule sits over a button, the
  // topmost element at its centre will not be the button itself.
  const covered = await page.locator('a[href="/contact/"]').evaluateAll((els) =>
    els
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        if (rect.top < 0 || rect.bottom > window.innerHeight) return false;
        const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return top !== el && !el.contains(top);
      })
      .map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40))
  );
  expect(covered, 'these calls to action are obscured by another element').toEqual([]);
});
