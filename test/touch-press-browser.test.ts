/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The first touch's press (?touch=down and ?touch=up; doc/architecture/mission-21/first-touch.md), in the page, at a
// laptop's 1280 by 800 on the kite's first town. What the owner asked of the primary control that only the page can
// break: focus and hovering send nothing; setting out, held, is not done by a tap (it asks) nor by a hold let go
// early, and is done once when held full; a press shows taken without any row moving; a double click is one command;
// in up, a press slid off before release does nothing. (Gesture's own promises: test/small/touch-gesture.)
class Probe {
  static readonly script = () => {
    const w = window as unknown as { __sent: string[] };
    w.__sent = [];
    const post = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (this: Worker, m: { request?: { kind: string } }, ...rest: never[]) {
      if (m?.request) { w.__sent.push(m.request.kind); }
      return post.call(this, m, ...rest);
    } as typeof post;
  };
  static async sent(page: Page, ...kinds: string[]) {
    return page.evaluate(k => (window as unknown as { __sent: string[] }).__sent
      .filter(x => k.includes(x)).length, kinds);
  }
  static idle(page: Page) {
    return page.waitForFunction(() => !(window as unknown as { kyrieMono: { inspect(): { pending: boolean } } })
      .kyrieMono.inspect().pending, null, { timeout: 60000 });
  }
  static async press(page: Page, selector: string, ms: number, off = false) {
    const b = (await page.locator(selector).first().boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 }); await page.mouse.down();
    await page.waitForTimeout(ms);
    if (off) { await page.mouse.move(b.x + b.width / 2, b.y - 150, { steps: 4 }); }
    await page.mouse.up();
  }
  static boxes(page: Page) {
    return page.evaluate(() => [...document.querySelectorAll('.choice-row')].map(e => {
      const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round).join(',');
    }).join(';'));
  }
  static async open(browser: Browser, site: string, mode: string) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(`(${Probe.script.toString()})()`);
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`file://${join(site, 'mono.html')}?world=kite&touch=${mode}&sound=0`);
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    return { context, page, errors };
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the first touch\'s press', () => {
  let site = '', browser: Browser;
  const talk = ':is([data-act$="#talk"], [data-act^="talk_to("])', wait = '[data-act="company/0:Wait"]';
  const awhile = '[data-act="company/0:Wait/0:A while"]', setOut = '[data-option="set-out"]';
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-touch-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('commits once, never by focus, never by a hold let go, and moves nothing (down)', async () => {
    const { context, page, errors } = await Probe.open(browser, site, 'down');
    // Creation by the keys to setting out: arrows consider and ask the engine nothing; a digit chooses and goes on.
    const asked = await Probe.sent(page, 'creation');
    for (let k = 0; k < 5; k++) { await page.keyboard.press('ArrowDown'); }
    expect(await Probe.sent(page, 'creation')).toBe(asked);
    for (let k = 0; k < 12 && !await page.locator('.composed-go').count(); k++) {
      await page.keyboard.press('1'); await page.waitForTimeout(400);
    }
    await Probe.press(page, setOut, 80); await page.waitForTimeout(300);
    await page.keyboard.press('Escape'); await page.keyboard.press('1'); await page.waitForTimeout(300);
    await Probe.press(page, setOut, 330); await page.waitForTimeout(400);
    expect(await Probe.sent(page, 'set-out', 'begin')).toBe(0);
    await Probe.press(page, setOut, 800);
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    expect(await Probe.sent(page, 'set-out', 'begin')).toBe(1);
    if (await page.locator('[data-action="enter-hex"]').count()) {
      await Probe.press(page, '[data-action="enter-hex"]', 60); await Probe.idle(page);
    }
    // The hand over every row and the arrows through them: nothing sent.
    let before = await Probe.sent(page, 'perform');
    for (const row of await page.locator('.choice-row >> visible=true').all()) { await row.hover(); }
    for (let k = 0; k < 4; k++) { await page.keyboard.press('ArrowDown'); }
    await page.keyboard.press('Escape');
    expect(await Probe.sent(page, 'perform')).toBe(before);
    // A wait: taken at the press, and no row moved between the press and its answer.
    await Probe.press(page, wait, 60); await page.waitForTimeout(200);
    const was = await Probe.boxes(page);
    await Probe.press(page, awhile, 60);
    expect(await page.locator('[data-struck], [data-taken]').count()).toBeGreaterThan(0);
    expect(await Probe.boxes(page)).toBe(was);
    await Probe.idle(page);
    // A double click on the talk: one command.
    before = await Probe.sent(page, 'perform');
    const r = (await page.locator(talk).first().boundingBox())!;
    await page.mouse.dblclick(r.x + r.width / 2, r.y + r.height / 2);
    await page.waitForTimeout(400); await Probe.idle(page);
    expect(await Probe.sent(page, 'perform') - before).toBe(1);
    expect(errors).toEqual([]);
    await context.close();
  }, 300000);

  it('does nothing for a press slid off before its release (up)', async () => {
    const { context, page, errors } = await Probe.open(browser, site, 'up');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    if (await page.locator('[data-action="enter-hex"]').count()) {
      await Probe.press(page, '[data-action="enter-hex"]', 60); await Probe.idle(page);
    }
    const before = await Probe.sent(page, 'perform');
    await Probe.press(page, talk, 80, true); await page.waitForTimeout(400);
    expect(await Probe.sent(page, 'perform')).toBe(before);
    await Probe.press(page, talk, 80); await page.waitForTimeout(300); await Probe.idle(page);
    expect(await Probe.sent(page, 'perform') - before).toBe(1);
    expect(errors).toEqual([]);
    await context.close();
  }, 300000);
});
