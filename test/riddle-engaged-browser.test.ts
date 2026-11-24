/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The old woman's riddle on the page, at a desk and on a phone (OR-177's declared browser acceptance; the owner's
// playtest of 21 November: her answers had been mixed with unrelated world actions). Stopped for, the menu the page
// draws is her riddle: her three answers first, then only the ways off the green, and nothing of the drove's aim to
// take up ("Ask Owain how many head came down" had led it); answered, the green is the green again. Out of the adit
// first, as the page walk goes (test/page-walk-browser), by the rows a player sees.
const outOfTheAdit = async (d: MonoDriver) => {
  for (const words of [/light a (torch|candle)/i, /^To the old gallery/, /^the fallen prop$/, /^Heave up alone/,
    /^Up to the old drift/, /^To the landing at Porthalen/]) {
    const s = await d.inspect();
    const row = [...s.choices, ...s.sections.flatMap(x => x.choices)].find(c => words.test(c.label));
    expect([String(words), row?.id]).toEqual([String(words), expect.any(String)]);
    await d.act(row!.id);
  }
  expect((await d.inspect()).place?.id).toBe('region__s1_green');
};
const answers = /^(Tell her it is|Say you do not know)/;
describe.skipIf(!process.env.KYRIE_BROWSER)('the old woman\'s riddle on the page', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-riddle-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    it(`is the menu once stopped for, her answers first, at ${size.width}`, async () => {
      const { page, errors, driver: d } = await MonoBrowser.page(browser, size,
        { site, pointer: size.width < 600, query: '?world=iscoed' });
      page.setDefaultTimeout(8000);
      await page.waitForSelector('[data-mode="create"]', { timeout: 180000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"], [data-mode="prologue"]', { timeout: 180000 });
      await outOfTheAdit(d);
      // Her riddle's own row, within her drawer, opened by looking at her riddle as a player does (the page's id).
      const id = async (words: RegExp) => (await d.inspect()).observed
        ?.find(o => /_pl_riddle\//.test(o) && words.test(o));
      await d.act('region__s1_pl_riddle#look');
      const stop = await id(/Stop for the old woman/);
      expect(stop).toEqual(expect.any(String));
      await d.act(stop!);
      // Her drawer put away: what the place's own menu draws, row by row, its words as a player reads them.
      for (let i = 0; i < 3 && (await d.inspect()).mode !== 'explore'; i++) { await d.key('Escape'); }
      expect((await d.inspect()).mode).toBe('explore');
      const rows = await page.locator('[data-menu] [data-action]').evaluateAll(es => es
        .filter(e => (e as HTMLElement).offsetParent !== null)
        .map(e => (e as HTMLElement).innerText.split('\n')[0]!.trim()).filter(Boolean));
      const said = rows.filter(r => answers.test(r));
      expect(said).toHaveLength(3);
      expect(answers.test(rows.find(r => !/riddle/.test(r))!)).toBe(true);
      expect(rows.filter(r => /Owain|take it up/.test(r))).toEqual([]);
      expect(rows.filter(r => !answers.test(r) && !/riddle/.test(r) && !/^(To |Into |Out |Up |Down |More)/.test(r)))
        .toEqual([]);
      await d.act((await id(/Tell her it is a river/))!);
      const after = await page.locator('[data-menu] [data-action]').evaluateAll(es => es
        .map(e => (e as HTMLElement).innerText.split('\n')[0]!.trim()));
      expect(after.filter(r => answers.test(r))).toEqual([]);
      expect(errors).toEqual([]);
      await page.close();
    }, 600000);
  }
});
