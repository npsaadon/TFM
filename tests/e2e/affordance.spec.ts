import { test, expect } from '@playwright/test';

/**
 * Catches elements that LOOK interactive but are not.
 *
 * The earlier link tests verified that existing links work — and passed while
 * the real complaint walked straight through them: cards styled with hover
 * lifts and pointer cursors that were not links at all. A visitor reads those
 * as clickable; clicking them doing nothing is a broken promise even though no
 * href is technically broken. This suite fails on the *class* of problem.
 */

const PAGES = ['/', '/about/', '/private-label/', '/contact/'] as const;

for (const path of PAGES) {
  test(`${path}: everything that looks clickable is clickable`, async ({ page }) => {
    await page.goto(path);

    const impostors = await page.evaluate(() => {
      const offenders: string[] = [];
      const isInteractive = (el: Element | null): boolean => {
        for (let node = el; node; node = node.parentElement) {
          const tag = node.tagName;
          if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'LABEL') return true;
          if (node.getAttribute('role') === 'button' || node.getAttribute('role') === 'link') return true;
        }
        return false;
      };

      for (const el of document.querySelectorAll<HTMLElement>('body *')) {
        if (isInteractive(el)) continue;
        // Skip wrappers whose interactive child covers them.
        if (el.querySelector('a, button')) continue;

        const style = getComputedStyle(el);
        const hasPointer = style.cursor === 'pointer';
        // Hover-lift styling is the visual promise of a card that navigates.
        const hasHoverLift = [...el.classList].some((c) => /^hover:.*(translate|shadow|scale)/.test(c));

        if (hasPointer || hasHoverLift) {
          const label = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);
          offenders.push(`<${el.tagName.toLowerCase()} class="${el.className.slice(0, 80)}"> "${label}"`);
        }
      }
      return offenders;
    });

    expect(impostors, `${path}: styled as clickable but not interactive`).toEqual([]);
  });
}

test('the homepage feature and difference cards navigate to their subjects', async ({ page }) => {
  const expectations = [
    { text: '100% U.S.-Based Manufacturing', dest: '/about/', fragment: 'made-in-usa' },
    { text: 'Warehousing Solutions', dest: '/about/', fragment: 'capabilities' },
    { text: 'Drop Shipping Services', dest: '/private-label/', fragment: 'experience' },
    { text: 'Quality', dest: '/about/', fragment: null },
    { text: 'Innovation', dest: '/private-label/', fragment: 'product-development' },
    { text: 'A-To-Z Service', dest: '/private-label/', fragment: null },
  ] as const;

  for (const { text, dest, fragment } of expectations) {
    await page.goto('/');
    const card = page
      .locator('a')
      .filter({ has: page.locator('h3', { hasText: text }) })
      .first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await page.waitForLoadState('domcontentloaded');

    const url = new URL(page.url());
    expect(url.pathname, `"${text}" card should land on ${dest}`).toBe(dest);
    if (fragment) {
      expect(url.hash, `"${text}" card should target #${fragment}`).toBe(`#${fragment}`);
      await expect(page.locator(`#${fragment}`)).toHaveCount(1);
    }
  }
});
