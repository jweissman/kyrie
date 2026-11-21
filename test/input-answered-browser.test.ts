/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// Every input answered at once, and a long press's commitment secure (OR-91; the owner, 18 November: "we really should
// never have a user input that we don't respond to immediately somehow, and especially long-press commitment should
// feel secure"). In a1's first town, at a laptop's size with a mouse and a phone's with touch: an ordinary act (the way
// into the town), a talk opened and a reply in it, and a journey held. Measured in the page: from the pointer's event
// (or the key's) to the row drawn taken (data-taken, while the engine answers), each under 100 ms; for the journey,
// from the press to the hold drawn (data-holding), and from the hold's end to the row taken. One gesture is one command
// (MT-24's receipts, read through the page's hook, kyrieMono.receipts; a journey's requests counted as sent to the
// engine, each leg its own receipt); a second press and a key while it is answered are no second command; and a long
// press held three times its length commits once. CI's first run is its test: each size logs ANSWERED with its numbers.
// taken: each row drawn taken, by its act; held: a hold drawn; turned: the page turned to another mode (a talk opened).
interface Answers { taken: { act: string | null; ms: number }[]; held: number[]; turned: number[] }
class Answered {
  static readonly budget = 100;
  // In the page from its first script: the first press since the last reset, and each row drawn taken or held since,
  // and each turn of the page's mode, by how long after it (a second press and a key meanwhile do not move it).
  static readonly script = () => {
    const w = window as unknown as { __pressed: number; __taken: { act: string | null; ms: number }[]; __held: number[];
      __turned: number[]; __sent: string[] };
    w.__pressed = 0; w.__taken = []; w.__held = []; w.__turned = []; w.__sent = [];
    addEventListener('pointerdown', () => { w.__pressed ||= performance.now(); }, true);
    addEventListener('keydown', e => { if ((e as KeyboardEvent).key === 'Enter') { w.__pressed ||= performance.now(); } },
      true);
    const seen = (e: Element) => {
      const after = performance.now() - w.__pressed;
      if (e.hasAttribute('data-taken')) { w.__taken.push({ act: e.getAttribute('data-act'), ms: after }); }
      if (e.hasAttribute('data-holding')) { w.__held.push(after); }
    };
    new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === 'attributes' && m.attributeName === 'data-mode') { w.__turned.push(performance.now() - w.__pressed); }
        if (m.type === 'attributes') { seen(m.target as Element); continue; }
        for (const n of m.addedNodes) {
          if (n instanceof Element) { [n, ...n.querySelectorAll('[data-taken], [data-holding]')].forEach(seen); }
        }
      }
    }).observe(document, { attributes: true, attributeFilter: ['data-taken', 'data-holding', 'data-mode'], childList: true,
      subtree: true });
    const post = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (this: Worker, m: { request?: { kind: string } }, ...rest: never[]) {
      if (m?.request && ['perform', 'travel'].includes(m.request.kind)) { w.__sent.push(m.request.kind); }
      return post.call(this, m, ...rest);
    } as typeof post;
  };
  static reset(page: Page) {
    return page.evaluate(() => {
      const w = window as unknown as { __pressed: number; __taken: unknown[]; __held: unknown[]; __turned: unknown[] };
      w.__pressed = 0; w.__taken = []; w.__held = []; w.__turned = [];
    });
  }
  static read(page: Page): Promise<Answers> {
    return page.evaluate(() => { const w = window as unknown as { __taken: Answers['taken']; __held: number[];
      __turned: number[] }; return { taken: [...w.__taken], held: [...w.__held], turned: [...w.__turned] }; });
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
  // A long press held for `ms`: the mouse down and up, or a touch begun and ended (CDP: a touch held still).
  static async hold(page: Page, selector: string, touch: boolean, ms: number) {
    const row = page.locator(selector).first();
    await row.scrollIntoViewIfNeeded();
    const b = (await row.boundingBox())!, x = b.x + b.width / 2, y = b.y + b.height / 2;
    if (!touch) {
      await page.mouse.move(x, y); await page.mouse.down(); await page.waitForTimeout(ms); await page.mouse.up();
      return;
    }
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await page.waitForTimeout(ms);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  // A gesture's measure: the row drawn taken after it, the receipts it made, and the commands sent.
  static async gesture(page: Page, go: () => Promise<void>) {
    const [receipts, sent] = [await Answered.receipts(page), await Answered.sent(page)];
    await Answered.reset(page);
    await go();
    await Answered.idle(page);
    const a = await Answered.read(page);
    // Answered: the row drawn taken, or the page turned to what it opened (a talk), whichever came first.
    const first = [a.taken[0]?.ms, a.turned[0]].filter((t): t is number => t !== undefined);
    return { ms: first.length ? Math.min(...first) : undefined, held: a.held[0], taken: a.taken[0]?.ms,
      receipts: await Answered.receipts(page) - receipts,
      sent: await Answered.sent(page) - sent };
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('every input answered at once', () => {
  let site = '', browser: Browser;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-answered-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800, false], [390, 844, true]] as const)('at %ix%i (touch: %p): an act, a talk and its reply, a held journey',
    async (width, height, touch) => {
      const context = await browser.newContext({ viewport: { width, height }, ...touch ? { hasTouch: true } : {} });
      await context.addInitScript(`(${Answered.script.toString()})()`);
      const page = await context.newPage(), errors: string[] = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(`file://${join(site, 'mono.html')}?world=a1`);
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
      await Answered.idle(page);
      // An ordinary act: the way into the town.
      const act = await Answered.gesture(page, () => Answered.press(page, '[data-act^="exit:"]:not([data-hold])', touch));
      // A talk opened, and a reply in it (not its leave-taking).
      const talk = await Answered.gesture(page, () => Answered.press(page, '[data-act$="#talk"]', touch));
      const reply = await Answered.gesture(page, () => Answered.press(page,
        '[data-mode="talk"] [data-act]:not([data-act$="#leave"]):not([data-act$="#talk"]):not([data-hold])', touch));
      await page.locator('[data-act$="#leave"]').first().click().catch(() => undefined);
      await Answered.idle(page);
      // A journey held: pressed and held three times as long as a hold asks, then let go.
      const ms = await page.evaluate(() => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hold-ms'), 10)
        || 520);
      const held = '[data-hold="sustained"][data-act^="travel:"]';
      // Held on the map (CI's first run: none in a1's first town, whose four lead over the country to the map, OR-159):
      // the map opened, a place further off viewed, and its Travel to held.
      await page.keyboard.press('m');
      const far = page.locator('[data-action="map-view"][data-choice^="travel:"]:not(:has-text("Enter "))').first();
      if (await far.count()) {
        await far.click();
        await page.waitForSelector(held, { timeout: 8000 }).catch(() => undefined);
      }
      if (!await page.locator(held).count()) {
        const there = await page.evaluate(() => [...document.querySelectorAll('[data-hold], [data-act^="travel:"], '
          + '[data-choice^="travel:"]')].map(e => `${e.getAttribute('data-act') ?? e.getAttribute('data-choice')} `
          + `hold=${e.getAttribute('data-hold')}`));
        throw new Error(`No journey held at ${width}x${height}; held or travel rows here: ${there.join(', ') || 'none'}`);
      }
      const journey = await Answered.gesture(page, () => Answered.hold(page, held, touch, ms * 3));
      console.log(`ANSWERED ${width}x${height} ${JSON.stringify({ act, talk, reply, journey, hold: ms })}`);
      // Each row drawn taken within the budget of its press (the journey's hold drawn within it of the press).
      expect([act.ms, talk.ms, reply.ms].every(t => t !== undefined && t < Answered.budget)).toBe(true);
      expect(journey.held !== undefined && journey.held < Answered.budget).toBe(true);
      // The journey taken within the budget of its hold's end: the hold is done when full, not on release.
      expect(journey.taken !== undefined && journey.taken < ms + Answered.budget).toBe(true);
      // One gesture, one command: the second press and the key while it was answered made none.
      expect([act.receipts, talk.receipts, reply.receipts]).toEqual([1, 1, 1]);
      expect([act.sent, talk.sent, reply.sent]).toEqual([1, 1, 1]);
      // The long press held three times over commits once: one journey asked for, its legs each a receipt.
      expect(journey.sent).toBe(1);
      expect(journey.receipts).toBeGreaterThanOrEqual(1);
      expect(errors).toEqual([]);
      await context.close();
    }, 300000);
});
