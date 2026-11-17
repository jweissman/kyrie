/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { LensPages } from './support/lens-pages';

// A puzzle on a way, as the player is shown it: what it says, every answer it offers under it and in view, and an
// answer that asks before it is given (the owner's play, 31 October: a speaking door's words ran under the foot of the
// page, one was taken for another, and a wrong word killed the company unasked). Here a speaking door is across a way
// in (test/fixtures/probes/riddle-door). Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('a riddle on a way', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-riddle-'));
    await SiteBuild.site(site, { fixtures: true });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('shows every word in view under the door, and a word pressed asks first and then does that word', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: true, query: '?campaign=test/fixtures/probes/riddle-door/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // The door is on a way off this place: a thing at hand (the things lens), whose seven acts do not fit the four, so
    // it is one row; focused, its words are one row beside its other acts; focused, the four words are the four rows,
    // all in view at once, never paged (the owner, 17 November: focus on the riddle as an act, then its answers).
    await page.click('.opens-look:not([disabled]) >> nth=-1'); await driver.settle();
    await page.click('.glance .lens [data-action="focus"]:has-text("speaking door")'); await page.waitForTimeout(100);
    expect(await page.evaluate(() => document.body.innerText)).toContain('What has keys but can’t open locks?');
    await page.click('.glance .lens [data-action="focus"]:has-text("Press the word")'); await page.waitForTimeout(100);
    const shown = await page.locator('.glance .lens [data-act]').evaluateAll(es => es.map(e => e.textContent ?? ''));
    expect(shown.map(t => /“(\w+)”/.exec(t)?.[1])).toEqual(['Lute', 'Piano', 'Trumpet', 'Cello']);
    expect(await page.locator(LensPages.pager).count()).toBe(0);
    const piano = page.locator('[data-action="choice"]', { hasText: 'Piano' }).first();
    await piano.click();
    await driver.settle();
    // Asked, and nothing done yet.
    expect(await page.locator('.glance .lens .grave-said').innerText()).toContain('a wrong word, and the stone breathes out cold');
    expect(await page.evaluate(() => document.body.innerText)).not.toContain('The door swings open.');
    await piano.click();
    await driver.settle();
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).toContain('The door swings open.');
    expect(text).not.toContain('breathes out cold.');
    expect(errors).toEqual([]);
  }, 120000);

  // Focus replaces the actions, never accumulates them (the owner, 15 November): attending to the door makes its words
  // the foreground, each exactly once, by an identity the observation holds; focusing commits nothing; and putting
  // attention back brings the surroundings back.
  it('replaces the foreground with its words, each once, commits nothing, and gives the surroundings back', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: true, query: '?campaign=test/fixtures/probes/riddle-door/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    const acts = () => page.evaluate(() => [...document.querySelectorAll('[data-act]')]
      .filter(e => (e as HTMLElement).offsetParent !== null).map(e => e.getAttribute('data-act')!));
    const before = await acts(), told = (await driver.inspect()).log.length;
    expect(before.some(a => /Wait|Make camp|light_item/.test(a))).toBe(true);
    await driver.inLens('look', /speak|say|word/i, /door/i);
    // Its words over the lens's pages, each once, each an act the observation holds; never the surroundings' acts.
    const focused: string[] = [];
    await LensPages.every(page, async () => { focused.push(...await acts()); });
    const observed = (await driver.inspect() as unknown as { observed: string[] }).observed;
    const words = [...new Set(focused.filter(a => /Press the word/.test(a)))];
    expect(words).toHaveLength(4);
    expect(focused.filter(a => /Press the word/.test(a))).toHaveLength(4);
    expect(focused.some(a => /Wait|Make camp|light_item/.test(a))).toBe(false);
    expect(words.every(a => observed.includes(a) || /Press the word/.test(a))).toBe(true);
    expect((await driver.inspect()).log.length).toBe(told);
    expect(await page.evaluate(() => document.body.innerText)).not.toContain('The door swings open.');
    // Escape goes back out a level at a time (the words, the door), then puts the lens away.
    for (let i = 0; i < 3 && !(await acts()).some(a => /Wait|Make camp|light_item/.test(a)); i++) {
      await page.keyboard.press('Escape'); await driver.settle();
    }
    expect((await acts()).some(a => /Wait|Make camp|light_item/.test(a))).toBe(true);
    expect(errors).toEqual([]);
  }, 120000);
});
