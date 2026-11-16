import type { Page } from 'playwright-core';

// A lens shows four acts at a time (the owner, 16 November: never more than four, in any context), the rest on pages a
// restrained "More…" row turns (GlanceStage.Lens). A spec looks for an act as a player does: turning the pages until it
// is there, or round to the first without finding it.
export class LensPages {
  static readonly pager = '.glance .lens [data-action="lens-page"]';
  // Turns pages until the selector has something on it; true if it has.
  static async seek(page: Page, selector: string): Promise<boolean> {
    for (let turns = 0; turns < 16; turns++) {
      if (await page.locator(selector).count()) { return true; }
      const pager = page.locator(LensPages.pager);
      if (!await pager.count()) { return false; }
      const [at, of] = [Number(await pager.getAttribute('data-page')), Number(await pager.getAttribute('data-pages'))];
      await pager.click();
      // Round to the first page without finding it: done.
      if (at === of && turns > 0 && !await page.locator(selector).count()) { return false; }
    }
    return false;
  }
  // Turns pages until the lens says something matching the text.
  static async seekText(page: Page, text: RegExp): Promise<boolean> {
    return LensPages.seek(page, `.glance .lens:text-matches("${text.source.replace(/"/g, '\\"')}", "${text.flags}")`);
  }
  // The acts of every page of the lens, in order (round once, back to the first page).
  static async every(page: Page, each: () => Promise<void>): Promise<void> {
    const pager = page.locator(LensPages.pager);
    const pages = await pager.count() ? Number(await pager.getAttribute('data-pages')) : 1;
    for (let at = 0; at < pages; at++) {
      await each();
      if (pages > 1) { await page.locator(LensPages.pager).click(); }
    }
  }
}
