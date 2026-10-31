/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// A puzzle on a way, as the player is shown it: what it says, every answer it offers under it and in view, and an
// answer that asks before it is given (the owner's play, 31 October: a speaking door's words ran under the foot of the
// page, one was taken for another, and a wrong word killed the company unasked). Here a speaking door is across a way
// in (test/fixtures/probes/riddle-door). Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('a riddle on a way', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-riddle-'));
    await SiteBuild.site(site, { fixtures: true });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('shows every word in view under the door, and a word pressed asks first and then does that word', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: true, query: '?campaign=test/fixtures/probes/riddle-door/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await page.locator('.led [aria-expanded]', { hasText: /speaking door/ }).first().click();
    await driver.settle();
    for (const word of ['Lute', 'Piano', 'Trumpet']) {
      expect(await page.locator('[data-action="choice"]', { hasText: word }).first().isVisible()).toBe(true);
    }
    expect(await page.evaluate(() => document.body.innerText)).toContain('What has keys but can’t open locks?');
    const piano = page.locator('[data-action="choice"]', { hasText: 'Piano' }).first();
    await piano.click();
    await driver.settle();
    // Asked, and nothing done yet.
    expect(await page.locator('.grave-said').innerText()).toContain('a wrong word, and the stone breathes out cold');
    expect(await page.evaluate(() => document.body.innerText)).not.toContain('The door swings open.');
    await piano.click();
    await driver.settle();
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).toContain('The door swings open.');
    expect(text).not.toContain('breathes out cold.');
    expect(errors).toEqual([]);
  }, 120000);
});
