/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// A lens's list is its acts and nothing else (the owner, 15 November: "some text interspersed in the action list; it
// should basically never be the case; I think it's trying to be a category marker"): unfolded whole, the talk lens had
// headed each one's acts with their name (WELLBY over "Talk to Wellby"), and the look lens put the corn-store padlock's
// name over its words, then the same words again under the act. Each act's own words say what it is done to.
describe.skipIf(!process.env.KYRIE_BROWSER)('a lens', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-lens-acts-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  it('lists only acts, each lens at a town\'s camp unfolded whole', async () => {
    const { page, driver } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, pointer: false,
      query: '?world=a1' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]'); await driver.settle();
    await page.click('.rail-mark.opens-go'); await driver.settle();
    await page.locator('.glance .lens [data-act]').first().click(); await driver.settle();
    const stray: string[] = [];
    for (const part of ['go', 'look', 'wait', 'talk']) {
      await page.locator(`.rail-mark.opens-${part}`).first().click(); await driver.settle();
      const all = page.locator('.glance .lens [data-action="lens-all"][aria-expanded="false"]');
      if (await all.count()) { await all.click(); await driver.settle(); }
      stray.push(...(await page.evaluate(() => [...document.querySelectorAll('.glance .do-col *')].filter(e =>
        !e.children.length && e.textContent?.trim() && !e.closest('[data-act], button'))
        .map(e => `${e.className}: ${e.textContent!.trim().slice(0, 60)}`))).map(t => `${part}: ${t}`));
    }
    expect(stray).toEqual([]);
  }, 300000);
});
