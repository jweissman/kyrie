import type { Page } from 'playwright-core';

// The place at rest is one menu (OR-1490): its four, then the rest of the scene's rows a page at a time, turned by
// Something else… (the place's question: PlaceQuestion). A spec looks for a row there as a player does, turning the
// pages round to the first; true once the selector has something on it, false where no page holds it.
export class PlacePages {
  static readonly more = '[data-choice="place:more"]';
  static async seek(page: Page, find: string, settle: () => Promise<unknown>): Promise<boolean> {
    // Round every first page twice at most (the pages after the four are few: OR-1495).
    for (let turns = 0; turns < 8; turns++) {
      if (await page.locator(find).count()) { return true; }
      // A kind folded into pages of its own (OR-1495), opened where it may hold what is sought.
      const kind = page.locator('[data-choice^="place:kind:"]');
      for (let i = 0; i < await kind.count(); i++) {
        await kind.nth(i).click(); await settle();
        if (await PlacePages.kindHolds(page, find, settle)) { return true; }
      }
      const more = page.locator(PlacePages.more);
      if (!await more.count()) { return false; }
      await more.click(); await settle();
    }
    return false;
  }
  // Through a kind's own pages until it is there, else back to the first page after the four.
  private static async kindHolds(page: Page, find: string, settle: () => Promise<unknown>): Promise<boolean> {
    for (let turns = 0; turns < 12; turns++) {
      if (await page.locator(find).count()) { return true; }
      const more = page.locator(PlacePages.more), back = /^\s*Back/.test(await more.innerText());
      await more.click(); await settle();
      if (back) { return false; }
    }
    return false;
  }
}
