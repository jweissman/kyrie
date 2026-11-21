/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// A digit in a conversation is the reply beside it as the rows stand (OR-142, the browser half of R11-01; its headless
// half is test/small/talk-digit-settle). In a1's first town the wagoner is asked what he carries, and the answer puts
// "Ask again" where that question was. The number now beside a different reply, pressed at once as the answer is
// drawn, is refused: nothing sent, nothing taken. Pressed again once the rows have stood (DigitSettle's 450 ms), it
// takes the reply now beside it, never the one that was there. Logs DIGIT with the rows before and after and what
// each press did.
class Digits {
  // In the page from its first script: each command sent to the engine, and each row drawn taken, by its act.
  static readonly script = () => {
    const w = window as unknown as { __sent: string[]; __taken: string[] };
    w.__sent = []; w.__taken = [];
    const post = Worker.prototype.postMessage;
    type Sent = { request?: { kind: string; command?: string } };
    Worker.prototype.postMessage = function (this: Worker, m: Sent, ...rest: never[]) {
      if (m?.request?.kind === 'perform') { w.__sent.push(m.request.command ?? ''); }
      return post.call(this, m, ...rest);
    } as typeof post;
    new MutationObserver(ms => {
      for (const m of ms) {
        const e = m.target as Element;
        if (m.type === 'attributes' && e.hasAttribute('data-taken')) { w.__taken.push(e.getAttribute('data-act') ?? ''); }
        for (const n of m.addedNodes) {
          if (n instanceof Element) {
            for (const t of [n, ...n.querySelectorAll('[data-taken]')]) {
              if (t.hasAttribute('data-taken')) { w.__taken.push(t.getAttribute('data-act') ?? ''); }
            }
          }
        }
      }
    }).observe(document, { attributes: true, attributeFilter: ['data-taken'], childList: true, subtree: true });
  };
  // The numbered replies as drawn: number to choice.
  static rows(page: Page): Promise<Record<string, string>> {
    return page.evaluate(() => Object.fromEntries([...document.querySelectorAll<HTMLElement>('.talk [data-number]')]
      .map(e => [e.dataset.number ?? '', e.dataset.choice ?? ''])));
  }
  static log(page: Page): Promise<{ sent: string[]; taken: string[] }> {
    return page.evaluate(() => { const w = window as unknown as { __sent: string[]; __taken: string[] };
      return { sent: [...w.__sent], taken: [...w.__taken] }; });
  }
  static idle(page: Page) {
    return page.waitForFunction(() => !(window as unknown as { kyrieMono: { inspect(): { pending: boolean } } })
      .kyrieMono.inspect().pending, null, { timeout: 60000 });
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('a digit in a conversation, in the browser', () => {
  let site = '', browser: Browser;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-digit-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('is refused on rows an answer has just renumbered, and takes the reply now beside it once they have stood',
    async () => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await context.addInitScript(`(${Digits.script.toString()})()`);
      const page = await context.newPage(), errors: string[] = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(`file://${join(site, 'mono.html')}?world=a1`);
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
      await Digits.idle(page);
      await page.click('[data-act$="#talk"]');
      await page.waitForSelector('[data-mode="talk"] .talk [data-number]', { timeout: 60000 });
      await Digits.idle(page);
      await page.waitForTimeout(500);
      const before = await Digits.rows(page);
      // The question whose answer puts another reply in its place: asked by the hand.
      const asked = Object.entries(before).find(([, c]) => /:Ask the wagoner what/.test(c));
      expect(asked).toBeDefined();
      await page.click(`.talk [data-choice="${asked![1]}"]`);
      // The answer drawn: the rows changed. The number now beside another reply, pressed at once.
      await page.waitForFunction(was => JSON.stringify(Object.fromEntries([...document.querySelectorAll<HTMLElement>(
        '.talk [data-number]')].map(e => [e.dataset.number ?? '', e.dataset.choice ?? '']))) !== was,
      JSON.stringify(before), { timeout: 60000, polling: 'raf' });
      const after = await Digits.rows(page);
      const [n, now] = Object.entries(after).find(([k, c]) => before[k] && before[k] !== c) ?? [];
      expect(n).toBeDefined();
      const was = await Digits.log(page), sent = was.sent.length, taken = was.taken.length;
      await page.keyboard.press(n!);
      await page.waitForTimeout(150);
      const atOnce = await Digits.log(page);
      // Then once the rows have stood.
      await page.waitForTimeout(500);
      await page.keyboard.press(n!);
      await Digits.idle(page);
      const stood = await Digits.log(page);
      // What each press drew taken, the hand's question before them aside.
      const once = atOnce.taken.slice(taken), then = stood.taken.slice(taken);
      console.log(`DIGIT ${JSON.stringify({ before, after, pressed: n, atOnce: atOnce.sent.slice(sent),
        stood: stood.sent.slice(sent), takenAtOnce: once, takenStood: then })}`);
      // At once: nothing sent, nothing drawn taken.
      expect([atOnce.sent.length - sent, once]).toEqual([0, []]);
      // Once stood: one command, and the reply now beside the number taken, never the one that was there.
      expect(stood.sent.length).toBe(sent + 1);
      expect(then).toContain(now!);
      expect(then).not.toContain(before[n!]!);
      expect(errors).toEqual([]);
      await context.close();
    }, 300000);
});
