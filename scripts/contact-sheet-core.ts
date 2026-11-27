/// <reference lib="dom" />
import type { Page } from 'playwright-core';
import { MonoBrowser } from '../test/support/mono-browser';
import type { MonoDriver } from '../test/support/mono-driver';
import type { SheetCamera } from './contact-sheet-camera';
import { SheetHour } from './contact-sheet-hour';
import { PlacePages } from '../test/support/place-pages';
import { SheetWalks, type SheetRun } from './contact-sheet-walks';

// The core pages, each pictured at its full resolution for a design review (OR-1091, the owner's review of the
// tablet sheet): the title, creation, a place at rest, a conversation, trade and a fight, at a desk's size, an
// upright tablet's and a phone's (bun scripts/contact-sheets.ts --core). The fight is pictured at three moments, for
// a reader asked to tell from one frame who is hurt and how badly, whose turn it is and what they can do (OR-1133):
// the company to act, whom to strike being chosen, and a round on, blows taken on both sides. A wonder is left out
// until a wonder has an instrument of its own (OR-1139).
export class SheetCore {
  static async walk(run: SheetRun): Promise<void> {
    await SheetCore.title(run);
    const { page, driver: d } = await MonoBrowser.page(run.browser, run.size, { site: run.site, query: '?world=a1',
      reduced: run.reduced });
    page.setDefaultTimeout(30000);
    const cam = SheetWalks.camera(run, page, 'core', d), hour = new SheetHour(page, d, cam);
    await cam.step('creation', 'Creation: its first step, a people chosen', () =>
      page.waitForSelector('[data-mode="create"]', { timeout: 120000 }));
    await cam.step('resting', "A place at rest: Millholm's green, the lenses folded", async () => {
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
      await hour.to('region__s2_green');
    });
    await cam.step('resting-more', 'The same place, Something else…: what is worth doing, and the rest by kind', async () => {
      await d.click(PlacePages.more);
    });
    await cam.step('character', 'Your character: the backstage, one page (OR-1492)', async () => {
      // Among what is worth doing, or under Yourself… (OR-1495).
      await PlacePages.seek(page, '[data-choice="view:company"]', () => d.settle());
      await d.click('[data-choice="view:company"]');
    });
    await page.keyboard.press('Escape'); await d.settle();
    await cam.step('conversation', 'A conversation: Bask the salter, asked what the matter is', async () => {
      // Talked to by her row, on whichever of the place's pages holds it (OR-1490: no lens, one menu).
      const bask = '.glance ol.led [data-act="region__s2_merchant#talk"]';
      if (await PlacePages.seek(page, bask, () => d.settle())) { await d.click(bask); } else {
        await d.talk(); await page.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait');
      }
      await d.settle();
      await d.pick(c => /what the matter is/.test(c.label), 'what the matter is');
    });
    await cam.step('trade', "Trade: Bask's stall, its goods", async () => {
      for (let n = 0; n < 6 && !await page.locator('[data-action="trade"]').count()
        && await page.locator('[data-action="more-talk"]').count(); n++) { await d.click('[data-action="more-talk"]'); }
      await d.click('[data-action="trade"]');
    });
    await SheetCore.fight(page, d, cam, hour);
    await page.close();
  }
  // The rats in the warren under the corn-store, the job taken up from the notes and followed there.
  private static async fight(page: Page, d: MonoDriver, cam: SheetCamera, hour: SheetHour): Promise<void> {
    await cam.step('combat', 'A fight: the rats in the warren, the company to act', async () => {
      if (await page.locator('[data-action="trade-back"]').count()) { await d.click('[data-action="trade-back"]'); }
      // The rats' job heard from her, and followed from the notes, as the hour's walk follows it.
      await d.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
      await d.away();
      await d.mode('j');
      await page.locator('.aim-card .aim-pick').last().click();
      await page.locator('.journal .keep [data-action="follow"]:not(.shut)').click(); await d.settle();
      for (const place of ['region__s2_u_store', 'region__s2_u_cellar']) { await hour.to(place); }
      await d.pick(c => /light|Light/.test(c.label), 'a light');
      await hour.to('region__s2_u_warren');
      await d.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
      await page.waitForFunction(SheetCore.ours, null, { timeout: 30000 });
    });
    await cam.step('combat-aim', 'A fight: Attack pressed, whom to strike being chosen', async () => {
      await page.locator('.fight .hand-menu .choice-row').first().click();
      await page.waitForSelector('.fight .fighter.target', { timeout: 10000 });
    });
    await cam.step('combat-round', 'A fight a round on: a rat struck, blows taken, the company to act again', async () => {
      await page.locator('.fight .fighter.target .pick').first().click(); await d.settle();
      await page.waitForFunction(SheetCore.ours, null, { timeout: 30000 });
    });
  }
  // The company's turn, or the fight over.
  private static ours(): boolean {
    const mono = (window as unknown as { kyrieMono: { inspect(): { combat?: { ours: boolean; outcome?: string } } } })
      .kyrieMono;
    const combat = mono.inspect().combat;
    return !!combat && (combat.ours || !!combat.outcome);
  }
  private static async title(run: SheetRun): Promise<void> {
    const { page } = await MonoBrowser.page(run.browser, run.size, { site: run.site, query: '', reduced: run.reduced });
    const cam = SheetWalks.camera(run, page, 'core');
    await cam.step('title', 'The title, no game kept', () => page.waitForSelector('.beat-ready'));
    await page.close();
  }
}
