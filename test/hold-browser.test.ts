/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { LensPages } from './support/lens-pages';

// Holding means something, and only where it matters (the owner, 16 November): a night's rest and a camp are held (the
// engine marks them, test/hold-rule); a search, a wait, a look, a talk are touches, and no ring promises a hold on
// them.
class Afield {
  // Out of the town, on the road north: the page's own journey, as the map sets one out (kyrieMono.act), and the time lens.
  static async go(page: import('playwright-core').Page, d: { settle(): Promise<void> }) {
    await page.evaluate(() => (window as unknown as { kyrieMono: { act(c: string, s: string): void } })
      .kyrieMono.act('travel:region__edge_north', 'travel'));
    await d.settle();
    await page.waitForTimeout(800);
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('a ring only where a hold matters', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-hold-')); await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('is never on a wait, a search or a talk', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.enter();
    await page.click('.rail-mark.opens-wait'); await d.settle();
    // Nothing among the waits is held.
    const held = await page.locator('[data-hold]').evaluateAll(es => es.map(e => e.getAttribute('data-act') ?? ''));
    expect(held.filter(id => !/camp|rest/.test(id))).toEqual([]);
    // A press on a wait fills no ring and does what a touch does.
    const wait = page.locator('.glance .lens-time [data-act]').first(), box = (await wait.boundingBox())!;
    const before = (await d.inspect()).log.length;
    await page.mouse.move(box.x + 40, box.y + box.height / 2); await page.mouse.down();
    expect(await page.locator('.ix-reticle.holding').count()).toBe(0);
    await page.mouse.up(); await d.settle();
    expect((await d.inspect()).log.length).toBeGreaterThan(before);
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);

  it('is the camp in the open: held to be done, a tap only arms it, and a second tap does it', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.enter();
    await Afield.go(page, d);
    await page.click('.rail-mark.opens-wait'); await d.settle();
    expect(await LensPages.seek(page, '.glance .lens-time [data-hold]')).toBe(true);
    const held = page.locator('.glance .lens-time [data-hold]');
    expect(await held.evaluateAll(es => es.every(e => /camp|rest/.test(e.getAttribute('data-act') ?? '')))).toBe(true);
    const told = async () => (await d.inspect()).log.length, at = (await held.first().boundingBox())!;
    const press = async (ms: number) => {
      await page.mouse.move(at.x + 40, at.y + at.height / 2); await page.mouse.down();
      await page.waitForTimeout(ms); await page.mouse.up();
    };
    // A tap does nothing but arm it, and no ring is left running.
    const before = await told();
    await press(60);
    expect(await told()).toBe(before);
    expect(await held.first().getAttribute('data-armed')).not.toBeNull();
    // Left alone it disarms; then held, the cursor's ring fills while the hand stays, and the act is done when full.
    await page.waitForTimeout(3300);
    expect(await held.first().getAttribute('data-armed')).toBeNull();
    await page.mouse.move(at.x + 40, at.y + at.height / 2); await page.mouse.down();
    await page.waitForTimeout(150);
    expect(await page.locator('.ix-reticle.holding').count()).toBe(1);
    await page.waitForTimeout(700); await page.mouse.up(); await d.settle();
    expect(await told()).toBeGreaterThan(before);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);

  it('is done by a second tap while armed, and by a held key', async () => {
    const { page, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.enter();
    await Afield.go(page, d);
    await page.click('.rail-mark.opens-wait'); await d.settle();
    expect(await LensPages.seek(page, '.glance .lens-time [data-hold]')).toBe(true);
    const held = page.locator('.glance .lens-time [data-hold]'), told = async () => (await d.inspect()).log.length;
    const at = (await held.first().boundingBox())!, before = await told();
    const tap = async () => {
      await page.mouse.move(at.x + 40, at.y + at.height / 2); await page.mouse.down();
      await page.waitForTimeout(60); await page.mouse.up();
    };
    await tap();
    expect(await told()).toBe(before);
    await tap(); await d.settle();
    expect(await told()).toBeGreaterThan(before);
  }, 240000);
});
