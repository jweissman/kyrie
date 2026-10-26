/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// Looking at what is on a way opens under it, where it was asked. Found by an independent review of the deployed
// game: looking at the speaking door, the lift's cage and a pressure plate opened nothing a player could see, because
// a door drew the things that might be tried at it, but not what one of them opened. Here a tripwire is laid across a
// gate (test/fixtures/probes/trapped-way). Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('a thing on a way', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-door-'));
    await SiteBuild.site(site, { fixtures: true });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('opens what can be done with it under it, and looking closer tells what it is', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?campaign=test/fixtures/probes/trapped-way/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await page.locator('.ways [data-exit] .also', { hasText: 'Look at the tripwire' }).click();
    await driver.settle();
    const opened = page.locator('.ways [data-exit] .unfolded');
    expect(await opened.innerText()).toContain('Look closely');
    await opened.locator('[data-action="choice"]', { hasText: 'Look closely' }).click();
    await driver.settle();
    expect(await page.evaluate(() => document.body.innerText)).toContain('A wire is strung across the gateway');
    expect(errors).toEqual([]);
  }, 120000);
});
