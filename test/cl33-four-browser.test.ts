/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { GoldenWalk } from './support/golden-walk';

// CL-33 in the browser (the owner: "fine to close if the original wall-of-rows experience is demonstrably resolved in
// the browser"): the turns test/cl33-four pins headlessly, on the page at a desk (1280) and on a phone (390): the act
// that matters is a row in the four, gold (data-continues), visible, in its words. Each life begun as the page's
// automation begins one (kyrieMono.begin), and brought to the turn by the cold plays' own lines, as the page's
// commands (kyrieMono.act).
class Turn {
  // The cold plays' own lines as the page's commands: an act by its command, an aim followed by its row (follow:),
  // a look nothing (the page is at rest on it).
  static commands(file: string, n: number, from = 0): string[] {
    return readFileSync(file, 'utf8').split('\n').filter(Boolean).slice(from, from + n).flatMap(line => {
      const m = JSON.parse(line) as { act?: string; follow?: string };
      return m.follow ? [`follow:${m.follow}`] : m.act ? [m.act] : [];
    });
  }
  // With no stock opening (asked "none"): the four are the drove's and the weir's, which the adit comes before; the
  // adit's own turns are test/features/world/under-the-fall.pin's.
  static async begin(page: Page, origin: string, member: Record<string, string>) {
    await page.waitForFunction(() => 'kyrieMono' in window, null, { timeout: 120000 });
    await page.evaluate(`window.kyrieMono.begin(${JSON.stringify({ campaign: 'world', seed: 'iscoed', origin,
      party: [member], opening: 'none' })})`);
    await page.waitForFunction('window.kyrieMono.inspect().mode === "explore"', null, { timeout: 180000 });
  }
  static async play(page: Page, commands: string[]) {
    for (const command of commands) {
      await page.evaluate(`window.kyrieMono.act(${JSON.stringify(command)}, ${JSON.stringify(command)})`);
      await page.waitForFunction('!window.kyrieMono.inspect().pending', null, { timeout: 60000 });
    }
  }
  // The one gold row among the four: visible, in its words.
  static async gold(page: Page): Promise<string> {
    const row = page.locator('li[data-continues]').first();
    await row.waitFor({ state: 'visible', timeout: 30000 });
    return (await row.innerText()).replace(/\s+/g, ' ');
  }
  // The wall of rows the cold play met, counted as test/foreground-browser counts it: the visible acts drawn, the
  // likenesses of who is here and a closed fold apart. At most four, the gold among them.
  static async drawn(page: Page): Promise<string[]> {
    return page.evaluate(() => [...document.querySelectorAll('[data-act]')]
      .filter(e => (e as HTMLElement).offsetParent !== null && !e.closest('.portraits, details:not([open])'))
      .map(e => (e as HTMLElement).innerText.replace(/\s+/g, ' ').trim().slice(0, 60)));
  }
}
const weir = 'doc/architecture/mission-22/cold/cold-5-lines.txt', drove = 'doc/architecture/mission-22/golden/warrior-walk.txt';
const ilse = { name: 'Ilse', raceId: 'elf', classId: 'mage', backgroundId: 'scholar' };
describe.skipIf(!process.env.KYRIE_BROWSER)('the act that matters, gold among the four, on the page (CL-33)', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  const turns: Record<string, string[]> = {};
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-cl33-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
    turns.pawl = Turn.commands(weir, 9);
    turns.wind = Turn.commands(weir, 22);
    turns.ianto = Turn.commands(drove, 21, GoldenWalk.opened());
  }, 600000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const width of [1280, 390]) {
    const size = { width, height: width > 600 ? 800 : 844 };
    it(`at ${width}: the pawl found in the gate-well, taking it gold in the four`, async () => {
      const { page, errors } = await MonoBrowser.page(browser, size, { site, query: '?world=iscoed' });
      await Turn.begin(page, 'weir', ilse);
      await Turn.play(page, turns.pawl!);
      expect(await Turn.gold(page)).toMatch(/pawl/i);
      expect((await Turn.drawn(page)).length).toBeLessThanOrEqual(4);
      expect(errors).toEqual([]);
    }, 300000);
    it(`at ${width}: at the windlass with Gesk hired, winding the gate gold in the four`, async () => {
      const { page, errors } = await MonoBrowser.page(browser, size, { site, query: '?world=iscoed' });
      await Turn.begin(page, 'weir', ilse);
      await Turn.play(page, turns.wind!);
      expect(await Turn.gold(page)).toMatch(/wind the sea-gate shut/i);
      expect((await Turn.drawn(page)).length).toBeLessThanOrEqual(4);
      expect(errors).toEqual([]);
    }, 300000);
    it(`at ${width}: turned to Ianto at the staithe, poling his boat gold among what is had of him`, async () => {
      const { page, errors, driver } = await MonoBrowser.page(browser, size, { site, query: '?world=iscoed' });
      await Turn.begin(page, 'drove', { name: 'Wenna', raceId: 'human', classId: 'warrior' });
      await Turn.play(page, turns.ianto!);
      await driver.act('pans__ianto#talk');
      const reply = page.locator('.replies .aimed').first();
      await reply.waitFor({ state: 'visible', timeout: 30000 });
      expect(await reply.innerText()).toMatch(/Pole Ianto.s fuel boat/);
      expect(errors).toEqual([]);
    }, 300000);
  }
});
