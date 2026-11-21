/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { HexSteps } from '../web/reader/board/hex-steps';
import { MonoBrowser } from './support/mono-browser';

// The map at a journey's end, in a real browser (OR-91's rest; OR-162's other half), at a laptop's size and a
// phone's: a journey set out on from the map (a1's first town, a place further off viewed and its Travel to held),
// walked hex by hex with what it comes to know lit as the company reaches it, not all at the end; and then the board
// updated in place, not made again: what it draws, read back from it (Board.drawing), is what a board made for the
// same land would draw (BoardModel.drawn), its labels with it; no part of laying the land again holding the page as
// long as a board made again had (1.3-1.6 s without a GPU). For CI (KYRIE_BROWSER): each size logs WALK.
type Now = { at?: number; seen: number[]; width: number; height: number };
type Sample = { t: number; now?: Now };
class Walk {
  // Sampled each frame in the page from before the hold, until stopped.
  static start(page: Page) {
    return page.evaluate(() => {
      const w = window as unknown as { __walk: Sample[]; __walking: boolean;
        kyrieMono: { boardNow(): Now | undefined } };
      w.__walk = []; w.__walking = true;
      const tick = () => {
        w.__walk.push({ t: performance.now(), now: w.kyrieMono.boardNow() });
        if (w.__walking) { requestAnimationFrame(tick); }
      };
      requestAnimationFrame(tick);
    });
  }
  static stop(page: Page): Promise<Sample[]> {
    return page.evaluate(() => {
      const w = window as unknown as { __walk: Sample[]; __walking: boolean };
      w.__walking = false; return w.__walk;
    });
  }
  // The hexes the mark stood on in turn; whether each is beside the last; and the frames at which hexes newly
  // known came to be shown, and the hexes the mark had come to by then.
  static read(samples: Sample[]) {
    const shown = samples.filter(s => s.now), first = shown[0]!.now!, last = shown.at(-1)!.now!;
    const cells: number[] = [];
    for (const s of shown) { if (s.now!.at !== undefined && s.now!.at !== cells.at(-1)) { cells.push(s.now!.at); } }
    const stepped = cells.every((c, i) => i === 0 || HexSteps.neighbours(first.width, first.height, cells[i - 1]!)
      .includes(c));
    const before = new Set(first.seen), lit: { t: number; n: number; steps: number }[] = [];
    let seen = before.size, steps = 0, at = first.at;
    for (const s of shown) {
      if (s.now!.at !== at) { steps++; at = s.now!.at; }
      const n = s.now!.seen.filter(c => !before.has(c)).length;
      if (s.now!.seen.length !== seen) {
        lit.push({ t: Math.round(s.t - shown[0]!.t), n, steps }); seen = s.now!.seen.length;
      }
    }
    return { cells, stepped, lit, fresh: last.seen.filter(c => !before.has(c)).length };
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the map at a journey\'s end', () => {
  let site = '', browser: Browser;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-board-update-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800, false], [390, 844, true]] as const)('at %ix%i (touch: %p): walked hex by hex, then updated',
    async (width, height, touch) => {
      const context = await browser.newContext({ viewport: { width, height }, ...touch ? { hasTouch: true } : {} });
      const page = await context.newPage(), errors: string[] = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(`file://${join(site, 'mono.html')}?world=a1`);
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
      await page.keyboard.press('m');
      const far = page.locator('[data-action="map-view"][data-choice^="travel:"]:not(:has-text("Enter "))').first();
      await far.click();
      const held = '[data-hold="sustained"][data-act^="travel:"]';
      await page.waitForSelector(held, { timeout: 30000 });
      await page.waitForFunction(() => (window as unknown as { kyrieMono: { boardNow(): unknown } }).kyrieMono
        .boardNow(), null, { timeout: 60000 });
      const began = await page.evaluate(() => performance.now());
      await Walk.start(page);
      const b = (await page.locator(held).first().boundingBox())!;
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
      await page.waitForTimeout(800); await page.mouse.up();
      await page.waitForFunction(() => !(window as unknown as { kyrieMono: { inspect(): { pending: boolean } } })
        .kyrieMono.inspect().pending, null, { timeout: 60000 });
      const back = await page.evaluate(() => (window as unknown as { kyrieMono: { board(): Promise<unknown> } })
        .kyrieMono.board()) as { drawn: unknown; wanted: unknown };
      const walk = Walk.read(await Walk.stop(page));
      const measured = await page.evaluate(from => Object.fromEntries(['board:made', 'board:update', 'board:part',
        'board:relaid'].map(n => [n, performance.getEntriesByName(n).filter(e => e.startTime >= from)
        .map(e => Math.round(e.duration))])), began);
      console.log(`WALK ${width}x${height} ${JSON.stringify({ ...walk, measured })}`);
      // Hex by hex: each hex the mark stands on beside the last, over more than one.
      expect(walk.cells.length).toBeGreaterThan(1);
      expect(walk.stepped).toBe(true);
      // What it came to know lit as it went: more than once, the first before the mark had come to its last hex.
      expect(walk.fresh).toBeGreaterThan(0);
      expect(walk.lit.filter(l => l.n > 0).length).toBeGreaterThan(1);
      expect(walk.lit.find(l => l.n > 0)!.steps).toBeLessThan(walk.cells.length - 1);
      // Updated, not made again; each part of the land laid again a task of its own, short; and what it draws read
      // back from it what a board made for the same land would draw, its labels with it.
      expect(measured['board:made']).toEqual([]);
      expect(measured['board:update']!.length).toBeGreaterThan(0);
      expect([...measured['board:update']!, ...measured['board:part']!, ...measured['board:relaid']!]
        .every(ms => ms < 200)).toBe(true);
      expect(back.drawn).toEqual(back.wanted);
      expect(errors).toEqual([]);
      await context.close();
    }, 300000);
});
