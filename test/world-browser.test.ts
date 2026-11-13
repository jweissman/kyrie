/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// A generated world begun in the browser, as a player begins it: the creation page read for a while, then Begin.
// Found measuring the browser: wren never began ("names a kind missing from the item catalog: abbey_chalice"),
// and the page stayed on the creation page. While the page is read its country's files are read too and kept; a
// start meanwhile put its own kinds in place of the country's, and a file given back as it was kept no longer
// declared them. No test began a generated world in the browser. Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('a generated world in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-world-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each(['wren', 'thorn'])('begins in %s after the creation page has been read, and is taken up again', async seed => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: `?world=${seed}` });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    // The qualities are six rolls placed by choosing one and then another (the cold playtest could not place them),
    // behind Details on the last page of creation (OWN-14: creation asks only why, people, calling, way and name).
    while (await page.locator('[data-action="next"]').count()) { await page.click('[data-action="next"]'); }
    await page.click('[data-action="details"]');
    await page.click('[data-step="qualities"]');
    const roll = (q: string) => page.getAttribute(`[data-quality="${q}"]`, 'data-roll');
    const [strength, dexterity] = [await roll('strength'), await roll('dexterity')];
    await page.click('[data-quality="strength"]');
    await page.click('[data-quality="dexterity"]');
    expect([await roll('strength'), await roll('dexterity')]).toEqual([dexterity, strength]);
    // Changed over, neither stays chosen: the page does not ask for another quality to give a roll to.
    expect(await page.locator('[data-quality][aria-pressed="true"]').count()).toBe(0);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(3000);
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Kept as it is played, and taken up again where it was, its world kept with it: once what was kept has changed
    // with the move (a game is kept from its start, so that it is kept at all is not enough).
    await page.waitForFunction(() => !!localStorage.getItem('kyrie.mono.v1.summary'), null, { timeout: 30000 });
    const kept = await page.evaluate(() => localStorage.getItem('kyrie.mono.v1.summary'));
    await driver.pick(c => /^To /.test(c.label), 'a way on');
    const [place, clock] = [(await driver.inspect()).place?.id, await page.textContent('[data-id="clock"]')];
    await page.waitForFunction(was => localStorage.getItem('kyrie.mono.v1.summary') !== was, kept, { timeout: 30000 });
    await page.reload();
    await driver.click('[data-action="continue"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    expect([(await driver.inspect()).place?.id, await page.textContent('[data-id="clock"]')]).toEqual([place, clock]);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
  // (The road page's spec, a road's two ends with their ways beneath, went with the road page's last way in: a journey
  // across a drawn country now arrives whole, and nothing leaves the company on a road; see the register's NVR-23.)
  // On a desktop a place is laid out (spatial-play.md): its surface, the plan of where the company is, and beside it
  // the focus, from the place's head to the stage's foot, nothing across the foot and nothing to scroll; and the stage
  // keeps its margins, about a twentieth of the screen's width each side (Mission 18's A1, halved by the owner,
  // 4 November).
  // The scene first (amendment 6, A): the painting is the whole screen, the place's head over its top and what is told
  // and done in a panel over it, inside the screen.
  it('gives a place its painting edge to edge, and its head and what is told over it', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?world=mere' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Play begins on the map; entered, the place.
    await driver.enter();
    // As it stands once it has settled, not while the place comes in.
    await page.waitForTimeout(1500);
    const laid = await page.evaluate(() => {
      const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      const [surface, focus, bar, page, frame] = ['.world-page .surface', '.world-page .focus', '.world-bar', '#page',
        '.frame'].map(box) as DOMRect[];
      const r = Math.round;
      return { whole: r(surface!.left) === 0 && r(surface!.top) === 0 && r(surface!.right) === innerWidth
          && r(surface!.bottom) === r(page!.bottom),
        over: r(focus!.left) > r(surface!.left) && r(focus!.right) <= innerWidth && r(focus!.bottom) <= innerHeight
          && r(bar!.top) === r(surface!.top),
        scroll: document.scrollingElement!.scrollHeight > innerHeight + 1,
        margins: Math.min(r(frame!.left), r(innerWidth - frame!.right)) };
    });
    expect([laid.whole, laid.over, laid.scroll, laid.margins]).toEqual([true, true, false, 0]);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
  // On a phone each way from a place, in Go…, has its name whole ("To the market-place of Karashilgab" had
  // wrapped over three lines in half the width: play 11) and none runs off the side of the screen.
  it('gives each way about a place its whole name on a phone', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 390, height: 844 },
      { site, pointer: true, query: '?world=mere' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.pick(c => /^To the market-place/.test(c.label), 'the market-place');
    await page.click('.rail-mark.opens-go');
    const all = page.locator('.glance .lens [data-action="lens-all"][aria-expanded="false"]');
    if (await all.count()) { await all.click(); }
    const names = await page.$$eval('.glance .lens-places [data-act]', tiles => tiles.map(t => {
      const n = t.querySelector('.row-label')!, box = t.getBoundingClientRect();
      return n.scrollWidth <= n.clientWidth + 1 && box.right <= innerWidth && box.left >= 0;
    }));
    expect(names.length).toBeGreaterThan(0);
    expect(names.every(Boolean)).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
