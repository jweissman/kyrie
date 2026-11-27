#!/usr/bin/env bun
/// <reference lib="dom" />
// A fight's responsiveness in the built page (the owner, 26 November: the combat experiment's first part, "press →
// settled frame against 300 ms p95"; AGENTS.md's beta target, an act settled in the browser under 300 ms p95). a1's
// first fight, the rats under the corn-store, reached as a player goes (test/support/rats-walk); then, round by round,
// Attack pressed and its first target, each timed by the page's own clock from the press of the target to the frame
// settled: the company's turn again (or the fight over), nothing pending, and two frames painted after it. Each press
// as it is drawn, at a laptop's 1280x800 and, by touch, a phone's 390x844; p50, p95 and the worst printed, with the
// engine's own share of the last frame (Frame.timing). It asserts nothing: the numbers are the register's.
//   bun scripts/performance/fight-press.ts [--runs 3]
// Needs a Playwright Chromium (KYRIE_CHROMIUM may name it) and, on this machine, LD_LIBRARY_PATH for NSS.
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../../src/cli/site-build';
import { MonoBrowser } from '../../test/support/mono-browser';
import { RatsWalk } from '../../test/support/rats-walk';

interface Press { ms: number; engine?: number; screen?: number }
type Mono = { kyrieMono: { inspect(): { pending: boolean; mode: string; combat?: { ours?: boolean; outcome?: string };
  timings: { engine?: number; screen?: number }[] } } };
export class FightPress {
  static readonly target = 300;
  static pct(xs: number[], p: number): number {
    const s = [...xs].sort((a, b) => a - b);
    return s.length ? s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]! : NaN;
  }
  // One press of a target, timed in the page to the frame settled.
  static async press(page: Page): Promise<Press | undefined> {
    const attack = page.locator('.fight .hand-menu [data-action="attack"]');
    if (!await attack.count()) { return undefined; }
    await attack.click();
    const whom = page.locator('.fight .hand .whom [data-action="whom"]').first();
    const chosen = await whom.count() ? whom : undefined;
    // The press, by the page's own clock (window.pressedAt), then the frame settled: nothing pending, and the company's
    // turn again, the fight's end, or out of the fight (each look a frame apart, never past 10 s); then two frames
    // painted.
    await page.evaluate((direct: boolean) => {
      (window as unknown as { pressedAt: number }).pressedAt = performance.now();
      if (!direct) { document.querySelector<HTMLElement>('.fight .hand .whom [data-action="whom"]')!.click(); }
    }, !chosen);
    await page.waitForFunction(() => {
      const s = (window as unknown as Mono).kyrieMono.inspect();
      return !s.pending && (s.mode !== 'combat' || !!s.combat?.ours || !!s.combat?.outcome);
    }, null, { polling: 'raf', timeout: 10000 });
    return page.evaluate(async () => {
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const w = window as unknown as Mono & { pressedAt: number }, last = w.kyrieMono.inspect().timings.at(-1);
      return { ms: Math.round(performance.now() - w.pressedAt),
        ...last?.engine !== undefined ? { engine: last.engine } : {},
        ...last?.screen !== undefined ? { screen: last.screen } : {} };
    });
  }
  static async fight(page: Page): Promise<Press[]> {
    const out: Press[] = [];
    for (let i = 0; i < 30; i++) {
      const s = await page.evaluate(() => (window as unknown as { kyrieMono: { inspect(): { mode: string;
        combat?: { outcome?: string } } } }).kyrieMono.inspect());
      if (s.mode !== 'combat' || s.combat?.outcome) { break; }
      const p = await this.press(page);
      if (!p) { break; }
      console.log(`    press ${out.length + 1}: ${p.ms} ms (engine ${p.engine ?? '?'} ms)`);
      out.push(p);
    }
    return out;
  }
  static async main(args: string[]): Promise<number> {
    const at = args.indexOf('--runs'), runs = at >= 0 ? Number(args[at + 1]) : 2;
    const site = await mkdtemp(join(tmpdir(), 'kyrie-fight-press-')), browser = await MonoBrowser.launch();
    try {
      await SiteBuild.site(site, {});
      const sizes = args.includes('--wide') ? [[1280, 800]] as const : [[1280, 800], [390, 844]] as const;
      for (const [width, height] of sizes) {
        const presses: Press[] = [];
        for (let r = 0; r < runs; r++) {
          const { page, driver } = await MonoBrowser.page(browser, { width, height },
            { site, query: '?world=a1&earned' });
          page.setDefaultTimeout(20000);
          console.log(`  ${width}x${height} run ${r + 1}: to the rats`);
          await new RatsWalk(page, driver).rats();
          console.log(`  ${width}x${height} run ${r + 1}: in the fight`);
          presses.push(...await this.fight(page));
          await page.close();
        }
        const ms = presses.map(p => p.ms), engine = presses.flatMap(p => p.engine ?? []);
        console.log(`FIGHT-PRESS ${width}x${height}: ${presses.length} presses; press → settled p50 ${this.pct(ms, 0.5)} ms,`
          + ` p95 ${this.pct(ms, 0.95)} ms, worst ${Math.max(...ms)} ms (target p95 ${this.target} ms);`
          + ` the engine's share p50 ${this.pct(engine, 0.5)} ms, p95 ${this.pct(engine, 0.95)} ms`);
      }
    } finally {
      await browser.close();
      await rm(site, { recursive: true, force: true });
    }
    return 0;
  }
}

if (import.meta.main) { process.exit(await FightPress.main(process.argv.slice(2))); }
