/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// Low Water as a player meets it in the page, at a desk and on a phone: the title page offers it; Isaura waits at the
// head of the Stair and comes along; the Channel is gauged with her rod and her tally told on the way; and the Dyers'
// Basin's gauge-posts say what the water does as the gate is wound. Opt in with KYRIE_BROWSER=1.
class Page_ {
  static text(page: Page) { return page.evaluate(() => document.body.innerText); }
  static async act(d: MonoDriver, ...labels: string[]) {
    for (const label of labels) {
      for (const part of label.split(' › ')) {
        const re = new RegExp(part, 'i');
        await d.pick(c => re.test(c.label), part);
      }
    }
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('Low Water in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-ammerlin-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1440, 900, false], [390, 844, true]] as const)('at %ix%i', async (width, height, pointer) => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
      { site, pointer, query: '?campaign=low-water' });
    await page.waitForSelector('[data-action="start"]');
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    expect(await Page_.text(page)).toContain('the ring is mud');
    await Page_.act(d, '^To the head of the Stair', '^Talk to Isaura', 'waiting for you', 'join the company');
    await d.away();
    await Page_.act(d, '^To the Rim Gauge', 'the channel head$', 'Gauge the Fulling', '^Back', '^Talk to Isaura', 'what is troubling');
    expect(await Page_.text(page)).toContain('Forty ells a day');
    await d.away();
    await Page_.act(d, '^To the head of the Stair', '^To Measures Square', "^To the Dyers' Walk", "^To the edge of the Dyers' Basin",
      'the sump gate$', '^Wind up');
    expect(await Page_.text(page)).toMatch(/basin.s gauge-post stands at [0-3], the Sump.s at [0-3]\./);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
