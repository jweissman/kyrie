import type { Page } from 'playwright-core';

// The scene's rail as a player meets it (OR-1084): at rest its lenses are folded behind one diamond and cannot be
// pressed unseen, so a spec takes the diamond up first, as a player does, and then the lens; elsewhere, or with the
// lenses already out, it presses the lens at once. Every spec that opens a lens from the rail comes through here (or
// through MonoDriver.click, which does the same), so that what the specs prove is what a player can do.
export class Rail {
  static readonly folded = '.scene-rail[data-fold]:not(.unfolded)';
  // The lenses taken up from their diamond, where they are folded; nothing where they are not.
  static async unfold(page: Page, touch = false): Promise<void> {
    if (!await page.locator(Rail.folded).count()) { return; }
    if (touch) { await page.tap('[data-action="lenses"]'); } else { await page.click('[data-action="lenses"]'); }
    await page.waitForSelector('.scene-rail.unfolded .lenses-fold', { state: 'visible' });
  }
  // The earned stage (compactification, OR-1245): the lenses, the map and the journal are earned in play (Surfaces),
  // so a spec that presses one of them, where it does not stand yet, has the company earn every surface first, as the
  // oracle does (kyrieMono.earn), rather than playing to the fourth level. Only where something is missing.
  static readonly earnable = new RegExp(['rail-mark', 'opens-(go|look|wait|talk)', 'data-action="(lenses|book|mode|compass)"',
    'data-control="map-mark"', 'data-view'].join('|'));
  static async earned(page: Page, selector: string): Promise<void> {
    if (!Rail.earnable.test(selector) || await page.locator(selector).count()) { return; }
    await page.evaluate(() => (window as unknown as { kyrieMono: { earn(): Promise<void> } }).kyrieMono.earn());
    await page.waitForFunction(() => !(window as unknown as { kyrieMono: { inspect(): { pending: boolean } } })
      .kyrieMono.inspect().pending, null, { timeout: 60000 });
  }
  // Whether what the selector names first stands among the folded lenses.
  static async within(page: Page, selector: string): Promise<boolean> {
    return page.locator(selector).first()
      .evaluate((e, f) => !!e.closest(`${f} .lenses-fold`), Rail.folded).catch(() => false);
  }
  // A press on what the selector names, the lenses unfolded first where it is among them.
  static async click(page: Page, selector: string, touch = false): Promise<void> {
    await Rail.earned(page, selector);
    if (await Rail.within(page, selector)) { await Rail.unfold(page, touch); }
    if (touch) { await page.tap(selector); } else { await page.click(selector); }
  }
  // A lens opened from the rail: talk, go, look or wait; left as it is where it is open already (a second press on its
  // mark puts it away, and what the spec meant to press next was then gone from under it).
  static async open(page: Page, lens: 'talk' | 'go' | 'look' | 'wait'): Promise<void> {
    const mark = `.rail-mark.opens-${lens}`;
    if (await page.locator(`${mark}:is([aria-pressed="true"], [aria-expanded="true"])`).count()) { return; }
    await Rail.click(page, mark);
    await page.waitForSelector(`${mark}:is([aria-pressed="true"], [aria-expanded="true"])`, { state: 'visible' });
  }
}
