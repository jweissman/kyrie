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
    // on their own page of the book creation is.
    await page.click('[data-step="qualities"]');
    const roll = (q: string) => page.textContent(`[data-quality="${q}"]`);
    const [strength, dexterity] = [await roll('strength'), await roll('dexterity')];
    await page.click('[data-quality="strength"]');
    await page.click('[data-quality="dexterity"]');
    expect([await roll('strength'), await roll('dexterity')]).toEqual([dexterity, strength]);
    // Changed over, neither stays chosen: the page does not ask for another quality to give a roll to.
    expect(await page.locator('[data-quality][aria-pressed="true"]').count()).toBe(0);
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
  // A road's two ends say where they go, and under it by what and how long: they had run together, "‹ The landing at
  // Merinaelthe Nûrnellë road" (play 10).
  it('sets each end of a road with its way beneath it', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 820, height: 1180 },
      { site, pointer: true, query: '?world=mere' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.pick(c => /^To the market-place/.test(c.label), 'the market-place');
    await driver.pick(c => /^To the bridge over the Beorcex/.test(c.label), 'the bridge');
    const beneath = await page.$$eval('.end-way .route', ends => ends.map(end => {
      const n = end.querySelector('.n')!.getBoundingClientRect(), r = end.querySelector('.r')!.getBoundingClientRect();
      return r.top >= n.bottom - 1;
    }));
    expect(beneath).toEqual([true, true]);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
  // On a desktop the ways at the foot of the right page are as tall as they need, up to half of it, and the telling has
  // the rest: at a chapter's opening they had had the lower 44% for one way, and cut the telling above them short
  // (play 12).
  it('gives the ways on a desktop only the height they need, and the telling the rest', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?world=mere' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // The pane's own words end near its foot: no empty band below them, while the telling above is cut short.
    const slack = await page.evaluate(() => {
      const pane = document.querySelector('.place-spread > .on-pane')!, inner = pane.querySelector('.measure')!;
      return pane.getBoundingClientRect().bottom - inner.getBoundingClientRect().bottom;
    });
    expect(slack).toBeLessThanOrEqual(40);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
  // On a phone the ways about a place stand two to a row, and one whose name is long takes the whole row: "To the
  // market-place of Karashilgab" had wrapped over three lines in half the width (play 11).
  it('gives a long way about a place a row of its own on a phone', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 390, height: 844 },
      { site, pointer: true, query: '?world=mere' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.pick(c => /^To the market-place/.test(c.label), 'the market-place');
    const rows = await page.$$eval('.ways.about .options', lists => lists.flatMap(list => {
      const whole = list.getBoundingClientRect().width;
      return Array.from(list.querySelectorAll(':scope > li.wide')).map(li => Math.abs(li.getBoundingClientRect().width - whole) < 2);
    }));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(Boolean)).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
