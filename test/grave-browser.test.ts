/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

class Grave {
  // A thing turned to by a touch: on the place's glance when it leads with it, else under Look about (OWN-18).
  static async touch(page: Page, selector: string) {
    if (!(await page.locator(selector).count())) { await page.click('[data-action="look-about"]'); }
    await page.click(selector);
  }
}

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
    await Grave.touch(page, '[data-choice="p__statue#look"]');
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
  // Low Water's 11 (AUT-08): a thing's own view did not show the lines of the place its change altered. Winding the
  // sump gate up from its own view tells the basin draining there, with the gate as it now is.
  it('tells, in a thing\'s own view, what its change did to the place', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?campaign=test/fixtures/probes/sump-gate/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await Grave.touch(page, '[data-choice="p__sluice#look"]');
    await driver.settle();
    await page.locator('[data-choice^="p__sluice/"][data-choice*=":Wind"]').first().click();
    await driver.settle();
    expect(await page.locator('.thing').innerText()).toContain('The water in the basin goes down');
    expect(errors).toEqual([]);
  }, 120000);
  // Low Water's 5 and the Liberty of the Ice's 10 (AUT-03, ICE-10): a question put to the company is answered by its
  // answers, under the question, not among the rest of what might be said.
  it('shows the answers to a question put, as answers', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?campaign=test/fixtures/probes/question/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.pick(c => /#talk$/.test(c.id) && /Callow/.test(c.label), 'Callow');
    await driver.pick(c => /Ask Callow what he wants/.test(c.label), 'the question');
    expect(await page.locator('.dialogue .answering').innerText()).toMatch(/your answer/i);
    expect(await page.locator('.dialogue .replies.answers li').allInnerTexts())
      .toEqual([expect.stringContaining('Say that you are'), expect.stringContaining('Say that none of you is')]);
    expect(errors).toEqual([]);
  }, 120000);
});
