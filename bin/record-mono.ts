#!/usr/bin/env bun
/// <reference lib="dom" />
// Plays the reference Serewater journey in the built Mono client through real keyboard/pointer input, writing
// screenshots, the exported transcript and measurements to doc/playtests/mono. Requires `bun run web:build`
// and a Playwright Chromium (KYRIE_CHROMIUM may name the executable).
import { chromium, type Page } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { MonoDriver } from '../test/support/mono-driver';

export class MonoJourney {
  static readonly out = resolve(import.meta.dir, '../doc/playtests/mono');
  static async launch() {
    return chromium.launch(process.env.KYRIE_CHROMIUM ? { executablePath: process.env.KYRIE_CHROMIUM } : {});
  }
  static async page(browser: Awaited<ReturnType<typeof MonoJourney.launch>>, size: { width: number; height: number },
    options: { site?: string; pointer?: boolean; query?: string } = {}) {
    const page = await browser.newPage({ viewport: size, ...(options.pointer ? { hasTouch: true } : {}) });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`file://${join(options.site ?? resolve(import.meta.dir, '../site'), 'mono.html')}${options.query ?? '?campaign=data/serewater/campaign.json'}`);
    await page.evaluate(() => { try { localStorage.clear(); } catch { /* file:// may refuse storage */ } });
    await page.reload();
    return { page, errors, driver: new MonoDriver(page, options.pointer) };
  }
  static async metrics(page: Page) {
    return page.evaluate(() => {
      const doc = document.documentElement;
      const panes = Array.from(document.querySelectorAll('.pane')).map(p => p.getBoundingClientRect());
      const area = panes.reduce((sum, r) => sum + r.width * r.height, 0);
      return { scroll: doc.scrollHeight > innerHeight || doc.scrollWidth > innerWidth,
        paneCoverage: Math.round((area / (innerWidth * innerHeight)) * 100),
        visibleRows: document.querySelectorAll('.row').length, words: document.body.innerText.split(/\s+/).length };
    });
  }
  // The reference journey. Each step is an ordinary input: arrows, Enter, digits, Escape or a click.
  static async journey(d: MonoDriver, shot: (name: string) => Promise<void>) {
    await d.click('[data-action="start"]');
    await d.page.waitForSelector('[data-mode="explore"]');
    await shot('01-quay');
    await d.go('march__outfitter');
    await d.open('march__nera');
    await d.choose('Talk');
    await d.open('topic:Ask Nera how to prepare');
    await d.open('deal:Buy');
    await d.choose('Nera’s healing draught', 'for Bran');
    await shot('02-conversation');
    await d.open('leave');
    await d.go('march__quay');
    await d.go('march__causeway');
    await d.open('march__marsh_cress');
    await shot('03-wilderness');
    await d.go('march__ridge');
    await d.go('march__yard');
    await d.go('march__vestibule');
    await d.open('march__pell');
    await d.choose('Talk');
    await d.open('topic:Ask Pell what happened');
    await d.open('leave');
    await d.open('march__pell');
    await d.choose('Free them');
    await shot('04-pell-freed');
    await d.open('march__survey_board');
    await d.go('march__workshop');
    await d.go('march__stores');
    await d.open('march__line_cache');
    await d.choose('Take', 'for Bran');
    await d.mode('i');
    await d.open('march__line_cache');
    await d.choose('Equip');
    await shot('05-pack');
    await d.mode('e');
    await d.go('march__workshop');
    await d.go('march__gallery');
    await shot('06-gallery');
    await d.open('march__roost');
    await d.choose('Attack');
    await shot('07-combat');
    await d.fight(async state => {
      const first = state.rows.find(r => r.id.startsWith('ability:attack')) ?? state.rows[0]!;
      await d.open(first.id);
      const targets = (await d.inspect()).menu;
      if (targets?.length) { await d.choose(targets[0]!.label); }
    });
    await shot('08-after-combat');
    await d.go('march__hoist');
    await d.open('march__scored_timber');
    await d.open('exit:march__landing');
    await d.choose('Brace');
    await d.go('march__landing');
    await shot('09-level-two');
    await d.go('march__hall');
    await d.go('march__kitchen');
    await d.open('exit:march__name_room');
    await d.choose('Risk', 'Elen');
    await shot('10-trap');
    await d.mode('i');
    await d.open('march__draught_1');
    await d.choose('Use on', 'Elen');
    await d.mode('e');
    for (const place of ['march__kitchen', 'march__hall', 'march__landing', 'march__hoist', 'march__gallery',
      'march__workshop', 'march__vestibule']) { await d.go(place); }
    await shot('11-pell-waiting');
    for (const place of ['march__yard', 'march__ridge', 'march__causeway', 'march__quay']) {
      await d.open(`exit:${place}`);
      await d.choose('Escort');
    }
    await shot('12-home');
    await d.open('march__pell');
    await d.choose('Talk');
    await d.open('topic:Speak with Pell after returning');
    await d.open('leave');
    await d.mode('j');
    await shot('13-journal');
    await d.mode('h');
    await shot('14-history');
    await d.mode('h');
    await d.mode('e');
  }
  static async capture(page: Page, name: string, measured: Record<string, unknown>) {
    await page.screenshot({ path: join(this.out, `${name}.png`) });
    measured[name] = await this.metrics(page);
  }
  static async run() {
    await mkdir(this.out, { recursive: true });
    const browser = await this.launch();
    const results: Record<string, unknown> = {};
    try {
      const sizes = ([['desktop', 1440, 900], ['laptop', 1024, 768], ['phone', 390, 844]] as const)
        .filter(([label]) => !process.env.MONO_SIZES || process.env.MONO_SIZES.split(',').includes(label));
      for (const [label, width, height] of sizes) {
        const { page, errors, driver } = await this.page(browser, { width, height }, { pointer: label === 'phone' });
        const measured: Record<string, unknown> = {};
        const started = Date.now();
        await this.journey(driver, name => this.capture(page, `${label}-${name}`, measured));
        const transcript = await page.evaluate(() => (window as unknown as {
          kyrieMono: { exportTranscript(): unknown } }).kyrieMono.exportTranscript());
        if (label === 'desktop') {
          await writeFile(join(this.out, 'journey.transcript.json'), JSON.stringify(transcript, null, 1));
        }
        results[label] = { width, height, inputs: driver.presses, seconds: (Date.now() - started) / 1000,
          errors, screens: measured, final: await driver.inspect() };
        await page.close();
      }
    } finally { await browser.close(); }
    await writeFile(join(this.out, 'results.json'), JSON.stringify(results, null, 2));
    return results;
  }
}

if (import.meta.main) {
  const results = await MonoJourney.run();
  for (const [label, r] of Object.entries(results)) {
    const { inputs, seconds, errors } = r as { inputs: number; seconds: number; errors: string[] };
    console.log(`${label}: ${inputs} inputs, ${seconds.toFixed(1)}s, ${errors.length} page errors`);
  }
}
