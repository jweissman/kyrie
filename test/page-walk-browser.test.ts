/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The page cold play's driver works the controls a player has (GR-24; cold play 9 had stopped measuring the game at
// T32, its driver pressing rows under a lens or a view it never opened). A short walk in Iscoed as Set out now draws
// it (the drove road), each step by MonoDriver.act, as scripts/cold-play/page-runner.ts plays: the aim followed by its
// own row; the Black Rhyne searched where the page draws Search; a walk about the town, held (the travel rows of
// T8-T9 and T75); and Porthalen left by the map, its own row held. None of it by the page's automation.
// A new life on Iscoed begins under the fall in the old adit (StockOpenings): out of it first, by a player's controls
// as the rest is, a light made, past the badger's warning and under the fallen prop, and down to the green, where the
// drove road's walk begins. The adit's own incidents are test/features/world/under-the-fall.pin's.
const outOfTheAdit = async (d: MonoDriver) => {
  for (const words of [/light a (torch|candle)/i, /^To the old gallery/, /fallen prop/, /^Up to the old drift/,
    /^To the landing at Porthalen/]) {
    const s = await d.inspect();
    const row = [...s.choices, ...s.sections.flatMap(x => x.choices)].find(c => words.test(c.label));
    expect([String(words), row?.id]).toEqual([String(words), expect.any(String)]);
    expect(await d.act(row!.id)).not.toBe('fallback');
  }
  expect((await d.inspect()).place?.id).toBe('region__s1_green');
};
describe.skipIf(!process.env.KYRIE_BROWSER)('the page cold play\'s driver', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-walk-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  it('follows an aim, searches and walks the town, by a player\'s controls', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=iscoed' });
    page.setDefaultTimeout(8000);
    await page.waitForSelector('[data-mode="create"]', { timeout: 180000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"], [data-mode="prologue"]', { timeout: 180000 });
    await outOfTheAdit(d);
    const by: string[] = [];
    const act = async (id: string) => { by.push(`${id}: ${await d.act(id)}`); return d.inspect(); };
    // The aims as the page holds them, written down (the driver had written none).
    const first = await d.inspect();
    expect((first.aims ?? []).length).toBeGreaterThan(0);
    const aim = first.aims!.find(a => a.follow)!;
    expect((await act(aim.follow!)).aims?.find(a => a.id === aim.id)?.followed).toBe(true);
    await act('exit:drove__pens');
    await act('exit:drove__rhyne');
    await act('company/0:Search here');
    expect(await page.locator('.stage').innerText()).toMatch(/four in all/);
    // A walk about the town is held (T8-T9: pressed and let go, it had done nothing).
    expect((await act('travel:drove__customs')).place?.id).toBe('drove__customs');
    // Back out of doors: the country's journeys are set out on from the town's open places (OR-151).
    expect((await act('exit:region__s1_green')).place?.id).toBe('region__s1_green');
    console.log(by.join('\n'));
    expect(by.filter(b => b.endsWith('fallback'))).toEqual([]);
    expect(errors).toEqual([]);
  }, 600000);
  // OR-152, open: the map's menu rows three places of its own list, and a place across the country the engine sets
  // out for is reached only by touching it on the board, which keys cannot. Failing until the map's rows are the
  // engine's journeys (it then passes, and this is made an ordinary case).
  // The map's rows are the engine's journeys, every one reached a page at a time (MapRows, OR-152).
  it('leaves Porthalen by the map to a place across the country, by a player\'s controls (OR-152)', async () => {
    const { page, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=iscoed' });
    page.setDefaultTimeout(8000);
    await page.waitForSelector('[data-mode="create"]', { timeout: 180000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"], [data-mode="prologue"]', { timeout: 180000 });
    await outOfTheAdit(d);
    const here = (await d.inspect()).place?.id;
    await d.key('m');
    // A journey across the country among the map's rows (a way into the next hex is one too, by go(…): not that).
    const far = await page.locator(':is([data-action="map-view"], [data-action="map-road"])[data-choice^="travel:"]'
      + ':not(:has-text("Enter "))').first().getAttribute('data-choice');
    expect(far).toMatch(/^travel:/);
    await d.key('Escape');
    const said = await d.act(far!);
    expect(said).not.toBe('fallback');
    expect((await d.inspect()).place?.id).not.toBe(here);
  }, 600000);
});
