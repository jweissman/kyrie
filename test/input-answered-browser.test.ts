/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// Every input answered at once (OR-91; the owner, 18 November: "we really should never have a user input that we don't
// respond to immediately somehow"), and nothing held (OR-185, 23 November: "No long presses"; a journey had been held
// to be set out on). In a1's first town, at a laptop's size with a mouse and a phone's with touch: an ordinary act (the
// way into the town), a talk opened and a reply in it, and a journey set out on from the map. Measured in the page:
// from the pointer's event (or the key's) to the row drawn taken (data-taken, while the engine answers) or the
// journey's On the way card, each under 100 ms. One gesture is one command (MT-24's receipts, read through the page's
// hook, kyrieMono.receipts; a journey's requests counted as sent to the engine, each leg its own receipt); a second
// press and a key while it is answered are no second command. CI's first run is its test: each size logs ANSWERED.
// taken: each row drawn taken, by its act; turned: the page turned to another mode (a talk opened).
// sentAt: each journey asked of the engine, by how long after the press.
interface Answers { taken: { act: string | null; ms: number }[]; turned: number[]; sentAt: number[] }
class Answered {
  static readonly budget = 100;
  // In the page from its first script: the first press since the last reset, and each row drawn taken since,
  // and each turn of the page's mode, by how long after it (a second press and a key meanwhile do not move it).
  static readonly script = () => {
    const w = window as unknown as { __pressed: number; __taken: { act: string | null; ms: number }[];
      __turned: number[]; __sent: string[]; __sentAt: number[] };
    w.__pressed = 0; w.__taken = []; w.__turned = []; w.__sent = []; w.__sentAt = [];
    addEventListener('pointerdown', () => { w.__pressed ||= performance.now(); }, true);
    addEventListener('keydown', e => { if ((e as KeyboardEvent).key === 'Enter') { w.__pressed ||= performance.now(); } },
      true);
    const seen = (e: Element) => {
      const after = performance.now() - w.__pressed;
      // A row drawn taken; or, a journey set out on from the map, its On the way card (WorldStage.Going).
      if (e.hasAttribute('data-taken') || e.getAttribute('data-state') === 'travelling') {
        w.__taken.push({ act: e.getAttribute('data-act'), ms: after });
      }
    };
    new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === 'attributes' && m.attributeName === 'data-mode') { w.__turned.push(performance.now() - w.__pressed); }
        if (m.type === 'attributes') { seen(m.target as Element); continue; }
        for (const n of m.addedNodes) {
          if (n instanceof Element) {
            [n, ...n.querySelectorAll('[data-taken], [data-state="travelling"]')].forEach(seen);
          }
        }
      }
    }).observe(document, { attributes: true, attributeFilter: ['data-taken', 'data-mode', 'data-state'], childList: true,
      subtree: true });
    // What held the page's one thread (OR-91): each long task, by when and how long.
    (w as unknown as { __long: number[][] }).__long = [];
    new PerformanceObserver(l => (w as unknown as { __long: number[][] }).__long.push(...l.getEntries()
      .map(e => [Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true });
    const post = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (this: Worker, m: { request?: { kind: string } }, ...rest: never[]) {
      if (m?.request && ['perform', 'travel'].includes(m.request.kind)) { w.__sent.push(m.request.kind); }
      if (m?.request?.kind === 'travel') { w.__sentAt.push(performance.now() - w.__pressed); }
      return post.call(this, m, ...rest);
    } as typeof post;
  };
  static reset(page: Page) {
    return page.evaluate(() => {
      const w = window as unknown as { __pressed: number; __taken: unknown[]; __turned: unknown[];
        __sentAt: unknown[] };
      w.__pressed = 0; w.__taken = []; w.__turned = []; w.__sentAt = [];
    });
  }
  static read(page: Page): Promise<Answers> {
    return page.evaluate(() => { const w = window as unknown as { __taken: Answers['taken'];
      __turned: number[]; __sentAt: number[] };
    return { taken: [...w.__taken], turned: [...w.__turned], sentAt: [...w.__sentAt] }; });
  }
  static sent(page: Page): Promise<number> {
    return page.evaluate(() => (window as unknown as { __sent: string[] }).__sent.length);
  }
  static receipts(page: Page): Promise<number> {
    return page.evaluate(async () => ((await (window as unknown as { kyrieMono: { receipts(): Promise<unknown[]> } })
      .kyrieMono.receipts()) ?? []).length);
  }
  static idle(page: Page) {
    return page.waitForFunction(() => !(window as unknown as { kyrieMono: { inspect(): { pending: boolean } } })
      .kyrieMono.inspect().pending, null, { timeout: 60000 });
  }
  // A press as the hand makes it (a click, or a tap with touch), and a second press and Enter at once after it, while
  // the first is answered.
  static async press(page: Page, selector: string, touch: boolean, again = true) {
    const row = page.locator(selector).first();
    await row.scrollIntoViewIfNeeded();
    const b = (await row.boundingBox())!, x = b.x + b.width / 2, y = b.y + b.height / 2;
    if (touch) { await page.touchscreen.tap(x, y); } else { await page.mouse.click(x, y); }
    if (!again) { return; }
    if (touch) { await page.touchscreen.tap(x, y); } else { await page.mouse.click(x, y); }
    await page.keyboard.press('Enter');
  }
  // The page's thread from the journey's press (OR-91): when the act was performed, each drawing of the map and each
  // long task since, all from the press, in ms.
  static trace(page: Page) {
    return page.evaluate(() => {
      const from = (window as unknown as { __pressed: number }).__pressed, at = (t: number) => Math.round(t - from);
      const after = (e: PerformanceEntry) => e.startTime >= from;
      return { perform: performance.getEntriesByName('page:perform').filter(after).map(e => at(e.startTime)),
        draws: performance.getEntriesByName('board:draw').filter(after).slice(0, 40)
          .map(e => [at(e.startTime), Math.round(e.duration)]),
        drifts: performance.getEntriesByName('board:drift').filter(after).slice(0, 40).map(e => at(e.startTime)),
        // The drawings that cast the shadows again (the costliest), the board's knowledge laid, and the page's own
        // marks: the journey answered by the engine, and its walk on the map done.
        shaded: performance.getEntriesByName('board:shaded').filter(after).map(e => [at(e.startTime), Math.round(e.duration)]),
        know: performance.getEntriesByName('board:know').filter(after).map(e => [at(e.startTime), Math.round(e.duration)]),
        answered: performance.getEntriesByName('page:answered').filter(after).map(e => at(e.startTime)),
        walked: performance.getEntriesByName('page:walked').filter(after).map(e => at(e.startTime)),
        // The board at the journey's end: made again (board:made), or updated in place (board:update), its land
        // laid again a part a task (board:part) and shown (board:relaid), each [start, ms].
        ...Object.fromEntries(['board:made', 'board:update', 'board:part', 'board:relaid'].map(n => [n.slice(6),
          performance.getEntriesByName(n).filter(after).map(e => [at(e.startTime), Math.round(e.duration)])])),
        // The frame come set on the page, and drawn (React's commit of it).
        frame: performance.getEntriesByName('page:frame').filter(after).map(e => at(e.startTime)),
        drawn: performance.getEntriesByName('page:drawn').filter(after).map(e => at(e.startTime)),
        long: (window as unknown as { __long: number[][] }).__long.filter(([s]) => s! >= from)
          .map(([s, d]) => [at(s!), d]) };
    });
  }
  // A gesture's measure: the row drawn taken after it, the receipts it made, and the commands sent.
  static async gesture(page: Page, go: () => Promise<void>) {
    const [receipts, sent] = [await Answered.receipts(page), await Answered.sent(page)];
    await Answered.reset(page);
    // Settled: from the press until the page is idle again, the answer drawn (measured from here, so a little over;
    // logged as a baseline for beta's 300 ms budget, not asserted: mission-22-beta/sprint-0-baseline.md).
    const began = performance.now();
    await go();
    await Answered.idle(page);
    const settled = Math.round(performance.now() - began), a = await Answered.read(page);
    // Answered: the row drawn taken, or the page turned to what it opened (a talk), whichever came first.
    const first = [a.taken[0]?.ms, a.turned[0]].filter((t): t is number => t !== undefined);
    return { ms: first.length ? Math.min(...first) : undefined, taken: a.taken[0]?.ms,
      sentAt: a.sentAt[0], settled,
      receipts: await Answered.receipts(page) - receipts,
      sent: await Answered.sent(page) - sent };
  }
}

// Played as the page is played, served over http (the site on Pages: OR-145, the lead's call of 24 November), the
// engine its own worker loading its own script. From file://, as the other browser specs open it, a worker may not be
// started from a file, so the engine's eighteen megabytes are read into the page as a script, and the page had paid
// for that text mid-play (a decoding of it and a major collection, 65-85 ms of the first act's drawing): that
// harness's act is measured too, once, and logged apart as such (ANSWERED-FILE), not as the page's.
describe.skipIf(!process.env.KYRIE_BROWSER)('every input answered at once', () => {
  let site = '', browser: Browser, server: ReturnType<typeof Bun.serve>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-answered-'));
    await SiteBuild.site(site, {});
    server = Bun.serve({ port: 0, fetch: r => SiteBuild.serve(site, r) });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => {
    await browser?.close(); await server?.stop(true); await rm(site, { recursive: true, force: true });
  });
  // Where the page is opened: served (as it is played), or from its file (the harness's way, measured apart).
  const opened = (file: boolean) => `${file ? `file://${site}/` : server.url}mono.html?world=a1`;

  // Each size played once, its measures kept for both the ordinary case and the journey's timing.
  const played = new Map<string, Awaited<ReturnType<typeof play>>>();
  // A life begun in a1's first town, the page idle.
  async function begin(width: number, height: number, touch: boolean, file = false) {
    const context = await browser.newContext({ viewport: { width, height }, ...touch ? { hasTouch: true } : {} });
    await context.addInitScript(`(${Answered.script.toString()})()`);
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(opened(file));
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    await Answered.idle(page);
    return { context, page, errors };
  }
  async function play(width: number, height: number, touch: boolean) {
    const { context, page, errors } = await begin(width, height, touch);
    // An ordinary act: the way into the town.
    const act = await Answered.gesture(page, () => Answered.press(page, '[data-act^="exit:"]', touch));
    // A talk opened, and a reply in it (not its leave-taking).
    const talk = await Answered.gesture(page, () => Answered.press(page, '[data-act$="#talk"]', touch));
    const reply = await Answered.gesture(page, () => Answered.press(page,
      '[data-mode="talk"] [data-act]:not([data-act$="#leave"]):not([data-act$="#talk"])', touch));
    await page.locator('[data-act$="#leave"]').first().click().catch(() => undefined);
    await Answered.idle(page);
    // A journey set out on from the map (none in a1's first town, whose four lead over the country to the map, OR-159):
    // the map opened, a place further off viewed, and its Travel to pressed once.
    const held = '[data-action="set-out"][data-act^="travel:"]';
    await page.keyboard.press('m');
    const far = page.locator('[data-action="map-view"][data-choice^="travel:"]:not(:has-text("Enter "))').first();
    if (await far.count()) {
      await far.click();
      await page.waitForSelector(held, { timeout: 8000 }).catch(() => undefined);
    }
    if (!await page.locator(held).count()) {
      const there = await page.evaluate(() => [...document.querySelectorAll('[data-act^="travel:"], [data-choice^="travel:"]')]
        .map(e => `${e.getAttribute('data-act') ?? e.getAttribute('data-choice')}`));
      throw new Error(`No Travel to at ${width}x${height}; travel rows here: ${there.join(', ') || 'none'}`);
    }
    const journey = await Answered.gesture(page, () => Answered.press(page, held, touch));
    console.log(`TRACE ${width}x${height} ${JSON.stringify(await Answered.trace(page))}`);
    console.log(`ANSWERED ${width}x${height} ${JSON.stringify({ act, talk, reply, journey })}`);
    await context.close();
    return { act, talk, reply, journey, errors };
  }
  async function measured(width: number, height: number, touch: boolean) {
    const key = `${width}x${height}`;
    if (!played.has(key)) { played.set(key, await play(width, height, touch)); }
    return played.get(key)!;
  }
  const sizes = [[1280, 800, false], [390, 844, true]] as const;
  it.each(sizes)('at %ix%i (touch: %p): an act, a talk and its reply at once, and a journey at one press, once',
    async (width, height, touch) => {
      const { act, talk, reply, journey, errors } = await measured(width, height, touch);
      // Each row drawn taken within the budget of its press.
      expect([act.ms, talk.ms, reply.ms].every(t => t !== undefined && t < Answered.budget)).toBe(true);
      // One gesture, one command: the second press and the key while it was answered made none.
      expect([act.receipts, talk.receipts, reply.receipts]).toEqual([1, 1, 1]);
      expect([act.sent, talk.sent, reply.sent]).toEqual([1, 1, 1]);
      // The journey pressed, pressed again and keyed while answered, commits once: one journey, its legs receipts.
      expect(journey.sent).toBe(1);
      expect(journey.receipts).toBeGreaterThanOrEqual(1);
      expect(errors).toEqual([]);
    }, 300000);
  // OR-91 (P0): the journey answered at once. Held, on 21 November, its card came 0.9-1.2 s after the press, then 522
  // and 531 ms with the map's drift paused (Board.busy), the hold's 520 ms of it; at one press (OR-185), the journey is
  // asked of the engine and its On the way card drawn within the budget of the press itself.
  it.each(sizes)('at %ix%i (touch: %p): a journey commits at its press, and is answered at once (OR-91)',
    async (width, height, touch) => {
      const { journey } = await measured(width, height, touch);
      expect(journey.sentAt !== undefined && journey.sentAt < Answered.budget).toBe(true);
      expect(journey.taken !== undefined && journey.taken < Answered.budget).toBe(true);
    }, 300000);
  // The harness's way in, once: the act from file://, answered within the budget as any, its settling logged apart.
  it('from its file at 1280x800: the act is answered at once, its settling logged as the harness\'s', async () => {
    const { context, page, errors } = await begin(1280, 800, false, true);
    const act = await Answered.gesture(page, () => Answered.press(page, '[data-act^="exit:"]', false));
    console.log(`ANSWERED-FILE 1280x800 ${JSON.stringify({ act })}`);
    await context.close();
    expect(act.ms !== undefined && act.ms < Answered.budget).toBe(true);
    expect(errors).toEqual([]);
  }, 300000);
});
