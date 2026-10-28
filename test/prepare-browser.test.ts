/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// Spells are prepared on the caster's page, each prepared spell with what could be prepared in its place, a touch
// each; the place only says that they can be. Play 9 found a fold three deep on the place, "Prepare spells › In place
// of Bless (first-level slot) › Dark Bolt" (M17-25). Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('preparing spells', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-prepare-'));
    await SiteBuild.site(site, { fixtures: true });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('goes from the place to the caster\'s page, and a spell is prepared in place of another there', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 820, height: 1180 },
      { site, pointer: true, query: '?campaign=test/fixtures/march/serewater-march.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await page.locator('.you .act', { hasText: 'Dori: prepare other spells' }).click();
    await driver.settle();
    const prepared = page.locator('.character .prepared');
    expect(await prepared.locator('h3').innerText()).toMatch(/prepared today/i);
    const swap = prepared.locator('.instead .act').first();
    const name = (await swap.evaluate(b => b.firstChild?.textContent ?? '')).trim();
    await swap.click();
    await driver.settle();
    expect(await page.evaluate(() => document.body.innerText)).toContain(`Dori spends an hour over ${name}`);
    expect(errors).toEqual([]);
  }, 120000);
});
