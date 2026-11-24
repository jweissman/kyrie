/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Browser } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// Play to the first meaningful action, measured in the built page (OR-23, AX-04; BRIEF §3.1 and §4: "first meaningful
// action within 1.5 seconds of Play", "Play → ready game with prepared world under 1 second", "measured and reported,
// not asserted from a hopeful animation"). A player who knows what they want: Play pressed the moment it shows, then
// We enter the world as we are the moment it is asked, so that the time is the game's, not the player's reading. From
// the press of Play to the first frame of play drawn with its acts (a place's rows, or the opening's first page and its
// Continue), measured in the page by its own clock; and apart, the question's answer (Play to the two rows drawn) and
// the second press to that first frame. Two conditions: cold, Play pressed as soon as the title shows, the world and
// the life still being rolled behind it (EngineForesight: the country drawn and the start made ready from the title's
// load); warm, the title left to stand until the engine is idle, the roll done. Each in a fresh browser context, at a
// laptop's 1280x800 and a phone's 390x844 by touch, several runs, p50 and p95 logged with the engine's own phases of
// the start (Frame.timing). The ceilings are generous and catch only a broken pre-roll or a start gone wholly cold
// (test/quarantine.json: no flaky budget); the numbers are the register's (OR-23).
// rolled: warm, how long after the title showed the engine was idle, the world and the life rolled (cold: 0).
interface Run { titled: number; rolled: number; question: number; entered: number; total: number;
  engine: Record<string, number> }
class Timed {
  static readonly runs = 5;
  // The ceilings: warm, the pre-roll taken (well under them when it is); cold, a start drawn from nothing at all.
  static readonly warm = 3000;
  static readonly cold = 30000;
  static async run(browser: Browser, site: string, size: { width: number; height: number },
    warm: boolean): Promise<Run> {
    const touch = size.width < 600;
    const context = await browser.newContext({ viewport: size, ...touch ? { hasTouch: true, isMobile: true } : {} });
    const page = await context.newPage(), began = Date.now();
    await page.goto(`file://${join(site, 'mono.html')}`);
    await page.waitForSelector('[data-action="begin"]', { state: 'visible', timeout: 60000 });
    const titled = Date.now() - began, shown = Date.now();
    if (warm) {
      await page.evaluate(() => (window as unknown as { kyrieMono: { idle(): Promise<unknown> } }).kyrieMono.idle());
    }
    const rolled = warm ? Date.now() - shown : 0;
    const timed = await page.evaluate(() => new Promise<{ question: number; entered: number; total: number }>(done => {
      const start = performance.now();
      let question = 0, second = 0;
      const ready = () => document.querySelector('.stage[data-mode="explore"] [data-act], .prologue-page .go-on, '
        + '.prologue-page [data-action="answer"]');
      new MutationObserver((_, watching) => {
        const now = performance.now(), row = document.querySelector<HTMLElement>('.begin-menu [data-action="set-out-now"]');
        if (!second && row) { question = now - start; second = now; row.click(); return; }
        if (second && ready()) {
          watching.disconnect();
          done({ question: Math.round(question), entered: Math.round(now - second), total: Math.round(now - start) });
        }
      }).observe(document.body, { subtree: true, childList: true, attributes: true });
      document.querySelector<HTMLElement>('[data-action="begin"]')!.click();
    }));
    const engine = await page.evaluate(() => (window as unknown as { kyrieMono: { inspect(): { begun?: Record<string,
      number> } } }).kyrieMono.inspect().begun ?? {});
    await context.close();
    return { titled, rolled, ...timed, engine };
  }
  static pct(xs: number[], p: number): number {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]!;
  }
  static said(runs: Run[]) {
    const of = (k: 'titled' | 'rolled' | 'question' | 'entered' | 'total') => ({ p50: Timed.pct(runs.map(r => r[k]), 0.5),
      p95: Timed.pct(runs.map(r => r[k]), 0.95), max: Math.max(...runs.map(r => r[k])) });
    return { title: of('titled'), rolled: of('rolled'), question: of('question'), entered: of('entered'), total: of('total'),
      engine: runs.at(-1)!.engine };
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('Play to the first meaningful action', () => {
  let site = '', browser: Browser;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-play-first-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  const cases = [[1280, 800, 'warm'], [390, 844, 'warm'], [1280, 800, 'cold'], [390, 844, 'cold']] as const;
  it.each(cases)('at %ix%i, %s', async (width, height, how) => {
    const runs: Run[] = [];
    for (let i = 0; i < Timed.runs; i++) { runs.push(await Timed.run(browser, site, { width, height }, how === 'warm')); }
    const said = Timed.said(runs);
    console.log(`PLAY ${width}x${height} ${how} ${JSON.stringify(said)} runs=${JSON.stringify(runs.map(r => r.total))}`);
    expect(said.total.max).toBeLessThan(how === 'warm' ? Timed.warm : Timed.cold);
  }, 900000);
});
