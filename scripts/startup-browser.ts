// The browser's half of the startup benchmark (scripts/startup-bench.ts --browser): the local site build in Chromium,
// a1 from the page's load to creation, and Start pressed at once to the first place. Two passes a run, in one fresh
// browser profile: the first a first visit (nothing parsed kept in IndexedDB), the second a new game begun again in
// the same profile, as a returning player (what the first kept). The engine's share is what it says of itself in the
// first frame (the drawing and placing, the screen and its telling); the rest is the page, the transfer and the
// paint. Every request to the worker is timed from the page, and each part of the world taken in is timed as the
// engine says it (its progress), so the browser's installs can be laid beside Node's.
// Needs a Playwright Chromium (KYRIE_CHROMIUM may name it) and, on this machine, LD_LIBRARY_PATH for NSS.
import { loadavg } from 'node:os';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from '../test/support/mono-browser';
import type { BrowserRun } from './startup-report';

interface Seen { sent: { t: number; id: number; kind: string }[]; got: { t: number; kind: string; id?: number;
  stage?: string; step?: [number, number]; timing?: BrowserRun['timing'] }[] }

export class StartupBrowser {
  static readonly site = '/var/tmp/kyrie/kyr-scratch/site';
  // Every message to and from the engine's worker, with the page's clock, kept on window.__bench.
  static readonly listening = `(() => {
    const W = window.Worker, seen = { sent: [], got: [] }; window.__bench = seen;
    window.Worker = class extends W {
      constructor(...a) { super(...a); this.addEventListener('message', e => { const d = e.data || {};
        seen.got.push({ t: performance.now(), kind: d.kind, id: d.id, stage: d.stage, step: d.step,
          timing: d.value && d.value.timing }); }); }
      postMessage(m, ...r) { seen.sent.push({ t: performance.now(), id: m.id, kind: m.request && m.request.kind });
        return super.postMessage(m, ...r); }
    };
  })();`;
  static async runs(n: number): Promise<BrowserRun[]> {
    await mkdir(this.site, { recursive: true });
    if (!process.env.KYRIE_BENCH_SITE_KEPT) { await SiteBuild.site(this.site); }
    const browser = await MonoBrowser.launch(), out: BrowserRun[] = [];
    try {
      for (let i = 0; i < n; i++) {
        for (const passes of StartupBrowser.profiles) { out.push(...await this.profile(browser, passes)); }
      }
    } finally { await browser.close(); }
    return out;
  }
  // Each profile fresh, its passes in order: a first visit and a return to the same country; and a country begun in a
  // profile that has begun another (kite) first, so what is kept is the authored and shared texts and not a1's own.
  // And a first visit whose player reads creation for a while before Start: the page makes the start ready meanwhile
  // (ReaderOpening.readySoon), so what is left to wait is what has not been done by then.
  static readonly profiles: [string, string, number][][] = [[['first visit', 'a1', 0], ['returning', 'a1', 0]],
    [['', 'kite', 0], ['new country', 'a1', 0]],
    [['first visit, 15 s at creation', 'a1', 15000]]];
  private static async profile(browser: Awaited<ReturnType<typeof MonoBrowser.launch>>,
    passes: [string, string, number][]) {
    const context = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
    const out: BrowserRun[] = [];
    try {
      for (const [pass, seed, dwell] of passes) {
        const page = await context.newPage();
        const run = await this.pass(page, pass, seed, dwell);
        console.error(`browser ${pass || 'prime'} (${seed}): creation ${run.toCreation} ms, place ${run.toPlace} ms`);
        if (pass) { out.push(run); }
        await page.close();
      }
    } finally { await context.close(); }
    return out;
  }
  private static async pass(page: Page, pass: string, seed: string, dwell: number): Promise<BrowserRun> {
    const load = loadavg()[0]!;
    await page.addInitScript(this.listening);
    await page.goto(`file://${join(this.site, 'mono.html')}?world=${seed}`);
    await page.evaluate(() => { try { localStorage.clear(); } catch { /* file:// may refuse storage */ } });
    await page.reload();
    await page.waitForSelector('[data-mode="create"]', { timeout: 180000 });
    const toCreation = await page.evaluate(() => performance.now());
    if (dwell) { await page.waitForTimeout(dwell); }
    await page.click('[data-action="start"]');
    const pressed = await page.evaluate(() => performance.now());
    await page.waitForSelector('[data-mode="explore"]', { timeout: 180000 });
    const placed = await page.evaluate(() => performance.now());
    const seen = await page.evaluate(() => (window as unknown as { __bench: Seen }).__bench);
    return { pass, load, toCreation: Math.round(toCreation), toPlace: Math.round(placed - pressed),
      ...this.read(seen, pressed) };
  }
  // Each request's time from the page's sending to its reply; the first frame's own timing; and the time between
  // each part of the world taken in after Start was pressed (what the engine said: Placing its people, n of m).
  private static read(seen: Seen, pressed: number): Pick<BrowserRun, 'requests' | 'timing' | 'steps'> {
    const requests = seen.sent.flatMap(s => {
      const reply = seen.got.find(g => g.kind === 'reply' && g.id === s.id);
      return reply ? [{ kind: s.kind, ms: Math.round(reply.t - s.t) }] : [];
    });
    const frame = seen.got.find(g => g.kind === 'reply' && g.t > pressed && g.timing);
    const steps = seen.got.filter(g => g.kind === 'progress' && g.step && g.t > pressed).map(g => g.t);
    return { requests, ...frame?.timing ? { timing: frame.timing } : {},
      steps: steps.slice(1).map((t, i) => Math.round(t - steps[i]!)) };
  }
}
