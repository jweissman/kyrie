/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The map is a thing to plan with (the play-structure investigation's PT-27: it could not be clicked), and the one
// map (the owner, 4 November, late): play begins on it, and a place on it is chosen by pointing or by the keys, says
// whether the company has been there and the way there, and is entered (a town) or set out for (anywhere else); the
// journey is told where it comes to. From the notes, too, each place known is somewhere to set out for
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
    // Play begins where the company is, in the town (Mission 20's amendment 1); M raises the map over it.
    expect(await page.locator('.world-page.scale-scene').count()).toBe(1);
    await driver.mode('m');
    expect(await page.locator('.world-page.scale-board').count()).toBe(1);
    // By the keys: the town is reached by Tab and chosen with Enter (on the board, once it is drawn).
    await page.waitForSelector('[data-action="map-place"][data-id="region__s4"]', { timeout: 120000 });
    await page.focus('[data-action="map-place"][data-id="region__s4"]');
    await page.keyboard.press('Enter');
    const card = await page.textContent('.enter-card');
    expect(card).toContain('Brockfield');
    expect(card).toMatch(/by the ways you know/);
    // Seen is not there: travelled to and come to on the map, still outside it, then entered (the owner, 5 November).
    await page.click('.enter-card [data-action="travel"]');
    await driver.settle();
    // Come to it, or stopped on the way where the map marks it (kite's bridge over the Redwater): either way the map
    // stays up over where the company is, and it is entered from there.
    await page.waitForSelector('.enter-card[data-state="arrived"], .world-page.interrupted', { timeout: 30000 });
    expect(await page.locator('.world-page.scale-board').count()).toBe(1);
    await page.click('[data-action="enter-hex"]');
    const after = await driver.inspect();
    expect([after.mode, after.place?.id !== from]).toEqual(['explore', true]);
    expect(await page.locator('.world-page.scale-scene').count()).toBe(1);
    // Going anywhere is the map's alone: the notes set out for nowhere (the owner, 4 November).
    await driver.mode('j');
    expect(await page.locator('.journal [data-action="set-out"]').count()).toBe(0);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
  // A march-stone on the map is set out for by the road to it, and come to, where the country beyond is drawn (the
  // navigation review: the map had gone across country to the hex beside it, or from the road in, nowhere).
  it('chooses a march-stone on the map, shows the road there, and comes to the stone', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    // One come in debt, who knows the country's roads as a trader does: a march-stone is on the map only once heard of,
    // or so known (the owner, 3 November: the map had begun with the whole country on it).
    await page.click('[data-action="origin"][data-id="debt"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Play begins in the town (Mission 20's amendment 1): M raises the map.
    await page.keyboard.press('m');
    // North: east of every first country is the Eastern Ocean, whose shore no road goes over (see WorldShape).
    await page.waitForSelector('[data-action="map-place"][data-id="region__edge_north"]', { timeout: 120000 });
    await page.focus('[data-action="map-place"][data-id="region__edge_north"]');
    await page.keyboard.press('Enter');
    const plan = await page.textContent('.plan');
    expect(plan).toContain('march-stone of');
    expect(plan).toMatch(/By the old road north/);
    await page.click('.plan [data-action="set-out"]');
    await driver.settle();
    // Gone on with, as the page offers it on the map's card ("Go on to the march-stone of …"), past whatever stops it
    // on the road (something going on there stops a journey, as a toll or nightfall would).
    // A meeting on the road is a hex to enter, not passed by (the owner, 6 November): entered, it is gone on from.
    for (let k = 0; k < 8 && (await driver.inspect()).place?.id !== 'region__edge_north'; k++) {
      await driver.settle();
      if (await page.locator('[data-action="go-on"]').count()) { await driver.click('[data-action="go-on"]'); continue; }
      if (await page.locator('[data-action="enter-hex"]').count()) { await driver.click('[data-action="enter-hex"]'); }
      // In the place the meeting is, the journey is gone on with as the page offers it ("Go on to …").
      else { await driver.pick(c => /^Go on to /.test(c.label), 'go on'); }
    }
    expect((await driver.inspect()).place?.id).toBe('region__edge_north');
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
  // On a phone the map is the whole stage (Mission 18, the owner's correction): where you are is on it, nothing runs
  // past the screen's edge, and where you are is said in a card at its foot, whole (the register's NAV-05 and PRE-04:
  // names cut on a phone; the map untested at 390 px). The rest of the country is a drag away.
  it('at 390 by 844: fills the stage with the map, you on it, and its card at its foot', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 390, height: 844 },
      { site, pointer: true, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Play begins in the town (Mission 20's amendment 1): M raises the map.
    await page.keyboard.press('m');
    await page.waitForSelector('.field-land.board[data-board="ready"] .board-you', { timeout: 120000 });
    await page.waitForTimeout(2000);
    const fit = await page.evaluate(() => {
      const map = document.querySelector('.field-land canvas')!.getBoundingClientRect();
      const stage = document.querySelector('.world-page .surface')!.getBoundingClientRect();
      const you = document.querySelector('.board-you')!.getBoundingClientRect();
      // Raised by M the map opens on the aim followed (its plan), or else where the company is: whichever card it is.
      const plan = document.querySelector('.world-page .focus > *')!.getBoundingClientRect();
      return { names: document.querySelectorAll('.board-labels [data-action="map-place"]').length,
        whole: map.width >= stage.width - 1 && map.height >= stage.height - 1,
        you: you.left >= 0 && you.right <= innerWidth && you.top >= 0 && you.bottom <= innerHeight,
        wide: document.documentElement.scrollWidth > innerWidth,
        plan: plan.left >= 0 && plan.right <= innerWidth && plan.bottom <= innerHeight };
    });
    expect(fit.names).toBeGreaterThan(4);
    expect(fit).toEqual({ names: fit.names, whole: true, you: true, wide: false, plan: true });
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
  // Pointed at, a hex of country known is a waypoint set out for at once, your mark walking the way there on the map
  // before the journey is told where it comes to (the owner, OWN-48).
  // A touch chooses, and shows the way; a second touch on it sets out (the owner, 4 November: one touch had set out
  // at once, and taken him where he had not meant to go).
  it('chooses a hex pointed at, and sets out for it on a second touch', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Play begins in the town (Mission 20's amendment 1): M raises the map.
    await page.keyboard.press('m');
    const from = (await driver.inspect()).place?.id;
    await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 180000 });
    await page.waitForTimeout(6000);
    const you = (await page.locator('.board-you').boundingBox())!;
    await page.mouse.click(you.x + you.width * 2.5, you.y + you.height - 4);
    await page.waitForSelector('.plan [data-action="set-out"]', { timeout: 30000 });
    await page.mouse.click(you.x + you.width * 2.5, you.y + you.height - 4);
    await page.waitForFunction(was => (window as unknown as { kyrieMono: { inspect(): { place?: { id: string } } } })
      .kyrieMono.inspect().place?.id !== was, from, { timeout: 60000 });
    await driver.settle();
    const after = await driver.inspect();
    expect([after.mode, after.place?.id !== from]).toEqual(['explore', true]);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
