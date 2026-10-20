#!/usr/bin/env bun
/// <reference lib="dom" />
// Plays "Caught Below" in both installations through the built Mono client with real input, writing screenshots,
// transcripts and map observations to doc/playtests/caught-below. Requires `bun run web:build` and Chromium.
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { Page } from 'playwright-core';
import { MonoBrowser as MonoJourney } from '../test/support/mono-browser';
import type { MonoDriver } from '../test/support/mono-driver';

export interface MapState { here?: string; places: string[]; edges: Record<string, string> }
export class CaughtJourney {
  static readonly campaigns = { river: 'data/campaigns/serewater-march.campaign.json',
    quarry: 'data/campaigns/skellfold.campaign.json' } as const;
  // A map edge or place by its id without the installation prefix.
  static edge(ids: Record<string, string>, suffix: string): string | undefined {
    return Object.entries(ids).find(([id]) => id.endsWith(`__${suffix}`))?.[1];
  }
  static readonly out = resolve(import.meta.dir, '../doc/playtests/caught-below');
  static map(page: Page): Promise<MapState> {
    return page.evaluate(() => ({
      here: document.querySelector('.chart .place[aria-current]')?.getAttribute('data-place') ?? undefined,
      places: Array.from(document.querySelectorAll('.chart .place')).map(p => p.getAttribute('data-place')!),
      edges: Object.fromEntries(Array.from(document.querySelectorAll('.chart .way'))
        .map(e => [e.getAttribute('data-edge')!, e.getAttribute('data-status')!])),
    }));
  }
  static async walk(d: MonoDriver, ...places: string[]) { for (const p of places) { await d.go(p); } }
  // A way that is not yet open says what to do first (open the door); once done, the way leads on.
  static async through(d: MonoDriver, place: string) {
    const ways = (await d.inspect()).choices.filter(c => c.id.startsWith('exit:') && c.id.split('/')[0]!.endsWith(`__${place}`));
    const first = ways.find(c => c.label.includes(' — '));
    if (first) { await d.go(place, first.label.split(' — ')[1]); }
    await d.go(place);
  }
  static async river(d: MonoDriver, shot: (name: string) => Promise<void>) {
    await d.click('[data-action="start"]');
    await d.page.waitForSelector('[data-mode="explore"]');
    await shot('01-quay');
    await d.do('rescue__relative', 'Ask Wren what is wrong');
    await shot('02-wren');
    await this.walk(d, 'shop_floor');
    await d.do('nera', 'Buy', 'one ration');
    await shot('03-shop');
    await this.walk(d, 'quay', 'causeway');
    await shot('04-floodplain');
    await d.do('boar', 'Read');
    await this.walk(d, 'drain_mouth', 'workshop');
    await this.through(d, 'stores');
    await d.do('rescue__bar', 'Take', 'for Bran');
    await this.walk(d, 'workshop', 'gallery');
    await shot('05-hound');
    await d.do('hound', 'Approach');
    await this.walk(d, 'hoist');
    await shot('06-pinned');
    await d.do('rescue__guest', 'Ask Pell what happened');
    await d.do('rescue__rack', 'Lever');
    await d.do('rescue__guest', 'Ask them to come with you');
    await shot('07-freed');
    await this.walk(d, 'gallery', 'workshop');
    const culvert = (await d.inspect()).choices.find(c => c.id.startsWith('exit:') && c.id.split('/')[0]!.endsWith('__drain_mouth'));
    if (culvert && !culvert.disabled) { await this.walk(d, 'drain_mouth', 'causeway'); }
    else { await this.walk(d, 'vestibule', 'yard', 'ridge', 'causeway'); }
    await this.walk(d, 'quay');
    await shot('08-reunion');
    await d.do('rescue__relative', 'Speak with Wren');
    await this.walk(d, 'taproom');
    await d.do('maud', 'Take a bed');
    await shot('09-inn');
    await d.mode('c');
    await shot('10-company');
    await d.mode('e');
    await d.mode('h');
    await shot('11-history');
    await d.mode('h');
  }
  static async quarry(d: MonoDriver, shot: (name: string) => Promise<void>) {
    await d.click('[data-action="start"]');
    await d.page.waitForSelector('[data-mode="explore"]');
    await d.do('rescue__relative', 'Ask Marrit what is wrong');
    await shot('01-marrit');
    await this.walk(d, 'lane_foot', 'quarry_floor', 'smithy');
    await d.do('rescue__bar', 'Take', 'for Bran');
    await d.do('coil', 'Take', 'for Elen');
    await this.walk(d, 'quarry_floor', 'adit', 'upper_gallery');
    await shot('02-ladder');
    await d.go('lower_gallery', 'Lash');
    await this.walk(d, 'lower_gallery');
    await d.do('rescue__rack', 'Lever');
    await d.do('rescue__guest', 'Ask them to come with you');
    await shot('03-freed');
    await this.walk(d, 'upper_gallery', 'adit', 'quarry_floor');
    const lane = (await d.inspect()).choices.find(c => c.id.startsWith('exit:') && c.id.split('/')[0]!.endsWith('__lane_foot'));
    await shot('04-quarry-floor');
    if (lane && !lane.disabled) { await this.walk(d, 'lane_foot', 'green'); }
    else { await this.walk(d, 'fell_track', 'green'); }
    await d.do('rescue__relative', 'Speak with Marrit');
    await shot('05-reunion');
  }
  static async run() {
    await mkdir(this.out, { recursive: true });
    const browser = await MonoJourney.launch();
    const results: Record<string, unknown> = {};
    try {
      for (const [label, campaign, width, height, pointer] of [
        ['river-desktop', 'river', 1440, 900, false], ['quarry-desktop', 'quarry', 1440, 900, false],
        ['quarry-phone', 'quarry', 390, 844, true]] as const) {
        const { page, errors, driver } = await MonoJourney.page(browser, { width, height },
          { pointer, query: `?campaign=${CaughtJourney.campaigns[campaign]}` });
        const maps: Record<string, MapState> = {};
        const play = campaign === 'river' ? this.river.bind(this) : this.quarry.bind(this);
        await play(driver, async name => {
          await page.screenshot({ path: join(this.out, `${label}-${name}.png`) });
          maps[name] = await this.map(page);
        });
        const transcript = await page.evaluate(() =>
          (window as unknown as { kyrieMono: { exportTranscript(): unknown } }).kyrieMono.exportTranscript());
        await writeFile(join(this.out, `${label}.transcript.json`), JSON.stringify(transcript, null, 1));
        results[label] = { inputs: driver.presses, errors, maps, final: await driver.inspect() };
        await page.close();
      }
    } finally { await browser.close(); }
    await writeFile(join(this.out, 'results.json'), JSON.stringify(results, null, 2));
    return results;
  }
}

if (import.meta.main) {
  const results = await CaughtJourney.run();
  for (const [label, r] of Object.entries(results)) {
    const { inputs, errors } = r as { inputs: number; errors: string[] };
    console.log(`${label}: ${inputs} inputs, ${errors.length} page errors`);
  }
}
