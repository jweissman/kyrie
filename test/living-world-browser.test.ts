/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../bin/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The March as a living world, played through the real client by keys: the keep's ways in and secrets, the world
// moving overnight, the drowned girl, and the register taken home and kept through a night watch. Each step is
// a real input event; the checks read what is on the page. Opt in with KYRIE_BROWSER=1.
class Living {
  static readonly query = '?campaign=data/campaigns/serewater-march.campaign.json';
  static async walk(d: MonoDriver, ...places: string[]) { for (const p of places) { await d.go(p); } }
  static async ids(d: MonoDriver) { return (await d.inspect()).choices.map(c => c.id.split('/')[0]!); }
  static async light(d: MonoDriver) {
    if ((await d.inspect()).choices.some(c => c.label.includes('light a torch'))) {
      await d.pick(c => c.label.includes('light a torch'), 'a torch');
    }
  }
  static async buyTorches(d: MonoDriver, seller: string) {
    for (let i = 0; i < 2; i++) { await d.do(seller, 'Buy'); await d.choose('Torch'); }
  }
  static async text(page: Page) { return page.evaluate(() => document.body.innerText); }
  static async way(d: MonoDriver, place: string) {
    return (await d.inspect()).choices.find(c => c.id.split('/')[0]!.endsWith(`__${place}`) && c.id.startsWith('exit:'));
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the March as a living world, in a real browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-living-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('Holt keep: several ways in, secrets that change what can be done, a world that moves overnight', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, query: Living.query });
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]');
    await Living.walk(d, 'shop_floor');
    await Living.buyTorches(d, 'nera');
    // Overland by Chalkcross and the holt, smoking the bears out of the bracken on the way.
    await Living.walk(d, 'quay', 'causeway', 'ridge', 'cross_green', 'holt_edge');
    await d.do('bears', 'Lay green wood');
    await Living.walk(d, 'den_clearing', 'holt_green', 'tower_foot');
    // Exercise 2, a blocked route with several ways in: the gate is barred, the postern opens to a locksmith.
    expect((await Living.way(d, 'bailey'))?.disabled).toBeTruthy();
    await d.go('crypt');
    await Living.light(d);
    // Exercise 3, a discovery that changes what can be done: the back stair appears once the worn steps are read.
    expect(await Living.way(d, 'study')).toBeUndefined();
    await d.do('worn_steps', 'Examine');
    expect(await Living.way(d, 'study')).toBeDefined();
    await d.do('risen', 'Say the rites');
    await Living.walk(d, 'hall', 'library');
    await d.do('letters', 'Examine');
    await d.do('roll', 'Examine');
    await Living.walk(d, 'hall', 'bailey');
    await d.do('winch', 'Wind');
    expect((await Living.way(d, 'tower_foot'))?.disabled).toBeFalsy();
    await Living.walk(d, 'stable');
    await d.do('plan', 'Examine');
    await Living.walk(d, 'bailey', 'chapel');
    // The captain answers only to the name in the roll.
    await d.do('captain', 'Call the captain by his name');
    expect(await Living.text(page)).toContain('Present');
    await Living.walk(d, 'bailey', 'hall', 'crypt');
    await Living.light(d);
    await Living.walk(d, 'cistern');
    await d.go('strongroom', 'sluice');
    await Living.walk(d, 'strongroom');
    await d.do('chest', 'Break');
    expect(await Living.text(page)).toContain('twenty-five old crowns');
    await d.do('plate', 'Take');
    // Out by the gate the company opened, to the Holly Bush for the night.
    await Living.walk(d, 'cistern', 'crypt', 'hall', 'bailey', 'tower_foot', 'holt_green', 'holly_room');
    await d.do('osric', 'Take a bed');
    // Saved as it goes: a reloaded page continues the same company, at the same place and hour.
    const [place, clock] = [(await d.inspect()).place?.id, await page.textContent('[data-id="clock"]')];
    await page.reload();
    await d.click('[data-action="continue"]');
    await page.waitForSelector('[data-mode="explore"]');
    expect([(await d.inspect()).place?.id, await page.textContent('[data-id="clock"]')]).toEqual([place, clock]);
    await Living.buyTorches(d, 'osric');
    await Living.walk(d, 'holt_green');
    // Exercise 5, someone acting while the company was elsewhere: overnight the churchyard fell, and the green says
    // so as news.
    expect(await page.textContent('.prose p.new')).toContain('lychgate hangs open');
    await Living.walk(d, 'tower_foot', 'bailey', 'hall', 'crypt');
    await Living.light(d);
    await Living.walk(d, 'study');
    // Exercise 8, an encounter that reacts to what the company did elsewhere: Sorgen knows his hall's dead were laid.
    expect(await Living.text(page)).toContain('You laid my dead down in the hall');
    await d.do('key', 'Take');
    await Living.walk(d, 'roof');
    // Exercise 7, a strategic operation that changed the site: from the roof, the churchyard held; below, a voice.
    const roof = await Living.text(page);
    expect([roof.includes('in Brackenholt churchyard, something tall'), roof.includes("a girl's voice")]).toEqual([true, true]);
    await Living.walk(d, 'study', 'crypt', 'cell');
    await Living.light(d);
    await d.do('maren', 'Ask the drowned girl');
    expect(await Living.text(page)).toContain('Tell him to let me go');
    await Living.walk(d, 'crypt', 'study');
    await d.do('necromancer', 'Tell Sorgen');
    expect(await Living.text(page)).toContain("'Then I will,' he says");
    await d.mode('j');
    const journal = await page.textContent('.known');
    expect([journal?.includes('from the garrison roll'), journal?.includes('told you'), journal?.includes('you saw it')])
      .toEqual([true, true, true]);
    expect((await MonoBrowser.metrics(page)).scroll).toBe(false);
    expect(errors).toEqual([]);
    await page.close();
  }, 600000);

  it('the register taken home: Iven accepts it, two installations share him, and a night watch catches Corvin', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, query: Living.query });
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]');
    await Living.walk(d, 'shop_floor');
    await Living.buyTorches(d, 'nera');
    await Living.walk(d, 'quay', 'causeway', 'ridge', 'yard', 'vestibule', 'workshop');
    await d.go('stores', 'pick the stores padlock');
    await Living.walk(d, 'stores', 'hall');
    await Living.light(d);
    await Living.walk(d, 'kitchen');
    await d.do('crock_label', 'Examine');
    await d.go('name_room', 'Risk');
    await d.choose('Bran');
    await d.do('register_copy', 'Take');
    await Living.walk(d, 'kitchen', 'hall', 'stores', 'workshop', 'vestibule', 'yard', 'ridge', 'causeway', 'quay', 'shrine');
    // Exercise 6, two installations sharing a person: Iven answers for the keepers' dead and for the register.
    const iven = (await d.inspect()).choices.filter(c => c.id.startsWith('keepers__keeper')).map(c => c.label);
    expect([iven.some(l => l.includes("keepers' dead")), iven.some(l => l.startsWith('Give the waxed refuge register'))])
      .toEqual([true, true]);
    // Exercise 1, a request met naturally: he asked for it; it is handed over, and he takes it.
    await d.do('keeper', 'Give');
    expect(await page.textContent('[data-id="response"]')).toContain('You have brought them home');
    // Exercise 4, an activity that can be interrupted: waiting out the night, the company is roused when someone
    // comes; exercise 8 again, Corvin comes because the company brought the register here.
    let roused = '';
    for (let i = 0; i < 80 && !roused; i++) {
      const night = (await d.inspect()).choices.some(c => c.label === 'Wait until first light');
      await d.choose(night ? 'Wait until first light' : 'Wait an hour');
      const said = await page.textContent('[data-id="response"]') ?? '';
      if (said.includes('You are interrupted')) { roused = said; }
    }
    expect(roused).toContain('Corvin');
    expect((await d.inspect()).choices.some(c => c.id.startsWith('rising__digger') && c.label === 'Attack')).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
  }, 600000);
});
