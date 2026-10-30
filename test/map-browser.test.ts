/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { ChoiceShape } from './support/mono-driver';

// The map is a thing to plan with (the play-structure investigation's PT-27: it could not be clicked): a place on it
// is chosen by pointing or by the keys, says whether the company has been there and the way there leg by leg, and
// sets out; the journey is told where it comes to. From the notes, too, each place known is somewhere to set out for
// (PT-25: the notes were a ledger, not a plan). Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('the map and the notes, to plan with', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-map-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('chooses a town on the map, shows the way there, and sets out for it', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    const from = (await driver.inspect()).place?.id;
    await driver.mode('m');
    expect((await driver.inspect()).mode).toBe('map');
    // By the keys: the town is reached by Tab and chosen with Enter (on the board, once it is drawn).
    await page.waitForSelector('[data-action="map-place"][data-id="region__s4"]', { timeout: 120000 });
    await page.focus('[data-action="map-place"][data-id="region__s4"]');
    await page.keyboard.press('Enter');
    const plan = await page.textContent('.plan');
    expect(plan).toContain('Brockfield');
    expect(plan).toMatch(/By the .+ to /);
    await page.click('[data-action="set-out"]');
    await driver.settle();
    const after = await driver.inspect();
    expect([after.mode, after.place?.id !== from]).toEqual(['explore', true]);
    // The notes say where else the company could go, each with setting out.
    await driver.mode('j');
    expect(await page.locator('.going [data-action="set-out"]').count()).toBeGreaterThan(0);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
  // A march-stone on the map is set out for by the road to it, and come to, where the country beyond is drawn (the
  // navigation review: the map had gone across country to the hex beside it, or from the road in, nowhere).
  it('chooses a march-stone on the map, shows the road there, and comes to the stone', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.mode('m');
    await page.waitForSelector('[data-action="map-place"][data-id="region__edge_east"]', { timeout: 120000 });
    await page.focus('[data-action="map-place"][data-id="region__edge_east"]');
    await page.keyboard.press('Enter');
    const plan = await page.textContent('.plan');
    expect(plan).toContain('march-stone of');
    expect(plan).toMatch(/By the old road east/);
    await page.click('[data-action="set-out"]');
    await driver.settle();
    // Gone on with, as the page offers, past whatever stops it on the road (on the bridge by Brightbridge, something
    // going on there stops a journey, as a toll or nightfall would).
    const onward = (c: ChoiceShape) => c.id === 'travel:region__edge_east';
    for (let k = 0; k < 4 && (await driver.inspect()).choices.some(onward); k++) { await driver.pick(onward, 'go on'); }
    expect((await driver.inspect()).place?.id).toBe('region__edge_east');
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
  // On a phone the map is the whole screen (Mission 18, the owner's correction), the board or the flat map, whichever
  // the browser can draw: where you are is on it, nothing runs
  // past the screen's edge, and a place chosen is said in a card at its foot, whole (the register's NAV-05 and PRE-04:
  // names cut on a phone; the map untested at 390 px). The rest of the country is a drag away.
  it('at 390 by 844: fills the screen with the map, you on it, and the plan at its foot', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 390, height: 844 },
      { site, pointer: true, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.mode('m');
    await page.waitForSelector('.field-land [aria-current="location"] .you-dot', { timeout: 120000 });
    const fit = await page.evaluate(() => {
      const map = document.querySelector('.field-land svg, .field-land canvas')!.getBoundingClientRect();
      const you = document.querySelector('.field-land [aria-current="location"] .you-dot')!.getBoundingClientRect();
      const plan = document.querySelector('.field-map .plan')!.getBoundingClientRect();
      return { names: document.querySelectorAll('.field-land text, .board-labels [data-action="map-place"]').length,
        whole: map.width >= innerWidth - 1 && map.height >= innerHeight - 1,
        you: you.left >= 0 && you.right <= innerWidth && you.top >= 0 && you.bottom <= innerHeight,
        wide: document.documentElement.scrollWidth > innerWidth,
        plan: plan.left >= 0 && plan.right <= innerWidth && plan.bottom <= innerHeight };
    });
    expect(fit.names).toBeGreaterThan(4);
    expect(fit).toEqual({ names: fit.names, whole: true, you: true, wide: false, plan: true });
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
