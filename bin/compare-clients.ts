#!/usr/bin/env bun
/// <reference lib="dom" />
// Replays the Mono reference journey's exact commands in the previous Folio player by clicking, then plays the
// same journey in Mono by pointer, and records input counts and per-screen measurements for both clients.
// Requires `bun run web:build` and doc/playtests/mono/journey.transcript.json (from bin/record-mono.ts).
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { Page } from 'playwright-core';
import { MonoJourney } from './record-mono';
import { PlaySession, type Transcript } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

interface Sample { scroll: boolean; buttons: number; partyVisible: boolean; placeVisible: boolean; words: number }

export class ClientComparison {
  static readonly site = resolve(import.meta.dir, '../site');
  static sample(page: Page): Promise<Sample> {
    return page.evaluate(() => {
      const shown = Array.from(document.querySelectorAll('button, h1, .company-bar, .party')).filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
      });
      return { scroll: document.documentElement.scrollHeight > innerHeight + 1,
        buttons: shown.filter(el => el.tagName === 'BUTTON').length,
        partyVisible: shown.some(el => el.matches('.company-bar, .party')), placeVisible: shown.some(el => el.tagName === 'H1'),
        words: document.body.innerText.split(/\s+/).length };
    });
  }
  static async click(page: Page, counter: { clicks: number }, selector: string) {
    const el = page.locator(selector).first();
    await el.scrollIntoViewIfNeeded();
    await el.click(); counter.clicks++;
    await page.waitForFunction(() => !document.querySelector('.pending'), null, { timeout: 60000 });
  }
  static present(page: Page, selector: string): Promise<boolean> {
    return page.locator(selector).first().isVisible().catch(() => false);
  }
  static async folio(page: Page, transcript: Transcript) {
    const counter = { clicks: 0 }, samples: Sample[] = [];
    await this.click(page, counter, '[data-action="start"]');
    await page.waitForSelector('.game-shell', { timeout: 60000 });
    for (const step of transcript.steps) {
      const target = `[data-action="command"][data-id="${step.command}"]`;
      if (!await this.present(page, target)) {
        const intents = await page.locator('[data-action="intent"]').evaluateAll(els => els.map(e => (e as HTMLElement).dataset.id!));
        for (const intent of intents) {
          await this.click(page, counter, `[data-action="intent"][data-id="${intent}"]`);
          if (await this.present(page, target)) { break; }
        }
      }
      if (!await this.present(page, target)) {
        for (const drawer of ['satchel', 'company', 'journal', 'map']) {
          await this.click(page, counter, `[data-action="drawer"][data-id="${drawer}"]`);
          if (await this.present(page, target)) { break; }
          await this.click(page, counter, '[role="dialog"] [data-action="drawer"]');
        }
      }
      await this.click(page, counter, target);
      for (const command of step.combat ?? []) {
        await page.waitForSelector(`[data-action="ability"][data-id="${command.ability}"]`, { timeout: 60000 });
        await this.click(page, counter, `[data-action="ability"][data-id="${command.ability}"]`);
        if (await this.present(page, `[data-action="target"][data-id="${command.target}"]`)) {
          await this.click(page, counter, `[data-action="target"][data-id="${command.target}"]`);
        }
      }
      if (await this.present(page, '[data-action="continue"]')) { await this.click(page, counter, '[data-action="continue"]'); }
      if (await this.present(page, '[role="dialog"]')) { await this.click(page, counter, '[role="dialog"] [data-action="drawer"]'); }
      samples.push(await this.sample(page));
    }
    const exported = await page.evaluate(() => JSON.parse(localStorage.getItem('kyrie.serewater.game.v1') ?? 'null') as
      { transcript: Transcript } | null);
    return { clicks: counter.clicks, samples, transcript: exported?.transcript };
  }
  static summary(samples: Sample[]) {
    const n = samples.length || 1;
    return { screens: samples.length, scrollingScreens: samples.filter(s => s.scroll).length,
      meanVisibleButtons: Math.round(samples.reduce((a, s) => a + s.buttons, 0) / n),
      partyVisible: samples.filter(s => s.partyVisible).length,
      placeVisible: samples.filter(s => s.placeVisible).length,
      meanWords: Math.round(samples.reduce((a, s) => a + s.words, 0) / n) };
  }
  static async run() {
    const path = resolve(import.meta.dir, '../doc/playtests/mono/journey.transcript.json');
    const transcript = await Bun.file(path).json() as Transcript;
    const browser = await MonoJourney.launch();
    const results: Record<string, unknown> = { commands: transcript.steps.length,
      combatTurns: transcript.steps.reduce((a, s) => a + (s.combat?.length ?? 0), 0) };
    try {
      for (const [label, width, height] of [['desktop', 1440, 900], ['phone', 390, 844]] as const) {
        const folioPage = await browser.newPage({ viewport: { width, height } });
        await folioPage.goto(`file://${join(this.site, 'serewater.html')}`);
        await folioPage.evaluate(() => localStorage.clear()); await folioPage.reload();
        const folio = await this.folio(folioPage, transcript);
        const same = JSON.stringify(folio.transcript?.steps) === JSON.stringify(transcript.steps);
        const mono = await MonoJourney.page(browser, { width, height }, { pointer: true });
        const monoSamples: Sample[] = [];
        await MonoJourney.journey(mono.driver, async () => { monoSamples.push(await this.sample(mono.page)); });
        const replay = await PlaySession.start(transcript.scenario, transcript.seed, NodeBundleSource.shared,
          transcript.party);
        await replay.replay(transcript.steps);
        results[label] = { folio: { clicks: folio.clicks, identicalCommands: same, ...this.summary(folio.samples) },
          mono: { clicks: mono.driver.presses, ...this.summary(monoSamples), note: 'samples at the journey checkpoints' } };
        await folioPage.close(); await mono.page.close();
      }
    } finally { await browser.close(); }
    await mkdir(resolve(import.meta.dir, '../doc/playtests/mono'), { recursive: true });
    await writeFile(resolve(import.meta.dir, '../doc/playtests/mono/comparison.json'), JSON.stringify(results, null, 2));
    return results;
  }
}

if (import.meta.main) { console.log(JSON.stringify(await ClientComparison.run(), null, 2)); }
