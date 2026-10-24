/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// A game in which the company carries a thing of the adventure's own kind, taken up again after the page is
// reloaded, its engine fresh. Found by the follow-up independent review: saves from the singing halls would not
// load in a fresh browser ("Unknown item definition cantor_token"). Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('a kept game with a thing of its own kind', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-kinds-'));
    await SiteBuild.site(site, { fixtures: true });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('is taken up again after a reload', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?campaign=test/fixtures/probes/local-kind/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.do('ox', 'Take');
    await page.waitForFunction(() => !!localStorage.getItem('kyrie.mono.v1'), null, { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.reload();
    await driver.click('[data-action="continue"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    expect((await driver.inspect()).error).toBe('');
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
