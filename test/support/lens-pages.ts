import type { Locator, Page } from 'playwright-core';

// A lens shows four acts at a time (the owner, 16 November: never more than four, in any context). Where its acts do
// not fit, a thing is one row that focuses it, and a run of its alike acts one row in turn (the owner, 17 November: a
// riddle's words focused, never paged: LensFocused); only many things at hand still turn by a restrained "More…" row.
// A spec looks for an act as a player does: turning the pages and focusing each row that gathers others, until it is
// there, and coming back out of each focus that did not hold it.
export class LensPages {
  static readonly pager = '.glance .lens [data-action="lens-page"]';
  static readonly focus = '.glance .lens [data-action="focus"]';
  // Turns pages and focuses until the selector (or locator) has something on it; true if it has.
  static async seek(page: Page, find: string | (() => Locator), depth = 0): Promise<boolean> {
    const found = async () => (await (typeof find === 'string' ? page.locator(find) : find()).count()) > 0;
    for (let turns = 0; turns < 16; turns++) {
      if (await found()) { return true; }
      for (let i = 0; depth < 3 && i < await page.locator(LensPages.focus).count(); i++) {
        await page.locator(LensPages.focus).nth(i).click(); await page.waitForTimeout(60);
        if (await LensPages.seek(page, find, depth + 1)) { return true; }
        await LensPages.out(page);
      }
      const pager = page.locator(LensPages.pager);
      if (!await pager.count()) { return false; }
      const [at, of] = [Number(await pager.getAttribute('data-page')), Number(await pager.getAttribute('data-pages'))];
      await pager.click();
      // Round to the first page without finding it: done.
      if (at === of && turns > 0 && !await found()) { return false; }
    }
    return false;
  }
  // Out of a focus, a level: its "Leave it for now", or the Escape key.
  static async out(page: Page): Promise<void> {
    const leave = page.locator('.glance .lens [data-action="defocus"]');
    if (await leave.count()) { await leave.click(); } else { await page.keyboard.press('Escape'); }
    await page.waitForTimeout(60);
  }
  // Turns pages until the lens says something matching the text.
  static async seekText(page: Page, text: RegExp): Promise<boolean> {
    return LensPages.seek(page, `.glance .lens:text-matches("${text.source.replace(/"/g, '\\"')}", "${text.flags}")`);
  }
  // The acts of every page of the lens, and of every focus within it, in order (round once, back to where it began).
  static async every(page: Page, each: () => Promise<void>, depth = 0): Promise<void> {
    const pager = page.locator(LensPages.pager);
    const pages = await pager.count() ? Number(await pager.getAttribute('data-pages')) : 1;
    for (let at = 0; at < pages; at++) {
      await each();
      for (let i = 0; depth < 3 && i < await page.locator(LensPages.focus).count(); i++) {
        await page.locator(LensPages.focus).nth(i).click(); await page.waitForTimeout(60);
        await LensPages.every(page, each, depth + 1);
        await LensPages.out(page);
      }
      if (pages > 1) { await page.locator(LensPages.pager).click(); }
    }
  }
}
