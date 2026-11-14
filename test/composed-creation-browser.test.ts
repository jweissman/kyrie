/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// Creation as the owner asked for it (15 November, the playback notes): one press is enough to choose, and the page
// goes on (no Continue, no second click); never more than four cards at once (ancestry and calling page on); no
// stray "Details" button; the sign has its sky. Walked from the title to setting out, at a laptop's size and a
// tablet's.
describe.skipIf(!process.env.KYRIE_BROWSER)('creation, composed', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-composed-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800], [820, 1180]] as const)('at %ix%i: a press chooses and goes on, four cards at most, no Details', async (w, h) => {
    const { page, errors } = await MonoBrowser.page(browser, { width: w, height: h }, { site, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    const seen: string[] = [], most: number[] = [];
    for (let presses = 0; presses < 12; presses++) {
      const where = await page.getAttribute('.creation', 'data-page') ?? '';
      if (where === 'go') { break; }
      seen.push(where);
      most.push(await page.locator('.composed-cards .card').count());
      if (where === 'sign') { expect(await page.locator('.observatory').count()).toBe(1); }
      expect(await page.locator('button:has-text("Details"), button:has-text("Continue")').count()).toBe(0);
      await page.click('[data-option]:not([data-option="more"]):not(:disabled) >> nth=0');
      await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, where, { timeout: 5000 });
    }
    expect(seen.length).toBeGreaterThan(4);
    expect(seen.length).toBeLessThanOrEqual(8);
    expect(Math.max(...most)).toBeLessThanOrEqual(4);
    expect(await page.locator('button:has-text("Details")').count()).toBe(0);
    await page.click('[data-option="set-out"]');
    await page.click('[data-option="set-out"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 90000 });
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);
});
