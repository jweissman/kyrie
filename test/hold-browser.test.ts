/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// Holding means something, and only where it matters (the owner, 16 November): a night's rest and a camp are held (the
// engine marks them, test/hold-rule); a search, a wait, a look, a talk are touches, and no ring promises a hold on
// them.
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
});
