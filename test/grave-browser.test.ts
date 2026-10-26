/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// What cannot be undone is said before it is done, and done when chosen again: the founder's statue
// (test/fixtures/probes/grave). Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('a grave act on the page', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-grave-'));
    await SiteBuild.site(site, { fixtures: true });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('says what it costs on the first choosing, and is done on the second', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?campaign=test/fixtures/probes/grave/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Looked at, the statue shows what can be done to it.
    await page.click('[data-choice="p__statue#look"]');
    await driver.settle();
    const act = () => page.locator('[data-choice^="p__statue/"][data-choice*=":Break"]').first();
    await act().click();
    await driver.settle();
    expect(await act().locator('.grave-said').innerText()).toContain('broken, it stays broken. It cannot be undone.');
    expect(await page.evaluate(() => document.body.innerText)).not.toContain('it goes over');
    await act().click();
    await driver.settle();
    expect(await page.evaluate(() => document.body.innerText)).toContain('it goes over, and breaks');
    expect(errors).toEqual([]);
  }, 120000);
});
