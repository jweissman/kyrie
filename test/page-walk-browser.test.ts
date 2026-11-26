/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import type { Page } from 'playwright-core';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The page cold play's driver works the controls a player has (GR-24; cold play 9 had stopped measuring the game at
// T32, its driver pressing rows under a lens or a view it never opened). A short walk in Iscoed as Set out now draws
// it (the drove road), each step by MonoDriver.act, as scripts/cold-play/page-runner.ts plays: the aim taken up by its
// own step's row; the Black Rhyne searched where the page draws Search; a walk about the town, held (the travel rows of
// T8-T9 and T75); and Porthalen left by the map, its own row held. None of it by the page's automation.
// A new life on Iscoed begins under the fall in the old adit (StockOpenings): out of it first, by a player's controls
// as the rest is, a light made, the badger fought (it stands between the company and the prop), under the fallen
// prop, and down to the green, where the drove road's walk begins. The adit's own incidents are
// test/features/world/under-the-fall.pin's.
// The prop is lifted from its own drawer, opened by its likeness (pressing the likeness alone had left it down, and
// the drift's mouth beyond it pressed with the drawer open: the driver's fallback).
// In the dark of the fall no way on is open: the compass's mark is shut, and M brings up no empty lens (OR-211).
const inTheDark = async (page: Page, d: MonoDriver) => {
  expect(await page.locator('.scene-rail .opens-compass[disabled]').count()).toBe(1);
  await page.keyboard.press('m');
  expect(await page.locator('.glance .lens').count()).toBe(0);
  expect((await d.inspect()).place?.id).toMatch(/adit_fall$/);
};
const outOfTheAdit = async (d: MonoDriver) => {
  for (const words of [/light a (torch|candle)/i, /^To the old gallery/, /^To the old drift$/, /^Attack$/,
    /^the fallen prop$/, /^Heave up alone/, /^Up to the old drift/, /^To the landing at Porthalen/]) {
    const s = await d.inspect();
    const row = [...s.choices, ...s.sections.flatMap(x => x.choices)].find(c => words.test(c.label));
    expect([String(words), row?.id]).toEqual([String(words), expect.any(String)]);
    expect(await d.act(row!.id)).not.toBe('fallback');
    // The badger stands between the company and the prop until the bout with it is over (under-the-fall.pin, since
    // OR-461 to OR-464): fought by the page's own fight, as a player fights it.
    if (String(words) === String(/^Attack$/)) { await d.fight(); }
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
    await inTheDark(page, d);
    await outOfTheAdit(d);
    const by: string[] = [];
    const act = async (id: string) => { by.push(`${id}: ${await d.act(id)}`); return d.inspect(); };
    // The aims as the page holds them, written down (the driver had written none).
    const first = await d.inspect();
    expect((first.aims ?? []).map(a => a.id)).toContain('drove__held_aim');
    // The aim is taken up by its own step, the one row in its words (one row, one act: OR-466): no row to follow it
    // stands beside it. Pressed, it turns to Owain, the question first of what can be said to him, and asking it
    // follows the drove on to the Black Rhyne.
    const step = page.locator('[data-choice="drove__owain#talk"] >> visible=true').first();
    expect(await step.innerText()).toMatch(/Ask Owain how many head came down/);
    expect(await page.locator('[data-choice="follow:drove__held_aim"]').count()).toBe(0);
    const talk = await act('drove__owain#talk');
    const question = talk.choices.find(c => /^Ask how many head came down/.test(c.label));
    expect([talk.mode, question?.id]).toEqual(['talk', expect.any(String)]);
    expect((await act(question!.id)).aims?.find(a => a.followed)?.id).toBe('drove__held_rhyne');
    await d.away();
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
    // Told of somewhere across the country first, by the notice on the well-post (the sea-gate at Gatesend): since the
    // map draws what the company knows (OR-810), a company come up out of the adit has heard of no other town.
    const green = await d.inspect();
    const notice = [...green.choices, ...green.sections.flatMap(x => x.choices)]
      .find(c => /^Read the notice on the well-post/.test(c.label));
    expect(notice?.id).toEqual(expect.any(String));
    expect(await d.act(notice!.id)).not.toBe('fallback');
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
