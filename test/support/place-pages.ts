import type { Page } from 'playwright-core';

// The place at rest is one menu (OR-1490): its four, then the rest of the scene's rows a page at a time, turned by
// Something else… (the place's question: PlaceQuestion). A spec looks for a row there as a player does, turning the
// pages round to the first; true once the selector has something on it, false where no page holds it.
export class PlacePages {
  static readonly more = '[data-choice="place:more"]';
  static async seek(page: Page, find: string, settle: () => Promise<unknown>): Promise<boolean> {
    for (let turns = 0; turns < 24; turns++) {
      if (await page.locator(find).count()) { return true; }
      const more = page.locator(PlacePages.more);
      if (!await more.count()) { return false; }
      const back = /^Back/.test(await more.innerText());
      await more.click(); await settle();
      if (back) { return (await page.locator(find).count()) > 0; }
    }
    return false;
  }
}
