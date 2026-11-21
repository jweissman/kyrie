/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The page cold play's driver works the controls a player has (GR-24; cold play 9 had stopped measuring the game at
// T32, its driver pressing rows under a lens or a view it never opened). A short walk in Iscoed as Set out now draws
// it (the drove road), each step by MonoDriver.act, as scripts/cold-play/page-runner.ts plays: the aim followed by its
// own row; the Black Rhyne searched where the page draws Search; a walk about the town, held (the travel rows of
// T8-T9 and T75); and Porthalen left by the map, its own row held. None of it by the page's automation.
describe.skipIf(!process.env.KYRIE_BROWSER)('the page cold play\'s driver', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-walk-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  it('follows an aim, searches, walks the town and leaves it by the map, by a player\'s controls', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=iscoed' });
    page.setDefaultTimeout(8000);
    await page.waitForSelector('[data-mode="create"]', { timeout: 180000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"], [data-mode="prologue"]', { timeout: 180000 });
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
    // Back out of doors (the country's journeys are set out on from the town's open places, not from inside a house),
    // then out of Porthalen by the map: a journey the map rows, set out on there.
    await act('exit:region__s1_green');
    // The first place across the country the map's menu rows (it rows three, ranked; the rest are touched on the map
    // itself): viewed, then Travel to, held.
    const now = await d.inspect(), here = new Set((now.path ?? []).map(p => p.name));
    await d.key('m');
    const far = await page.locator('[data-action="map-view"]').first().getAttribute('data-choice');
    expect(far).toMatch(/^travel:/);
    await d.key('Escape');
    const after = await act(far!);
    expect(after.place?.id).not.toBe('drove__customs');
    expect((after.path ?? []).some(p => !here.has(p.name)) || after.place?.id === far!.slice('travel:'.length)).toBe(true);
    console.log(by.join('\n'));
    expect(by.filter(b => b.endsWith('fallback'))).toEqual([]);
    expect(errors).toEqual([]);
  }, 600000);
});
