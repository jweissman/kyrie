/// <reference lib="dom" />
// The same sustained journey in a real browser: the commands a profile recorded (scripts/journey-profile.ts --out),
// done in the built page by their ids (kyrieMono.act), in a tablet's viewport with the page's processor slowed if
// asked (CDP Emulation.setCPUThrottlingRate, which slows the page's thread and not its engine's worker). Each command
// is timed as the page times a choice (web/reader/timings.ts: from the choice to the second frame painted after the
// answer, with the engine's own share and the render), and the page's heap after a collection and what it keeps in
// the browser are recorded as it goes. Fights go on by the game's own tactics, as the page's T does.
//   bun run web:build
//   LD_LIBRARY_PATH=… bun scripts/journey-browser.ts <steps.jsonl> <seed> [--class warrior] [--origin wanderer]
//     [--throttle 1] [--width 820] [--height 1180] [--out file.jsonl] [--every 25]
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium, type CDPSession, type Page } from 'playwright-core';
import { JourneyProfile, type JourneyStep } from './journey-profile';

interface Mono {
  inspect(): { mode: string; pending: boolean; combat?: { ours: boolean; outcome: string | null };
    timings: { total: number; engine?: number; screen?: number; narrative?: number; render: number }[] };
  begin(r: unknown): Promise<void>; act(command: string, said: string): void; auto(): void; back(): void;
}
interface BrowserStep {
  step: number; choice: string; total: number; engine: number; screen: number; narrative: number; render: number;
  fight: number; heap: number; kept: number;
}
class JourneyBrowser {
  constructor(private readonly page: Page, private readonly cdp: CDPSession) {}
  static async main(args: string[]): Promise<number> {
    const [file, seed] = args;
    if (!file || !seed) { console.error('usage: bun scripts/journey-browser.ts <steps.jsonl> <seed> [options]'); return 1; }
    const option = JourneyProfile.option.bind(JourneyProfile, args);
    const steps = readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as JourneyStep);
    const chromiumAt = process.env.KYRIE_CHROMIUM;
    const browser = await chromium.launch(chromiumAt ? { executablePath: chromiumAt } : {});
    try {
      const page = await browser.newPage({ viewport: { width: Number(option('width', '820')),
        height: Number(option('height', '1180')) }, hasTouch: true });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(option('throttle', '1')) });
      const journey = new JourneyBrowser(page, cdp), every = Number(option('every', '25'));
      await page.goto(`file://${resolve(import.meta.dir, '../site/mono.html')}`);
      await page.evaluate(() => { try { localStorage.clear(); } catch { /* file:// may refuse storage */ } });
      await page.reload();
      await page.waitForFunction(() => 'kyrieMono' in window);
      const began = performance.now();
      await journey.begin({ campaign: 'world', seed, party: [{ name: 'Wenna', raceId: 'human',
        classId: option('class', 'warrior') }], origin: option('origin', 'wanderer') });
      console.log(`begin ${Math.round(performance.now() - began)} ms`);
      const done = await journey.play(steps, every), out = option('out', '');
      JourneyBrowser.summary(done);
      if (out) { writeFileSync(out, done.map(s => JSON.stringify(s)).join('\n') + '\n'); }
      return done.length === steps.length ? 0 : 1;
    } finally { await browser.close(); }
  }
  private mono<T>(body: (m: Mono) => T): Promise<T> {
    return this.page.evaluate(`(${body.toString()})(window.kyrieMono)`) as Promise<T>;
  }
  private async settled() {
    await this.page.waitForFunction('!window.kyrieMono.inspect().pending && window.kyrieMono.inspect().mode !== "create"',
      null, { timeout: 600000, polling: 20 });
  }
  async begin(request: unknown) {
    await this.page.evaluate(`window.kyrieMono.begin(${JSON.stringify(request)})`);
    await this.page.waitForFunction('window.kyrieMono.inspect().mode === "explore"', null, { timeout: 600000 });
  }
  async play(steps: JourneyStep[], every: number): Promise<BrowserStep[]> {
    const done: BrowserStep[] = [];
    for (const s of steps) {
      // The page keeps its last 200 timings: a new one is told by the last one changing, not by their count.
      const before = await this.page.evaluate('JSON.stringify(window.kyrieMono.inspect().timings.at(-1) ?? null)');
      await this.page.evaluate(`window.kyrieMono.act(${JSON.stringify(s.command)}, ${JSON.stringify(s.choice)})`);
      await this.settled();
      const fight = await this.fight();
      const timing = await this.page.waitForFunction(`JSON.stringify(window.kyrieMono.inspect().timings.at(-1) ?? null)
        !== ${JSON.stringify(before)} && window.kyrieMono.inspect().timings.at(-1)`, null, { timeout: 60000 })
        .then(h => h.jsonValue()) as Mono['inspect'] extends () => { timings: (infer T)[] } ? T : never;
      done.push({ step: s.step, choice: s.choice, total: timing.total, engine: timing.engine ?? 0,
        screen: timing.screen ?? 0, narrative: timing.narrative ?? 0, render: timing.render, fight,
        ...await this.size(s.step % every === 0) });
      if (s.step % every === 0) { JourneyBrowser.row(done.slice(-every)); }
    }
    return done;
  }
  // A fight the command began, fought out by the game's own tactics and left: how long it took, all told.
  private async fight(): Promise<number> {
    const started = performance.now();
    for (let i = 0; i < 400 && (await this.mono(m => m.inspect().mode)) === 'combat'; i++) {
      const outcome = await this.mono(m => m.inspect().combat?.outcome ?? null);
      await this.page.evaluate(outcome ? 'window.kyrieMono.back()' : 'window.kyrieMono.auto()');
      await this.settled();
    }
    return Math.round(performance.now() - started);
  }
  // The page's heap (after a collection, at the end of each window) and what it keeps in this browser.
  private async size(collect: boolean): Promise<{ heap: number; kept: number }> {
    if (collect) { await this.cdp.send('HeapProfiler.collectGarbage'); }
    const heap = await this.cdp.send('Runtime.getHeapUsage');
    const kept = await this.page.evaluate(() => {
      try { return Object.keys(localStorage).reduce((n, k) => n + (localStorage.getItem(k)?.length ?? 0), 0); }
      catch { return 0; }
    });
    return { heap: Math.round(heap.usedSize / 1e6), kept };
  }
  private static median(w: BrowserStep[], k: keyof BrowserStep): number {
    return JourneyProfile.pct(w.map(s => s[k] as number), 0.5);
  }
  private static row(w: BrowserStep[]) {
    const last = w.at(-1)!;
    console.log(`steps ${w[0]!.step}-${last.step}: choice to paint p50 ${this.median(w, 'total')} max`
      + ` ${Math.max(...w.map(s => s.total))} | engine ${this.median(w, 'engine')} screen ${this.median(w, 'screen')}`
      + ` render ${this.median(w, 'render')} | page heap ${last.heap}MB kept ${Math.round(last.kept / 1000)}k`);
  }
  private static summary(done: BrowserStep[]) {
    for (const k of ['total', 'engine', 'screen', 'narrative', 'render', 'fight'] as const) {
      const all = done.map(s => s[k]);
      console.log(`${k}: p50 ${JourneyProfile.pct(all, 0.5)} p90 ${JourneyProfile.pct(all, 0.9)}`
        + ` p99 ${JourneyProfile.pct(all, 0.99)} max ${Math.max(...all)} ms`);
    }
  }
}
process.exitCode = await JourneyBrowser.main(process.argv.slice(2));
