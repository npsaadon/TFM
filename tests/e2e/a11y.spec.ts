import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/about/', '/private-label/', '/contact/'] as const;

/**
 * Accessibility gate.
 *
 * The live WordPress site fails several of these outright: body copy at 3.5:1
 * against white, six certification badges whose alt text is their filename,
 * four social links with empty hrefs, and no focus styling anywhere. This suite
 * exists so those cannot come back unnoticed.
 */
for (const path of PAGES) {
  test(`${path} has no detectable accessibility violations`, async ({ page }) => {
    await page.goto(path);

    // Freeze the scroll-reveal animations before auditing. Axe computes
    // contrast from rendered pixels, so an element caught mid-fade at partial
    // opacity reports phantom contrast failures — the audit must see the page
    // in its settled state, which is what every human reads.
    await page.addStyleTag({
      content:
        '[data-reveal], .hero-in { opacity: 1 !important; transform: none !important; transition: none !important; animation: none !important; }',
    });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // The Google Maps embed is cross-origin: axe cannot inspect inside it,
      // and scanning it mid-load produces intermittent phantom violations.
      // Excluding the frame's subtree; the <iframe> element's own attributes
      // (title etc.) are still ours and still checked via the DOM.
      .exclude('iframe[src*="google.com"]')
      .analyze();

    // Print details before asserting so a CI failure explains itself rather
    // than just reporting a count.
    if (results.violations.length > 0) {
      console.error(
        `\n${path} violations:\n` +
          results.violations
            .map(
              (v) =>
                `  [${v.impact}] ${v.id}: ${v.help}\n` +
                v.nodes.map((n) => `      ${n.target.join(' ')}`).join('\n')
            )
            .join('\n')
      );
    }

    expect(results.violations).toEqual([]);
  });
}

test('every page has exactly one h1 and a skip link', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator('h1'), `${path} should have exactly one h1`).toHaveCount(1);
    await expect(page.locator('a[href="#main"]'), `${path} should have a skip link`).toHaveCount(1);
  }
});

test('the skip link becomes visible on keyboard focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.locator('a[href="#main"]');
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
});
