/// <reference lib="dom" />
import type { Page } from 'playwright-core';
import { MonoBrowser } from '../test/support/mono-browser';
import { MonoDriver } from '../test/support/mono-driver';
import { LensPages } from '../test/support/lens-pages';
import type { SheetCamera } from './contact-sheet-camera';
import { SheetWalks, type SheetRun } from './contact-sheet-walks';
import { Rail } from '../test/support/rail';

// The first hour in a1, as test/safe-zone-browser walks it (the walk every nightly run proves): set out with the life
// creation offers, Millholm's green, the lenses opened, the book's pages, a talk with Bask the salter and her stall,
// the corn-store's cellar by a light, the rats fought and after, the map, a hex chosen, the journey made, a town's own
// country and the town entered by its way in.
export class SheetHour {
  constructor(readonly page: Page, readonly d: MonoDriver, readonly cam: SheetCamera) {}
  static async walk(run: SheetRun): Promise<void> {
    const { page, driver } = await MonoBrowser.page(run.browser, run.size, { site: run.site, query: '?world=a1', reduced: run.reduced });
    page.setDefaultTimeout(30000);
    const hour = new SheetHour(page, driver, SheetWalks.camera(run, page, 'hour', driver));
    await hour.town();
    await hour.book();
    await hour.talk();
    await hour.fight();
    await hour.map();
    await page.close();
  }
  async town(): Promise<void> {
    const { page, d, cam } = this;
    await cam.step('opening', 'The first place, at rest (Set out now)', async () => {
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    });
    await cam.step('town', "Millholm's green, at rest", () => this.to('region__s2_green'));
    // The lenses folded at rest into their diamond (OR-1084), taken up.
    await cam.step('lenses', 'The lenses unfolded from their diamond', () => Rail.click(page, '[data-action="lenses"]'));
    await page.click('[data-action="lenses"]').catch(SheetHour.none);
    for (const [part, said] of [['go', 'Go… opened'], ['look', 'Look… opened'], ['wait', 'Wait… opened']] as const) {
      const mark = `.rail-mark.opens-${part}:not(:disabled)`;
      if (this.cam.broken || !await page.locator(mark).count()) { continue; }
      await cam.step(`${part}-lens`, said, () => Rail.click(page, mark));
      await d.key('Escape').catch(SheetHour.none);
    }
  }
  async book(): Promise<void> {
    const { page, d, cam } = this;
    for (const [key, name, said] of [['i', 'pack', 'The book: pack'], ['c', 'character', 'The book: character'],
      ['j', 'notes', 'The book: notes'], ['h', 'story', 'The book: story']] as const) {
      await cam.step(name, said, () => d.mode(key));
      // From the pack, a thing's entry in the encyclopedia, opened over the game (EncyclopediaOverlay), then put away.
      if (key === 'i' && !cam.broken && await page.locator('.pack-entry').count()) {
        await cam.step('encyclopedia-entry', 'The encyclopedia over the game: a thing\'s entry', async () => {
          await page.click('.pack-entry'); await page.waitForSelector('.enc-overlay .enc-page');
          await page.waitForTimeout(1200);
        });
        await page.keyboard.press('Escape');
      }
      if (!cam.broken) { await page.keyboard.press('e'); await d.settle(); }
    }
  }
  async talk(): Promise<void> {
    const { page, d, cam } = this;
    await cam.step('talk-lens', 'Talk: the likenesses of who is here', () => d.talk());
    await cam.step('talk', 'A conversation: Bask the salter', () =>
      page.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait'));
    await d.pick(c => /what the matter is/.test(c.label), 'what the matter is');
    await cam.step('talk-reply', 'A conversation: her answer about the rats', () =>
      d.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats'));
    await cam.step('store', "A stall's goods: trading with Bask", async () => {
      for (let n = 0; n < 6 && !await page.locator('[data-action="trade"]').count()
        && await page.locator('[data-action="more-talk"]').count(); n++) { await d.click('[data-action="more-talk"]'); }
      await d.click('[data-action="trade"]');
    });
    if (cam.broken) { return; }
    if (await page.locator('[data-action="trade-back"]').count()) { await d.click('[data-action="trade-back"]'); }
    await d.away();
    // The job taken up, followed from the notes, as the safe zone's walk follows it.
    await d.mode('j');
    await page.locator('.aim-card .aim-pick').last().click();
    await page.locator('.journal .keep [data-action="follow"]:not(.shut)').click(); await d.settle();
  }
  async fight(): Promise<void> {
    const { page, d, cam } = this;
    await cam.step('cellar', "The corn-store's cellar, by a light", async () => {
      await this.to('region__s2_u_store');
      await this.to('region__s2_u_cellar');
      await d.pick(c => /light|Light/.test(c.label), 'a light');
    });
    await cam.step('fight', 'A fight: the rats, the company to act', async () => {
      await this.to('region__s2_u_warren');
      await d.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
      await page.waitForFunction(SheetHour.ours, null, { timeout: 30000 });
    });
    if (!cam.broken && await page.locator('.moves .act.opens').count()) {
      await cam.step('fight-moves', 'A fight: a kind of move opened', () => page.locator('.moves .act.opens').first().click());
      await d.key('Escape').catch(SheetHour.none);
    }
    await cam.step('fight-end', "A fight's end", () => this.fought());
    await cam.step('after-fight', 'After the fight', () => d.pick(c => c.id === 'onward', 'go on'));
  }
  async map(): Promise<void> {
    const { page, d, cam } = this;
    await cam.step('map', 'The map', async () => {
      await this.to('region__s2_u_cellar'); await this.to('region__s2_u_store'); await this.to('region__s2_green');
      await d.mode('m');
      await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 180000 });
    });
    await cam.step('map-chosen', 'The map: a hex chosen, the journey offered', async () => {
      const you = (await page.locator('.board-you').boundingBox())!;
      await page.mouse.click(you.x - 20, you.y + you.height + 72);
      await page.waitForSelector('.plan [data-action="set-out"]');
    });
    await cam.step('journey', 'A journey made: the next hex', async () => {
      await MonoDriver.press(page, '.plan [data-action="set-out"]');
      await d.settle();
    });
    await cam.step('town-hex', "A town's own country, its way in among the acts", async () => {
      await page.evaluate(() => (window as unknown as { kyrieMono: { act(c: string, s: string): void } }).kyrieMono
        .act('travel:region__t89', 'Go to the country about Millholm'));
      await page.waitForSelector('ol.led li', { timeout: 60000 });
    });
    await cam.step('entered', 'The town entered by its way in', async () => {
      await page.locator('ol.led li', { hasText: 'Millholm' }).locator('button').first().click();
      await d.settle();
    });
  }
  // The fight let go on by the game's own tactics (T) until it has an outcome.
  private async fought(): Promise<void> {
    for (let guard = 0; guard < 200; guard++) {
      const state = await this.d.inspect();
      if (state.mode !== 'combat') { throw new Error('the fight ended with no outcome shown'); }
      if (state.combat?.outcome) { return; }
      if (state.combat?.ours) { await this.d.key('t'); } else { await this.page.waitForTimeout(20); }
    }
    throw new Error('the fight did not end in 200 turns');
  }
  // Gone to by the places lens, as test/safe-zone-browser goes (CN-01).
  async to(place: string): Promise<void> {
    const { page } = this;
    if (await page.locator('.act.opens-go').count()) { await page.click('.act.opens-go'); await this.d.settle(); return; }
    await Rail.click(page, '.rail-mark.opens-go');
    const row = `.glance .lens :is([data-act="travel:${place}"], [data-act^="exit:${place}"]) >> nth=0`;
    await LensPages.seek(page, row);
    await this.d.click(row);
  }
  private static ours(): boolean {
    const mono = (window as unknown as { kyrieMono: { inspect(): { combat?: { ours: boolean } } } }).kyrieMono;
    return !!mono.inspect().combat?.ours;
  }
  private static none(): void { /* nothing opened to put away */ }
}
