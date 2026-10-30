/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// What is on a way, and what can be done about it, are under the way: the thing's name, and each thing to do as a row
// of its own. Found by an independent review of the deployed game: looking at the speaking door, the lift's cage and a
// pressure plate opened nothing a player could see; then it was a fold to open, which the owner's report and a tablet
// play put away (play 7). Here a tripwire is laid across a gate (test/fixtures/probes/trapped-way). Opt in with
// KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('a thing on a way', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-door-'));
    await SiteBuild.site(site, { fixtures: true });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('shows what can be done with it under it, and looking closer tells what it is', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?campaign=test/fixtures/probes/trapped-way/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Every way, raised over the place's glance (OWN-19).
    await page.click('.all-ways');
    const way = page.locator('.ways [data-exit]', { has: page.locator('.way-thing', { hasText: /tripwire/i }) });
    await way.locator('.also', { hasText: 'Look closely' }).click();
    await driver.settle();
    expect(await page.evaluate(() => document.body.innerText)).toContain('A wire is strung across the gateway');
    expect(errors).toEqual([]);
  }, 120000);
  // A way barred by what is on it: what can be tried on the thing is the way's first choice of its own, and a touch on
  // "Push and pull at it" under a portcullis found nothing to do (play 9). Here a portcullis is down across a gate.
  it('lets what can be tried on a thing that bars the way be tried', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 820, height: 1180 },
      { site, pointer: true, query: '?campaign=test/fixtures/probes/barred-way/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await page.click('.all-ways');
    await page.locator('.ways .also', { hasText: 'Push and pull at it' }).click();
    await driver.settle();
    expect(await page.evaluate(() => document.body.innerText)).toContain('shifts an inch in its grooves');
    expect(errors).toEqual([]);
  }, 120000);
  // Hurt on the way in, the blow is told before the place that says what it left (play 9 read "The hidden switch has
  // gone off, and is spent." before "A scything blade swings through the air.").
  it('tells a trap that strikes on the way in before the place it leaves spent', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 820, height: 1180 },
      { site, pointer: true, query: '?campaign=test/fixtures/probes/trapped-way/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await page.click('.all-ways');
    await page.locator('.ways [data-exit] .act.way').first().click();
    await driver.settle();
    const text = await page.evaluate(() => document.body.innerText);
    const struck = text.search(/takes? \d+ piercing damage|resists/), left = text.indexOf('has gone off, and is spent');
    expect(struck).toBeGreaterThan(-1);
    expect(left === -1 || struck < left).toBe(true);
    expect(errors).toEqual([]);
  }, 120000);
});
