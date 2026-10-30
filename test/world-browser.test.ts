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
  // A road's two ends say where they go, and under it by what and how long: they had run together, "‹ The landing at
  // Merinaelthe Nûrnellë road" (play 10).
  it('sets each end of a road with its way beneath it', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 820, height: 1180 },
      { site, pointer: true, query: '?world=mere' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.pick(c => /^To the market-place/.test(c.label), 'the market-place');
    await driver.pick(c => /^To the bridge over the Birchwater/.test(c.label), 'the bridge');
    const beneath = await page.$$eval('.end-way .route', ends => ends.map(end => {
      const n = end.querySelector('.n')!.getBoundingClientRect(), r = end.querySelector('.r')!.getBoundingClientRect();
      return r.top >= n.bottom - 1;
    }));
    expect(beneath).toEqual([true, true]);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
  // On a desktop the telling and the ways stand side by side under the place's head, each the whole height between the
  // head and the foot (at a chapter's opening the ways had had the lower 44% of the right page for one way, and cut the
  // telling above them short: play 12), and the stage that holds them keeps its margins: about a tenth of the screen's
  // width each side (Mission 18's A1).
  it('gives the telling and the ways a column each under the head, in a stage with its margins', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?world=mere' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    const laid = await page.evaluate(() => {
      const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      const [scene, on, head, foot, frame] = ['.scene-page > .scene', '.scene-page > .on-pane', '.place-head',
        '.place-foot', '.frame'].map(box) as DOMRect[];
      const r = Math.round;
      return { level: r(scene!.top) === r(on!.top) && r(scene!.height) === r(on!.height),
        between: r(scene!.top) === r(head!.bottom) && r(scene!.bottom) === r(foot!.top),
        margins: Math.min(r(frame!.left), r(innerWidth - frame!.right)) };
    });
    expect([laid.level, laid.between, laid.margins >= 130]).toEqual([true, true, true]);
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
    // A busy place's ways are raised over the scene by one touch.
    if (await page.locator('.all-ways').count()) { await page.click('.all-ways'); }
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
