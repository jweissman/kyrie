#!/usr/bin/env bun
// Discovery for the action button (the owner, 17 November): how soon the first page is ready, whether layouts hold
// still, what each family of control looks like in each of its states, and whether touch, keyboard and pointer each
// commit it. Measures, never judges: the findings are written from it by hand
// (doc/architecture/mission-21/button-discovery.md).
//   KYRIE_BROWSER=1 bun test/support/ui-discovery.ts [--runs 2] [--out doc/architecture/mission-21/button-data.json]
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../../src/cli/site-build';
import { MonoBrowser } from './mono-browser';
import { MonoDriver } from './mono-driver';

type Browser = Awaited<ReturnType<typeof MonoBrowser.launch>>;
type Look = Awaited<ReturnType<typeof Discovery.look>>;
interface Counters { __cls: { total: number }; __long: number[][] }
const observers = `window.__cls = { total: 0 }; window.__long = [];
  new PerformanceObserver(l => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { window.__cls.total += e.value; } } })
    .observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__long.push([Math.round(e.startTime),
    Math.round(e.duration)]); } }).observe({ type: 'longtask', buffered: true });`;
const first = '[data-option]:not([data-option="more"]):not(:disabled) >> nth=0';

class Discovery {
  static median(xs: number[]): number { return [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0; }
  static cls(page: Page): Promise<number> {
    return page.evaluate(() => (window as unknown as Counters).__cls.total);
  }

  // How soon each moment of the first minute arrives, from the navigation, with the machine as it is and slowed.
  static async startup(browser: Browser, site: string, throttle: number) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const cdp = await page.context().newCDPSession(page);
    if (throttle > 1) { await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle }); }
    await page.addInitScript(observers);
    const t0 = Date.now();
    await page.goto(`file://${join(site, 'mono.html')}`);
    const paint = await page.evaluate(() => Object.fromEntries(performance.getEntriesByType('paint')
      .map(p => [p.name, Math.round(p.startTime)])));
    await page.waitForSelector('[data-action="begin"]', { state: 'visible', timeout: 60000 });
    const title = Date.now() - t0;
    await page.waitForTimeout(3500);
    const cls0 = await Discovery.cls(page), h0 = Date.now();
    await MonoDriver.hold(page, '[data-action="begin"]');
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    const toCreate = Date.now() - h0 - 800, steps: number[] = [];
    for (let i = 0; i < 14 && await page.getAttribute('.creation', 'data-page') !== 'go'; i++) {
      const was = await page.getAttribute('.creation', 'data-page'), s0 = Date.now();
      await MonoDriver.hold(page, first);
      await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, was,
        { timeout: 60000 });
      steps.push(Date.now() - s0 - 800);
    }
    const clsCreate = await Discovery.cls(page), g0 = Date.now();
    await MonoDriver.hold(page, '[data-option="set-out"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 240000 });
    const toPlay = Date.now() - g0 - 800;
    await page.waitForTimeout(1500);
    const long = await page.evaluate(() => (window as unknown as Counters).__long), total = await Discovery.cls(page);
    await page.close();
    return { throttle, paint, titleReady: title, titleCls: +cls0.toFixed(4), holdToCreate: toCreate,
      creationStepMs: { median: Discovery.median(steps), max: Math.max(...steps), n: steps.length },
      creationCls: +(clsCreate - cls0).toFixed(4), holdToFirstScene: toPlay, totalCls: +total.toFixed(4),
      longTasks: { n: long.length, ms: long.reduce((a, l) => a + l[1]!, 0),
        worst: Math.max(0, ...long.map(l => l[1]!)) } };
  }

  // What a control looks like now (computed), and its box.
  static look(page: Page, selector: string) {
    return page.locator(selector).first().evaluate(e => {
      const c = getComputedStyle(e), r = e.getBoundingClientRect(), a = getComputedStyle(e, '::after');
      const b = getComputedStyle(e, '::before'), m = e.querySelector('.row-mark');
      const has = (s: CSSStyleDeclaration) => s.content !== 'none' && s.content !== 'normal';
      return { box: [r.x, r.y, r.width, r.height].map(n => Math.round(n * 10) / 10),
        bg: c.backgroundColor, bgImage: c.backgroundImage === 'none' ? '' : 'image',
        border: `${c.borderTopWidth} ${c.borderTopColor}`, color: c.color, shadow: c.boxShadow === 'none' ? '' : 'shadow',
        outline: c.outlineStyle === 'none' ? '' : `${c.outlineWidth} ${c.outlineColor}`,
        transform: c.transform === 'none' ? '' : c.transform, opacity: c.opacity, cursor: c.cursor.slice(0, 18),
        markBg: m ? getComputedStyle(m).backgroundColor : '', ring: has(a) ? a.opacity : '',
        hint: has(b) ? b.content : '', transition: c.transitionDuration.split(',')[0] };
    });
  }

  static async states(page: Page, selector: string, held: boolean, press = true) {
    const out: Record<string, Look> = {};
    await page.mouse.move(2, 2); await page.waitForTimeout(450);
    out.rest = await Discovery.look(page, selector);
    const b = (await page.locator(selector).first().boundingBox())!, [x, y] = [b.x + b.width / 3, b.y + b.height / 2];
    await page.mouse.move(x, y); await page.waitForTimeout(450);
    out.hover = await Discovery.look(page, selector);
    await page.mouse.move(2, 2); await page.keyboard.press('Shift');
    await page.locator(selector).first().focus(); await page.waitForTimeout(450);
    out.focus = await Discovery.look(page, selector);
    await page.locator(selector).first().evaluate(e => (e as HTMLElement).blur());
    await page.mouse.move(x, y); await page.waitForTimeout(200);
    if (!press) { await page.mouse.move(2, 2); return out; }
    await page.mouse.down(); await page.waitForTimeout(held ? 300 : 120);
    out[held ? 'holding' : 'pressed'] = await Discovery.look(page, selector);
    await page.mouse.up(); await page.waitForTimeout(held ? 250 : 400);
    if (held) { out.armed = await Discovery.look(page, selector); }
    await page.mouse.move(2, 2); await page.waitForTimeout(3300);
    return out;
  }

  // One press by the pointer, the keys or a finger, as long as the hand holds.
  static async press(page: Page, mode: 'pointer' | 'keys' | 'touch', selector: string, ms: number) {
    const b = (await page.locator(selector).first().boundingBox())!;
    const [x, y] = [b.x + b.width / 3, b.y + b.height / 2];
    if (mode === 'touch') {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await page.waitForTimeout(ms);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else if (mode === 'keys') {
      await page.locator(selector).first().focus(); await page.keyboard.down('Enter');
      await page.waitForTimeout(ms); await page.keyboard.up('Enter');
    } else {
      await page.mouse.move(x, y); await page.mouse.down(); await page.waitForTimeout(ms); await page.mouse.up();
    }
  }

  // Which of the three hands commit a held control, and what each does.
  static async hands(browser: Browser, site: string) {
    const result: Record<string, string> = {};
    for (const mode of ['pointer', 'keys', 'touch'] as const) {
      const viewport = { width: 1280, height: 800 };
      const page = await browser.newPage({ viewport, hasTouch: mode === 'touch' });
      await page.goto(`file://${join(site, 'mono.html')}`);
      await page.waitForSelector('[data-action="begin"]', { state: 'visible' }); await page.waitForTimeout(3500);
      const where = async () => (await page.getAttribute('[data-mode]', 'data-mode')) ?? '';
      await Discovery.press(page, mode, '[data-action="begin"]', 80); await page.waitForTimeout(500);
      result[`${mode}: a tap on New game`] = await where();
      await page.waitForTimeout(3300);
      await Discovery.press(page, mode, '[data-action="begin"]', 800);
      await page.waitForSelector('[data-mode="create"]', { timeout: 20000 }).catch(() => undefined);
      result[`${mode}: a hold on New game`] = await where();
      if (await where() === 'create') { await Discovery.cards(page, mode, result); }
      await page.close();
    }
    return result;
  }

  static async cards(page: Page, mode: 'pointer' | 'keys' | 'touch', result: Record<string, string>) {
    const was = await page.getAttribute('.creation', 'data-page'), now = () => page.getAttribute('.creation', 'data-page');
    await Discovery.press(page, mode, first, 80); await page.waitForTimeout(500);
    result[`${mode}: a tap on a card`] = await now() === was ? 'stays (armed)' : 'goes on';
    await page.waitForTimeout(3300);
    await Discovery.press(page, mode, first, 800); await page.waitForTimeout(1200);
    result[`${mode}: a hold on a card`] = await now() === was ? 'stays' : 'goes on';
    if (mode !== 'touch') {
      await page.keyboard.press('1'); await page.waitForTimeout(900);
      result[`${mode}: the digit 1`] = (await now()) ?? '';
    }
  }

  // Each family on its own page, in each of its states.
  static async families(browser: Browser, site: string) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`file://${join(site, 'mono.html')}`);
    await page.waitForSelector('[data-action="begin"]', { state: 'visible' }); await page.waitForTimeout(3500);
    const out: Record<string, Record<string, Look>> = {};
    out['title way-in (held)'] = await Discovery.states(page, '[data-action="begin"]', true);
    await MonoDriver.hold(page, '[data-action="begin"]'); await page.waitForSelector('[data-mode="create"]');
    let rows = false, cards = false;
    for (let i = 0; i < 14 && !(rows && cards); i++) {
      await page.waitForTimeout(900);
      if (!cards && await page.locator('.composed-card').count()) {
        out['creation card (held)'] = await Discovery.states(page, '.composed-card', true); cards = true;
      }
      if (!rows && await page.locator('.composed-row[data-hold]').count()) {
        out['creation row (held)'] = await Discovery.states(page, '.composed-row[data-hold]', true); rows = true;
      }
      if (await page.getAttribute('.creation', 'data-page') === 'go') { break; }
      await MonoDriver.hold(page, first);
    }
    for (let i = 0; i < 14 && await page.getAttribute('.creation', 'data-page') !== 'go'; i++) {
      await MonoDriver.hold(page, first); await page.waitForTimeout(900);
    }
    await MonoDriver.hold(page, '[data-option="set-out"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 240000 }); await page.waitForTimeout(1500);
    out['scene choice row (not pressed)'] = await Discovery.states(page, '.glance .choice-row', false, false);
    out['scene rail mark (not pressed)'] = await Discovery.states(page, '.rail-mark.opens-look', false, false);
    await page.keyboard.press('m');
    await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 120000 });
    await page.waitForTimeout(1200);
    await page.locator('[data-action="map-place"]:not(.here)').nth(1).focus(); await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    if (await page.locator('.map-menu .choice-row').count()) {
      out['map menu row (not pressed)'] = await Discovery.states(page, '.map-menu .choice-row', false, false);
    }
    await page.close();
    return out;
  }

  static async main() {
    const arg = (name: string, d: string) => {
      const i = process.argv.indexOf(name);
      return i > 0 ? process.argv[i + 1]! : d;
    };
    const site = await mkdtemp(join(tmpdir(), 'kyrie-ui-discovery-'));
    await SiteBuild.site(site, {});
    const browser = await MonoBrowser.launch(), runs = Number(arg('--runs', '2')), startup: unknown[] = [];
    for (const throttle of [1, 4]) {
      for (let i = 0; i < runs; i++) { startup.push(await Discovery.startup(browser, site, throttle)); console.log('startup', throttle, i); }
    }
    const families = await Discovery.families(browser, site), hands = await Discovery.hands(browser, site);
    const out = { measured: new Date().toISOString().slice(0, 10), startup, families, hands };
    await browser.close(); await rm(site, { recursive: true, force: true });
    await writeFile(arg('--out', 'doc/architecture/mission-21/button-data.json'), `${JSON.stringify(out, null, 1)}\n`);
    console.log('written');
  }
}
await Discovery.main();
