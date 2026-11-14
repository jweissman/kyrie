/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// A press is taken once, on the screen it was made on (the interaction research, IG-17 and IG-18). At a laptop's 1280
// by 800, with keys and a mouse, on the road into the kite's first town:
// - Enter held on a focused row does its act once (held, it had talked to the wagoner and then said the first reply and
//   another, unread: the browser's repeat clicking whatever was focused next);
// - a press begun in a conversation and let go after it has ended does nothing in the place;
// - the next screen lights nothing under a hand that has not moved, and lights the row as soon as the hand moves.
class Sent {
  // The engine's commands, counted where the page hands them to its worker.
  static readonly script = () => {
    const w = window as unknown as { __sent: string[] };
    w.__sent = [];
    const post = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (this: Worker, m: { request?: { kind: string } }, ...rest: never[]) {
      if (m?.request && ['perform', 'fight', 'travel', 'unbind'].includes(m.request.kind)) { w.__sent.push(m.request.kind); }
      return post.call(this, m, ...rest);
    } as typeof post;
  };
  static count(page: Page) { return page.evaluate(() => (window as unknown as { __sent: string[] }).__sent.length); }
  static idle(page: Page) {
    return page.waitForFunction(() => !(window as unknown as { kyrieMono: { inspect(): { pending: boolean } } })
      .kyrieMono.inspect().pending, null, { timeout: 60000 });
  }
  static selected(page: Page) {
    return page.evaluate(() => (window as unknown as { kyrieMono: { inspect(): { selected?: string } } })
      .kyrieMono.inspect().selected);
  }
  // Whether this row is lit: its ground other than a row's at rest.
  static ground(page: Page, selector: string) {
    return page.evaluate(sel => {
      const hot = document.querySelector(sel);
      const cold = [...document.querySelectorAll('.choice-row')].find(e => e !== hot && !e.matches('.sel, :focus-visible, :hover'));
      return !!hot && !!cold && getComputedStyle(hot).backgroundColor !== getComputedStyle(cold).backgroundColor;
    }, selector);
  }
  static async over(page: Page, selector: string) {
    const b = (await page.locator(selector).first().boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 });
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('a press is taken once, on its own screen', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  const talk = ':is([data-act$="#talk"], [data-act^="talk_to("])', leave = '[data-act$="#leave"]';
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-press-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('by a held key, across a change of screen, and under a still hand', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(`(${Sent.script.toString()})()`);
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`file://${join(site, 'mono.html')}?world=kite`);
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    if (await page.locator('[data-action="enter-hex"]').count()) {
      await page.click('[data-action="enter-hex"]'); await Sent.idle(page);
    }
    // Enter held on the talk: one command, however many times the key repeats. Talked to once and left, the wagoner is
    // talked to again by a row of the place's own; focused, Enter held on it (the repeats had gone on to the
    // conversation's first reply and another).
    await page.click(talk); await Sent.idle(page); await page.click(leave); await Sent.idle(page);
    let before = await Sent.count(page);
    await page.locator(talk).first().focus();
    for (let k = 0; k < 10; k++) { await page.keyboard.down('Enter'); await page.waitForTimeout(40); }
    await page.keyboard.up('Enter'); await Sent.idle(page); await page.waitForTimeout(300);
    expect(await Sent.count(page) - before).toBe(1);
    expect(await page.locator(leave).count()).toBe(1);
    // A press begun on a reply and let go once the leave (by its key) has ended the conversation: nothing more done.
    await Sent.over(page, '.talk .replies .choice-row'); await page.mouse.down();
    before = await Sent.count(page);
    const key = (await page.locator(`${leave} .row-key`).first().textContent())!.trim();
    await page.keyboard.press(key); await Sent.idle(page); await page.waitForTimeout(200);
    await page.mouse.up(); await page.waitForTimeout(400); await Sent.idle(page);
    expect(await Sent.count(page) - before).toBe(1);
    // The place came back under a hand that has not moved: a row under it (its hover forced, wherever the hand rests)
    // is not lit; the hand moved a little, it is.
    expect(await page.evaluate(() => document.documentElement.dataset.still)).toBe('');
    const cdp = await context.newCDPSession(page), { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `${talk}` });
    await cdp.send('CSS.enable'); await cdp.send('DOM.enable');
    await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] });
    expect(await Sent.ground(page, talk)).toBe(false);
    await page.mouse.move(40, 40, { steps: 2 }); await page.mouse.move(60, 52, { steps: 2 });
    await page.waitForTimeout(200);
    expect(await Sent.ground(page, talk)).toBe(true);
    expect(errors).toEqual([]);
    await context.close();
  }, 300000);
});
