import type { Page } from 'playwright-core';
import type { MonoDriver } from './mono-driver';
import { LensPages } from './lens-pages';
import { Rail } from './rail';

// Into a1's first fight on the page, as a player goes (test/fight-geometry-browser, scripts/performance/fight-press):
// the salter's job, the corn-store, its cellar lit, the rat-runs, by the lenses. Begun on the earned stage (?earned).
export class RatsWalk {
  constructor(readonly page: Page, readonly d: MonoDriver) {}
  // Gone to by the places lens (CN-01): the way there or the walk there, among its four or the rest unfolded.
  async to(place: string) {
    const { page } = this;
    if (await page.locator('.act.opens-go').count()) { await Rail.click(page, '.opens-go'); await this.d.settle(); return; }
    await Rail.click(page, '.opens-go');
    const row = `.glance .lens :is([data-act="travel:${place}"], [data-act^="exit:${place}"]) >> nth=0`;
    await LensPages.seek(page, row);
    // A journey is held to set out on (OR-111); the driver holds what is held.
    await this.d.click(row);
  }

  // Into the rats' fight: the salter's job, the corn-store, its cellar lit, the rat-runs.
  async rats() {
    const { page, d } = this;
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await this.to('region__s2_green');
    await d.talk();
    await page.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait');
    // The job is asked after once told what the matter is (OR-423, OR-370).
    await d.pick(c => /what the matter is/.test(c.label), 'what the matter is');
    await d.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
    await d.away();
    await this.to('region__s2_u_store'); await this.to('region__s2_u_cellar');
    await d.pick(c => /light|Light/.test(c.label), 'a light');
    await this.to('region__s2_u_warren');
    await d.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
    for (let i = 0; i < 100 && !((await d.inspect()).combat?.ours); i++) { await page.waitForTimeout(30); }
  }
}
